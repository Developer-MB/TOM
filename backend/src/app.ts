import express, { type ErrorRequestHandler } from 'express';
import adminCmsRouter from './routes/cms/index.js';
import publicHomeRouter from './routes/public/home.js';
import youtubeRouter from './routes/public/youtube.js';
import { requireAdmin } from './middleware/adminAuth.js';
import { asyncRoute } from './utils/http.js';

const app = express();
const jsonParser = express.json({ limit: '1mb', strict: true });

app.disable('x-powered-by');
app.use((_request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.get('/api/health', (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.json({ status: 'ok' });
});

app.use('/api/cms', jsonParser, requireAdmin, adminCmsRouter);
app.use('/api/home', jsonParser, publicHomeRouter);
app.use('/api/youtube', jsonParser, youtubeRouter);

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'Ruta API no encontrada.' });
});

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  const parsedError = error as { status?: number; type?: string; message?: string };
  if (parsedError.type === 'entity.too.large') {
    response.status(413).json({ error: 'La solicitud excede el tamaño permitido.' });
    return;
  }
  console.error('Error no controlado en API:', error);
  response.status(parsedError.status && parsedError.status < 500 ? parsedError.status : 500)
    .json({ error: parsedError.status && parsedError.status < 500
      ? 'La solicitud no es válida.'
      : 'Ocurrió un error interno. Inténtalo más tarde.' });
};
app.use(errorHandler);

export default app;
