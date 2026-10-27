(() => {
'use strict';
const script = document.querySelector('script[data-app]');
const siteBase = new URL('../', script.src).pathname;

const environments = {
  dev: 'https://api-dev.datafast.ec', qa: 'https://api-qa.datafast.ec',
  uat: 'https://api-uat.datafast.ec', prod: 'https://api-prod.datafast.com.ec'
};
const routeMatch = location.pathname.match(/\/(dev|qa|uat|prod)(?:\/|$)/);
const queryEnv = new URLSearchParams(location.search).get('env');
let environment = routeMatch?.[1] || (Object.hasOwn(environments, queryEnv) ? queryEnv : 'uat');
let authorizationToken = '';
let requestController = null;
let generation = 0;
const article = document.getElementById('article');
const envSelect = document.getElementById('environment');
const uatDownload = 'https://app.bitrise.io/app/49affc485b3b76ee/installable-artifacts/2ab0a7481b8a4613/public-install-page/3092caa8c3be6828539663e3b76be537';
const productionDownload = 'https://play.google.com/store/apps/details?id=ec.com.datafast.app';
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const code = value => {
  const language = /^\s*(?:#|-keep|-dontwarn)/.test(value) ? 'ProGuard' : /^\s*\{/.test(value) ? 'JSON' : 'Kotlin';
  const tokens = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/[^\n]*|\b(?:val|var|fun|class|object|import|package|internal|private|public|override|suspend|return|when|if|else|true|false|null)\b|\b\d+(?:\.\d+)?\b|\b[A-Z][A-Za-z0-9_]*\b)/g;
  let output = '', cursor = 0;
  for (const match of value.matchAll(tokens)) {
    output += escapeHtml(value.slice(cursor, match.index));
    const token = match[0];
    const kind = token.startsWith('//') ? 'comment' : /^["']/.test(token) ? 'string' : /^\d/.test(token) ? 'number' : /^[A-Z]/.test(token) ? 'type' : 'keyword';
    output += `<span class="syntax-${kind}">${escapeHtml(token)}</span>`;
    cursor = match.index + token.length;
  }
  output += escapeHtml(value.slice(cursor));
  return `<div class="code-editor"><div class="code-editor-bar"><span class="editor-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${language}</span></div><pre><code>${output}</code></pre></div>`;
};
const notice = (title, text) => `<div class="notice"><strong>${title}</strong>${text}</div>`;
const intro = (eyebrow, title, text) => `<div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="lead">${text}</p>`;
const steps = items => `<ol class="steps">${items.map((item, i) => `<li><span class="num">${i + 1}</span><div><strong>${item[0]}</strong><p>${item[1]}</p></div></li>`).join('')}</ol>`;
const external = (url, label, className = 'button') => `<a class="${className}" href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
const next = (hash, label) => `<div class="next"><a href="#${hash}">${label} →</a></div>`;
const table = (headers, rows) => `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const journey = [
 ['Afíliate en TenTen UAT', 'Completa el registro de tu comercio y obtén las credenciales para las pruebas.'],
 ['Integra el SDK y las APIs', 'Valida los flujos de cobro, anulación y consulta de transacciones en UAT.'],
 ['Certifica la integración con Datafast', 'Datafast revisa y certifica la correcta implementación de este SDK en UAT.'],
 ['Habilita producción', 'Después de la certificación, Datafast proporciona el acceso productivo y las credenciales correspondientes.']
];
const pages = {
 inicio: () => intro('COMMERCE PAYMENT SDK', 'Tus cobros, en tu aplicación', 'Integra el flujo de cobro de TenTen de Datafast en Android. Comienza con la afiliación en UAT y avanza a producción después de la certificación.') + steps(journey) + `<div class="links"><a class="link-card" href="#afiliacion"><strong>Comenzar con la afiliación →</strong><span>El primer paso para obtener tus credenciales de UAT.</span></a><a class="link-card" href="#productos/t2p/inicio"><strong>Cobro con celular (T2P) →</strong><span>Conoce el producto e integra su flujo de cobro.</span></a></div>`,
 afiliacion: () => intro('PRIMEROS PASOS', 'Afiliación y credenciales', 'Antes de integrar el SDK, afilia tu comercio en la aplicación TenTen del ambiente UAT.') + `<h2>¿Qué es TenTen?</h2><p>TenTen es la aplicación de Datafast que permite a los comercios registrarse, recibir pagos con tarjetas y consultar sus ventas. La afiliación identifica al comercio; el SDK permite integrar el flujo de cobro dentro de tu propia aplicación.</p><h2>Afiliación en UAT</h2><p>Instala TenTen UAT, completa la afiliación y solicita a Datafast las credenciales necesarias para integrar este SDK.</p><div class="actions">${environment === 'uat' ? external(uatDownload,'Descargar TenTen UAT','button primary') : ''}${external('https://tenten.datafast.com.ec/','Conocer TenTen','button secondary')}</div>` + notice('Ambiente de pruebas', 'UAT está sujeto a cambios, mantenimiento y disponibilidad de conexión con bancos y proveedores externos. Durante las pruebas pueden presentarse interrupciones o errores. Repórtalos a Datafast indicando versión, fecha, hora, pasos para reproducirlos y código recibido; no incluyas contraseñas, tokens ni datos completos de tarjetas.') + `<h2>Comercios que ya están en producción</h2><p>También debes crear el comercio en UAT. La afiliación y certificación en este ambiente validan la correcta implementación de este SDK. La afiliación productiva existente no sustituye esa certificación.</p><h2>API de afiliación</h2><p>Sección reservada. El contrato técnico se documentará cuando esté definido.</p><h2>Afiliación productiva</h2><p>Después de la certificación de Datafast, utiliza la aplicación productiva para completar la afiliación cuando corresponda.</p>${environment === 'prod' ? external(productionDownload,'TenTen en Google Play') : ''}` + next('productos/t2p/inicio','Cobro con celular (T2P)'),
 android: () => intro('INTEGRACIÓN', 'SDK Android', 'Configura los AAR locales e inicializa DataFastCommerceManager con las credenciales proporcionadas por Datafast.') + `<h2>Requisitos</h2><ul><li>Android 10 (API 29) o superior.</li><li>Activity basada en AndroidX ComponentActivity.</li><li>Conexión a internet y comercio afiliado en el ambiente correspondiente.</li><li>NFC disponible y habilitado, incluida la prueba con la mock.</li></ul><h2>Dependencias locales</h2><p>Incluye el AAR release de Commerce y los AAR de Mastercard Sonic y Visa Sensory.</p>${external('https://github.com/DatafastSA/poc-mc-deep-link-app','Ver demo de integración')}` + code(`dependencies {
    implementation(files("libs/datafast-commerce-payment-sdk-<version>.aar"))
    implementation(files("libs/sonic-sdk-release-1.5.4.aar"))
    implementation(files("libs/visa-sensory-branding-2.3.aar"))
}`) + `<h2>Dependencias del SDK</h2><p>Al integrar AAR locales, declara sus dependencias en el módulo de la aplicación. Versiones utilizadas por el SDK:</p>` + code("dependencies {\n    implementation(\"com.airbnb.android:lottie-compose:4.0.0\")\n    implementation(\"androidx.activity:activity-compose:1.9.3\")\n    implementation(platform(\"androidx.compose:compose-bom:2025.06.00\"))\n    implementation(\"androidx.compose.ui:ui\")\n    implementation(\"androidx.compose.material3:material3\")\n    implementation(\"androidx.compose.foundation:foundation\")\n    implementation(\"androidx.compose.ui:ui-tooling-preview\")\n    implementation(\"se.warting.signature:signature-pad:0.1.2\")\n    implementation(\"androidx.activity:activity-ktx:1.9.3\")\n    implementation(\"androidx.constraintlayout:constraintlayout:2.2.2\")\n    implementation(\"androidx.core:core-ktx:1.10.1\")\n    implementation(\"org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.1\")\n    implementation(\"androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7\")\n    implementation(\"androidx.lifecycle:lifecycle-runtime-ktx:2.8.7\")\n    implementation(\"androidx.appcompat:appcompat:1.7.1\")\n    implementation(\"com.google.android.material:material:1.12.0\")\n    implementation(\"javax.inject:javax.inject:1\")\n    implementation(\"com.squareup.retrofit2:retrofit:2.9.0\")\n    implementation(\"com.squareup.retrofit2:converter-moshi:2.9.0\")\n    implementation(\"com.squareup.okhttp3:logging-interceptor:4.12.0\")\n    implementation(\"com.amazonaws:aws-android-sdk-core:2.73.0\")\n    implementation(\"com.amazonaws:aws-android-sdk-cognitoidentityprovider:2.73.0\")\n    implementation(\"com.amazonaws:aws-android-sdk-logs:2.73.0\")\n}") + `<h2>Permisos e instalación</h2><p>El manifiesto del AAR incorpora INTERNET para las APIs y descargas, NFC para la lectura, y REQUEST_INSTALL_PACKAGES y REQUEST_DELETE_PACKAGES para gestionar Cloud Commerce con confirmación del usuario.</p><p>En DEV, QA y UAT, el SDK descarga la variante correspondiente y abre la configuración de instalación desde esta fuente cuando Android lo requiere. Los archivos se guardan en la caché privada de la aplicación.</p><p>En PROD, la instalación se realiza desde Google Play. Para una variante dedicada a producción, elimina los permisos de instalación y desinstalación del manifiesto fusionado:</p>` + code(`<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">
    <uses-permission
        android:name="android.permission.REQUEST_INSTALL_PACKAGES"
        tools:node="remove" />
    <uses-permission
        android:name="android.permission.REQUEST_DELETE_PACKAGES"
        tools:node="remove" />
</manifest>`) + `<p>Coloca esta configuración en el AndroidManifest.xml del source set de producción. Si release también se utiliza para UAT, usa un flavor de producción para separar esta configuración. StageEnum selecciona el ambiente durante la ejecución; los permisos del manifiesto se definen al compilar.</p><h2>Inicialización</h2>` + code(`private val commerceManager = DataFastCommerceManager()

commerceManager.initialize(
    context = this,
    credentials = credentials,
    listener = object : InitializeListener {
        override fun onSuccess() { /* SDK listo para cobrar */ }
        override fun onError(error: DataFastPaymentException) { /* Gestiona el error */ }
        override fun onLog(message: String) { /* Estados y logs del comercio */ }
    },
    stage = StageEnum.UAT,
    debugProperties = null
)`) + `<h2>Realizar un cobro</h2><p><code>taxableAmount</code> incluye IVA; <code>zeroAmount</code> es el monto de tarifa cero. <code>amount</code> debe ser la suma de ambos. No agregues el IVA otra vez.</p>` + code(`val request = PaymentRequest(
    amount = BigDecimal("11.50"),
    taxableAmount = BigDecimal("11.50"),
    zeroAmount = BigDecimal("0.00")
)
commerceManager.charge(this, request, object : CommerceListener {
    override fun onSuccess(result: ChargeResult) { /* Cobro aprobado */ }
    override fun onError(error: DataFastPaymentException) { /* Gestiona el error */ }
})`) + next('sandbox','Ambientes y modo sandbox'),
 pruebas: () => intro('PRUEBAS', 'Ambientes y pruebas', 'El ambiente de las APIs de Datafast y la variante de Cloud Commerce son configuraciones independientes.') + table(['Ambiente','Base de las APIs','Cloud Commerce predeterminado'],Object.entries(environments).map(([env, url]) => [env.toUpperCase(),`<code>${url}</code>`,env === 'prod' ? 'Release · Google Play' : 'Debug / MTF'])) + notice('UAT por defecto en la wiki', 'El selector del encabezado actualiza la ruta /dev, /qa, /uat o /prod y el destino de las peticiones. Sin un ambiente indicado, se utiliza UAT.') + `<h2>Permisos y dispositivo</h2><p>El SDK valida NFC antes de abrir el lector. Cloud Commerce gestiona sus permisos de ubicación, micrófono y Bluetooth. Para instalar MTF o mock, Android puede solicitar autorización para instalar desde esta fuente.</p><h2>Escenarios de la mock</h2>` + table(['Monto USD','Respuesta simulada'],[['1.11','Mastercard aprobada'],['1.12','Visa aprobada'],['1.13','Amex aprobada'],['2.23','Fondos insuficientes'],['2.24','Tarjeta expirada']]) + next('sandbox','Modo sandbox'),
 sandbox: () => intro('PRUEBAS', 'Modo sandbox', 'Prueba el flujo con la aplicación mock de Cloud Commerce. La lectura devuelve respuestas simuladas y no representa un cobro bancario real.') + code(`debugProperties = DebugProperties(
    sandbox = true,
    forceSignature = false,
    demoLogin = false
)`) + table(['Opción','Valor por defecto','Comportamiento'],[['sandbox','false','true selecciona la APK mock; false o null usa MTF en DEV, QA y UAT.'],['forceSignature','false','Fuerza la captura de firma para probar ese flujo.'],['demoLogin','false','true usa el login interno de email/password; false utiliza credentials como x-df-key.']]) + notice('Opciones independientes', 'Sandbox no cambia el stage de las APIs de Datafast. Por ejemplo, StageEnum.UAT continúa utilizando UAT aunque la lectura se simule con la mock.') + `<h2>Instalación de Cloud Commerce</h2><p>Si no está instalada la variante correcta, la UI del SDK ofrece descargarla. Una APK incompatible debe desinstalarse antes de instalar la correspondiente. El usuario confirma los permisos y la instalación en Android.</p>` + notice('Restricción de producción', 'En PROD, todo el objeto debugProperties debe ser null. Enviar un objeto, incluso con todas sus propiedades en false, produce DF011 en initialize().') + next('certificacion','Certificación Datafast'),
 certificacion: () => intro('PASA A PRODUCCIÓN', 'Certificación Datafast', 'Datafast debe validar y certificar la correcta integración del SDK en UAT antes de habilitar el acceso productivo.') + `<h2>Proceso de validación</h2><p>Coordina con Datafast la revisión de los flujos implementados y los escenarios que deban validarse. La certificación aplica también a comercios que ya están afiliados en producción.</p><h2>Información para la revisión</h2><ul><li>Aplicación y versión del SDK integradas.</li><li>Evidencia de las pruebas realizadas en UAT.</li><li>Resultados de los flujos de cobro, anulación, consulta y manejo de errores.</li></ul>` + notice('La mock no sustituye la certificación', 'Utiliza la mock para validar escenarios simulados; coordina con Datafast las pruebas necesarias de la integración en UAT.') + `<h2>Producción · R8 y ProGuard</h2><p>El AAR incluye reglas de consumidor que Android aplica automáticamente. Configura la minificación de tu aplicación en release:</p>` + code(`android {
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}`) + `<p>Agrega las reglas específicas de tu aplicación en <code>proguard-rules.pro</code>. Valida inicialización, cobro y firma con la variante release antes de la certificación.</p>` + `<h2>Reglas ProGuard incluidas en el AAR</h2><p>Estas reglas preservan las firmas y anotaciones que utiliza Retrofit, los campos CREATOR de Parcelable y los nombres de enums utilizados en los contratos. Se aplican automáticamente desde el AAR durante la compilación de la aplicación.</p>` + code("# Retrofit lee por reflexi\u00f3n las firmas suspend y los tipos de Response<T>.\n-keepattributes Signature,InnerClasses,EnclosingMethod,RuntimeVisibleAnnotations,RuntimeVisibleParameterAnnotations,AnnotationDefault\n-keep,allowobfuscation interface ec.com.datafast.commerce.payment.abstracts.endpoints.** {\n    @retrofit2.http.* <methods>;\n}\n-keep,allowoptimization,allowshrinking,allowobfuscation class kotlin.coroutines.Continuation\n-keep,allowoptimization,allowshrinking,allowobfuscation class retrofit2.Response\n\n# Android reconstruye los Parcelable mediante su campo CREATOR.\n-keepclassmembers class ec.com.datafast.commerce.payment.** implements android.os.Parcelable {\n    public static final android.os.Parcelable$Creator CREATOR;\n}\n\n# Nombres de los enums utilizados en el contrato JSON y de CVM.\n-keepclassmembers enum ec.com.datafast.commerce.payment.data.enums.TaxRegimen { <fields>; }\n-keepclassmembers enum ec.com.datafast.commerce.payment.business.charge.data.enums.CvmResult { <fields>; }\n\n# Moshi/KSP y Retrofit incluyen sus reglas propias en META-INF/proguard.\n") + next('produccion','Habilitación productiva'),
 produccion: () => intro('PASA A PRODUCCIÓN', 'Habilitación productiva', 'Después de la certificación, Datafast proporciona el acceso a la API productiva y las credenciales correspondientes.') + steps([['Certificación aprobada','Datafast confirma la correcta integración en UAT.'],['Afiliación productiva','Completa la afiliación en TenTen productivo cuando corresponda.'],['Configura producción','Utiliza credenciales productivas, StageEnum.PROD y debugProperties = null.']]) + external(productionDownload,'Descargar TenTen productivo') + notice('Cloud Commerce en producción', 'El SDK exige la variante release no depurable de Cloud Commerce. Si falta o es incompatible, muestra la acción correspondiente para instalarla desde Google Play.'),
 errores: () => intro('CONSULTA', 'Errores y diagnóstico', 'Este catálogo describe los errores públicos del SDK. Los mensajes técnicos crudos de las APIs quedan exclusivamente en CloudWatch.') + table(['Código','Descripción','Acción recomendada'],[['DF001','Cloud Commerce no instalada','Instala la variante ofrecida por el SDK.'],['DF002','Solicitud de cobro inválida','Revisa montos, decimales y Activity compatible.'],['DF005','No se pudo procesar la transacción','Consulta el estado antes de repetir un cobro si existe duda sobre su resultado.'],['DF006','Transacción declinada','Verifica los datos o utiliza otro método de pago.'],['DF007','Cobro cancelado','Inicia otro cobro cuando el usuario lo solicite.'],['DF008','SDK no inicializado','Espera el onSuccess de initialize().'],['DF009','Cobro en curso','Espera el resultado de la operación actual.'],['DF010','Error de autenticación','Revisa el ambiente y las credenciales.'],['DF011','Inicialización inválida','Revisa credentials; en PROD envía debugProperties = null.'],['DF012 / DF013','Cloud Commerce incompatible','Instala la variante compatible con la configuración.'],['DF014','NFC no disponible','Utiliza un dispositivo con NFC.'],['DF015','NFC desactivado','Abre los ajustes y activa NFC.']]) + `<h2>Logs del comercio</h2><p><code>InitializeListener.onLog(message)</code> recibe los cambios de estado y el request/response del lector con secretos ocultos.</p>` + code(`🔷 [initialize] state=READY
🚀 [CloudCommerce] request=...
⚠️ [CloudCommerce] response={"status":"DECLINED", ...}
❌ [charge] No se pudo procesar la transacción`) + `<p>Los fallos de APIs se comunican con mensajes generales. En ambientes bajos, la pantalla de error incluye «Datos de depuración». En PROD ese botón está oculto.</p>`,
 referencia: () => intro('REFERENCIA', 'API pública del SDK', 'Solo se documentan clases, métodos, modelos, enums y listeners públicos. Las implementaciones internal quedan fuera de la referencia.') + table(['Elemento','Responsabilidad'],[['DataFastCommerceManager','initialize() y charge().'],['InitializeListener','onSuccess(), onError(error) y onLog(message).'],['CommerceListener','onSuccess(result) y onError(error).'],['PaymentRequest','amount, taxableAmount y zeroAmount.'],['ChargeResult','transactionId, providerTransactionId, cardName, cardholder, date, status y maskedPan.'],['DebugProperties','sandbox, forceSignature y demoLogin.'],['StageEnum','Selecciona el ambiente. Para integración se documentan DEV, QA, UAT y PROD.'],['PaymentMethod','CLOUD_COMMERCE.'],['DataFastPaymentException','Código público del error y detalles disponibles.'],['DataFastPaymentErrorEnum','Catálogo de códigos y mensajes del SDK.']]) + `<h2>Fecha del resultado</h2><p><code>ChargeResult.date</code> expresa milisegundos Unix. Los campos opcionales dependen de la información recibida del proveedor.</p>`,
 descargas: () => intro('RECURSOS', 'Demo y descargas', 'Descarga una versión específica del SDK e integra sus AAR en tu aplicación.') + `<div class="try-panel"><div class="try-header"><h2>Descargar AAR</h2></div><form id="download-form" class="try-form"><div class="field"><label for="artifact-version">Versión publicada</label><input id="artifact-version" required placeholder="Ej.: 1.39.54-ALPHA" pattern="[0-9]+[.][0-9]+[.][0-9]+(-ALPHA)?"><small>Ingresa una versión existente. Los ALPHA se eliminan automáticamente después de 30 días.</small></div><div class="actions"><button type="submit" class="button primary" name="variant" value="release">Descargar release</button></div><p id="download-result" class="api-note" aria-live="polite"></p></form></div>${environment === 'uat' ? '<h2>Prueba la experiencia</h2><p>Descarga la demo para conocer la experiencia de cobro.</p><div class="actions"><a class="button primary" href="https://d3qduyc2dlz2jg.cloudfront.net/datafast-commerce-payment-sdk/DataTapDemo.apk">Descargar demo</a></div>' : ''}<h2>Demo independiente</h2><p>El proyecto de ejemplo consume los AAR locales de Commerce y los dos AAR de branding, sin depender del código fuente del SDK.</p><div class="actions"><a class="button primary" href="https://d3qduyc2dlz2jg.cloudfront.net/datafast-commerce-payment-sdk/DataTapDemo-source.zip">Descargar proyecto demo · ZIP</a></div>` + `<h2>Dependencias de branding</h2><div class="branding-downloads"><a class="branding-download" href="https://d3qduyc2dlz2jg.cloudfront.net/datafast-commerce-payment-sdk/sonic-sdk-release-1.5.4.aar"><img src="assets/brand-mastercard.png" alt="Mastercard"><span><strong>Descargar Sonic</strong><small>Versión 1.5.4 · AAR</small></span></a><a class="branding-download" href="https://d3qduyc2dlz2jg.cloudfront.net/datafast-commerce-payment-sdk/visa-sensory-branding-2.3.aar"><img src="assets/brand-visa.png" alt="Visa"><span><strong>Descargar Visa Sensory</strong><small>Versión 2.3 · AAR</small></span></a></div><h2>Convención de nombres</h2>` + code(`datafast-commerce-payment-sdk-<version>.aar`),
 soporte: () => intro('AYUDA', 'Soporte de la integración', 'Reporta a Datafast los problemas encontrados para que el equipo pueda revisar tu caso.') + `<h2>Incluye en tu reporte</h2><ul><li>Ambiente y versión de la aplicación, SDK y Cloud Commerce.</li><li>Fecha y hora del incidente.</li><li>Código público y mensaje recibido.</li><li>Pasos para reproducirlo y capturas relevantes.</li><li>Identificador de transacción, si está disponible.</li></ul>` + notice('Protege la información', 'No compartas contraseñas, API keys, tokens, firmas ni datos completos de tarjetas en capturas, issues o repositorios públicos.') + `<div class="actions">${external('https://datafast.com.ec/','Ir a Datafast')}${external('https://developer.mastercard.com/cloud-commerce-processor/documentation/','Documentación de Mastercard','button secondary')}</div>`
};

// Factory de páginas: cada producto registra sus secciones y selecciona una plantilla.
const productRegistry = window.DatafastProducts;
const productPageFactories = {
  overview: product => intro('PRODUCTOS', product.title, product.description)
    + `<h2>Antes de integrar</h2><p>Completa primero la <a href="#afiliacion">afiliación en TenTen UAT</a> y obtén las credenciales proporcionadas por Datafast.</p>`
    + `<h2>Cómo funciona el cobro</h2>`
    + steps([
      ['Inicializa el SDK', 'Envía credentials y espera el onSuccess del listener de inicialización.'],
      ['Inicia el cobro', 'Construye PaymentRequest con el monto gravado, el monto de tarifa cero y el total.'],
      ['Lee la tarjeta con Cloud Commerce', 'El SDK abre la aplicación compatible para realizar la lectura NFC.'],
      ['Recibe el resultado', 'El SDK valida la respuesta, presenta éxito o error y solicita firma cuando corresponde. El resultado vuelve a CommerceListener.']
    ])
    + `<div class="links">${product.sections.filter(section => section.id !== 'inicio').map(section => `<a class="link-card" href="#productos/${product.id}/${section.id}"><strong>${escapeHtml(section.title)} →</strong><span>Guía de ${escapeHtml(product.title)}</span></a>`).join('')}</div>`,
  afiliacion: () => pages.afiliacion(),
  android: () => pages.android(),
  pruebas: () => pages.pruebas(),
  certificacion: () => pages.certificacion(),
  produccion: () => pages.produccion(),
  soporte: () => pages.soporte(),
  api: () => '',
  sandbox: () => pages.sandbox(),
  errores: () => pages.errores(),
  referencia: () => pages.referencia(),
  descargas: () => pages.descargas()
};
function renderProductNavigation(productId, sectionId) {
  document.getElementById('product-navigation').innerHTML = productRegistry.all().map(product =>
    `<a class="product-heading" href="#productos/${product.id}/inicio" ${product.id === productId ? 'aria-current="page"' : ''}>${escapeHtml(product.title)}</a>`
    + (product.id === productId ? product.sections.map(section => `${section.group ? `<div class="product-nav-group">${escapeHtml(section.group)}</div>` : ''}<a class="subnav" href="#productos/${product.id}/${section.id}" ${section.id === sectionId ? 'aria-current="page"' : ''}>${escapeHtml(section.title)}</a>`).join('') : '')
  ).join('');
}
function createProductPage(productId, sectionId) {
  const product = productRegistry.get(productId);
  const section = product?.sections.find(item => item.id === sectionId);
  const factory = section && productPageFactories[section.template];
  if(!factory) {
    article.innerHTML = intro('PRODUCTOS', 'Sección no disponible', 'El producto o la sección solicitados no están registrados en esta wiki.');
    document.getElementById('breadcrumb-current').textContent = 'Productos';
    return;
  }
  if(section.template === 'api') {
    renderApi(section.api, product);
    return;
  }
  article.innerHTML = factory(product);
  document.getElementById('breadcrumb-current').textContent = `${product.title} · ${section.title}`;
  // Los enlaces de la guía quedan dentro del producto actual.
  for(const link of article.querySelectorAll('a[href^="#"]')) {
    const target = link.getAttribute('href').slice(1);
    if(product.sections.some(item => item.id === target)) link.setAttribute('href', `#productos/${product.id}/${target}`);
  }
  if(section.template === 'descargas') wireDownload();
}
function routeToEnvironment(nextEnv, replace = false) {
  if (!Object.hasOwn(environments, nextEnv)) nextEnv = 'uat';
  requestController?.abort(); generation++;
  authorizationToken = '';
  environment = nextEnv;
  const url = `${siteBase}${environment}${location.hash || '#inicio'}`;
  history[replace ? 'replaceState' : 'pushState']({environment}, '', url);
  render();
}
function updateEnvironmentHeader() {
  envSelect.value = environment;
  document.getElementById('sidebar-environment').textContent = `${environment.toUpperCase()} · ${environment === 'prod' ? 'Producción' : 'Ambiente de pruebas'}`;
}
function decorateDownloadButtons() {
  const icon = '<svg class="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/></svg>';
  article.querySelectorAll('a, button').forEach(element => {
    if (!element.textContent.trim().startsWith('Descargar') && !element.classList.contains('branding-download')) return;
    element.classList.add('download-control');
    element.insertAdjacentHTML(element.classList.contains('branding-download') ? 'beforeend' : 'afterbegin', icon);
  });
}
function render() {
  requestController?.abort(); generation++;
  let hash = location.hash.slice(1) || 'inicio';
  const sharedLegacySections = ['afiliacion','android','sandbox','errores','referencia','descargas','pruebas','certificacion','produccion','soporte'];
  if(hash.startsWith('apis/') || sharedLegacySections.includes(hash)) {
    hash = `productos/t2p/${hash}`;
    history.replaceState({environment}, '', `${siteBase}${environment}#${hash}`);
  }
  const [section, api = 't2p'] = hash.split('/');
  const productSection = hash.split('/').slice(2).join('/') || 'inicio';
  renderProductNavigation(section === 'productos' ? api : null, productSection);
  updateEnvironmentHeader();
  document.querySelectorAll('aside [data-section]').forEach(link => {
    link.toggleAttribute('aria-current', link.dataset.section === section);
    if (link.dataset.section === section) link.setAttribute('aria-current','page');
  });
  document.querySelectorAll('aside [data-api]').forEach(link => {
    link.removeAttribute('aria-current');
    if(section === 'apis' && link.dataset.api === api) link.setAttribute('aria-current','page');
  });
  if(section === 'productos') createProductPage(api, productSection);

  else {
    const page = Object.hasOwn(pages, section) ? section : 'inicio';
    article.innerHTML = pages[page]();
    document.getElementById('breadcrumb-current').textContent = article.querySelector('h1').textContent;
    if(page === 'descargas') wireDownload();
  }
  if(['dev', 'qa'].includes(environment)) {
    article.insertAdjacentHTML('afterbegin', `<div class="internal-environment-banner" role="note"><strong>${environment.toUpperCase()} · Pruebas internas</strong><span>Este ambiente está orientado a pruebas internas del equipo de desarrollo de Datafast.</span></div>`);
  }
  decorateDownloadButtons();
  document.title = `${article.querySelector('h1').textContent} · Datafast`;
}
function apiUrl(path) {
  if(environment === 'prod') throw new Error('El probador no está disponible en producción.');
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('#')) throw new Error('Ingresa una ruta relativa que comience con /, sin dominio ni fragmento.');
  const url = new URL(environments[environment] + path);
  if(url.origin !== environments[environment]) throw new Error('El destino debe pertenecer al ambiente seleccionado.');
  return url.href;
}
function loginResponseSchema(key) {
  if(key !== 'login') return '';
  return `<section class="api-schema"><h2>Respuesta · 200 OK</h2><p class="api-note">Estructura de referencia basada en el modelo actual del SDK.</p>${code(JSON.stringify({
    idToken: '<idToken>',
    accessToken: '<accessToken>',
    refreshToken: '<refreshToken>',
    expiresIn: 3600,
    createdAt: '<fecha de creación>',
    mobilePhone: null,
    welcomeName: null,
    forceChangePassword: false,
    isAllowedToTransact: null
  }, null, 2))}</section>`;
}
function renderApi(key, product) {
  const apiDefinitions = product.apis;
  const api = apiDefinitions[key];
  document.getElementById('breadcrumb-current').textContent = `${product.title} · APIs · ${api.title}`;
  if(environment === 'prod') {
    article.innerHTML = intro('APIS DE INTEGRACIÓN', api.title, api.description)
      + `<div class="api-topline"><span class="method ${api.method === 'GET' ? 'get' : ''}">${api.method}</span><code>${escapeHtml(environments.prod + (api.path || '/…'))}</code></div>`
      + `<div class="api-tabs">${Object.entries(apiDefinitions).map(([id, def]) => `<a href="#productos/${product.id}/apis/${id}" ${id === key ? 'aria-current="page"' : ''}>${def.title}</a>`).join('')}</div>`
      + loginResponseSchema(key)
      + notice('Producción · Solo documentación', 'El probador de APIs está disponible únicamente en DEV, QA y UAT. No se solicitan credenciales ni se envían peticiones productivas desde esta wiki.')
      + '<button class="button primary" id="switch-to-uat" type="button">Probar en UAT →</button>';
    document.getElementById('switch-to-uat').addEventListener('click', () => routeToEnvironment('uat'));
    return;
  }
  article.innerHTML = intro('APIS DE INTEGRACIÓN',api.title,api.description) + `<div class="api-topline"><span class="method ${api.method === 'GET' ? 'get' : ''}">${api.method}</span><code id="endpoint-label">${escapeHtml(environments[environment] + (api.path || '/…'))}</code></div><div class="api-tabs">${Object.entries(apiDefinitions).map(([id, def]) => `<a href="#productos/${product.id}/apis/${id}" ${id === key ? 'aria-current="page"' : ''}>${def.title}</a>`).join('')}</div>${!api.path ? notice('Contrato pendiente', 'No se ha precargado un endpoint ni un request inventado. Completa los campos usando el contrato proporcionado por Datafast.') : ''}<div class="try-panel"><div class="try-header"><h2>Probar esta API</h2><span class="env-badge">${environment.toUpperCase()}</span></div><form id="api-form" class="try-form"><div class="field"><label for="api-path">Ruta del endpoint</label><input id="api-path" required value="${api.path}" ${key === 'login' ? 'readonly' : ''} placeholder="/ruta/proporcionada/por/datafast" autocomplete="off" spellcheck="false"><small>Base: ${environments[environment]}</small></div><div class="field ${key !== 'login' ? 'token-field' : ''}" ${key !== 'login' ? 'hidden' : ''}><label for="api-secret">${key === 'login' ? 'Credencial · x-df-key' : 'Token · Authorization'}</label><div class="input-row"><input id="api-secret" type="password" ${key === 'login' ? 'required' : ''} autocomplete="off" spellcheck="false" placeholder="${key === 'login' ? 'Ingresa tu credencial de este ambiente' : 'Pega el token obtenido en el login'}"><button class="button secondary" type="button" id="show-secret" aria-label="Mostrar credencial" aria-pressed="false">Mostrar</button></div><small>Solo se conserva en memoria durante esta sesión. Al cambiar de ambiente se elimina el token.</small></div>${key !== 'login' ? '<p id="token-note" class="token-note"></p>' : ''}<div class="field body-editor" ${api.method === 'GET' || key === 'login' ? 'hidden' : ''}><label for="api-body">Body · application/json</label><textarea id="api-body" spellcheck="false" ${key === 'login' ? 'readonly' : ''}>{}</textarea></div><div class="field-title">Vista previa del request</div><pre class="request-preview" id="request-preview"></pre><div class="actions"><button id="send-request" type="submit" class="button primary">Enviar petición →</button><button id="copy-curl" type="button" class="button secondary">Copiar cURL</button><button id="cancel-request" type="button" class="button secondary" hidden>Cancelar</button></div><p id="request-error" class="request-error" role="alert" hidden></p><p class="api-note">Las peticiones salen directamente desde tu navegador. Si el backend no permite CORS para este sitio, puedes probar el cURL en tu terminal o Postman.</p></form><div class="response"><div class="response-bar"><strong>Respuesta</strong><span id="response-meta">Sin ejecutar</span></div><div id="response-empty" class="response-empty">La respuesta aparecerá aquí cuando envíes una petición.</div><pre id="response-body" hidden></pre></div></div>${loginResponseSchema(key)}`;
  const form = document.getElementById('api-form');
  const pathField = document.getElementById('api-path');
  const secret = document.getElementById('api-secret');
  const body = document.getElementById('api-body');
  const errorBox = document.getElementById('request-error');
  if(key !== 'login') document.getElementById('token-note').textContent=authorizationToken ? 'Sesión lista. La autorización se aplica automáticamente.' : 'Inicia sesión en Login para probar esta API.';
  async function buildRequest() {
    const url = apiUrl(pathField.value.trim());
    const headers = {Accept:'application/json'};
    const gatewayKey = await window.getDatafastTestApiKey(environment);
    if(!gatewayKey) throw new Error('Ingresa la API key del ambiente seleccionado.');
    headers['x-api-key']=gatewayKey;
    if(api.method !== 'GET') headers['Content-Type']='application/json';
    if(key === 'login') {
      if(!secret.value.trim()) throw new Error('Ingresa la credencial x-df-key.');
      headers['x-df-key']=secret.value.trim();
    } else {
      if(!authorizationToken) throw new Error('Primero inicia sesión en Login.');
      headers.Authorization=/^Bearer\s/i.test(authorizationToken) ? authorizationToken : `Bearer ${authorizationToken}`;
    }
    const payload=api.method === 'GET' ? undefined : JSON.stringify(JSON.parse(body.value));
    return {url,headers,payload};
  }
  function preview() {
    const path=pathField.value.trim();
    document.getElementById('endpoint-label').textContent=environments[environment]+(path || '/…');
    document.getElementById('request-preview').textContent=`${api.method} ${environments[environment]}${path || '/…'}\n${api.method !== 'GET' ? 'Content-Type: application/json\n' : ''}${key === 'login' ? 'x-df-key: ••••••••' : 'Authorization: Bearer ••••••••'}${api.method !== 'GET' && key !== 'login' && body.value.trim() !== '{}' ? '\n\n'+body.value : ''}`;
    document.getElementById('send-request').disabled=!path || (key === 'login' ? !secret.value.trim() : !authorizationToken);
  }
  function showError(message) {errorBox.textContent=message;errorBox.hidden=false;}
  pathField.addEventListener('input',preview);secret.addEventListener('input',preview);body.addEventListener('input',preview);
  document.getElementById('show-secret').addEventListener('click',e=>{const visible=secret.type==='password';secret.type=visible?'text':'password';e.currentTarget.textContent=visible?'Ocultar':'Mostrar';e.currentTarget.setAttribute('aria-pressed',String(visible));});
  document.getElementById('cancel-request').addEventListener('click',()=>requestController?.abort());
  document.getElementById('copy-curl').addEventListener('click',async e=>{
    const copyButton = e.currentTarget;
    errorBox.hidden=true;
    try {
      const req=await buildRequest();const quote=v=>"'"+v.replace(/'/g,"'\\''")+"'";
      let curl=`curl --request ${api.method} ${quote(req.url)}`;
      for(const [header,value] of Object.entries(req.headers)) curl+=` \\\n  --header ${quote(header+': '+value)}`;
      if(req.payload !== undefined) curl+=` \\\n  --data-raw ${quote(req.payload)}`;
      await navigator.clipboard.writeText(curl);copyButton.textContent='Copiado';setTimeout(()=>{if(copyButton.isConnected)copyButton.textContent='Copiar cURL';},1800);
    } catch(error){showError(error instanceof SyntaxError ? 'El body debe ser un JSON válido.' : error.message);}
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();errorBox.hidden=true;
    let req;try{req=await buildRequest();}catch(error){showError(error instanceof SyntaxError ? 'El body debe ser un JSON válido.' : error.message);return;}
    const current=++generation;const controller=new AbortController();requestController=controller;
    const button=document.getElementById('send-request'),cancel=document.getElementById('cancel-request');
    button.disabled=true;button.textContent='Enviando…';cancel.hidden=false;
    const started=performance.now();
    try {
      const response=await fetch(req.url,{method:api.method,headers:req.headers,body:req.payload,signal:controller.signal,credentials:'omit',redirect:'error',cache:'no-store'});
      const raw=await response.text();if(current!==generation)return;
      const elapsed=Math.round(performance.now()-started);let parsed;
      try{parsed=JSON.parse(raw);}catch{parsed=null;}
      document.getElementById('response-meta').innerHTML=`<span class="http-badge ${response.ok?'':'error'}">HTTP ${response.status}</span> · ${elapsed} ms`;
      const output=document.getElementById('response-body');output.textContent=parsed!==null?JSON.stringify(parsed,(name,value)=> /^(idToken|accessToken|refreshToken)$/i.test(name) ? '[oculto]' : value,2):(raw || '(Sin contenido)');output.hidden=false;document.getElementById('response-empty').hidden=true;
      if(key==='login' && response.ok && parsed){const token=parsed.idToken || parsed.data?.idToken || parsed.body?.idToken;if(typeof token==='string') authorizationToken=token;}
    } catch(error) {
      if(current!==generation)return;
      document.getElementById('response-meta').textContent=error.name==='AbortError'?'Cancelada':'Sin respuesta HTTP';
      showError(error.name==='AbortError'?'Petición cancelada.':'No se pudo leer la respuesta. Revisa la conexión y CORS del backend. Puedes copiar el cURL para probar fuera del navegador.');
    } finally {
      if(current===generation){button.textContent='Enviar petición →';cancel.hidden=true;requestController=null;preview();}
    }
  });
  preview();
}
function wireDownload() {
  document.getElementById('download-form').addEventListener('submit',event=>{
    event.preventDefault();const version=document.getElementById('artifact-version').value.trim();
    if(!/^\d+\.\d+\.\d+(?:-ALPHA)?$/.test(version)) {
      document.getElementById('download-result').textContent='Ingresa una versión válida, por ejemplo 1.39.54 o 1.39.54-ALPHA.';
      return;
    }
    const file=`datafast-commerce-payment-sdk-${version}.aar`;
    const path=/ALPHA/i.test(version)?'alpha/':'';
    const url=`https://d3qduyc2dlz2jg.cloudfront.net/datafast-commerce-payment-sdk/${path}${encodeURIComponent(file)}`;
    const result=document.getElementById('download-result');result.replaceChildren();
    const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=file;result.append(a);
    a.click();
  });
}
// GitHub Pages sirve rutas profundas mediante 404.html y esta normalización.
history.replaceState({environment},'',`${siteBase}${environment}${location.hash || '#inicio'}`);
envSelect.addEventListener('change',()=>routeToEnvironment(envSelect.value));
window.addEventListener('hashchange',()=>{render();document.getElementById('sidebar').classList.remove('open');document.getElementById('menu').setAttribute('aria-expanded','false');});
window.addEventListener('popstate',()=>{const match=location.pathname.match(/\/(dev|qa|uat|prod)(?:\/|$)/);const restored=match?.[1] || 'uat';if(restored!==environment){authorizationToken='';environment=restored;}render();});
document.getElementById('menu').addEventListener('click',e=>{const open=document.getElementById('sidebar').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',String(open));});
render();
})();
