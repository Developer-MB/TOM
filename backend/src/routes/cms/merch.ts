import { Router } from 'express';
import type { CmsMerchProduct, MerchCategory } from '../../models/cms.js';
import { MERCH_CATEGORIES } from '../../models/cms.js';
import { isSafePublicImageUrl, deleteImage } from '../../services/media.js';
import { FirestoreRepository } from '../../services/firestoreRepository.js';
import { asyncRoute, getSingleParam, isCmsStatus, isRecord, nextCode, normalizedPublishDate } from '../../utils/http.js';

const router = Router();
const repository = new FirestoreRepository<CmsMerchProduct>('cms_merch');
const isValidUrl = (value: string) => {
  if (!value) return true;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const isValidImageSource = (value: string) =>
  isSafePublicImageUrl(value) || value.startsWith('data:image/') || value.startsWith('/image/');

const isValidMerchBody = (body: unknown): body is {
  name: string;
  category: MerchCategory;
  description: string;
  price: number;
  stock?: number;
  purchaseUrl: string;
  image: string;
  status: CmsMerchProduct['status'];
  publish: string;
} =>
  isRecord(body) &&
  typeof body.name === 'string' && Boolean(body.name.trim()) && body.name.trim().length <= 150 &&
  typeof body.category === 'string' && MERCH_CATEGORIES.includes(body.category as MerchCategory) &&
  typeof body.description === 'string' && body.description.length <= 2000 &&
  typeof body.price === 'number' && Number.isFinite(body.price) && body.price >= 0 && body.price <= 1_000_000_000 &&
  (body.stock === undefined || (typeof body.stock === 'number' && Number.isFinite(body.stock) && body.stock >= 0 && body.stock <= 1_000_000)) &&
  typeof body.purchaseUrl === 'string' && body.purchaseUrl.length <= 2048 && isValidUrl(body.purchaseUrl) &&
  typeof body.image === 'string' && isValidImageSource(body.image) &&
  isCmsStatus(body.status) && typeof body.publish === 'string' && body.publish.length <= 100;

router.get('/', asyncRoute(async (_request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.json(await repository.list());
}));

router.post('/', asyncRoute(async (request, response) => {
  const body: unknown = request.body;
  if (!isValidMerchBody(body)) {
    response.status(400).json({ error: 'Los datos del producto no son válidos. Revisa los campos y la imagen.' });
    return;
  }
  const publish = normalizedPublishDate(body.status, body.publish);
  if (publish === null) {
    response.status(400).json({ error: 'Indica una fecha futura válida para la publicación programada.' });
    return;
  }
  const { id, code } = await nextCode('cms_merch', 'TOM-MER-');
  const product: CmsMerchProduct = {
    id,
    code,
    name: body.name.trim(),
    category: body.category,
    description: body.description.trim(),
    price: Math.round(body.price * 100) / 100,
    stock: typeof body.stock === 'number' ? Math.max(0, Math.floor(body.stock)) : 0,
    image: body.image,
    purchaseUrl: body.purchaseUrl.trim(),
    status: body.status,
    publish,
  };
  await repository.create(product);
  response.status(201).json(product);
}));

router.put('/:id', asyncRoute(async (request, response) => {
  const id = getSingleParam(request.params.id);
  const body: unknown = request.body;
  if (!id || !isValidMerchBody(body)) {
    response.status(400).json({ error: 'Los datos del producto no son válidos. Revisa los campos y el inventario.' });
    return;
  }
  const existing = await repository.get(id);
  if (!existing) {
    response.status(404).json({ error: 'No se encontró el producto solicitado.' });
    return;
  }
  const publish = body.status === 'PUBLICADO' && existing.status === 'PUBLICADO' && existing.publish
    ? existing.publish
    : normalizedPublishDate(body.status, body.publish);
  if (publish === null) {
    response.status(400).json({ error: 'Indica una fecha futura válida para la publicación programada.' });
    return;
  }
  const updated: CmsMerchProduct = {
    ...existing,
    name: body.name.trim(),
    category: body.category,
    description: body.description.trim(),
    price: Math.round(body.price * 100) / 100,
    stock: typeof body.stock === 'number' ? Math.max(0, Math.floor(body.stock)) : existing.stock ?? 0,
    image: body.image,
    purchaseUrl: body.purchaseUrl.trim(),
    status: body.status,
    publish,
  };
  await repository.update(id, updated);
  response.json(updated);
}));

router.delete('/:id', asyncRoute(async (request, response) => {
  const id = getSingleParam(request.params.id);
  if (!id) {
    response.status(400).json({ error: 'El identificador del producto no es válido.' });
    return;
  }
  const product = await repository.get(id);
  if (!product) {
    response.status(404).json({ error: 'No se encontró el producto solicitado.' });
    return;
  }
  await repository.delete(id);
  try {
    await deleteImage(product.image);
  } catch (error) {
    console.error('No se pudo borrar el archivo de imagen del producto:', error);
  }
  response.status(204).end();
}));

export default router;
