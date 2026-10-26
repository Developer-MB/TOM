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

`GET /api/youtube/videos` devuelve los videos más recientes del canal. Para solicitar otra página, envía el `nextPageToken` recibido como query param:

`GET /api/youtube/videos?pageToken=<token>`

Cada respuesta contiene el título del canal, `items` con ID, título, descripción, fecha y miniatura, y el token de paginación si hay más videos. Las respuestas se almacenan en memoria durante 10 minutos.

## Producción

Despliega la aplicación en un hosting que ejecute Node.js, configura `YOUTUBE_API_KEY` como variable secreta del entorno y ejecuta:

```sh
npm run build
npm start
```

El servidor sirve tanto `/api/youtube/videos` como los archivos compilados del frontend. Un hosting estático que no ejecute Node.js necesita alojar este backend por separado y enrutar `/api` hacia él.
