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

`GET /api/home/videos` devuelve los videos publicados en `data/post-video.json`, incluyendo sus datos, ID de YouTube, URL de inserción y miniatura. No requiere una API key.

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

## Videos del CMS

Los videos creados desde la cola editorial se guardan en `data/post-video.json`:

- `GET /api/cms/videos` carga todos los videos de la cola editorial.
- `POST /api/cms/videos` valida el título, descripción, URL de YouTube y estado, y genera un ID y código secuencial `TOM-VID-0000`.
- `PUT /api/cms/videos/:id` permite continuar un borrador conservando su ID y código.
- `DELETE /api/cms/videos/:id` elimina un video.

Los videos publicados aparecen en la sección Videopodcast y en el reproductor destacado de Home. Los videos programados cambian a `PUBLICADO` cuando llega su fecha/hora. El backend revisa las entradas programadas al consultar las listas del CMS o los videos públicos.

Las publicaciones, galerías y videos programados cambian a `PUBLICADO` cuando llega su fecha/hora. El backend las revisa periódicamente y también al consultar las listas del CMS.

## Giras del CMS

Las giras se guardan en `data/post-tours.json`:

- `GET /api/cms/tours` carga las giras de la cola editorial.
- `POST /api/cms/tours` valida los datos y la fecha del evento, y genera el ID y el código secuencial `TOM-GIR-0000`.
- `PUT /api/cms/tours/:id` permite continuar un borrador conservando su ID y código.
- `DELETE /api/cms/tours/:id` elimina una gira.
- `GET /api/home/tours` devuelve las giras publicadas para la sección pública de eventos.

Las giras programadas cambian a `PUBLICADO` al llegar la fecha y hora configuradas. En producción, el CMS necesita el backend Node.js para guardar cambios; los datos JSON incluidos en el build estático funcionan como respaldo de lectura.

## Métricas del portal

Las visitas se agregan por mes. La aplicación registra una entrada al cargar el portal y otra cada vez que se navega a Radio. En Vercel, `api/analytics/events.ts` y `api/cms/metrics.ts` implementan las funciones API; las métricas de visitas usan Redis REST para persistir entre ejecuciones sin depender del disco efímero. Conecta una base Redis de Upstash al proyecto Vercel y configura `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` en las variables de entorno de producción y preview. Después de agregarlas, vuelve a desplegar. `GET /api/cms/metrics` devuelve las visitas del mes, su variación frente al anterior, publicaciones publicadas y fotos de galerías publicadas, usando los JSON incluidos en el despliegue. Las entradas a Radio son accesos a la sección, no oyentes simultáneos.

En desarrollo, el watcher del backend excluye `data/` para evitar reiniciarse al guardar archivos del CMS o publicar entradas programadas. Si el servidor ya estaba ejecutándose antes de este cambio, reinicia `npm run dev` para activar la exclusión.

## Producción

Despliega la aplicación en un hosting que ejecute Node.js, configura `YOUTUBE_API_KEY` como variable secreta del entorno y ejecuta:

```sh
npm run build
npm start
```

El servidor sirve tanto `/api/youtube/videos` como los archivos compilados del frontend. En despliegues estáticos como Vercel, las publicaciones, galerías y videos versionados en `data/` se incluyen en el build. Si las rutas API responden `404`, el frontend muestra esos datos incluidos en el build para evitar errores de carga. Para guardar cambios desde el CMS y servir contenido actualizado sin volver a desplegar, aloja este backend y enruta `/api` hacia él; un despliegue estático por sí solo no puede escribir en los JSON.
