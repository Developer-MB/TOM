# Backend de Time of Metal

La API está organizada por dominios en `src/routes/cms`, `src/routes/public`,
`src/services` y `src/middleware`. Todas las escrituras del CMS usan Firestore;
las imágenes nuevas se almacenan en Firebase Storage. La misma aplicación
Express se ejecuta en Firebase Functions, Vercel y en el servidor local.

## Requisitos

- Node.js 22.
- Un proyecto Firebase con Firestore, Storage y Authentication habilitados.
- Proveedor **Correo electrónico/contraseña** habilitado en Firebase Authentication.
- Acceso de administrador a Firebase CLI (`firebase login`) y credenciales
  Admin SDK para tareas locales y despliegues fuera de Firebase.

## Variables de entorno

Usa `.env.example` como referencia para las variables del frontend y cópialo
localmente a `.env`. Los valores `VITE_FIREBASE_*` son configuración web pública;
no pongas credenciales de servicio bajo el prefijo `VITE_`.

El backend usa Application Default Credentials en Google Cloud/Firebase. Para
desarrollo local o Vercel configura `FIREBASE_PROJECT_ID` y la variable secreta
`FIREBASE_SERVICE_ACCOUNT_JSON` con el JSON completo de una cuenta de servicio.
Configura `FIREBASE_STORAGE_BUCKET` con el bucket exacto del proyecto. Nunca
guardes ni publiques ese JSON en el repositorio. `CMS_ADMIN_EMAILS` es una lista
opcional de correos verificados separados por comas para autorizar el API; para
subir imágenes, el usuario también necesita el custom claim `admin: true`.

## Habilitar un administrador

1. Crea la cuenta en Firebase Authentication y verifica su correo.
2. Desde un entorno con credenciales Admin SDK del proyecto correcto, ejecuta:

   ```sh
   npm --prefix backend run set-admin -- admin@tudominio.com
   ```

3. La persona debe cerrar sesión y volver a iniciarla para recibir el claim.

El claim autoriza operaciones CMS y cargas de imágenes. Firestore no permite
acceso directo desde clientes; la API verifica el Firebase ID token en cada
ruta `/api/cms/**`.

## Migrar los datos JSON existentes

Antes de migrar, confirma que `FIREBASE_PROJECT_ID` apunta al proyecto deseado y
que las cinco listas `data/post-*.json` contienen los datos correctos. Después:

```sh
npm --prefix backend run migrate:cms
```

El script crea documentos en `cms_posts`, `cms_galleries`, `cms_videos`,
`cms_tours` y `cms_merch`, y prepara los contadores de códigos. No borra ni
modifica los JSON. No sobrescribe documentos existentes: permite reintentos
cuando los documentos existentes coinciden con el origen y se detiene si
encuentra diferencias o registros no incluidos en los JSON. Conserva las rutas
de imágenes antiguas bajo `public/image/`; las cargas nuevas van a Storage.

## Desarrollo local

1. Configura `.env`, credenciales Firebase Admin y las variables `VITE_*`.
2. Instala dependencias en la raíz y en `backend` si aún no están instaladas.
3. Inicia frontend y API:

   ```sh
   npm run dev
   ```

Vite corre en el puerto `3000` y envía `/api` a Express en el `3001`. Para
compilar la función:

```sh
npm --prefix backend run build
```

## Despliegue en Firebase

Configura el proyecto correcto en `.firebaserc`, las variables del frontend en
el entorno de build y despliega:

```sh
npm run build
firebase deploy --only functions:api,hosting,firestore:rules,storage
```

La función `api` utiliza la identidad de servicio de Firebase; no es necesario
subir un JSON de credenciales. Firestore y Storage deben desplegar también sus
reglas. El hosting Firebase por sí solo sirve el frontend; las escrituras CMS
se ejecutan en la Function.

## Despliegue en Vercel

Conecta el repositorio a Vercel con el build `npm run build` y output `dist`.
Agrega las variables `VITE_FIREBASE_*` al entorno de build y agrega como secretos
de runtime `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET` y
`FIREBASE_SERVICE_ACCOUNT_JSON`. Configura también `CMS_ADMIN_EMAILS` si usarás
la lista opcional de correos. El endpoint catch-all `api/[[...path]].ts` envía
todas las rutas API al mismo Express que Firebase.

En ambos proveedores, crea/actualiza Firestore y Storage antes de habilitar el
CMS. El proyecto Firebase, sus reglas, proveedores de Authentication y cuentas
de administrador son configuración externa y no se crean mediante el deploy.

## Endpoints

- Públicos: `GET /api/home/posts`, `/galleries`, `/videos`, `/tours`, `/merch`;
  `GET /api/youtube/videos` requiere `YOUTUBE_API_KEY`.
- Privados: `/api/cms/posts`, `/galleries`, `/videos`, `/tours`, `/merch` y
  `/node-status`. Requieren `Authorization: Bearer <Firebase ID token>` y
  privilegios de administrador.
- `GET /api/health` comprueba que la API responde.
