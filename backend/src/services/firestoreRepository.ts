import {
  FieldValue,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { getFirebaseFirestore } from '../config/firebase.js';

export class FirestoreRepository<T extends { id: string }> {
  constructor(private readonly collectionName: string) {}

  private collection() {
    return getFirebaseFirestore().collection(this.collectionName);
  }

  private toItem(document: QueryDocumentSnapshot<DocumentData>): T {
    return { ...document.data(), id: document.id } as T;
  }

  async list(): Promise<T[]> {
    const snapshot = await this.collection().get();
    return snapshot.docs.map((document) => this.toItem(document));
  }

  async get(id: string): Promise<T | null> {
    const document = await this.collection().doc(id).get();
    return document.exists ? { ...document.data(), id: document.id } as T : null;
  }

  async create(item: T): Promise<void> {
    await this.collection().doc(item.id).create({
      ...item,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async update(id: string, updates: Partial<T>): Promise<boolean> {
    const reference = this.collection().doc(id);
    const result = await getFirebaseFirestore().runTransaction(async (transaction) => {
      const current = await transaction.get(reference);
      if (!current.exists) return false;
      transaction.update(reference, {
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
      });
      return true;
    });
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const reference = this.collection().doc(id);
    return getFirebaseFirestore().runTransaction(async (transaction) => {
      const current = await transaction.get(reference);
      if (!current.exists) return false;
      transaction.delete(reference);
      return true;
    });
  }

  async replaceAll(items: T[]): Promise<void> {
    const collection = this.collection();
    const existing = await collection.get();
    const batch = getFirebaseFirestore().batch();
    existing.docs.forEach((document) => batch.delete(document.ref));
    items.forEach((item) => {
      batch.set(collection.doc(item.id), {
        ...item,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
  }
}
