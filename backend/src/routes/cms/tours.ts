import { Router } from 'express';
import type { CmsTourItem } from '../../models/cms.js';
import { FirestoreRepository } from '../../services/firestoreRepository.js';
import { asyncRoute, getSingleParam, isCmsStatus, isRecord, nextCode, normalizedPublishDate } from '../../utils/http.js';

const router = Router();
const repository = new FirestoreRepository<CmsTourItem>('cms_tours');
const maxLengths = { band: 150, tourName: 200, venue: 200, info: 2000, ticketsInfo: 300 };

const isValidDate = (year: string, month: string, day: string) => {
  if (!/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(month) || !/^\d{1,2}$/.test(day)) return false;
  const y = Number(year), m = Number(month), d = Number(day);
  const date = new Date(Date.UTC(y, m - 1, d));
  return y >= 2000 && y <= 2100 && m >= 1 && m <= 12 &&
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

const isTourInput = (body: unknown): body is Omit<CmsTourItem, 'id' | 'code'> =>
  isRecord(body) &&
  typeof body.month === 'string' && typeof body.day === 'string' && typeof body.year === 'string' &&
  isValidDate(body.year, body.month, body.day) &&
  typeof body.band === 'string' && !!body.band.trim() &&
  typeof body.tourName === 'string' && !!body.tourName.trim() &&
  typeof body.venue === 'string' && !!body.venue.trim() &&
  typeof body.info === 'string' &&
  typeof body.ticketsInfo === 'string' &&
  typeof body.ticketsLow === 'boolean' &&
  isCmsStatus(body.status) &&
  typeof body.publish === 'string' && body.publish.length <= 100 &&
  Object.entries(maxLengths).every(([key, limit]) =>
    typeof body[key] === 'string' && (body[key] as string).trim().length <= limit);

router.get('/', asyncRoute(async (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.json(await repository.list());
}));

router.post('/', asyncRoute(async (request, response) => {
  if (!isTourInput(request.body)) {
    response.status(400).json({ error: 'Los datos de la gira no son válidos. Revisa la fecha y los campos.' });
    return;
  }
  const publish = normalizedPublishDate(request.body.status, request.body.publish);
  if (publish === null) {
    response.status(400).json({ error: 'Indica una fecha futura válida para la publicación programada.' });
    return;
  }
  const { id, code } = await nextCode('cms_tours', 'TOM-GIR-');
  const tour: CmsTourItem = {
    ...request.body,
    id,
    code,
    month: request.body.month.padStart(2, '0'),
    day: request.body.day.padStart(2, '0'),
    band: request.body.band.trim(),
    tourName: request.body.tourName.trim(),
    venue: request.body.venue.trim(),
    info: request.body.info.trim(),
    ticketsInfo: request.body.ticketsInfo.trim(),
    publish,
  };
  await repository.create(tour);
  response.status(201).json(tour);
}));

router.put('/:id', asyncRoute(async (request, response) => {
  const id = getSingleParam(request.params.id);
  if (!id) {
    response.status(400).json({ error: 'El identificador de gira no es válido.' });
    return;
  }
  if (!isTourInput(request.body)) {
    response.status(400).json({ error: 'Los datos de la gira no son válidos. Revisa la fecha y los campos.' });
    return;
  }
  const previous = await repository.get(id);
  if (!previous) {
    response.status(404).json({ error: 'No se encontró el registro de gira.' });
    return;
  }
  const publish = normalizedPublishDate(request.body.status, request.body.publish);
  if (publish === null) {
    response.status(400).json({ error: 'Indica una fecha futura válida para la publicación programada.' });
    return;
  }
  const updated: CmsTourItem = {
    ...previous,
    ...request.body,
    month: request.body.month.padStart(2, '0'),
    day: request.body.day.padStart(2, '0'),
    band: request.body.band.trim(),
    tourName: request.body.tourName.trim(),
    venue: request.body.venue.trim(),
    info: request.body.info.trim(),
    ticketsInfo: request.body.ticketsInfo.trim(),
    publish,
  };
  await repository.update(id, updated);
  response.json(updated);
}));

router.delete('/:id', asyncRoute(async (request, response) => {
  const id = getSingleParam(request.params.id);
  if (!id) {
    response.status(400).json({ error: 'El identificador de gira no es válido.' });
    return;
  }
  if (!await repository.delete(id)) {
    response.status(404).json({ error: 'No se encontró la gira solicitada.' });
    return;
  }
  response.status(204).end();
}));

export default router;
