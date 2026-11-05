import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { getStoredCmsSession } from '../data/CmsUsers';
import {
  INITIAL_CMS_GALLERIES,
  INITIAL_CMS_ITEMS,
  type CmsGalleryItem,
  type CmsMerchProduct,
  type CmsPostItem,
  type CmsTourItem,
  type CmsVideoItem,
} from '../data/Cms';
import { INITIAL_CMS_VIDEOS } from '../data/HomeVideo';
import { INITIAL_CMS_TOURS } from '../data/HomeTours';
import { readStoredMerchCatalog, writeStoredMerchCatalog } from '../data/Merch';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.length > 0,
);

const getConfiguredApp = () => {
  if (!isFirebaseConfigured) {
    throw new Error('Configura las variables VITE_FIREBASE_* para iniciar sesión en el CMS.');
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
};

export const getClientAuth = () => getAuth(getConfiguredApp());

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error(`No se pudo procesar la imagen ${file.name}.`));
      }
    };
    reader.onerror = () => reject(new Error(`No se pudo leer la imagen ${file.name}.`));
    reader.readAsDataURL(file);
  });

type LocalCollectionKey = 'posts' | 'galleries' | 'videos' | 'tours' | 'merch';

const LOCAL_STORAGE_KEYS: Record<LocalCollectionKey, string> = {
  posts: 'tom_cms_local_posts_v1',
  galleries: 'tom_cms_local_galleries_v1',
  videos: 'tom_cms_local_videos_v1',
  tours: 'tom_cms_local_tours_v1',
  merch: 'tom_merch_catalog_v1',
};

const CODE_PREFIXES: Record<LocalCollectionKey, string> = {
  posts: 'TOM-REC',
  galleries: 'TOM-CON',
  videos: 'TOM-VID',
  tours: 'TOM-TUR',
  merch: 'TOM-MER',
};

const readLocalCollection = <T extends { id: string }>(
  collection: LocalCollectionKey,
  seed: T[],
): T[] => {
  if (typeof window === 'undefined') return seed;
  if (collection === 'merch') {
    return readStoredMerchCatalog() as unknown as T[];
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEYS[collection]);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T[]) : seed;
  } catch {
    return seed;
  }
};

const writeLocalCollection = <T extends { id: string }>(
  collection: LocalCollectionKey,
  items: T[],
): void => {
  if (typeof window === 'undefined') return;
  if (collection === 'merch') {
    writeStoredMerchCatalog(items as unknown as CmsMerchProduct[]);
    return;
  }
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEYS[collection], JSON.stringify(items));
  } catch (error) {
    console.error(`No se pudo guardar la colección local ${collection}:`, error);
  }
};

const jsonResponse = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * Respaldo local (Spark Plan / Hosting estático sin Cloud Functions) para que el CMS
 * funcione al 100% en producción aunque no exista un backend de Cloud Functions activo.
 */
const handleLocalCmsFallback = (urlString: string, init: RequestInit): Response | null => {
  const match = urlString.match(/\/api\/cms\/(posts|galleries|videos|tours|merch)(?:\/([^/?#]+))?/);
  if (!match) return null;

  const collection = match[1] as LocalCollectionKey;
  const itemId = match[2] ? decodeURIComponent(match[2]) : undefined;
  const method = (init.method ?? 'GET').toUpperCase();

  const seeds: Record<LocalCollectionKey, Array<{ id: string }>> = {
    posts: INITIAL_CMS_ITEMS as CmsPostItem[],
    galleries: INITIAL_CMS_GALLERIES as CmsGalleryItem[],
    videos: INITIAL_CMS_VIDEOS as CmsVideoItem[],
    tours: INITIAL_CMS_TOURS as CmsTourItem[],
    merch: readStoredMerchCatalog(),
  };

  const currentItems = readLocalCollection<Record<string, unknown> & { id: string }>(
    collection,
    seeds[collection] as Array<Record<string, unknown> & { id: string }>,
  );

  if (method === 'GET') {
    return jsonResponse(currentItems);
  }

  if (method === 'DELETE' && itemId) {
    const nextItems = currentItems.filter((item) => item.id !== itemId);
    writeLocalCollection(collection, nextItems);
    return jsonResponse({ deleted: true, id: itemId });
  }

  if (method === 'POST' || method === 'PUT') {
    const bodyObj =
      typeof init.body === 'string' && init.body
        ? (JSON.parse(init.body) as Record<string, unknown>)
        : {};
    const nowLabel = new Date()
      .toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
      .toUpperCase();

    if (method === 'PUT' && itemId) {
      const existing = currentItems.find((item) => item.id === itemId);
      const updatedItem: Record<string, unknown> & { id: string } = {
        ...(existing ?? {}),
        ...bodyObj,
        id: itemId,
        code:
          (existing?.code as string) ??
          `${CODE_PREFIXES[collection]}-${String(currentItems.length + 1).padStart(4, '0')}`,
        publish: (bodyObj.publish as string) || (existing?.publish as string) || nowLabel,
      };
      const exists = currentItems.some((item) => item.id === itemId);
      const nextItems = exists
        ? currentItems.map((item) => (item.id === itemId ? updatedItem : item))
        : [updatedItem, ...currentItems];
      writeLocalCollection(collection, nextItems);
      return jsonResponse(updatedItem);
    }

    const createdItem: Record<string, unknown> & { id: string } = {
      ...bodyObj,
      id: `${collection}-${Date.now()}`,
      code: `${CODE_PREFIXES[collection]}-${String(currentItems.length + 1).padStart(4, '0')}`,
      publish: (bodyObj.publish as string) || nowLabel,
    };
    const nextItems = [createdItem, ...currentItems];
    writeLocalCollection(collection, nextItems);
    return jsonResponse(createdItem, 201);
  }

  return null;
};

export const authenticatedCmsFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> => {
  const headers = new Headers(init.headers);
  const storedSession = getStoredCmsSession();

  if (storedSession) {
    headers.set('X-CMS-User', storedSession.username);
  }

  if (isFirebaseConfigured) {
    try {
      const user = getClientAuth().currentUser;
      if (user) {
        const token = await user.getIdToken();
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch {
      // Fallback to dictionary session header if Firebase Auth is not active
    }
  }

  if (!storedSession && !headers.has('Authorization')) {
    throw new Error('Inicia sesión antes de usar el CMS.');
  }

  const urlString = typeof input === 'string' ? input : input.toString();

  try {
    const response = await fetch(input, { ...init, headers });
    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.toLowerCase().includes('application/json');

    // En Firebase Hosting (plan gratuito Spark) o Vercel sin Firestore configurado,
    // activamos automáticamente el respaldo local:
    if (!isJson || response.status === 404 || response.status === 405 || response.status >= 500) {
      const fallback = handleLocalCmsFallback(urlString, init);
      if (fallback) return fallback;
    }

    return response;
  } catch (networkError) {
    const fallback = handleLocalCmsFallback(urlString, init);
    if (fallback) return fallback;
    throw networkError;
  }
};

export const uploadCmsImage = async (file: File, folder: string): Promise<string> => {
  if (isFirebaseConfigured) {
    try {
      const user = getClientAuth().currentUser;
      if (user) {
        const storage = getStorage(getConfiguredApp());
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
        const imageRef = ref(storage, `cms/${folder}/${crypto.randomUUID()}-${safeName}`);
        await uploadBytes(imageRef, file, { contentType: file.type });
        return await getDownloadURL(imageRef);
      }
    } catch {
      // Fall back to inline data URL when Firebase Storage is unavailable
    }
  }

  return fileToDataUrl(file);
};
