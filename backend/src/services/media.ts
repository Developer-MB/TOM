import { randomUUID } from 'node:crypto';
import { getFirebaseStorage } from '../config/firebase.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export interface UploadedImage {
  mimeType: string;
  data: string;
}

export const isUploadedImage = (value: unknown): value is UploadedImage =>
  typeof value === 'object' &&
  value !== null &&
  'mimeType' in value &&
  'data' in value &&
  typeof value.mimeType === 'string' &&
  typeof value.data === 'string';

export const saveImage = async (value: UploadedImage, folder: string): Promise<string> => {
  const extension = IMAGE_TYPES[value.mimeType];
  if (!extension || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value.data)) {
    throw new Error('La imagen debe ser JPG, PNG, WebP o GIF.');
  }
  const bytes = Buffer.from(value.data, 'base64');
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_SIZE || bytes.toString('base64') !== value.data) {
    throw new Error('La imagen no puede superar los 5 MB.');
  }

  const file = getFirebaseStorage().bucket().file(`cms/${folder}/${randomUUID()}.${extension}`);
  const downloadToken = randomUUID();
  await file.save(bytes, {
    resumable: false,
    metadata: {
      contentType: value.mimeType,
      metadata: { firebaseStorageDownloadTokens: downloadToken },
    },
  });
  const bucketName = file.bucket.name;
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(file.name)}?alt=media&token=${downloadToken}`;
};

export const isSafePublicImageUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      url.hostname === 'firebasestorage.googleapis.com' &&
      url.pathname.startsWith('/v0/b/') &&
      url.searchParams.has('token');
  } catch {
    return false;
  }
};

export const deleteImage = async (value: string): Promise<void> => {
  if (!isSafePublicImageUrl(value)) return;
  const url = new URL(value);
  const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
  if (!match) return;
  const bucketName = decodeURIComponent(match[1]);
  const objectName = decodeURIComponent(match[2]);
  if (!objectName.startsWith('cms/')) return;
  await getFirebaseStorage().bucket(bucketName).file(objectName).delete({ ignoreNotFound: true });
};
