import 'dotenv/config';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIAL_CMS_ITEMS, type CmsPostItem, type CmsPostStatus, type CmsPostType } from '../src/data/Cms';
import { HOME_VIDEOS, resolveHomeVideoUrl } from '../src/data/HomeVideo';
import type { YouTubeVideo, YouTubeVideosResponse } from '../src/data/YouTube';

const app = express();
app.use(express.json({ limit: '8mb' }));
const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(backendDirectory, '..');
const cmsDataDirectory = path.join(projectDirectory, 'data');
const cmsPostsPath = path.join(cmsDataDirectory, 'post-disc.json');
const discCoversDirectory = path.join(projectDirectory, 'public', 'image', 'discos');
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
let cmsMutationQueue: Promise<void> = Promise.resolve();

const withCmsMutation = <T>(mutation: () => Promise<T>): Promise<T> => {
  const result = cmsMutationQueue.then(mutation);
  cmsMutationQueue = result.then(() => undefined, () => undefined);
  return result;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

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

app.get('/api/cms/posts', async (_request, response) => {
  try {
    response.setHeader('Cache-Control', 'no-store');
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
    author: body.author.trim(),
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

app.get('/api/home/videos', (_request, response) => {
  try {
    const items = HOME_VIDEOS.map((video) => ({
      ...video,
      ...resolveHomeVideoUrl(video.url),
    }));
    response.setHeader('Cache-Control', 'public, max-age=300');
    response.json({ items });
  } catch (error) {
    console.error('No se pudieron cargar los videos de HOME_VIDEOS:', error);
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

app.listen(port, () => {
  console.info(`TOM server listening on port ${port}`);
});
