/* Plantillas del producto "Cobro con celular (TenTén)". Cloud Commerce conserva las suyas en app.js. */
window.DatafastTentenPages = helpers => {
'use strict';
const {intro, notice, code, table, steps, external, next, escapeHtml, environments, productionDownload} = helpers;
const env = helpers.environment;
// Build de prueba de TenTén (Bitrise). Debe coincidir con TentenIntents.TEST_INSTALL_URL del SDK.
const tentenTestDownload = 'https://app.bitrise.io/app/49affc485b3b76ee/installable-artifacts/688810acdec6dab4/public-install-page/37473907b6e8df078e5a88428ab38174';
const tentenDemoDownload = 'https://d3qduyc2dlz2jg.cloudfront.net/datafast-commerce-payment-sdk/DataTapDemo-tenten.apk';
const tentenAppDownload = () => env() === 'prod'
  ? external(productionDownload, 'Descargar TenTén · Google Play', 'button primary')
  : external(tentenTestDownload, `Descargar TenTén · ${env().toUpperCase()}`, 'button primary');

const tentenChargeCode = `commerceManager.charge(
    activity = this,
    request = request,
    listener = chargeListener,
    method = PaymentMethod.TENTEN_PAYMENT
)`;
const tentenVoidCode = `commerceManager.voidTransaction(
    activity = this,
    transactionId = result.transactionId,
    listener = object : CommerceListener {
        override fun onSuccess(result: ChargeResult) { /* Anulación aprobada */ }
        override fun onError(error: DataFastPaymentException) { /* Gestiona el error */ }
    },
    method = PaymentMethod.TENTEN_PAYMENT
)`;

return {
 overview: product => intro('PRODUCTOS', product.title, product.description)
   + `<h2>Antes de integrar</h2><p>Completa primero la <a href="#afiliacion">afiliación en TenTén UAT</a> y obtén las credenciales proporcionadas por Datafast.</p>`
   + `<h2>Cómo funciona el cobro</h2>`
   + steps([
     ['Inicializa el SDK', 'Envía credentials y el tid del lector (prefijo TP) y espera el onSuccess del listener de inicialización.'],
     ['Inicia el cobro con TENTEN_PAYMENT', 'Construye PaymentRequest y llama charge() con PaymentMethod.TENTEN_PAYMENT.'],
     ['Checkout en TenTén', 'El SDK valida la app de TenTén y le envía la solicitud cifrada por deep link. TenTén presenta lectura NFC, firma y resultado con su UI nativa.'],
     ['Recibe el resultado', 'TenTén devuelve la aprobación o el error al SDK y el resultado llega a CommerceListener.']
   ])
   + notice('Anulación desde el SDK', 'Con TenTén puedes anular un cobro aprobado con voidTransaction() y su transactionId. No necesitas una API REST de anulación.')
   + `<div class="links">${product.sections.filter(section => section.id !== 'inicio').map(section => `<a class="link-card" href="#productos/${product.id}/${section.id}"><strong>${escapeHtml(section.title)} →</strong><span>Guía de ${escapeHtml(product.title)}</span></a>`).join('')}</div>`,

 android: () => intro('INTEGRACIÓN', 'SDK Android', 'Configura los AAR locales, inicializa DataFastCommerceManager y elige la experiencia TenTén con PaymentMethod.TENTEN_PAYMENT.')
   + `<h2>Requisitos</h2><ul><li>Android 10 (API 29) o superior.</li><li>Activity basada en AndroidX ComponentActivity.</li><li>Conexión a internet y comercio afiliado en el ambiente correspondiente.</li><li>NFC disponible y habilitado.</li><li>TenTén instalada: la versión de Google Play en PROD o el build de prueba en UAT. En DEV y QA la experiencia TenTén no está habilitada (DF020).</li></ul>`
   + `<h2>Dependencias locales</h2><p>Incluye el AAR release de Commerce y los AAR de Mastercard Sonic y Visa Sensory.</p><a class="button secondary" href="https://d3qduyc2dlz2jg.cloudfront.net/datafast-commerce-payment-sdk/DataTapDemo-source.zip">Descargar proyecto demo · ZIP</a>`
   + code(`dependencies {
    implementation(files("libs/datafast-commerce-payment-sdk-<version>.aar"))
    implementation(files("libs/sonic-sdk-release-1.5.4.aar"))
    implementation(files("libs/visa-sensory-branding-2.3.aar"))
}`)
   + `<h2>Visibilidad de TenTén</h2><p>El manifiesto del AAR declara la consulta del paquete <code>ec.com.datafast.app</code> y del deep link de lectura. No necesitas agregar entradas <code>&lt;queries&gt;</code> en tu aplicación.</p>`
   + `<h2>Inicialización</h2>` + code(`private val commerceManager = DataFastCommerceManager()

commerceManager.initialize(
    context = this,
    credentials = credentials,
    tid = "TP001912",
    listener = initializationListener,
    stage = StageEnum.UAT,
    debugProperties = null
)`)
   + notice('Lector (TID)', 'El tid es obligatorio y debe comenzar con el prefijo TP. Si está vacío, no empieza con TP o no pertenece al comercio, initialize() devuelve DF016.')
   + `<h2>Realizar un cobro</h2><p><code>taxableAmount</code> incluye IVA; <code>zeroAmount</code> es el monto de tarifa cero. <code>amount</code> debe ser la suma de ambos.</p>`
   + code(`val request = PaymentRequest(
    amount = BigDecimal("11.50"),
    taxableAmount = BigDecimal("11.50"),
    zeroAmount = BigDecimal("0.00")
)
${tentenChargeCode}`)
   + notice('Identidad de TenTén', 'El SDK resuelve internamente la app de TenTén autorizada para cada ambiente y valida su firma, su versión y su ambiente antes de enviarle la solicitud cifrada. Solo eliges el PaymentMethod; no envías certificados ni configuración adicional.')
   + `<h2>Anular una transacción</h2><p><code>voidTransaction()</code> anula un cobro aprobado a partir de su <code>transactionId</code>. TenTén muestra el detalle de la transacción y confirma la anulación con el usuario. El resultado llega a <code>CommerceListener</code>.</p>`
   + code(tentenVoidCode)
   + next('pruebas', 'Ambientes y pruebas'),

 pruebas: () => intro('PRUEBAS', 'Ambientes y pruebas', 'El stage selecciona las APIs de Datafast y la versión de TenTén que el SDK acepta.')
   + table(['Ambiente','Base de las APIs','TenTén requerida'], Object.entries(environments).map(([env, url]) => [env.toUpperCase(), `<code>${url}</code>`, env === 'prod' ? 'Oficial · Google Play' : env === 'uat' ? 'Build de prueba (sufijo -uat)' : 'No habilitado · DF020']))
   + notice('UAT por defecto en la wiki', 'El selector del encabezado actualiza la ruta /dev, /qa, /uat o /prod y el destino de las peticiones. Sin un ambiente indicado, se utiliza UAT.')
   + `<h2>Versión de TenTén por ambiente</h2><p>Antes de abrir TenTén, el SDK compara el <code>versionName</code> instalado con el stage:</p>`
   + table(['Stage','TenTén instalada','Acción del SDK'], [
     ['PROD','No instalada','Pantalla de error con acceso a Google Play · DF017'],
     ['PROD','Build de prueba (-dev, -qa, -uat)','Pantalla de error con acción de desinstalar · DF018'],
     ['UAT','No instalada','Pantalla de error que abre la página del build de prueba en el navegador · DF017'],
     ['UAT','Versión oficial','Pantalla de error con acción de desinstalar · DF018'],
     ['DEV, QA','Cualquiera','Pantalla de error sin acciones: operación no habilitada para este ambiente · DF020']
   ])
   + `<h2>Permisos y dispositivo</h2><p>El SDK valida NFC antes de abrir TenTén. TenTén gestiona sus propios permisos durante la lectura.</p>`
   + next('sandbox', 'Modo sandbox'),

 sandbox: () => intro('PRUEBAS', 'Modo sandbox', 'La experiencia TenTén no tiene modo sandbox ni app mock: las pruebas se realizan con el build de prueba de TenTén en UAT.')
   + `<h2>DebugProperties con TenTén</h2><p>Solo se aplica <code>demoLogin</code>. Si envías <code>sandbox</code> o <code>forceSignature</code>, no se aplican.</p>`
   + code(`debugProperties = DebugProperties(
    demoLogin = true
)`)
   + table(['Opción','Con TENTEN_PAYMENT'], [['sandbox','No se aplica.'],['forceSignature','No se aplica. TenTén decide cuándo solicitar firma.'],['demoLogin','true usa el usuario demo; false utiliza credentials como x-df-key.']])
   + notice('Restricción de producción', 'En PROD, todo el objeto debugProperties debe ser null. Enviar un objeto produce DF011 en initialize().')
   + next('certificacion', 'Certificación Datafast'),

 produccion: () => intro('PASA A PRODUCCIÓN', 'Habilitación productiva', 'Después de la certificación, Datafast proporciona el acceso a la API productiva y las credenciales correspondientes.')
   + steps([['Certificación aprobada','Datafast confirma la correcta integración en UAT.'],['Afiliación productiva','Completa la afiliación en TenTén productivo cuando corresponda.'],['Configura producción','Utiliza credenciales productivas, StageEnum.PROD, debugProperties = null y PaymentMethod.TENTEN_PAYMENT.']])
   + `<div class="actions">${external(productionDownload, 'Descargar TenTén · Google Play', 'button primary')}</div>`
   + notice('TenTén en producción', 'El SDK exige la versión oficial de TenTén. Si el dispositivo tiene un build de prueba (-dev, -qa o -uat), muestra la acción para desinstalarlo antes de instalar la versión de Google Play.'),

 errores: () => intro('CONSULTA', 'Errores y diagnóstico', 'Consulta los códigos de error del SDK con la experiencia TenTén y las acciones recomendadas.')
   + table(['Código','Descripción','Acción recomendada'], [
     ['DF002','Solicitud inválida','Revisa montos, decimales, transactionId y Activity compatible.'],
     ['DF003','No se pudo iniciar la transacción','TenTén no tiene disponible la clave de cifrado. Abre TenTén e inicia sesión una vez.'],
     ['DF005','No se pudo procesar la transacción','Consulta el estado antes de repetir un cobro si existe duda sobre su resultado.'],
     ['DF006','Transacción declinada','Verifica los datos o utiliza otro método de pago.'],
     ['DF007','Operación cancelada','Inicia otra operación cuando el usuario lo solicite.'],
     ['DF008','SDK no inicializado','Espera el onSuccess de initialize().'],
     ['DF009','Operación en curso','Espera el resultado de la operación actual.'],
     ['DF010','Error de autenticación','Revisa el ambiente y las credenciales.'],
     ['DF011','Inicialización inválida','Revisa credentials; en PROD envía debugProperties = null.'],
     ['DF014','NFC no disponible','Utiliza un dispositivo con NFC.'],
     ['DF015','NFC desactivado','Abre los ajustes y activa NFC.'],
     ['DF016','Lector no válido','Verifica el tid: debe empezar con TP y estar habilitado para el comercio.'],
     ['DF017','TenTén no instalada','Instala TenTén desde Google Play en PROD o el build de prueba en UAT.'],
     ['DF020','Operación no habilitada para este ambiente','TenTén solo está disponible en UAT y PROD.'],
     ['DF018','TenTén incompatible con el ambiente','Desinstala la versión instalada; el SDK ofrece la acción para instalar la correcta.'],
     ['TAP0002','No se pudo anular la venta','Consulta la transacción antes de reintentar la anulación.']
   ])
   + `<h2>Logs del comercio</h2><p><code>InitializeListener.onLog(message)</code> recibe los cambios de estado del SDK con secretos ocultos.</p>`,

 referencia: () => intro('REFERENCIA', 'API pública del SDK', 'Clases y contratos para integrar la experiencia TenTén en tu aplicación.')
   + `<div class="reference-grid">${[
     ['DataFastCommerceManager', 'Inicializa el SDK, inicia cobros y anula transacciones.', ['initialize()', 'charge()', 'voidTransaction()'], `<h3>charge()</h3>${code(`fun charge(
    activity: Activity,
    request: PaymentRequest,
    listener: CommerceListener,
    method: PaymentMethod = PaymentMethod.CLOUD_COMMERCE
)`)}<p>Envía <code>method = PaymentMethod.TENTEN_PAYMENT</code> para delegar el checkout en TenTén.</p><h3>voidTransaction()</h3>${code(`fun voidTransaction(
    activity: Activity,
    transactionId: String,
    listener: CommerceListener,
    method: PaymentMethod = PaymentMethod.CLOUD_COMMERCE
)`)}<dl><dt>activity</dt><dd>Activity AndroidX basada en ComponentActivity.</dd><dt>transactionId</dt><dd>Identificador Datafast del cobro aprobado (ChargeResult.transactionId). Es obligatorio; vacío produce DF002.</dd><dt>listener</dt><dd>Recibe la anulación aprobada o el error.</dd><dt>method</dt><dd>Debe ser TENTEN_PAYMENT. Con CLOUD_COMMERCE devuelve DF019.</dd></dl>${code(tentenVoidCode)}`],
     ['InitializeListener', 'Recibe el resultado de inicialización y los eventos del SDK.', ['onSuccess()', 'onError(error)', 'onLog(message)'], code(`interface InitializeListener {
    fun onSuccess()
    fun onError(error: DataFastPaymentException)
    fun onLog(message: String) {}
}`)],
     ['CommerceListener', 'Recibe el resultado del cobro o de la anulación.', ['onSuccess(result)', 'onError(error)'], code(`interface CommerceListener {
    fun onSuccess(result: ChargeResult)
    fun onError(error: DataFastPaymentException)
}`) + '<p>Para distinguir un cobro de una anulación, usa el listener correspondiente a cada llamada.</p>'],
     ['PaymentRequest', 'Define los montos del cobro.', ['amount', 'taxableAmount', 'zeroAmount'], code("data class PaymentRequest(\n    val amount: BigDecimal,\n    val taxableAmount: BigDecimal,\n    val zeroAmount: BigDecimal\n)")],
     ['ChargeResult', 'Contiene los datos de la transacción procesada.', ['transactionId', 'providerTransactionId', 'cardName', 'cardholder', 'date', 'status', 'maskedPan'], code("override fun onSuccess(result: ChargeResult) {\n    val transactionId = result.transactionId\n}") + '<p>En una anulación, <code>transactionId</code> identifica la transacción anulada.</p>'],
     ['DebugProperties', 'Configura las opciones de prueba.', ['demoLogin'], code("debugProperties = DebugProperties(\n    demoLogin = true\n)") + '<p>Con TenTén solo se aplica demoLogin. En PROD debe ser null.</p>'],
     ['StageEnum', 'Selecciona el ambiente y la versión de TenTén aceptada.', ['DEV', 'QA', 'UAT', 'PROD'], code("stage = StageEnum.UAT")],
     ['PaymentMethod', 'Selecciona la experiencia de cobro.', ['TENTEN_PAYMENT', 'CLOUD_COMMERCE'], code("enum class PaymentMethod {\n    CLOUD_COMMERCE,\n    TENTEN_PAYMENT\n}") + '<p><code>TENTEN_PAYMENT</code> delega el checkout en la UI nativa de TenTén y habilita voidTransaction().</p>'],
     ['DataFastPaymentException', 'Contiene el código público del error y los detalles disponibles.', [], code("override fun onError(error: DataFastPaymentException) {\n    val publicCode = error.code.code\n}")],
     ['DataFastPaymentErrorEnum', 'Define los códigos y mensajes de error del SDK.', ['TENTEN_NOT_INSTALLED', 'TENTEN_INCOMPATIBLE', 'NOT_IMPLEMENTED'], code("when (error.code) {\n    DataFastPaymentErrorEnum.TENTEN_NOT_INSTALLED -> { /* DF017 */ }\n    DataFastPaymentErrorEnum.TENTEN_INCOMPATIBLE -> { /* DF018 */ }\n    else -> { /* error.code.localMessage */ }\n}")]
   ].map(([name, description, members, details]) => `<section class="reference-card reference-card-expanded"><h2><code>${name}</code></h2><p>${description}</p>${members.length ? `<div class="reference-members">${members.map(member => `<code>${member}</code>`).join('')}</div>` : ''}<div class="reference-details">${details}</div></section>`).join('')}</div>`,

 descargas: () => intro('RECURSOS', 'Demo y descargas', 'Descarga una versión del SDK, la app TenTén del ambiente y la demo con la experiencia TenTén.')
   + `<div class="try-panel"><div class="try-header"><h2>Descargar AAR</h2></div><form id="download-form" class="try-form"><div class="field"><label for="artifact-version">Versión publicada</label><input id="artifact-version" required placeholder="Ej.: 1.39.54-ALPHA" pattern="[0-9]+[.][0-9]+[.][0-9]+(-ALPHA)?"><small>Ingresa una versión existente. Los ALPHA se eliminan automáticamente después de 30 días.</small></div><div class="actions"><button type="submit" class="button primary" name="variant" value="release">Descargar release</button></div><p id="download-result" class="api-note" aria-live="polite"></p></form></div>`
   + (['uat', 'prod'].includes(env())
     ? `<h2>TenTén · ${env() === 'prod' ? 'Producción' : 'UAT'}</h2><p>${env() === 'prod' ? 'Instala la versión oficial de TenTén desde Google Play.' : 'Instala el build de prueba de TenTén. La página se abre en el navegador.'}</p><div class="actions">${tentenAppDownload()}</div>`
     : notice('Operación no habilitada', `La experiencia TenTén no está habilitada en ${env().toUpperCase()}. Utiliza UAT para las pruebas.`))
   + (env() === 'uat' ? `<h2>Prueba la experiencia</h2><p>La demo cobra con TENTEN_PAYMENT y, después de un cobro aprobado, permite anularlo con voidTransaction().</p><div class="actions"><a class="button primary" href="${tentenDemoDownload}">Descargar demo TenTén</a></div>` : '')
   + `<h2>Demo independiente</h2><p>Descarga el proyecto de ejemplo y configúralo para la experiencia TenTén enviando <code>PaymentMethod.TENTEN_PAYMENT</code> en <code>charge()</code> y <code>voidTransaction()</code>.</p><div class="actions"><a class="button primary" href="https://d3qduyc2dlz2jg.cloudfront.net/datafast-commerce-payment-sdk/DataTapDemo-source.zip">Descargar proyecto demo · ZIP</a></div>`
   + `<h2>Dependencias de branding</h2><div class="branding-downloads"><a class="branding-download" href="https://d3qduyc2dlz2jg.cloudfront.net/datafast-commerce-payment-sdk/sonic-sdk-release-1.5.4.aar"><img src="assets/brand-mastercard.png" alt="Mastercard"><span><strong>Descargar Sonic</strong><small>Versión 1.5.4 · AAR</small></span></a><a class="branding-download" href="https://d3qduyc2dlz2jg.cloudfront.net/datafast-commerce-payment-sdk/visa-sensory-branding-2.3.aar"><img src="assets/brand-visa.png" alt="Visa"><span><strong>Descargar Visa Sensory</strong><small>Versión 2.3 · AAR</small></span></a></div>`,

 // La anulación con TenTén es una operación del SDK, no una API REST.
 voidApi: product => intro('APIS DE INTEGRACIÓN', 'Anulación · Void', 'Con TenTén la anulación se realiza desde el SDK con voidTransaction(). No requiere endpoint, credenciales ni token en esta wiki.')
   + `<div class="api-tabs">${Object.entries(product.apis).map(([id, def]) => `<a href="#productos/${product.id}/apis/${id}" ${id === 'void' ? 'aria-current="page"' : ''}>${def.title}</a>`).join('')}</div>`
   + code(tentenVoidCode)
   + notice('Desde el SDK', 'TenTén muestra el detalle de la transacción y confirma la anulación con el usuario. El resultado llega a CommerceListener.')
   + `<p>Consulta el contrato completo en la <a href="#productos/${product.id}/referencia">referencia pública</a>.</p>`
};
};
