import type { IncomingMessage, ServerResponse } from 'node:http';
import cmsPosts from '../../data/post-disc.json';
import cmsGalleries from '../../data/post-pics.json';
import cmsVideos from '../../data/post-video.json';
import cmsTours from '../../data/post-tours.json';

type ApiRequest = IncomingMessage;

const respond = (response: ServerResponse, status: number, body: unknown) => {
  response.statusCode = status;
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPublished = (value: unknown, now: number, missingStatusIsPublished = false) => {
  if (!isRecord(value)) return false;
  if (value.status === 'PUBLICADO') return true;
  if (
    value.status === 'PROGRAMADO' &&
    typeof value.publish === 'string' &&
    Number.isFinite(Date.parse(value.publish))
  ) {
    return Date.parse(value.publish) <= now;
  }
  return missingStatusIsPublished && value.status === undefined;
};

const readMetricsCounter = async (key: string): Promise<number> => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Las variables de Redis no están configuradas.');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['GET', key]),
  });
  if (!response.ok) throw new Error(`Redis respondió HTTP ${response.status}.`);

  const payload: unknown = await response.json();
  if (!isRecord(payload) || typeof payload.error === 'string') {
    throw new Error('Redis devolvió una respuesta no válida.');
  }
  const result = payload.result;
  if (result === null) return 0;
  const count = typeof result === 'number'
    ? result
    : typeof result === 'string' && /^\d+$/.test(result)
      ? Number(result)
      : Number.NaN;
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error('Redis devolvió un contador no válido.');
  }
  return count;
};

export default async function handler(_request: ApiRequest, response: ServerResponse) {
  if (_request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    respond(response, 405, { error: 'Método no permitido.' });
    return;
  }

  try {
    const now = Date.now();
    const currentMonth = new Date(now).toISOString().slice(0, 7);
    const previousMonth = new Date(Date.UTC(
      new Date(now).getUTCFullYear(),
      new Date(now).getUTCMonth() - 1,
      1,
    )).toISOString().slice(0, 7);
    const [monthlyVisits, radioEntries, previousMonthVisits] = await Promise.all([
      readMetricsCounter(`tom:analytics:${currentMonth}:visits`),
      readMetricsCounter(`tom:analytics:${currentMonth}:radioEntries`),
      readMetricsCounter(`tom:analytics:${previousMonth}:visits`),
    ]);

    const publishedPosts = [
      ...cmsPosts,
      ...cmsGalleries,
      ...cmsVideos,
      ...cmsTours,
    ].filter((entry) => isPublished(entry, now)).length;
    const photoCount = cmsGalleries
      .filter((gallery) => isPublished(gallery, now, true))
      .reduce((total, gallery) => total + (Array.isArray(gallery.img) ? gallery.img.length : 0), 0);

    respond(response, 200, {
      monthlyVisits,
      radioEntries,
      publishedPosts,
      photoCount,
      comparisonPercent: previousMonthVisits > 0
        ? Math.round(((monthlyVisits - previousMonthVisits) / previousMonthVisits) * 1000) / 10
        : null,
    });
  } catch (error) {
    console.error('No se pudieron cargar las métricas de Vercel:', error);
    respond(response, 503, { error: 'El almacén de métricas no está disponible.' });
  }
}
