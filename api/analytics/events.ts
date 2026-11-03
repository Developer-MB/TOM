import type { IncomingMessage, ServerResponse } from 'node:http';
import { runMetricsRedisCommand } from '../../backend/metricsStore';

type ApiRequest = IncomingMessage & { body?: unknown };

const respond = (response: ServerResponse, status: number, body?: unknown) => {
  response.statusCode = status;
  response.setHeader('Cache-Control', 'no-store');
  if (body === undefined) {
    response.end();
    return;
  }
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export default async function handler(request: ApiRequest, response: ServerResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    respond(response, 405, { error: 'Método no permitido.' });
    return;
  }

  if (!isRecord(request.body) || !['portal', 'radio'].includes(request.body.type as string)) {
    respond(response, 400, { error: 'El tipo de evento de métricas no es válido.' });
    return;
  }

  try {
    const month = new Date().toISOString().slice(0, 7);
    const counter = request.body.type === 'portal' ? 'visits' : 'radioEntries';
    await runMetricsRedisCommand(['INCR', `tom:analytics:${month}:${counter}`]);
    respond(response, 204);
  } catch (error) {
    console.error('No se pudo registrar el evento de métricas:', error);
    respond(response, 503, { error: 'El registro de métricas no está configurado.' });
  }
}
