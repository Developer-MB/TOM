import type { IncomingMessage, ServerResponse } from 'node:http';
import videos from '../../data/post-video.json';

export default function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.statusCode = 405;
    response.end(JSON.stringify({ error: 'Método no permitido.' }));
    return;
  }
  response.statusCode = 200;
  response.end(JSON.stringify(videos));
}
