import { Router } from 'express';
import type { CmsPostItem, CmsPostStatus } from '../../models/cms.js';
import { FirestoreRepository } from '../../services/firestoreRepository.js';
import { nextCode, normalizedPublishDate, asyncRoute, isCmsStatus, isRecord, getSingleParam } from '../../utils/http.js';
import { isSafePublicImageUrl } from '../../services/media.js';

const router = Router();
const repository = new FirestoreRepository<CmsPostItem>('cms_posts');
const fields = [
  'band', 'disc', 'genre', 'genreKey', 'label', 'country', 'flag',
  'year', 'duration', 'excerpt', 'author',
] as const;
const lengths: Record<(typeof fields)[number], number> = {
  band: 150, disc: 200, genre: 100, genreKey: 100, label: 150,
  country: 100, flag: 20, year: 4, duration: 20, excerpt: 2000, author: 100,
};
const postTypes = ['RECOMENDACION', 'GALERIA', 'VIDEO', 'GIRAS'] as const;
const prefixes: Record<(typeof postTypes)[number], string> = {
  RECOMENDACION: 'TOM-REC-', GALERIA: 'TOM-GAL-', VIDEO: 'TOM-VID-', GIRAS: 'TOM-GIR-',
};

router.get('/', asyncRoute(async (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.json(await repository.list());
}));

router.post('/', asyncRoute(async (request, response) => {
  const body: unknown = request.body;
  if (!isRecord(body) ||
    !postTypes.includes(body.type as (typeof postTypes)[number]) ||
    !isCmsStatus(body.status) ||
    !fields.every((field) => typeof body[field] === 'string' &&
      (body[field] as string).trim().length > 0 &&
      (body[field] as string).trim().length <= lengths[field]) ||
    typeof body.publish !== 'string' ||
    body.publish.length > 100 ||
    typeof body.coverImage !== 'string' ||
    (!body.coverImage.startsWith('/image/discos/') && !isSafePublicImageUrl(body.coverImage))) {
    response.status(400).json({ error: 'Los datos de la publicación no son válidos.' });
    return;
  }

  const publish = normalizedPublishDate(body.status, body.publish);
  if (publish === null) {
    response.status(400).json({ error: 'Indica una fecha futura válida para la publicación programada.' });
    return;
  }

  const type = body.type as (typeof postTypes)[number];
  const { id, code } = await nextCode('cms_posts', prefixes[type]);
  const post: CmsPostItem = {
    id,
    code,
    type,
    band: (body.band as string).trim(),
    disc: (body.disc as string).trim(),
    genre: (body.genre as string).trim(),
    genreKey: (body.genreKey as string).trim(),
    label: (body.label as string).trim(),
    country: (body.country as string).trim(),
    flag: (body.flag as string).trim(),
    year: (body.year as string).trim(),
    duration: (body.duration as string).trim(),
    excerpt: (body.excerpt as string).trim(),
    author: (body.author as string).trim().toLocaleUpperCase('es'),
    cover: body.coverImage,
    publish,
    status: body.status as CmsPostStatus,
  };
  await repository.create(post);
  response.status(201).json(post);
}));

router.delete('/:id', asyncRoute(async (request, response) => {
  const id = getSingleParam(request.params.id);
  if (!id) {
    response.status(400).json({ error: 'El identificador de publicación no es válido.' });
    return;
  }
  const deleted = await repository.delete(id);
  if (!deleted) {
    response.status(404).json({ error: 'No se encontró la publicación solicitada.' });
    return;
  }
  response.status(204).end();
}));

export default router;
