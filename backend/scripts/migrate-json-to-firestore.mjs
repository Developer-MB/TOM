import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from './firebaseAdmin.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const sources = [
  { file: 'post-disc.json', collection: 'cms_posts' },
  { file: 'post-pics.json', collection: 'cms_galleries' },
  { file: 'post-video.json', collection: 'cms_videos' },
  { file: 'post-tours.json', collection: 'cms_tours' },
  { file: 'post-merch.json', collection: 'cms_merch' },
];
const firestore = getFirestore(getFirebaseAdminApp());

const stableStringify = (value, omitTimestamps = false) => {
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([key]) => !omitTimestamps || (key !== 'createdAt' && key !== 'updatedAt'))
      .sort(([first], [second]) => first.localeCompare(second));
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

const readSource = async ({ file, collection }) => {
  const content = await readFile(resolve(root, 'data', file), 'utf8');
  const records = JSON.parse(content);
  if (!Array.isArray(records)) throw new Error(`${file} debe contener una lista JSON.`);

  const ids = new Set();
  for (const [index, record] of records.entries()) {
    if (!record || typeof record !== 'object' || Array.isArray(record) ||
      typeof record.id !== 'string' || !record.id.trim() || record.id.includes('/')) {
      throw new Error(`${file}: el elemento ${index + 1} tiene un ID inválido.`);
    }
    if (ids.has(record.id)) throw new Error(`${file}: ID duplicado "${record.id}".`);
    ids.add(record.id);
  }
  return { file, collection, records };
};

const collections = await Promise.all(sources.map(readSource));
const snapshots = await Promise.all(
  collections.map(({ collection }) => firestore.collection(collection).get()),
);
const migrationPlans = collections.map(({ file, collection, records }, index) => {
  const existing = new Map(snapshots[index].docs.map((document) => [document.id, document.data()]));
  const sourceById = new Map(records.map((record) => [record.id, record]));

  for (const [id, current] of existing) {
    const source = sourceById.get(id);
    if (!source ||
      stableStringify(current, true) !== stableStringify(source, true)) {
      throw new Error(
        `Migración detenida: ${collection}/${id} ya existe con datos diferentes o no está en ${file}. No se modificó ningún documento.`,
      );
    }
  }

  return { file, collection, records, missing: records.filter((record) => !existing.has(record.id)) };
});

const counterPlans = [];
for (const { collection, records } of migrationPlans) {
  const maximumCode = records.reduce((maximum, record) => {
    const suffix = typeof record.code === 'string' ? record.code.match(/(\d+)$/)?.[1] : undefined;
    return suffix ? Math.max(maximum, Number(suffix)) : maximum;
  }, 0);
  if (!maximumCode) continue;

  const reference = firestore.collection('cms_counters').doc(collection);
  const snapshot = await reference.get();
  const currentValue = snapshot.get('value') ?? 0;
  if (typeof currentValue !== 'number' || !Number.isSafeInteger(currentValue) || currentValue < 0) {
    throw new Error(`El contador de códigos para ${collection} no es válido.`);
  }
  counterPlans.push({ collection, reference, maximumCode });
}

for (const { collection, records, missing } of migrationPlans) {
  for (let offset = 0; offset < missing.length; offset += 400) {
    const batch = firestore.batch();
    for (const record of missing.slice(offset, offset + 400)) {
      batch.create(firestore.collection(collection).doc(record.id), {
        ...record,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }
  console.log(`${collection}: ${records.length} registros verificados, ${missing.length} migrados.`);
}

for (const { collection, reference, maximumCode } of counterPlans) {
  await firestore.runTransaction(async (transaction) => {
    const current = await transaction.get(reference);
    const currentValue = current.get('value') ?? 0;
    if (typeof currentValue !== 'number' || !Number.isSafeInteger(currentValue) || currentValue < 0) {
      throw new Error(`El contador de códigos para ${collection} no es válido.`);
    }
    if (!current.exists || currentValue < maximumCode) {
      transaction.set(reference, { value: maximumCode });
    }
  });
}

console.log('Migración completada. Los archivos JSON originales no fueron modificados.');
