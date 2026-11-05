import dotenv from 'dotenv';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: resolve(fileURLToPath(new URL('../../', import.meta.url)), '.env') });

export const getFirebaseAdminApp = () => {
  const existing = getApps()[0];
  if (existing) return existing;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccount = serviceAccountJson ? JSON.parse(serviceAccountJson) : undefined;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || serviceAccount?.project_id;

  if (!projectId) {
    throw new Error('Define FIREBASE_PROJECT_ID o configura credenciales ADC.');
  }

  return initializeApp({
    projectId,
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
    ...(process.env.FIREBASE_STORAGE_BUCKET
      ? { storageBucket: process.env.FIREBASE_STORAGE_BUCKET }
      : {}),
  });
};
