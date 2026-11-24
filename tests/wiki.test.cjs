const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {webcrypto}=require('node:crypto');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
function open(path='/uat#productos/t2p/apis/login') {
  const dom=new JSDOM(html,{url:'https://datafastsa.github.io/datafast-commerce-payment-sdk-wiki'+path,runScripts:'outside-only'});
  const w=dom.window;
  Object.defineProperty(w,'crypto',{value:webcrypto});
  w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;
  w.fetch=()=>{throw Error('Unexpected network request');};
  w.HTMLAnchorElement.prototype.click=function(){};
  for(const file of ['environments','products','tenten','app'])w.eval(fs.readFileSync(`assets/${file}.js`,'utf8'));
  return {dom,w,d:w.document};
}
async function settle(){await new Promise(resolve=>setTimeout(resolve,30));}
async function navigate(w,hash){w.location.hash=hash;await settle();}
test('UAT is default and legacy API links resolve inside T2P',()=>{
  const {w,d,dom}=open('/#apis/login');
  assert.match(w.location.pathname,/\/uat$/);assert.equal(w.location.hash,'#productos/t2p/apis/login');
  assert.ok(d.querySelector('#api-form'));dom.window.close();
});
for(const env of ['dev','qa','uat','prod'])test(`environment ${env} renders its internal notice and API access correctly`,()=>{
 const {d,dom}=open(`/${env}#productos/t2p/apis/login`);
 assert.equal(!!d.querySelector('.internal-environment-banner'),['dev','qa'].includes(env));
 assert.equal(!!d.querySelector('#api-form'),env!=='prod');
 assert.equal(!!d.querySelector('#api-secret'),env!=='prod');dom.window.close();
});
test('all registered product sections render without throwing',()=>{
 const {w,dom}=open();
 for(const product of w.DatafastProducts.all())for(const section of product.sections){
  w.history.replaceState({},'',`/datafast-commerce-payment-sdk-wiki/uat#productos/${product.id}/${section.id}`);
  w.dispatchEvent(new w.PopStateEvent('popstate'));
  assert.ok(w.document.querySelector('#article h1'),section.id);
 }
 dom.window.close();
});
test('demo APK is offered only in UAT and release AAR is the only version download',()=>{
 for(const env of ['dev','qa','uat','prod']){
  const {d,dom}=open(`/${env}#productos/t2p/descargas`);
  assert.equal(!!d.querySelector('a[href$="DataTapDemo.apk"]'),env==='uat');
  assert.equal(!!d.querySelector('a[href$="DataTapDemo-uat.apk"]'),env==='uat');
  assert.equal(d.querySelectorAll('#download-form button[type=submit]').length,1);
  assert.ok(!d.querySelector('#download-form [value=debug]'));
  for(const name of ['sonic-sdk-release-1.5.4.aar','visa-sensory-branding-2.3.aar'])assert.ok(d.querySelector(`a[href$="${name}"] img`));
  dom.window.close();
 }
});
test('download accepts stable and ALPHA versions and rejects paths, URLs and HTML',()=>{
 const {w,d,dom}=open('/uat#productos/t2p/descargas');
 const field=d.querySelector('#artifact-version'),form=d.querySelector('#download-form');
 for(const version of ['1.39.54','1.39.54-ALPHA']){
  field.value=version;form.dispatchEvent(new w.Event('submit',{cancelable:true}));
  const url=new URL(d.querySelector('#download-result a').href);
  assert.equal(url.pathname,`/datafast-commerce-payment-sdk/${version.endsWith('ALPHA')?'alpha/':''}datafast-commerce-payment-sdk-${version}.aar`);
 }
 for(const version of ['../../bad','https://evil.example/file.apk','1.2.3.apk','<img onerror=alert(1)>']){
  field.value=version;form.dispatchEvent(new w.Event('submit',{cancelable:true}));
  assert.ok(!d.querySelector('#download-result a'));assert.ok(!d.querySelector('#download-result img'));
 }
 dom.window.close();
});
test('encrypted test keys decrypt only for lower environments',async()=>{
 const {w,dom}=open();
 for(const env of ['dev','qa','uat'])assert.ok((await w.getDatafastTestApiKey(env)).length>0);
 await assert.rejects(w.getDatafastTestApiKey('prod'));
 dom.window.close();
});
test('login applies idToken to consultation without exposing it and environment changes clear it',async()=>{
 const {w,d,dom}=open();const calls=[];
 w.fetch=async(url,options)=>{calls.push({url,options});return {ok:true,status:200,text:async()=>JSON.stringify(calls.length===1?{idToken:'test-private-token',accessToken:'test-access',refreshToken:'test-refresh',expiresIn:3600,apiKey:'test-session-key',createdAt:'2026-11-09T16:11:21.123',forceChangePassword:false}:{id:'trx-test'})};};
 d.querySelector('#api-secret').value='test-merchant';
 d.querySelector('#api-email').value='usuario@comercio.com';
 d.querySelector('#api-password').value='clave-de-prueba';
 d.querySelector('#api-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();
 assert.equal(calls.length,1);assert.equal(calls[0].options.headers['x-df-key'],'test-merchant');
 assert.equal(calls[0].options.headers['x-api-key'],undefined);
 assert.deepEqual(JSON.parse(calls[0].options.body),{email:'usuario@comercio.com',password:'clave-de-prueba'});
 assert.ok(!d.querySelector('#response-body').textContent.includes('test-private-token'));
 assert.ok(!d.querySelector('#response-body').textContent.includes('test-session-key'));
 assert.ok(d.querySelector('#response-body').textContent.includes('[oculto]'));
 await navigate(w,'#productos/t2p/apis/consulta');
 assert.equal(d.querySelector('#send-request').disabled,false);
 assert.ok(d.querySelector('#api-secret').closest('[hidden]'));
 assert.ok(!d.querySelector('#article').textContent.includes('test-private-token'));
 d.querySelector('#api-path').value='/transactions/api/v1/T2P/getTransaction/trx-test';
 d.querySelector('#api-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();
 assert.equal(calls[1].options.headers.Authorization,'test-private-token');
 assert.equal(calls[1].options.headers['x-api-key'],'test-session-key');
 assert.equal(calls[1].options.body,undefined);
 const select=d.querySelector('#environment');select.value='qa';select.dispatchEvent(new w.Event('change'));
 assert.equal(d.querySelector('#send-request').disabled,true);dom.window.close();
});
test('request destination cannot be redirected to an external origin',async()=>{
 const {w,d,dom}=open();let called=false;w.fetch=async()=>{called=true;};
 d.querySelector('#api-secret').value='test';d.querySelector('#api-email').value='usuario@comercio.com';d.querySelector('#api-password').value='clave-de-prueba';d.querySelector('#api-path').value='https://evil.example';
 d.querySelector('#api-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();
 assert.equal(called,false);assert.equal(d.querySelector('#request-error').hidden,false);dom.window.close();
});

test('transaction detail response is JSON below the tester and includes amounts and card data',()=>{
 const {d,dom}=open('/uat#productos/t2p/apis/consulta');
 const schema=d.querySelector('.api-schema');
 assert.ok(schema);
 assert.ok(d.querySelector('.try-panel').compareDocumentPosition(schema) & 4);
 const response=JSON.parse(schema.querySelector('code').textContent);
 assert.equal(response.provider,'T2P');
 assert.ok(Object.hasOwn(response.amountInfo,'ivaAmount'));
 assert.ok(Object.hasOwn(response.cardInfo,'maskedCardNumber'));
 assert.ok(Object.hasOwn(response,'providerTransactionId'));
 assert.equal(schema.querySelector('table'),null);
 dom.window.close();
});

test('unavailable APIs show coming soon without request controls in every environment',()=>{
 for(const env of ['dev','qa','uat','prod']){
  const {d,dom}=open(`/${env}#productos/t2p/apis/void`);
  assert.match(d.querySelector('#article').textContent,/Disponible próximamente/);
  assert.equal(d.querySelector('#api-form'),null);
  assert.equal(d.querySelector('#copy-curl'),null);
  assert.equal(d.querySelector('#api-secret'),null);
  dom.window.close();
 }
});

test('wiki does not expose links to its GitHub repository',()=>{
 const {d,dom}=open();
 assert.equal(d.querySelector('a[href*="github.com/DatafastSA/datafast-commerce-payment-sdk-wiki"]'),null);
 dom.window.close();
});

test('Android integration links to the downloadable demo ZIP instead of its private repository',()=>{
 const {d,dom}=open('/uat#productos/t2p/android');
 assert.equal(d.querySelector('a[href*="github.com/DatafastSA/poc-mc-deep-link-app"]'),null);
 assert.ok(d.querySelector('a[href$="DataTapDemo-source.zip"]'));
 dom.window.close();
});

test('every public reference type has contract details and code examples',()=>{
 const {d,dom}=open('/uat#productos/t2p/referencia');
 const cards=[...d.querySelectorAll('.reference-card')];
 assert.equal(cards.length,10);
 for(const card of cards){
  assert.ok(card.querySelector('.reference-details'),card.querySelector('h2').textContent);
  assert.ok(card.querySelector('.code-editor'),card.querySelector('h2').textContent);
 }
 dom.window.close();
});

test('affiliation heading and app download match UAT or PROD',()=>{
 for(const env of ['uat','prod']){
  const {d,dom}=open(`/${env}#productos/t2p/afiliacion`);
  assert.ok([...d.querySelectorAll('h2')].some(h=>h.textContent===`Afiliación en ${env.toUpperCase()}`));
  assert.equal(!!d.querySelector('a[href*="app.bitrise.io"]'),env==='uat');
  assert.equal(!!d.querySelector('a[href*="play.google.com"]'),env==='prod');
  dom.window.close();
 }
});

test('production affiliation explains that certification takes place in UAT',()=>{
 const {d,dom}=open('/prod#productos/t2p/afiliacion');
 assert.match(d.querySelector('#article').textContent,/La certificación de la integración se realiza en UAT/);
 dom.window.close();
});

test('production and download pages link to official Cloud Commerce on Play Store',()=>{
 for(const page of ['produccion','descargas']){
  const {d,dom}=open(`/prod#productos/t2p/${page}`);
  assert.ok(d.querySelector('a[href="https://play.google.com/store/apps/details?id=com.mastercard.cpos"]'));
  dom.window.close();
 }
});
test('visible branding uses TenTén with its accent',()=>{
 const {d,dom}=open('/uat#productos/t2p/afiliacion');
 assert.match(d.querySelector('#article').textContent,/TenTén/);
 assert.doesNotMatch(d.querySelector('#article').textContent,/TenTen|Tenten/);
 dom.window.close();
});

test('UAT downloads Cloud Commerce MTF instead of the Play Store app',()=>{
 const {d,dom}=open('/uat#productos/t2p/descargas');
 assert.ok(d.querySelector('a[href$="cloud-commerce-debug-6.10.0.apk"]'));
 assert.equal(d.querySelector('a[href*="id=com.mastercard.cpos"]'),null);
 dom.window.close();
});

test('DEV and QA do not offer Cloud Commerce debug or Play Store downloads in any section',()=>{
 for(const env of ['dev','qa']){
  const {w,d,dom}=open(`/${env}#productos/t2p/descargas`);
  for(const section of w.DatafastProducts.get('t2p').sections){
   w.history.replaceState({},'',`/datafast-commerce-payment-sdk-wiki/${env}#productos/t2p/${section.id}`);
   w.dispatchEvent(new w.PopStateEvent('popstate'));
   assert.equal(d.querySelector('a[href*="id=com.mastercard.cpos"]'),null,section.id);
   assert.equal(d.querySelector('a[href*="cloud-commerce-debug"]'),null,section.id);
  }
  dom.window.close();
 }
});

test('UAT never links to production Cloud Commerce from any product section',()=>{
 const {w,d,dom}=open();
 for(const section of w.DatafastProducts.get('t2p').sections){
  w.history.replaceState({},'',`/datafast-commerce-payment-sdk-wiki/uat#productos/t2p/${section.id}`);
  w.dispatchEvent(new w.PopStateEvent('popstate'));
  assert.equal(d.querySelector('a[href*="id=com.mastercard.cpos"]'),null,section.id);
  if(['produccion','descargas'].includes(section.id))assert.ok(d.querySelector('a[href*="cloud-commerce-debug"]'));
 }
 dom.window.close();
});

test('search finds content without accents and navigates directly to a product section',async()=>{
 const {w,d,dom}=open();const input=d.querySelector('#wiki-search');
 input.value='afiliacion';input.dispatchEvent(new w.Event('input'));
 assert.equal(d.querySelector('#search-results').hidden,false);
 const link=d.querySelector('#search-links a');assert.match(link.hash,/afiliacion/);
 link.dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));await settle();assert.equal(d.querySelector('#search-results').hidden,true);
 input.value='zzznothing';input.dispatchEvent(new w.Event('input'));
 assert.match(d.querySelector('#search-status').textContent,/No se encontraron/);
 input.value='<img onerror=alert(1)>';input.dispatchEvent(new w.Event('input'));
 assert.equal(d.querySelector('#search-links img'),null);
 input.value='';input.dispatchEvent(new w.Event('input'));
 assert.equal(d.querySelector('#search-results').hidden,true);dom.window.close();
});
const sessionResponse={idToken:'test-private-token',accessToken:'test-access',refreshToken:'test-refresh',expiresIn:3600,apiKey:'test-session-key',createdAt:'2026-11-09T16:11:21.123',forceChangePassword:false};
async function signIn(w,d,calls,loginResponse=sessionResponse){
 w.fetch=async(url,options)=>{calls.push({url,options});return {ok:true,status:200,text:async()=>JSON.stringify(calls.length===1?loginResponse:{tid:'TP001912',status:'actived'})};};
 d.querySelector('#api-secret').value='test-merchant';
 d.querySelector('#api-email').value='usuario@comercio.com';
 d.querySelector('#api-password').value='clave-de-prueba';
 d.querySelector('#api-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();
}
test('create terminal is registered after login in every product',()=>{
 const {w,dom}=open();
 for(const id of ['t2p','tenten']){
  const product=w.DatafastProducts.get(id);
  const ids=product.sections.map(section=>section.id);
  assert.equal(ids.indexOf('apis/terminal'),ids.indexOf('apis/login')+1,id);
  assert.deepEqual(Object.keys(product.apis).slice(0,2),['login','terminal'],id);
  assert.equal(product.apis.terminal.path,'/terminals/api/v1/terminals/create');
 }
 dom.window.close();
});
test('login tester asks for x-df-key, email and password and documents the contract',()=>{
 const {d,dom}=open('/uat#productos/t2p/apis/login');
 for(const id of ['#api-secret','#api-email','#api-password'])assert.ok(d.querySelector(id),id);
 assert.equal(d.querySelector('#send-request').disabled,true);
 const text=d.querySelector('#article').textContent;
 for(const expected of ['x-df-key','Origin','forceChangePassword','CORE027','No envíes x-api-key'])assert.ok(text.includes(expected),expected);
 assert.ok(!text.includes('mobilePhone'));assert.ok(!text.includes('Bearer'));
 const schema=JSON.parse(d.querySelector('.api-schema code').textContent);
 assert.deepEqual(Object.keys(schema),['idToken','accessToken','refreshToken','expiresIn','apiKey','createdAt','forceChangePassword']);
 dom.window.close();
});
test('create terminal sends the session headers without Bearer, an empty body and needs confirmation',async()=>{
 const {w,d,dom}=open();const calls=[];
 await signIn(w,d,calls);
 assert.equal(calls.length,1);
 await navigate(w,'#productos/t2p/apis/terminal');
 assert.equal(d.querySelector('#api-body').value,'{}');assert.equal(d.querySelector('#api-body').readOnly,true);
 assert.equal(d.querySelector('#send-request').disabled,true);
 d.querySelector('#api-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();
 assert.equal(calls.length,1);assert.equal(d.querySelector('#request-error').hidden,false);
 const confirm=d.querySelector('#terminal-confirm');confirm.checked=true;confirm.dispatchEvent(new w.Event('change'));
 assert.equal(d.querySelector('#send-request').disabled,false);
 d.querySelector('#api-form').dispatchEvent(new w.Event('submit',{cancelable:true}));await settle();
 assert.equal(calls.length,2);
 assert.equal(calls[1].url,'https://api-uat.datafast.ec/terminals/api/v1/terminals/create');
 assert.equal(calls[1].options.method,'POST');
 assert.equal(calls[1].options.headers.Authorization,'test-private-token');
 assert.equal(calls[1].options.headers['x-api-key'],'test-session-key');
 assert.equal(calls[1].options.headers['x-df-key'],undefined);assert.equal(calls[1].options.headers.Origin,undefined);
 assert.equal(calls[1].options.body,'{}');
 assert.equal(confirm.checked,false);assert.equal(d.querySelector('#send-request').disabled,true);
 dom.window.close();
});
test('forceChangePassword response explains why there is no session',async()=>{
 const {w,d,dom}=open();const calls=[];
 await signIn(w,d,calls,{...sessionResponse,idToken:'',accessToken:'',refreshToken:'',forceChangePassword:true});
 assert.match(d.querySelector('#request-error').textContent,/cambiar la contraseña/);
 await navigate(w,'#productos/t2p/apis/terminal');
 assert.equal(d.querySelector('#send-request').disabled,true);
 dom.window.close();
});
test('create terminal is documentation only in production',()=>{
 for(const id of ['t2p','tenten']){
  const {d,dom}=open(`/prod#productos/${id}/apis/terminal`);
  assert.equal(d.querySelector('#api-form'),null);assert.equal(d.querySelector('#terminal-confirm'),null);
  const schema=JSON.parse(d.querySelector('.api-schema code').textContent);
  assert.deepEqual(Object.keys(schema),['tid','status']);assert.match(schema.tid,/^TP/);
  const text=d.querySelector('#article').textContent;
  for(const expected of ['TRML001','TRML004','TRML005','sin el prefijo Bearer','Solo documentación'])assert.ok(text.includes(expected),expected);
  assert.ok(!text.includes('ruc:'));
  dom.window.close();
 }
});
test('affiliation explains credentials, authorized domains and how to get the TID inside each product',()=>{
 for(const id of ['t2p','tenten']){
  const {d,dom}=open(`/uat#productos/${id}/afiliacion`);
  const headings=[...d.querySelectorAll('h2')].map(h=>h.textContent);
  for(const expected of ['Credenciales de integración','Dominios autorizados','Obtén tu TID antes de integrar el SDK'])assert.ok(headings.includes(expected),expected);
  assert.ok(d.querySelector(`a[href="#productos/${id}/apis/login"]`));
  assert.ok(d.querySelector(`a[href="#productos/${id}/apis/terminal"]`));
  assert.doesNotMatch(d.querySelector('#article').textContent,/TenTen|Tenten/);
  dom.window.close();
 }
});
test('Android pages and support page point to the new terminal and security guidance',()=>{
 for(const id of ['t2p','tenten']){
  const {d,dom}=open(`/uat#productos/${id}/android`);
  assert.ok(d.querySelector(`a[href="#productos/${id}/apis/terminal"]`),id);
  dom.window.close();
 }
 const {d,dom}=open('/uat#productos/t2p/soporte');
 assert.ok([...d.querySelectorAll('h2')].some(h=>h.textContent==='Recomendaciones de seguridad'));
 dom.window.close();
});
test('search finds the terminal contract and its error codes',()=>{
 const {w,d,dom}=open();const input=d.querySelector('#wiki-search');
 input.value='TRML004';input.dispatchEvent(new w.Event('input'));
 assert.ok([...d.querySelectorAll('#search-links a')].some(link=>link.hash.endsWith('/apis/terminal')));
 dom.window.close();
});
