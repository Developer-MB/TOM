# Backend de YouTube

Este servidor Express obtiene los videos públicos del canal `@TimeOfMetal-mx` con YouTube Data API v3. La clave se mantiene en el servidor y no se incluye en el bundle del frontend.

## Configuración local

1. Crea una API key de YouTube Data API v3 en Google Cloud Console.
2. En la raíz del proyecto, crea `.env` usando `.env.example` como referencia y define `YOUTUBE_API_KEY`. No uses el prefijo `VITE_` ni subas `.env` al repositorio.
3. Instala dependencias con `npm install`.
4. Inicia el backend y el frontend juntos:

   ```sh
   npm run dev
   ```

El comando inicia ambos procesos. Vite sirve el frontend en el puerto `3000` y reenvía `/api` al backend, que escucha en el puerto `3001`. También puedes ejecutar `npm run server:dev` por separado para iniciar solo el backend.

## Endpoint

`GET /api/home/videos` devuelve los videos configurados en `HOME_VIDEOS` de `src/data/HomeVideo.ts`, incluyendo sus datos, ID de YouTube, URL de inserción y miniatura. No requiere una API key.

`GET /api/youtube/videos` devuelve los videos más recientes del canal. Para solicitar otra página, envía el `nextPageToken` recibido como query param:

`GET /api/youtube/videos?pageToken=<token>`

Cada respuesta contiene el título del canal, `items` con ID, título, descripción, fecha y miniatura, y el token de paginación si hay más videos. Las respuestas se almacenan en memoria durante 10 minutos.

## Publicaciones del CMS

Las publicaciones del CMS se guardan en `data/post-disc.json` en el servidor:

- `GET /api/cms/posts` carga la cola editorial.
- `POST /api/cms/posts` valida y guarda los datos, genera un ID y un código secuencial por tipo (por ejemplo, `TOM-REC-0009`), y almacena la portada en `public/image/discos/`.
- `DELETE /api/cms/posts/:id` elimina una publicación.

El archivo se inicializa con las publicaciones de ejemplo si todavía no existe. Estos endpoints requieren que el backend de Node.js esté ejecutándose; un despliegue estático por sí solo no puede escribir en el JSON.

## Galerías del CMS

Las galerías creadas desde el CMS se guardan en `data/post-pics.json`:

- `GET /api/cms/galleries` carga las galerías guardadas.
- `POST /api/cms/galleries` genera un ID y código, guarda hasta 15 imágenes JPG, PNG, WebP o GIF (máximo 5 MB cada una) en `public/image/concerts/` y registra sus rutas, estado y fecha de publicación junto con los datos del evento. Los borradores pueden guardarse sin imágenes; las galerías publicadas o programadas requieren al menos una.
- `PUT /api/cms/galleries/:id` permite continuar un borrador, conservar sus fotos existentes y agregar imágenes sin superar 15 en total. Mantiene el ID y código, y actualiza el estado y la fecha de publicación.

Como con las publicaciones, guardar galerías requiere que el backend de Node.js esté ejecutándose.

Las publicaciones y galerías programadas cambian a `PUBLICADO` cuando llega su fecha/hora. El backend las revisa periódicamente y también al consultar las listas del CMS.

## Producción

Despliega la aplicación en un hosting que ejecute Node.js, configura `YOUTUBE_API_KEY` como variable secreta del entorno y ejecuta:

```sh
npm run build
npm start
```

El servidor sirve tanto `/api/youtube/videos` como los archivos compilados del frontend. En despliegues estáticos como Vercel, las publicaciones versionadas en `data/post-disc.json` se incluyen en el build y se muestran sin depender de `/api/cms/posts`. Para crear o eliminar publicaciones desde el CMS, aloja este backend por separado y enruta `/api` hacia él; un despliegue estático por sí solo no puede escribir en el JSON.
