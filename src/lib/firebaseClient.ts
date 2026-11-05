import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { getStoredCmsSession } from '../data/CmsUsers';

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

  return fetch(input, { ...init, headers });
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
