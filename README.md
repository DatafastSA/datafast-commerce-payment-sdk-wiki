# Wiki · Datafast Commerce Payment SDK

Frontend estático para GitHub Pages. No requiere instalar dependencias ni compilar.

## Vista local

```bash
python3 serve.py
```

Abre `http://127.0.0.1:8765/`. El servidor local soporta las rutas `/dev`, `/qa`, `/uat` y `/prod`.

## Publicación en GitHub Pages

En Settings → Pages, selecciona GitHub Actions. El workflow `.github/workflows/pages.yml` publica el sitio automáticamente en cada push a `main`. Los archivos `index.html`, `assets/`, `.nojekyll` y `404.html` deben publicarse juntos. El fallback de GitHub Pages conserva el ambiente de las rutas profundas y la sección seleccionada. No se modifica el backend desde este repositorio.

## Ambientes y probador

- UAT es el ambiente predeterminado.
- El selector del encabezado cambia la ruta y el origen de los requests.
- El login usa POST `/users/api/v1/auth/login`, header `x-df-key` y body `{}`.
- Void y consulta tienen formularios con endpoint pendiente: no se inventan sus rutas ni contratos.
- La credencial del comercio (`x-df-key`) se ingresa en el navegador para DEV, QA o UAT. No se precarga ni se guarda en localStorage/sessionStorage. PROD no tiene probador ni solicita credenciales.
- Las API keys de DEV, QA y UAT se inyectan desde `assets/environments.js`; no se muestran en la interfaz. Son configuración del frontend, no secretos inaccesibles a quien inspeccione el sitio.
- El token obtenido del login solo se conserva en memoria y se elimina al cambiar de ambiente.
- Los requests se envían solo al origen Datafast del ambiente seleccionado, por acción explícita del usuario.
- CORS debe ser habilitado en el backend para el origen real de GitHub Pages. Mientras esté pendiente, el probador permite copiar un cURL.
- En PROD solo se muestra documentación. No hay formulario, envío de peticiones ni cURL ejecutable. El constructor de requests también rechaza producción.

## Contenido

Afiliación en TenTén UAT, integración Android, APIs, pruebas, sandbox, certificación de Datafast, producción, errores públicos, referencia pública del SDK, demo, descargas y soporte. La API de afiliación tiene únicamente una sección reservada.

## Productos y factory de documentación

`assets/products.js` registra los productos disponibles y sus secciones. El primero es **Cobro con celular (T2P)**, con rutas como `#productos/t2p/android`. El menú se genera desde ese registro.

Para agregar un producto, registra su ID, título, descripción y secciones; cada sección selecciona una plantilla de `productPageFactories` en `assets/app.js`. Se pueden reutilizar plantillas o agregar una específica. No es necesario duplicar la navegación ni el selector de ambientes. Cada producto posee afiliación, integración, APIs, pruebas, sandbox, certificación, producción, errores, referencia pública, descargas y soporte. La afiliación es el primer paso antes del SDK dentro de cada producto. Las definiciones de APIs también pertenecen al registro del producto; no existe un catálogo global compartido.

Este factory pertenece al frontend de documentación, no es una nueva clase pública del SDK.

## Pruebas automatizadas

Requiere Node.js 20 o superior. Ejecuta `npm ci` y `npm test`. Las pruebas utilizan un DOM simulado y respuestas controladas; no consumen las APIs reales. Cubren rutas, ambientes, restricciones de producción, descargas, cifrado y transferencia del idToken entre APIs.

El archivo `docs/pages.yml.example` contiene el workflow de Pages con pruebas previas al despliegue. Copia su contenido en `.github/workflows/pages.yml` desde GitHub; la credencial local no permite subir workflows.
