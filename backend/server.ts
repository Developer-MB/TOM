import 'dotenv/config';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INITIAL_CMS_ITEMS,
} from '../src/data/Cms';
import type {
  CmsPostItem,
  CmsPostStatus,
  CmsPostType,
  CmsTourItem,
  CmsVideoItem,
} from '../src/data/CmsTypes';
import { resolveHomeVideoUrl } from '../src/data/YouTubeUrl';
import { INITIAL_CMS_TOURS } from '../src/data/HomeTours';
import type { YouTubeVideo, YouTubeVideosResponse } from '../src/data/YouTube';

const app = express();
app.use('/api/cms/galleries', express.json({ limit: '105mb' }));
app.use(express.json({ limit: '8mb' }));
const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(backendDirectory, '..');
const cmsDataDirectory = path.join(projectDirectory, 'data');
const cmsPostsPath = path.join(cmsDataDirectory, 'post-disc.json');
const cmsGalleriesPath = path.join(cmsDataDirectory, 'post-pics.json');
const cmsVideosPath = path.join(cmsDataDirectory, 'post-video.json');
const cmsToursPath = path.join(cmsDataDirectory, 'post-tours.json');
const analyticsPath = path.join(cmsDataDirectory, 'analytics.json');
const discCoversDirectory = path.join(projectDirectory, 'public', 'image', 'discos');
const concertPhotosDirectory = path.join(projectDirectory, 'public', 'image', 'concerts');
const port = Number(process.env.PORT ?? 3001);
const cacheDurationMs = 10 * 60 * 1000;
const maxCachedPages = 10;
const cachedPages = new Map<string, { expiresAt: number; data: YouTubeVideosResponse }>();
const cmsPostTypes: CmsPostType[] = ['RECOMENDACION', 'GALERIA', 'VIDEO', 'GIRAS'];
const cmsPostStatuses: CmsPostStatus[] = ['PUBLICADO', 'PROGRAMADO', 'BORRADOR'];
const cmsTypeCodePrefixes: Record<CmsPostType, string> = {
  RECOMENDACION: 'REC',
  GALERIA: 'GAL',
  VIDEO: 'VID',
  GIRAS: 'GIR',
};
const maxVideoFieldLengths = {
  title: 200,
  description: 2000,
  url: 2048,
} as const;
const maxTourFieldLengths = {
  band: 150,
  tourName: 200,
  venue: 200,
  info: 2000,
  ticketsInfo: 300,
} as const;
const coverImageExtensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
} as const;
const requiredPostFields = [
  'band',
  'disc',
  'genre',
  'genreKey',
  'label',
  'country',
  'flag',
  'year',
  'duration',
  'excerpt',
  'author',
] as const;
const maxFieldLengths: Record<(typeof requiredPostFields)[number], number> = {
  band: 150,
  disc: 200,
  genre: 100,
  genreKey: 100,
  label: 150,
  country: 100,
  flag: 20,
  year: 4,
  duration: 20,
  excerpt: 2000,
  author: 100,
};
const maxGalleryImages = 15;
const maxGalleryFieldLengths = {
  concert: 150,
  date: 10,
  venue: 150,
  city: 100,
  title: 200,
  desc: 2000,
  credit: 100,
} as const;
const galleryFieldNames = Object.keys(maxGalleryFieldLengths) as (keyof typeof maxGalleryFieldLengths)[];
let cmsMutationQueue: Promise<void> = Promise.resolve();

const isValidEventDate = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  Number.isFinite(Date.parse(date)) &&
  new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) === date;

const withCmsMutation = <T>(mutation: () => Promise<T>): Promise<T> => {
  const result = cmsMutationQueue.then(mutation);
  cmsMutationQueue = result.then(() => undefined, () => undefined);
  return result;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

type AnalyticsMonth = { visits: number; radioEntries: number };
type AnalyticsData = { months: Record<string, AnalyticsMonth> };

const isAnalyticsData = (value: unknown): value is AnalyticsData =>
  isRecord(value) &&
  isRecord(value.months) &&
  Object.entries(value.months).every(([month, stats]) =>
    /^\d{4}-\d{2}$/.test(month) &&
    isRecord(stats) &&
    Number.isSafeInteger(stats.visits) &&
    (stats.visits as number) >= 0 &&
    Number.isSafeInteger(stats.radioEntries) &&
    (stats.radioEntries as number) >= 0
  );

const readAnalytics = async (): Promise<AnalyticsData> => {
  try {
    const contents = await readFile(analyticsPath, 'utf8');
    const analytics: unknown = JSON.parse(contents);
    if (!isAnalyticsData(analytics)) {
      throw new Error('El archivo de métricas tiene un formato no válido.');
    }
    return analytics;
  } catch (error) {
    if (!isRecord(error) || error.code !== 'ENOENT') throw error;
    return { months: {} };
  }
};

const writeAnalytics = async (analytics: AnalyticsData) => {
  await mkdir(cmsDataDirectory, { recursive: true });
  await writeFile(analyticsPath, `${JSON.stringify(analytics, null, 2)}\n`, 'utf8');
};

type GalleryImage = { id: number; pic: string };
type GalleryRecord = {
  id: string;
  code?: string;
  status?: CmsPostStatus;
  publish?: string;
  concert: string;
  date: string;
  venue: string;
  city: string;
  title: string;
  desc: string;
  credit: string;
  img: GalleryImage[];
};

type CmsVideoInput = {
  title: string;
  description: string;
  url: string;
  status: CmsPostStatus;
  publish: string;
};

type CmsTourInput = Omit<CmsTourItem, 'id' | 'code'>;

const isValidTourDate = (year: string, month: string, day: string) => {
  if (!/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(month) || !/^\d{1,2}$/.test(day)) return false;
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);
  if (parsedYear < 2000 || parsedYear > 2100) return false;
  const date = new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDay));
  return parsedMonth >= 1 &&
    parsedMonth <= 12 &&
    date.getUTCFullYear() === parsedYear &&
    date.getUTCMonth() === parsedMonth - 1 &&
    date.getUTCDate() === parsedDay;
};

const isCmsTourInput = (value: unknown): value is CmsTourInput =>
  isRecord(value) &&
  typeof value.month === 'string' &&
  typeof value.day === 'string' &&
  typeof value.year === 'string' &&
  typeof value.band === 'string' &&
  typeof value.tourName === 'string' &&
  typeof value.venue === 'string' &&
  typeof value.info === 'string' &&
  typeof value.ticketsInfo === 'string' &&
  typeof value.ticketsLow === 'boolean' &&
  cmsPostStatuses.includes(value.status as CmsPostStatus) &&
  typeof value.publish === 'string';

const isCmsTourItem = (value: unknown): value is CmsTourItem =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.code === 'string' &&
  /^TOM-GIR-\d+$/.test(value.code) &&
  isCmsTourInput(value) &&
  isValidTourDate(value.year, value.month, value.day);

const isValidCmsTourInput = (value: unknown): value is CmsTourInput =>
  isCmsTourInput(value) &&
  isValidTourDate(value.year, value.month, value.day) &&
  Object.entries(maxTourFieldLengths).every(([field, maxLength]) =>
    value[field as keyof typeof maxTourFieldLengths].trim().length <= maxLength
  ) &&
  value.publish.length <= 100;

const readCmsTours = async (): Promise<CmsTourItem[]> => {
  try {
    const contents = await readFile(cmsToursPath, 'utf8');
    const tours: unknown = JSON.parse(contents);
    if (!Array.isArray(tours) || !tours.every(isCmsTourItem)) {
      throw new Error('El archivo de giras del CMS tiene un formato no válido.');
    }
    return tours;
  } catch (error) {
    if (!isRecord(error) || error.code !== 'ENOENT') throw error;

    await mkdir(cmsDataDirectory, { recursive: true });
    await writeFile(cmsToursPath, `${JSON.stringify(INITIAL_CMS_TOURS, null, 2)}\n`, 'utf8');
    return [...INITIAL_CMS_TOURS];
  }
};

const writeCmsTours = async (tours: CmsTourItem[]) => {
  await mkdir(cmsDataDirectory, { recursive: true });
  await writeFile(cmsToursPath, `${JSON.stringify(tours, null, 2)}\n`, 'utf8');
};

const isValidHomeVideoUrl = (url: string) => {
  try {
    resolveHomeVideoUrl(url);
    return true;
  } catch {
    return false;
  }
};

const isCmsVideoItem = (value: unknown): value is CmsVideoItem =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.code === 'string' &&
  /^TOM-VID-\d{4}$/.test(value.code) &&
  typeof value.title === 'string' &&
  typeof value.description === 'string' &&
  typeof value.url === 'string' &&
  isValidHomeVideoUrl(value.url) &&
  cmsPostStatuses.includes(value.status as CmsPostStatus) &&
  typeof value.publish === 'string';

const isCmsVideoInput = (value: unknown): value is CmsVideoInput =>
  isRecord(value) &&
  typeof value.title === 'string' &&
  typeof value.description === 'string' &&
  typeof value.url === 'string' &&
  cmsPostStatuses.includes(value.status as CmsPostStatus) &&
  typeof value.publish === 'string';

const readCmsVideos = async (): Promise<CmsVideoItem[]> => {
  try {
    const contents = await readFile(cmsVideosPath, 'utf8');
    const videos: unknown = JSON.parse(contents);
    if (!Array.isArray(videos) || !videos.every(isCmsVideoItem)) {
      throw new Error('El archivo de videos del CMS tiene un formato no válido.');
    }
    return videos;
  } catch (error) {
    if (!isRecord(error) || error.code !== 'ENOENT') throw error;

    await mkdir(cmsDataDirectory, { recursive: true });
    await writeFile(cmsVideosPath, '[]\n', 'utf8');
    return [];
  }
};

const writeCmsVideos = async (videos: CmsVideoItem[]) => {
  await mkdir(cmsDataDirectory, { recursive: true });
  await writeFile(cmsVideosPath, `${JSON.stringify(videos, null, 2)}\n`, 'utf8');
};

const isGalleryRecord = (value: unknown): value is GalleryRecord =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  (value.code === undefined || typeof value.code === 'string') &&
  (value.status === undefined || cmsPostStatuses.includes(value.status as CmsPostStatus)) &&
  (value.publish === undefined || typeof value.publish === 'string') &&
  typeof value.concert === 'string' &&
  typeof value.date === 'string' &&
  typeof value.venue === 'string' &&
  typeof value.city === 'string' &&
  typeof value.title === 'string' &&
  typeof value.desc === 'string' &&
  typeof value.credit === 'string' &&
  Array.isArray(value.img) &&
  value.img.every((image) =>
    isRecord(image) && typeof image.id === 'number' && typeof image.pic === 'string'
  );

const readCmsGalleries = async (): Promise<GalleryRecord[]> => {
  try {
    const contents = await readFile(cmsGalleriesPath, 'utf8');
    const galleries: unknown = JSON.parse(contents);
    if (!Array.isArray(galleries) || !galleries.every(isGalleryRecord)) {
      throw new Error('El archivo de galerías del CMS tiene un formato no válido.');
    }
    return galleries;
  } catch (error) {
    if (!isRecord(error) || error.code !== 'ENOENT') throw error;

    await mkdir(cmsDataDirectory, { recursive: true });
    await writeFile(cmsGalleriesPath, '[]\n', 'utf8');
    return [];
  }
};

const writeCmsGalleries = async (galleries: GalleryRecord[]) => {
  await mkdir(cmsDataDirectory, { recursive: true });
  await writeFile(cmsGalleriesPath, `${JSON.stringify(galleries, null, 2)}\n`, 'utf8');
};

type CmsPostInputRecord = Record<(typeof requiredPostFields)[number], string> & {
  type: CmsPostType;
  status: CmsPostStatus;
  publish: string;
  coverImage: unknown;
};

const isCmsPostInput = (value: unknown): value is CmsPostInputRecord =>
  isRecord(value) &&
  cmsPostTypes.includes(value.type as CmsPostType) &&
  cmsPostStatuses.includes(value.status as CmsPostStatus) &&
  typeof value.publish === 'string' &&
  requiredPostFields.every((field) =>
    typeof value[field] === 'string' && value[field].trim().length > 0
  );

const parseCoverImage = (value: unknown): { extension: string; bytes: Buffer } | null => {
  if (!isRecord(value) || typeof value.mimeType !== 'string' || typeof value.data !== 'string') {
    return null;
  }
  if (
    !Object.prototype.hasOwnProperty.call(coverImageExtensions, value.mimeType) ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value.data)
  ) {
    return null;
  }

  const bytes = Buffer.from(value.data, 'base64');
  if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024 || bytes.toString('base64') !== value.data) {
    return null;
  }

  const isPng = bytes.length >= 8 && bytes.subarray(0, 8).equals(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isGif = bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6));
  const isWebp = bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP';
  const validSignature =
    (value.mimeType === 'image/png' && isPng) ||
    (value.mimeType === 'image/jpeg' && isJpeg) ||
    (value.mimeType === 'image/gif' && isGif) ||
    (value.mimeType === 'image/webp' && isWebp);

  if (!validSignature) return null;
  return {
    extension: coverImageExtensions[value.mimeType as keyof typeof coverImageExtensions],
    bytes,
  };
};

const isCmsPostItem = (value: unknown): value is CmsPostItem =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.code === 'string' &&
  typeof value.band === 'string' &&
  typeof value.disc === 'string' &&
  cmsPostTypes.includes(value.type as CmsPostType) &&
  typeof value.genre === 'string' &&
  typeof value.genreKey === 'string' &&
  typeof value.label === 'string' &&
  typeof value.country === 'string' &&
  typeof value.flag === 'string' &&
  typeof value.year === 'string' &&
  typeof value.duration === 'string' &&
  typeof value.cover === 'string' &&
  typeof value.excerpt === 'string' &&
  typeof value.publish === 'string' &&
  typeof value.author === 'string' &&
  cmsPostStatuses.includes(value.status as CmsPostStatus);

const readCmsPosts = async (): Promise<CmsPostItem[]> => {
  try {
    const contents = await readFile(cmsPostsPath, 'utf8');
    const posts: unknown = JSON.parse(contents);
    if (!Array.isArray(posts) || !posts.every(isCmsPostItem)) {
      throw new Error('El archivo de publicaciones del CMS tiene un formato no válido.');
    }
    return posts;
  } catch (error) {
    if (!isRecord(error) || error.code !== 'ENOENT') throw error;

    await mkdir(cmsDataDirectory, { recursive: true });
    await writeFile(cmsPostsPath, `${JSON.stringify(INITIAL_CMS_ITEMS, null, 2)}\n`, 'utf8');
    return [...INITIAL_CMS_ITEMS];
  }
};

const writeCmsPosts = async (posts: CmsPostItem[]) => {
  await mkdir(cmsDataDirectory, { recursive: true });
  await writeFile(cmsPostsPath, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
};

const publishScheduledCmsEntries = async () => withCmsMutation(async () => {
  const now = Date.now();
  const [posts, galleries, videos, tours] = await Promise.all([
    readCmsPosts(),
    readCmsGalleries(),
    readCmsVideos(),
    readCmsTours(),
  ]);
  const publishedPosts = posts.map((post) =>
    post.status === 'PROGRAMADO' &&
    Number.isFinite(Date.parse(post.publish)) &&
    Date.parse(post.publish) <= now
      ? { ...post, status: 'PUBLICADO' as const }
      : post,
  );
  const publishedGalleries = galleries.map((gallery) =>
    gallery.status === 'PROGRAMADO' &&
    typeof gallery.publish === 'string' &&
    Number.isFinite(Date.parse(gallery.publish)) &&
    Date.parse(gallery.publish) <= now
      ? { ...gallery, status: 'PUBLICADO' as const }
      : gallery,
  );
  const publishedVideos = videos.map((video) =>
    video.status === 'PROGRAMADO' &&
    Number.isFinite(Date.parse(video.publish)) &&
    Date.parse(video.publish) <= now
      ? { ...video, status: 'PUBLICADO' as const }
      : video,
  );
  const publishedTours = tours.map((tour) =>
    tour.status === 'PROGRAMADO' &&
    Number.isFinite(Date.parse(tour.publish)) &&
    Date.parse(tour.publish) <= now
      ? { ...tour, status: 'PUBLICADO' as const }
      : tour,
  );

  const postsChanged = publishedPosts.some((post, index) => post !== posts[index]);
  const galleriesChanged = publishedGalleries.some((gallery, index) => gallery !== galleries[index]);
  const videosChanged = publishedVideos.some((video, index) => video !== videos[index]);
  const toursChanged = publishedTours.some((tour, index) => tour !== tours[index]);
  if (postsChanged) await writeCmsPosts(publishedPosts);
  if (galleriesChanged) await writeCmsGalleries(publishedGalleries);
  if (videosChanged) await writeCmsVideos(publishedVideos);
  if (toursChanged) await writeCmsTours(publishedTours);

  return postsChanged || galleriesChanged || videosChanged || toursChanged;
});

type GalleryCreateInput = Record<keyof typeof maxGalleryFieldLengths, string> & {
  status: CmsPostStatus;
  publish: string;
  img: unknown[];
};

const isGalleryCreateInput = (value: unknown): value is GalleryCreateInput =>
  isRecord(value) &&
  cmsPostStatuses.includes(value.status as CmsPostStatus) &&
  typeof value.publish === 'string' &&
  galleryFieldNames.every((field) =>
    typeof value[field] === 'string' && value[field].trim().length > 0
  ) &&
  Array.isArray(value.img);

app.get('/api/cms/galleries', async (_request, response) => {
  try {
    response.setHeader('Cache-Control', 'no-store');
    await publishScheduledCmsEntries();
    response.json(await readCmsGalleries());
  } catch (error) {
    console.error('No se pudieron leer las galerías del CMS:', error);
    response.status(500).json({ error: 'No se pudieron cargar las galerías.' });
  }
});

app.post('/api/cms/galleries', async (request, response) => {
  const body: unknown = request.body;
  if (!isGalleryCreateInput(body) ||
    galleryFieldNames.some((field) => body[field].trim().length > maxGalleryFieldLengths[field]) ||
    !isValidEventDate(body.date) ||
    body.publish.length > 100 ||
    (body.status !== 'BORRADOR' && body.img.length === 0) ||
    body.img.length > maxGalleryImages) {
    response.status(400).json({
      error: `Completa los datos de la galería. Los borradores pueden guardarse sin fotos; para publicar o programar selecciona de 1 a ${maxGalleryImages}.`,
    });
    return;
  }

  if (body.status === 'PROGRAMADO' && (!body.publish || !Number.isFinite(Date.parse(body.publish)))) {
    response.status(400).json({ error: 'Indica una fecha y hora válida para la publicación programada.' });
    return;
  }

  const parsedImages = body.img.map(parseCoverImage);
  if (!parsedImages.every((image): image is NonNullable<typeof image> => image !== null)) {
    response.status(400).json({ error: 'Cada imagen debe ser JPG, PNG, WebP o GIF y pesar hasta 5 MB.' });
    return;
  }

  try {
    const created = await withCmsMutation(async () => {
      const galleries = await readCmsGalleries();
      const id = randomUUID();
      const savedImagePaths: string[] = [];
      const codePattern = /^TOM-CON-(\d+)$/;
      const highestCode = galleries.reduce((highest, gallery) => {
        const codeNumber = Number(gallery.code?.match(codePattern)?.[1]);
        return Number.isFinite(codeNumber) ? Math.max(highest, codeNumber) : highest;
      }, 0);

      try {
        await mkdir(concertPhotosDirectory, { recursive: true });
        const img: GalleryImage[] = [];
        for (const [index, image] of parsedImages.entries()) {
          const filename = `${randomUUID()}.${image.extension}`;
          const imagePath = path.join(concertPhotosDirectory, filename);
          await writeFile(imagePath, image.bytes, { flag: 'wx' });
          savedImagePaths.push(imagePath);
          img.push({ id: index + 1, pic: `/image/concerts/${filename}` });
        }

        const gallery: GalleryRecord = {
          id,
          code: `TOM-CON-${String(highestCode + 1).padStart(4, '0')}`,
          status: body.status,
          publish: body.status === 'PUBLICADO'
            ? new Date().toISOString()
            : body.status === 'PROGRAMADO'
              ? new Date(body.publish).toISOString()
              : '',
          concert: body.concert.trim(),
          date: body.date,
          venue: body.venue.trim(),
          city: body.city.trim(),
          title: body.title.trim(),
          desc: body.desc.trim(),
          credit: body.credit.trim().toLocaleUpperCase('es'),
          img,
        };
        await writeCmsGalleries([gallery, ...galleries]);
        return gallery;
      } catch (error) {
        await Promise.all(savedImagePaths.map((imagePath) => unlink(imagePath)));
        throw error;
      }
    });

    response.status(201).json(created);
  } catch (error) {
    console.error('No se pudo guardar la galería del CMS:', error);
    response.status(500).json({ error: 'No se pudo guardar la galería.' });
  }
});

app.put('/api/cms/galleries/:id', async (request, response) => {
  const body: unknown = request.body;
  if (!isGalleryCreateInput(body) ||
    galleryFieldNames.some((field) => body[field].trim().length > maxGalleryFieldLengths[field]) ||
    !isValidEventDate(body.date) ||
    body.publish.length > 100 ||
    body.img.length > maxGalleryImages) {
    response.status(400).json({ error: `Completa los datos de la galería. Puedes agregar hasta ${maxGalleryImages} fotografías.` });
    return;
  }

  if (body.status === 'PROGRAMADO' && (!body.publish || !Number.isFinite(Date.parse(body.publish)))) {
    response.status(400).json({ error: 'Indica una fecha y hora válida para la publicación programada.' });
    return;
  }

  const parsedImages = body.img.map(parseCoverImage);
  if (!parsedImages.every((image): image is NonNullable<typeof image> => image !== null)) {
    response.status(400).json({ error: 'Cada imagen debe ser JPG, PNG, WebP o GIF y pesar hasta 5 MB.' });
    return;
  }

  try {
    const result = await withCmsMutation(async () => {
      const galleries = await readCmsGalleries();
      const galleryIndex = galleries.findIndex((gallery) => gallery.id === request.params.id);
      if (galleryIndex === -1) return { kind: 'not-found' as const };

      const previous = galleries[galleryIndex];
      if ((previous.status ?? 'PUBLICADO') !== 'BORRADOR') {
        return { kind: 'not-draft' as const };
      }
      if (previous.img.length + parsedImages.length > maxGalleryImages) {
        return { kind: 'too-many-images' as const };
      }

      const savedImagePaths: string[] = [];
      try {
        const addedImages: GalleryImage[] = [];
        await mkdir(concertPhotosDirectory, { recursive: true });
        for (const [index, image] of parsedImages.entries()) {
          const filename = `${randomUUID()}.${image.extension}`;
          const imagePath = path.join(concertPhotosDirectory, filename);
          await writeFile(imagePath, image.bytes, { flag: 'wx' });
          savedImagePaths.push(imagePath);
          addedImages.push({
            id: previous.img.length + index + 1,
            pic: `/image/concerts/${filename}`,
          });
        }

        const updated: GalleryRecord = {
          ...previous,
          status: body.status,
          publish: body.status === 'PUBLICADO'
            ? new Date().toISOString()
            : body.status === 'PROGRAMADO'
              ? new Date(body.publish).toISOString()
              : '',
          concert: body.concert.trim(),
          date: body.date,
          venue: body.venue.trim(),
          city: body.city.trim(),
          title: body.title.trim(),
          desc: body.desc.trim(),
          credit: body.credit.trim().toLocaleUpperCase('es'),
          img: [...previous.img, ...addedImages],
        };
        const updatedGalleries = [...galleries];
        updatedGalleries[galleryIndex] = updated;
        await writeCmsGalleries(updatedGalleries);
        return { kind: 'updated' as const, gallery: updated };
      } catch (error) {
        await Promise.all(savedImagePaths.map((imagePath) => unlink(imagePath)));
        throw error;
      }
    });

    if (result.kind === 'not-found') {
      response.status(404).json({ error: 'No se encontró el borrador de galería.' });
      return;
    }
    if (result.kind === 'not-draft') {
      response.status(409).json({ error: 'Solo se pueden continuar galerías guardadas como borrador.' });
      return;
    }
    if (result.kind === 'too-many-images') {
      response.status(400).json({ error: `La galería no puede superar ${maxGalleryImages} fotografías.` });
      return;
    }

    response.json(result.gallery);
  } catch (error) {
    console.error('No se pudo continuar la publicación de la galería:', error);
    response.status(500).json({ error: 'No se pudo actualizar la galería.' });
  }
});

app.get('/api/cms/posts', async (_request, response) => {
  try {
    response.setHeader('Cache-Control', 'no-store');
    await publishScheduledCmsEntries();
    response.json(await readCmsPosts());
  } catch (error) {
    console.error('No se pudieron leer las publicaciones del CMS:', error);
    response.status(500).json({ error: 'No se pudieron cargar las publicaciones.' });
  }
});

app.post('/api/cms/posts', async (request, response) => {
  const body: unknown = request.body;
  if (!isCmsPostInput(body) || requiredPostFields.some((field) => body[field].length > maxFieldLengths[field]) ||
    body.publish.length > 100) {
    response.status(400).json({ error: 'Los datos de la publicación no son válidos.' });
    return;
  }

  if (body.status === 'PROGRAMADO' && (!body.publish || !Number.isFinite(Date.parse(body.publish)))) {
    response.status(400).json({ error: 'Indica una fecha y hora válida para la publicación programada.' });
    return;
  }

  const coverImage = parseCoverImage(body.coverImage);
  if (!coverImage) {
    response.status(400).json({ error: 'Selecciona una imagen válida de hasta 5 MB.' });
    return;
  }

  const postInput: Omit<CmsPostItem, 'id' | 'code' | 'cover'> = {
    type: body.type as CmsPostType,
    band: body.band.trim(),
    disc: body.disc.trim(),
    genre: body.genre.trim(),
    genreKey: body.genreKey.trim(),
    label: body.label.trim(),
    country: body.country.trim(),
    flag: body.flag.trim(),
    year: body.year.trim(),
    duration: body.duration.trim(),
    excerpt: body.excerpt.trim(),
    publish: body.status === 'PUBLICADO'
      ? new Date().toISOString()
      : body.status === 'PROGRAMADO'
        ? new Date(body.publish).toISOString()
        : '',
    status: body.status as CmsPostStatus,
    author: body.author.trim().toLocaleUpperCase('es'),
  };

  try {
    const created = await withCmsMutation(async () => {
      const posts = await readCmsPosts();
      const codePrefix = cmsTypeCodePrefixes[postInput.type];
      const codePattern = new RegExp(`^TOM-${codePrefix}-(\\d+)$`);
      const highestCode = posts.reduce((highest, post) => {
        const codeNumber = Number(post.code.match(codePattern)?.[1]);
        return Number.isFinite(codeNumber) ? Math.max(highest, codeNumber) : highest;
      }, 0);
      const filename = `${randomUUID()}.${coverImage.extension}`;
      const imagePath = path.join(discCoversDirectory, filename);
      await mkdir(discCoversDirectory, { recursive: true });
      await writeFile(imagePath, coverImage.bytes, { flag: 'wx' });

      try {
        const newPost: CmsPostItem = {
          id: randomUUID(),
          code: `TOM-${codePrefix}-${String(highestCode + 1).padStart(4, '0')}`,
          ...postInput,
          cover: `/image/discos/${filename}`,
        };
        await writeCmsPosts([newPost, ...posts]);
        return newPost;
      } catch (error) {
        await unlink(imagePath);
        throw error;
      }
    });

    response.status(201).json(created);
  } catch (error) {
    console.error('No se pudo guardar la publicación del CMS:', error);
    response.status(500).json({ error: 'No se pudo guardar la publicación.' });
  }
});

app.delete('/api/cms/posts/:id', async (request, response) => {
  try {
    const deleted = await withCmsMutation(async () => {
      const posts = await readCmsPosts();
      const remainingPosts = posts.filter((post) => post.id !== request.params.id);
      if (remainingPosts.length === posts.length) return false;
      await writeCmsPosts(remainingPosts);
      return true;
    });

    if (!deleted) {
      response.status(404).json({ error: 'No se encontró la publicación solicitada.' });
      return;
    }
    response.status(204).end();
  } catch (error) {
    console.error('No se pudo eliminar la publicación del CMS:', error);
    response.status(500).json({ error: 'No se pudo eliminar la publicación.' });
  }
});

app.get('/api/cms/videos', async (_request, response) => {
  try {
    response.setHeader('Cache-Control', 'no-store');
    await publishScheduledCmsEntries();
    response.json(await readCmsVideos());
  } catch (error) {
    console.error('No se pudieron leer los videos del CMS:', error);
    response.status(500).json({ error: 'No se pudieron cargar los videos.' });
  }
});

app.post('/api/cms/videos', async (request, response) => {
  const body: unknown = request.body;
  if (!isCmsVideoInput(body) ||
    !body.title.trim() ||
    !body.description.trim() ||
    !body.url.trim() ||
    body.title.trim().length > maxVideoFieldLengths.title ||
    body.description.trim().length > maxVideoFieldLengths.description ||
    body.url.trim().length > maxVideoFieldLengths.url ||
    body.publish.length > 100 ||
    !isValidHomeVideoUrl(body.url.trim())) {
    response.status(400).json({ error: 'Completa el título, la descripción y una URL válida de YouTube.' });
    return;
  }

  if (body.status === 'PROGRAMADO' && (!body.publish || !Number.isFinite(Date.parse(body.publish)))) {
    response.status(400).json({ error: 'Indica una fecha y hora válida para la publicación programada.' });
    return;
  }

  try {
    const created = await withCmsMutation(async () => {
      const videos = await readCmsVideos();
      const codePattern = /^TOM-VID-(\d+)$/;
      const highestCode = videos.reduce((highest, video) => {
        const codeNumber = Number(video.code.match(codePattern)?.[1]);
        return Number.isFinite(codeNumber) ? Math.max(highest, codeNumber) : highest;
      }, 0);
      const video: CmsVideoItem = {
        id: randomUUID(),
        code: `TOM-VID-${String(highestCode + 1).padStart(4, '0')}`,
        title: body.title.trim(),
        description: body.description.trim(),
        url: body.url.trim(),
        status: body.status,
        publish: body.status === 'PUBLICADO'
          ? new Date().toISOString()
          : body.status === 'PROGRAMADO'
            ? new Date(body.publish).toISOString()
            : '',
      };
      await writeCmsVideos([video, ...videos]);
      return video;
    });

    response.status(201).json(created);
  } catch (error) {
    console.error('No se pudo guardar el video del CMS:', error);
    response.status(500).json({ error: 'No se pudo guardar el video.' });
  }
});

app.put('/api/cms/videos/:id', async (request, response) => {
  const body: unknown = request.body;
  if (!isCmsVideoInput(body) ||
    !body.title.trim() ||
    !body.description.trim() ||
    !body.url.trim() ||
    body.title.trim().length > maxVideoFieldLengths.title ||
    body.description.trim().length > maxVideoFieldLengths.description ||
    body.url.trim().length > maxVideoFieldLengths.url ||
    body.publish.length > 100 ||
    !isValidHomeVideoUrl(body.url.trim())) {
    response.status(400).json({ error: 'Completa el título, la descripción y una URL válida de YouTube.' });
    return;
  }

  if (body.status === 'PROGRAMADO' && (!body.publish || !Number.isFinite(Date.parse(body.publish)))) {
    response.status(400).json({ error: 'Indica una fecha y hora válida para la publicación programada.' });
    return;
  }

  try {
    const result = await withCmsMutation(async () => {
      const videos = await readCmsVideos();
      const videoIndex = videos.findIndex((video) => video.id === request.params.id);
      if (videoIndex === -1) return { kind: 'not-found' as const };
      if (videos[videoIndex].status !== 'BORRADOR') return { kind: 'not-draft' as const };

      const updated: CmsVideoItem = {
        ...videos[videoIndex],
        title: body.title.trim(),
        description: body.description.trim(),
        url: body.url.trim(),
        status: body.status,
        publish: body.status === 'PUBLICADO'
          ? new Date().toISOString()
          : body.status === 'PROGRAMADO'
            ? new Date(body.publish).toISOString()
            : '',
      };
      const updatedVideos = [...videos];
      updatedVideos[videoIndex] = updated;
      await writeCmsVideos(updatedVideos);
      return { kind: 'updated' as const, video: updated };
    });

    if (result.kind === 'not-found') {
      response.status(404).json({ error: 'No se encontró el borrador de video.' });
      return;
    }
    if (result.kind === 'not-draft') {
      response.status(409).json({ error: 'Solo se pueden continuar videos guardados como borrador.' });
      return;
    }
    response.json(result.video);
  } catch (error) {
    console.error('No se pudo continuar la publicación del video:', error);
    response.status(500).json({ error: 'No se pudo actualizar el video.' });
  }
});

app.delete('/api/cms/videos/:id', async (request, response) => {
  try {
    const deleted = await withCmsMutation(async () => {
      const videos = await readCmsVideos();
      const remainingVideos = videos.filter((video) => video.id !== request.params.id);
      if (remainingVideos.length === videos.length) return false;
      await writeCmsVideos(remainingVideos);
      return true;
    });

    if (!deleted) {
      response.status(404).json({ error: 'No se encontró el video solicitado.' });
      return;
    }
    response.status(204).end();
  } catch (error) {
    console.error('No se pudo eliminar el video del CMS:', error);
    response.status(500).json({ error: 'No se pudo eliminar el video.' });
  }
});

app.get('/api/cms/tours', async (_request, response) => {
  try {
    response.setHeader('Cache-Control', 'no-store');
    await publishScheduledCmsEntries();
    response.json(await readCmsTours());
  } catch (error) {
    console.error('No se pudieron leer las giras del CMS:', error);
    response.status(500).json({ error: 'No se pudieron cargar las giras.' });
  }
});

app.post('/api/cms/tours', async (request, response) => {
  const body: unknown = request.body;
  if (!isValidCmsTourInput(body)) {
    response.status(400).json({ error: 'Los datos de la gira no son válidos. Revisa la fecha y los campos.' });
    return;
  }
  if (body.status === 'PROGRAMADO' && (!body.publish || !Number.isFinite(Date.parse(body.publish)))) {
    response.status(400).json({ error: 'Indica una fecha y hora válida para la publicación programada.' });
    return;
  }

  try {
    const created = await withCmsMutation(async () => {
      const tours = await readCmsTours();
      const highestCode = tours.reduce((highest, tour) => {
        const codeNumber = Number(tour.code.match(/^TOM-GIR-(\d+)$/)?.[1]);
        return Number.isFinite(codeNumber) ? Math.max(highest, codeNumber) : highest;
      }, 0);
      const tour: CmsTourItem = {
        id: randomUUID(),
        code: `TOM-GIR-${String(highestCode + 1).padStart(4, '0')}`,
        month: body.month.padStart(2, '0'),
        day: body.day.padStart(2, '0'),
        year: body.year,
        band: body.band.trim(),
        tourName: body.tourName.trim(),
        venue: body.venue.trim(),
        info: body.info.trim(),
        ticketsInfo: body.ticketsInfo.trim(),
        ticketsLow: body.ticketsLow,
        status: body.status,
        publish: body.status === 'PUBLICADO'
          ? new Date().toISOString()
          : body.status === 'PROGRAMADO'
            ? new Date(body.publish).toISOString()
            : '',
      };
      await writeCmsTours([tour, ...tours]);
      return tour;
    });

    response.status(201).json(created);
  } catch (error) {
    console.error('No se pudo guardar la gira del CMS:', error);
    response.status(500).json({ error: 'No se pudo guardar la gira.' });
  }
});

app.put('/api/cms/tours/:id', async (request, response) => {
  const body: unknown = request.body;
  if (!isValidCmsTourInput(body)) {
    response.status(400).json({ error: 'Los datos de la gira no son válidos. Revisa la fecha y los campos.' });
    return;
  }
  if (body.status === 'PROGRAMADO' && (!body.publish || !Number.isFinite(Date.parse(body.publish)))) {
    response.status(400).json({ error: 'Indica una fecha y hora válida para la publicación programada.' });
    return;
  }

  try {
    const result = await withCmsMutation(async () => {
      const tours = await readCmsTours();
      const tourIndex = tours.findIndex((tour) => tour.id === request.params.id);
      if (tourIndex === -1) return { kind: 'not-found' as const };
      if (tours[tourIndex].status !== 'BORRADOR') return { kind: 'not-draft' as const };

      const updated: CmsTourItem = {
        ...tours[tourIndex],
        month: body.month.padStart(2, '0'),
        day: body.day.padStart(2, '0'),
        year: body.year,
        band: body.band.trim(),
        tourName: body.tourName.trim(),
        venue: body.venue.trim(),
        info: body.info.trim(),
        ticketsInfo: body.ticketsInfo.trim(),
        ticketsLow: body.ticketsLow,
        status: body.status,
        publish: body.status === 'PUBLICADO'
          ? new Date().toISOString()
          : body.status === 'PROGRAMADO'
            ? new Date(body.publish).toISOString()
            : '',
      };
      const updatedTours = [...tours];
      updatedTours[tourIndex] = updated;
      await writeCmsTours(updatedTours);
      return { kind: 'updated' as const, tour: updated };
    });

    if (result.kind === 'not-found') {
      response.status(404).json({ error: 'No se encontró el borrador de gira.' });
      return;
    }
    if (result.kind === 'not-draft') {
      response.status(409).json({ error: 'Solo se pueden continuar giras guardadas como borrador.' });
      return;
    }
    response.json(result.tour);
  } catch (error) {
    console.error('No se pudo continuar la publicación de la gira:', error);
    response.status(500).json({ error: 'No se pudo actualizar la gira.' });
  }
});

app.delete('/api/cms/tours/:id', async (request, response) => {
  try {
    const deleted = await withCmsMutation(async () => {
      const tours = await readCmsTours();
      const remainingTours = tours.filter((tour) => tour.id !== request.params.id);
      if (remainingTours.length === tours.length) return false;
      await writeCmsTours(remainingTours);
      return true;
    });

    if (!deleted) {
      response.status(404).json({ error: 'No se encontró la gira solicitada.' });
      return;
    }
    response.status(204).end();
  } catch (error) {
    console.error('No se pudo eliminar la gira del CMS:', error);
    response.status(500).json({ error: 'No se pudo eliminar la gira.' });
  }
});

app.get('/api/home/tours', async (_request, response) => {
  try {
    await publishScheduledCmsEntries();
    const tours = await readCmsTours();
    response.setHeader('Cache-Control', 'no-store');
    response.json(tours.filter((tour) => tour.status === 'PUBLICADO'));
  } catch (error) {
    console.error('No se pudieron cargar las giras publicadas:', error);
    response.status(500).json({ error: 'No se pudieron cargar las giras publicadas.' });
  }
});

type YouTubeApiResponse<T> = {
  items?: T[];
  nextPageToken?: string;
};

type ChannelResponse = {
  snippet?: { title?: string };
  contentDetails?: { relatedPlaylists?: { uploads?: string } };
};

type PlaylistItemResponse = {
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
    resourceId?: { videoId?: string };
    thumbnails?: Record<string, { url?: string }>;
  };
};

let channelPromise: Promise<{ channelTitle: string; uploadsPlaylistId: string }> | undefined;

app.get('/api/home/videos', async (_request, response) => {
  try {
    await publishScheduledCmsEntries();
    const videos = await readCmsVideos();
    const items = videos
      .filter((video) => video.status === 'PUBLICADO')
      .sort((first, second) => Date.parse(second.publish) - Date.parse(first.publish))
      .map((video) => ({
        ...video,
        fecha: video.publish,
        ...resolveHomeVideoUrl(video.url),
      }));
    response.setHeader('Cache-Control', 'no-store');
    response.json({ items });
  } catch (error) {
    console.error('No se pudieron cargar los videos publicados:', error);
    response.status(500).json({ error: 'No se pudieron cargar los videos destacados.' });
  }
});

const requestYouTubeApi = async <T>(endpoint: string, params: Record<string, string>) => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY no está configurada.');
  }

  const url = new URL(`https://youtube.googleapis.com/youtube/v3/${endpoint}`);
  url.search = new URLSearchParams({ ...params, key: apiKey }).toString();
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`YouTube API respondió ${response.status} en ${endpoint}.`);
    throw new Error('No se pudo obtener información de YouTube.');
  }

  return response.json() as Promise<T>;
};

const getChannel = async () => {
  if (!channelPromise) {
    channelPromise = requestYouTubeApi<YouTubeApiResponse<ChannelResponse>>('channels', {
      part: 'snippet,contentDetails',
      forHandle: 'TimeOfMetal-mx',
    }).then((response) => {
      const channel = response.items?.[0];
      const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylistId) {
        throw new Error('No se encontró la lista de videos del canal de YouTube.');
      }

      return {
        channelTitle: channel.snippet?.title ?? 'Time of Metal',
        uploadsPlaylistId,
      };
    }).catch((error: unknown) => {
      channelPromise = undefined;
      throw error;
    });
  }

  return channelPromise;
};

const getVideosPage = async (pageToken: string | undefined): Promise<YouTubeVideosResponse> => {
  const channel = await getChannel();
  const params: Record<string, string> = {
    part: 'snippet',
    playlistId: channel.uploadsPlaylistId,
    maxResults: '12',
  };
  if (pageToken) params.pageToken = pageToken;

  const response = await requestYouTubeApi<YouTubeApiResponse<PlaylistItemResponse>>(
    'playlistItems',
    params,
  );

  const items: YouTubeVideo[] = (response.items ?? []).flatMap((item) => {
    const snippet = item.snippet;
    const videoId = snippet?.resourceId?.videoId;
    if (!snippet || !videoId) return [];

    const thumbnailUrl =
      snippet.thumbnails?.maxres?.url ??
      snippet.thumbnails?.high?.url ??
      snippet.thumbnails?.medium?.url ??
      snippet.thumbnails?.default?.url ??
      '';

    return [{
      id: videoId,
      title: snippet.title ?? 'Video sin título',
      description: snippet.description ?? '',
      publishedAt: snippet.publishedAt ?? '',
      thumbnailUrl,
    }];
  });

  return {
    channelTitle: channel.channelTitle,
    items,
    nextPageToken: response.nextPageToken,
  };
};

app.get('/api/youtube/videos', async (request, response) => {
  const pageToken = typeof request.query.pageToken === 'string'
    ? request.query.pageToken
    : undefined;
  if (pageToken && pageToken.length > 512) {
    response.status(400).json({ error: 'El token de paginación no es válido.' });
    return;
  }

  const cacheKey = pageToken ?? 'first';
  const cachedPage = cachedPages.get(cacheKey);
  if (cachedPage && cachedPage.expiresAt > Date.now()) {
    response.json(cachedPage.data);
    return;
  }

  try {
    const data = await getVideosPage(pageToken);
    cachedPages.set(cacheKey, { data, expiresAt: Date.now() + cacheDurationMs });
    if (cachedPages.size > maxCachedPages) {
      const oldestKey = cachedPages.keys().next().value;
      if (oldestKey) cachedPages.delete(oldestKey);
    }
    response.setHeader('Cache-Control', 'public, max-age=300');
    response.json(data);
  } catch (error) {
    console.error('No se pudo cargar el canal de YouTube:', error);
    response.status(process.env.YOUTUBE_API_KEY ? 502 : 503).json({
      error: process.env.YOUTUBE_API_KEY
        ? 'No se pudieron cargar los videos de YouTube.'
        : 'Falta configurar YOUTUBE_API_KEY en el servidor.',
    });
  }
});

app.use(express.static(path.join(projectDirectory, 'public')));
app.use(express.static(path.join(projectDirectory, 'dist')));
app.get('*', (_request, response) => {
  response.sendFile(path.join(projectDirectory, 'dist', 'index.html'));
});

const scheduledPublicationInterval = setInterval(() => {
  void publishScheduledCmsEntries()
    .then((changed) => {
      if (changed) console.info('Se publicaron automáticamente entradas programadas.');
    })
    .catch((error: unknown) => {
      console.error('No se pudieron publicar las entradas programadas:', error);
    });
}, 15_000);
scheduledPublicationInterval.unref();
void publishScheduledCmsEntries()
  .then((changed) => {
    if (changed) console.info('Se publicaron automáticamente entradas programadas.');
  })
  .catch((error: unknown) => {
    console.error('No se pudieron publicar las entradas programadas:', error);
  });

app.post('/api/analytics/events', async (request, response) => {
  if (!isRecord(request.body) || !['portal', 'radio'].includes(request.body.type as string)) {
    response.status(400).json({ error: 'El tipo de evento de métricas no es válido.' });
    return;
  }

  try {
    await withCmsMutation(async () => {
      const analytics = await readAnalytics();
      const month = new Date().toISOString().slice(0, 7);
      const stats = analytics.months[month] ?? { visits: 0, radioEntries: 0 };
      if (request.body.type === 'portal') stats.visits += 1;
      else stats.radioEntries += 1;
      analytics.months[month] = stats;
      await writeAnalytics(analytics);
    });
    response.status(204).end();
  } catch (error) {
    console.error('No se pudo registrar el evento de métricas:', error);
    response.status(500).json({ error: 'No se pudo registrar la visita.' });
  }
});

app.get('/api/cms/metrics', async (_request, response) => {
  try {
    await publishScheduledCmsEntries();
    const [posts, galleries, videos, tours, analytics] = await Promise.all([
      readCmsPosts(),
      readCmsGalleries(),
      readCmsVideos(),
      readCmsTours(),
      withCmsMutation(readAnalytics),
    ]);
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
      .toISOString()
      .slice(0, 7);
    const currentStats = analytics.months[currentMonth] ?? { visits: 0, radioEntries: 0 };
    const previousVisits = analytics.months[previousMonth]?.visits ?? 0;
    const isPublishedGallery = (gallery: GalleryRecord) =>
      (gallery.status ?? 'PUBLICADO') === 'PUBLICADO';
    const publishedPosts = posts.filter((post) => post.status === 'PUBLICADO').length +
      galleries.filter(isPublishedGallery).length +
      videos.filter((video) => video.status === 'PUBLICADO').length +
      tours.filter((tour) => tour.status === 'PUBLICADO').length;
    const photoCount = galleries
      .filter(isPublishedGallery)
      .reduce((total, gallery) => total + gallery.img.length, 0);

    response.setHeader('Cache-Control', 'no-store');
    response.json({
      monthlyVisits: currentStats.visits,
      radioEntries: currentStats.radioEntries,
      publishedPosts,
      photoCount,
      comparisonPercent: previousVisits > 0
        ? Math.round(((currentStats.visits - previousVisits) / previousVisits) * 1000) / 10
        : null,
    });
  } catch (error) {
    console.error('No se pudieron cargar las métricas del CMS:', error);
    response.status(500).json({ error: 'No se pudieron cargar las métricas.' });
  }
});

app.listen(port, () => {
  console.info(`TOM server listening on port ${port}`);
});
