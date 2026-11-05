import { Router } from 'express';
import type { CmsVideoItem } from '../../models/cms.js';
import { FirestoreRepository } from '../../services/firestoreRepository.js';
import { asyncRoute, getSingleParam, isCmsStatus, isRecord, nextCode, normalizedPublishDate } from '../../utils/http.js';

const router = Router();
const repository = new FirestoreRepository<CmsVideoItem>('cms_videos');
const maxLengths = { title: 200, description: 2000, url: 2048 };

const isValidYoutubeUrl = (value: string) => {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const id = host === 'youtu.be' || host === 'www.youtu.be'
      ? url.pathname.slice(1)
      : url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? '';
    return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be'].includes(host) &&
      /^[A-Za-z0-9_-]{11}$/.test(id);
  } catch {
    return false;
  }
};

const isVideoInput = (body: unknown): body is {
  title: string; description: string; url: string; status: CmsVideoItem['status']; publish: string;
} =>
  isRecord(body) &&
  typeof body.title === 'string' && !!body.title.trim() && body.title.trim().length <= maxLengths.title &&
  typeof body.description === 'string' && !!body.description.trim() && body.description.trim().length <= maxLengths.description &&
  typeof body.url === 'string' && body.url.length <= maxLengths.url && isValidYoutubeUrl(body.url) &&
  isCmsStatus(body.status) &&
  typeof body.publish === 'string' && body.publish.length <= 100;

router.get('/', asyncRoute(async (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.json(await repository.list());
}));

router.post('/', asyncRoute(async (request, response) => {
  if (!isVideoInput(request.body)) {
    response.status(400).json({ error: 'Completa el título, la descripción y una URL válida de YouTube.' });
    return;
  }
  const publish = normalizedPublishDate(request.body.status, request.body.publish);
  if (publish === null) {
    response.status(400).json({ error: 'Indica una fecha futura válida para la publicación programada.' });
    return;
  }
  const { id, code } = await nextCode('cms_videos', 'TOM-VID-');
  const video: CmsVideoItem = { ...request.body, id, code, publish };
  await repository.create(video);
  response.status(201).json(video);
}));

router.put('/:id', asyncRoute(async (request, response) => {
  const id = getSingleParam(request.params.id);
  if (!id) {
    response.status(400).json({ error: 'El identificador del video no es válido.' });
    return;
  }
  if (!isVideoInput(request.body)) {
    response.status(400).json({ error: 'Completa el título, la descripción y una URL válida de YouTube.' });
    return;
  }
  const previous = await repository.get(id);
  if (!previous) {
    response.status(404).json({ error: 'No se encontró el video solicitado.' });
    return;
  }
  if (previous.status !== 'BORRADOR') {
    response.status(409).json({ error: 'Solo se pueden continuar videos guardados como borrador.' });
    return;
  }
  const publish = normalizedPublishDate(request.body.status, request.body.publish);
  if (publish === null) {
    response.status(400).json({ error: 'Indica una fecha futura válida para la publicación programada.' });
    return;
  }
  const updates = { ...request.body, publish };
  await repository.update(id, updates);
  response.json({ ...previous, ...updates });
}));

router.delete('/:id', asyncRoute(async (request, response) => {
  const id = getSingleParam(request.params.id);
  if (!id) {
    response.status(400).json({ error: 'El identificador del video no es válido.' });
    return;
  }
  if (!await repository.delete(id)) {
    response.status(404).json({ error: 'No se encontró el video solicitado.' });
    return;
  }
  response.status(204).end();
}));

export default router;
