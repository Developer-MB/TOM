import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const getFirebaseApp = () => {
  const existingApp = getApps()[0];
  if (existingApp) return existingApp;

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId) {
    throw new Error('Configura FIREBASE_PROJECT_ID o las credenciales ADC de Firebase.');
  }

  const options = {
    projectId,
    ...(storageBucket ? { storageBucket } : {}),
    ...(serviceAccountJson
      ? { credential: cert(JSON.parse(serviceAccountJson) as Parameters<typeof cert>[0]) }
      : {}),
  };
  return initializeApp(options);
};

export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const getFirebaseFirestore = () => getFirestore(getFirebaseApp());
export const getFirebaseStorage = () => getStorage(getFirebaseApp());
