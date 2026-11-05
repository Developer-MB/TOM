import { Router } from 'express';
import type { CmsGalleryItem } from '../../models/cms.js';
import { FirestoreRepository } from '../../services/firestoreRepository.js';
import { isSafePublicImageUrl } from '../../services/media.js';
import { asyncRoute, getSingleParam, isCmsStatus, isRecord, nextCode, normalizedPublishDate } from '../../utils/http.js';

const router = Router();
const repository = new FirestoreRepository<CmsGalleryItem>('cms_galleries');
const limits = { concert: 150, date: 10, venue: 150, city: 100, title: 200, desc: 2000, credit: 100 };
const maxImages = 15;

const isValidDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;

const isGalleryInput = (body: unknown): body is {
  concert: string; date: string; venue: string; city: string; title: string;
  desc: string; credit: string; status: CmsGalleryItem['status']; publish: string;
  img: { pic: string }[];
} =>
  isRecord(body) &&
  Object.entries(limits).every(([key, limit]) =>
    typeof body[key] === 'string' && (body[key] as string).trim().length <= limit) &&
  typeof body.concert === 'string' && !!body.concert.trim() &&
  typeof body.date === 'string' && isValidDate(body.date) &&
  typeof body.venue === 'string' && !!body.venue.trim() &&
  typeof body.city === 'string' && !!body.city.trim() &&
  typeof body.title === 'string' && !!body.title.trim() &&
  typeof body.desc === 'string' && !!body.desc.trim() &&
  typeof body.credit === 'string' && !!body.credit.trim() &&
  isCmsStatus(body.status) &&
  typeof body.publish === 'string' && body.publish.length <= 100 &&
  Array.isArray(body.img) && body.img.length <= maxImages &&
  body.img.every((image) =>
    isRecord(image) && typeof image.pic === 'string' &&
    (image.pic.startsWith('/image/concerts/') || isSafePublicImageUrl(image.pic)));

const normalizeGallery = (body: ReturnType<typeof galleryInput>, id: string, code: string, img: CmsGalleryItem['img']): CmsGalleryItem => ({
  id,
  code,
  status: body.status,
  publish: body.publish,
  concert: body.concert.trim(),
  date: body.date,
  venue: body.venue.trim(),
  city: body.city.trim(),
  title: body.title.trim(),
  desc: body.desc.trim(),
  credit: body.credit.trim().toLocaleUpperCase('es'),
  img,
});

function galleryInput(body: unknown) {
  if (!isGalleryInput(body)) throw new Error('Los datos de galería no son válidos.');
  return body;
}

router.get('/', asyncRoute(async (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.json(await repository.list());
}));

router.post('/', asyncRoute(async (request, response) => {
  if (!isGalleryInput(request.body) ||
    (request.body.status !== 'BORRADOR' && request.body.img.length === 0)) {
    response.status(400).json({ error: `Completa los datos de la galería. Para publicar o programar agrega entre 1 y ${maxImages} fotografías.` });
    return;
  }
  const publish = normalizedPublishDate(request.body.status!, request.body.publish);
  if (publish === null) {
    response.status(400).json({ error: 'Indica una fecha futura válida para la publicación programada.' });
    return;
  }
  const { id, code } = await nextCode('cms_galleries', 'TOM-CON-');
  const gallery = normalizeGallery(
    { ...request.body, status: request.body.status!, publish },
    id,
    code,
    request.body.img.map((image, index) => ({ id: index + 1, pic: image.pic })),
  );
  await repository.create(gallery);
  response.status(201).json(gallery);
}));

router.put('/:id', asyncRoute(async (request, response) => {
  const id = getSingleParam(request.params.id);
  if (!id) {
    response.status(400).json({ error: 'El identificador de galería no es válido.' });
    return;
  }
  if (!isGalleryInput(request.body)) {
    response.status(400).json({ error: `Los datos de galería no son válidos. Agrega hasta ${maxImages} fotos.` });
    return;
  }
  const previous = await repository.get(id);
  if (!previous) {
    response.status(404).json({ error: 'No se encontró el borrador de galería.' });
    return;
  }
  if ((previous.status ?? 'PUBLICADO') !== 'BORRADOR') {
    response.status(409).json({ error: 'Solo se pueden continuar galerías guardadas como borrador.' });
    return;
  }
  if (previous.img.length + request.body.img.length > maxImages) {
    response.status(400).json({ error: `La galería admite un máximo de ${maxImages} fotografías.` });
    return;
  }
  const publish = normalizedPublishDate(request.body.status!, request.body.publish);
  if (publish === null) {
    response.status(400).json({ error: 'Indica una fecha futura válida para la publicación programada.' });
    return;
  }
  const updated = normalizeGallery(
    { ...request.body, status: request.body.status!, publish },
    previous.id,
    previous.code ?? 'TOM-CON-0000',
    [
      ...previous.img,
      ...request.body.img.map((image, index) => ({
        id: previous.img.length + index + 1,
        pic: image.pic,
      })),
    ],
  );
  await repository.update(id, updated);
  response.json(updated);
}));

export default router;
