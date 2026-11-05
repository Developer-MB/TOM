import { onRequest } from 'firebase-functions/v2/https';
import app from './src/app.js';

export const api = onRequest(
  {
    region: process.env.FUNCTION_REGION ?? 'us-central1',
    maxInstances: 10,
    cors: false,
  },
  app,
);
