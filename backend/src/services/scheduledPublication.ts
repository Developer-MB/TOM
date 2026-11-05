import { getFirebaseFirestore } from '../config/firebase.js';
import type { CmsPostStatus } from '../models/cms.js';

const COLLECTIONS = ['cms_posts', 'cms_galleries', 'cms_videos', 'cms_tours', 'cms_merch'];
const PUBLISH_CHECK_INTERVAL_MS = 10_000;
let lastPublishCheck = 0;
let publishCheck: Promise<void> | null = null;

export const publishScheduledDocuments = async (): Promise<void> => {
  if (Date.now() - lastPublishCheck < PUBLISH_CHECK_INTERVAL_MS) return;
  if (publishCheck) return publishCheck;

  publishCheck = publishDueDocuments();
  try {
    await publishCheck;
    lastPublishCheck = Date.now();
  } finally {
    publishCheck = null;
  }
};

const publishDueDocuments = async (): Promise<void> => {
  const firestore = getFirebaseFirestore();
  const now = new Date();
  const snapshots = await Promise.all(COLLECTIONS.map((name) =>
    firestore.collection(name).where('status', '==', 'PROGRAMADO').get(),
  ));
  const updates: FirebaseFirestore.WriteBatch[] = [];
  let batch = firestore.batch();
  let batchSize = 0;

  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((document) => {
      const publish = document.get('publish');
      if (typeof publish !== 'string' || !Number.isFinite(Date.parse(publish)) || Date.parse(publish) > now.getTime()) return;
      batch.update(document.ref, { status: 'PUBLICADO' satisfies CmsPostStatus, updatedAt: now });
      batchSize += 1;
      if (batchSize === 450) {
        updates.push(batch);
        batch = firestore.batch();
        batchSize = 0;
      }
    });
  });

  if (batchSize > 0) updates.push(batch);
  for (const update of updates) await update.commit();
};

export const publicDocuments = async <T extends { id: string; status: CmsPostStatus; publish: string }>(
  collectionName: string,
): Promise<T[]> => {
  await publishScheduledDocuments();
  const snapshot = await getFirebaseFirestore()
    .collection(collectionName)
    .where('status', '==', 'PUBLICADO')
    .get();
  return snapshot.docs
    .map((document) => Object.assign(document.data(), { id: document.id }) as T)
    .sort((first, second) => Date.parse(second.publish) - Date.parse(first.publish));
};
