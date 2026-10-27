/* Registro extensible de productos de la wiki; no modifica la API del SDK. */
(() => {
  'use strict';
  const products = new Map();
  function register(product) {
    if (!/^[a-z0-9-]+$/.test(product.id) || !product.title || !Array.isArray(product.sections)) {
      throw new Error('La definición del producto no es válida.');
    }
    if (products.has(product.id)) throw new Error('El producto ya está registrado.');
    products.set(product.id, Object.freeze({
      ...product,
      sections: Object.freeze(product.sections.map(section => Object.freeze({...section})))
    }));
  }
const apis = {
 login: {title:'Login', method:'POST', path:'/users/api/v1/auth/login', description:'Autentica la cuenta de servicio mediante la credencial enviada en el header x-df-key.'},
 consulta: {title:'Consulta de transacción', method:'GET', path:'/transactions/api/v1/T2P/getTransaction/{transactionId}', description:'Consulta el detalle de un cobro mediante el identificador de la transacción de Datafast en {transactionId}. La autorización utiliza el idToken obtenido en el login.'},
 void: {title:'Anulación · Void', method:'POST', path:'', description:'La ruta y el contrato de anulación están pendientes de confirmación. Puedes completar una ruta relativa y el body para probar un contrato que ya tengas.'}
};
  register({
    id: 't2p',
    title: 'Cobro con celular (T2P)',
    apis,
    description: 'Integra el cobro sin contacto de TenTen de Datafast en Android, utilizando Cloud Commerce para la lectura de la tarjeta.',
    sections: [
      {id: 'inicio', title: 'Visión general', template: 'overview'},
      {id: 'afiliacion', title: 'Afiliación y credenciales', template: 'afiliacion'},
      {id: 'android', title: 'Integración Android', template: 'android'},
      {id: 'apis/login', title: 'Login', template: 'api', api: 'login', group: 'APIs de integración'},
      {id: 'apis/consulta', title: 'Consulta de transacción', template: 'api', api: 'consulta'},
      {id: 'apis/void', title: 'Anulación · Void', template: 'api', api: 'void'},
      {id: 'pruebas', title: 'Ambientes y pruebas', template: 'pruebas'},
      {id: 'sandbox', title: 'Modo sandbox', template: 'sandbox'},
      {id: 'certificacion', title: 'Certificación Datafast', template: 'certificacion'},
      {id: 'produccion', title: 'Habilitación productiva', template: 'produccion'},
      {id: 'errores', title: 'Errores y logs', template: 'errores'},
      {id: 'referencia', title: 'Referencia pública', template: 'referencia'},
      {id: 'descargas', title: 'Demo y descargas', template: 'descargas'},
      {id: 'soporte', title: 'Soporte', template: 'soporte'}
    ]
  });
  window.DatafastProducts = Object.freeze({
    register,
    get: id => products.get(id),
    all: () => Array.from(products.values())
  });
})();
