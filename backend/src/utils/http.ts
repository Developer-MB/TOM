import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { getFirebaseFirestore } from '../config/firebase.js';

export const asyncRoute = (handler: RequestHandler): RequestHandler =>
  (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isCmsStatus = (value: unknown): value is 'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR' =>
  value === 'PUBLICADO' || value === 'PROGRAMADO' || value === 'BORRADOR';

export const getSingleParam = (value: string | string[] | undefined): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

export const normalizedPublishDate = (
  status: 'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR',
  publish: string,
): string | null => {
  if (status === 'BORRADOR') return '';
  if (status === 'PUBLICADO') return new Date().toISOString();
  const timestamp = Date.parse(publish);
  return Number.isFinite(timestamp) && timestamp > Date.now() ? new Date(timestamp).toISOString() : null;
};

export const nextCode = async (
  collectionName: string,
  prefix: string,
  width = 4,
): Promise<{ id: string; code: string }> => {
  const firestore = getFirebaseFirestore();
  const counterRef = firestore.collection('cms_counters').doc(collectionName);
  const id = randomUUID();
  const codeNumber = await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(counterRef);
    const current = snapshot.get('value') ?? 0;
    if (typeof current !== 'number' || !Number.isSafeInteger(current) || current < 0) {
      throw new Error(`El contador de códigos para ${collectionName} no es válido.`);
    }
    const next = current + 1;
    if (!Number.isSafeInteger(next)) {
      throw new Error(`El contador de códigos para ${collectionName} excedió el límite permitido.`);
    }
    transaction.set(counterRef, { value: next });
    return next;
  });
  return { id, code: `${prefix}${String(codeNumber).padStart(width, '0')}` };
};
