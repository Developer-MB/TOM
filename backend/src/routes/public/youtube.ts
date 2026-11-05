import { Router } from 'express';
import { asyncRoute } from '../../utils/http.js';

const router = Router();
const CACHE_DURATION = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 10;
const cache = new Map<string, { expiresAt: number; response: unknown }>();
let channelPromise: Promise<{ uploadsPlaylistId: string; channelTitle: string }> | undefined;

const youtubeApi = async <T>(endpoint: string, params: Record<string, string>): Promise<T> => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('El servicio de videos no está configurado.');
  const url = new URL(`https://youtube.googleapis.com/youtube/v3/${endpoint}`);
  url.search = new URLSearchParams({ ...params, key: apiKey }).toString();
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`YouTube API respondió HTTP ${response.status} en ${endpoint}.`);
    throw new Error('No se pudieron cargar los videos de YouTube.');
  }
  return response.json() as Promise<T>;
};

router.get('/videos', asyncRoute(async (request, response) => {
  const pageToken = typeof request.query.pageToken === 'string' ? request.query.pageToken : '';
  if (pageToken.length > 500) {
    response.status(400).json({ error: 'El token de paginación no es válido.' });
    return;
  }
  const cached = cache.get(pageToken);
  if (cached && cached.expiresAt > Date.now()) {
    response.setHeader('Cache-Control', 'public, max-age=60');
    response.json(cached.response);
    return;
  }

  channelPromise ??= youtubeApi<{
    items?: { snippet?: { title?: string }; contentDetails?: { relatedPlaylists?: { uploads?: string } } }[];
  }>('channels', { part: 'snippet,contentDetails', forHandle: 'TimeOfMetal-mx' })
    .then((result) => {
      const channel = result.items?.[0];
      const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylistId) throw new Error('No se encontró la lista de videos del canal.');
      return { channelTitle: channel.snippet?.title ?? 'Time Of Metal', uploadsPlaylistId };
    })
    .catch((error: unknown) => {
      channelPromise = undefined;
      throw error;
    });

  const channel = await channelPromise;
  const page = await youtubeApi<{
    nextPageToken?: string;
    items?: { snippet?: {
      title?: string; description?: string; publishedAt?: string;
      resourceId?: { videoId?: string };
      thumbnails?: Record<string, { url?: string }>;
    } }[];
  }>('playlistItems', {
    part: 'snippet',
    playlistId: channel.uploadsPlaylistId,
    maxResults: '12',
    ...(pageToken ? { pageToken } : {}),
  });

  const result = {
    channelTitle: channel.channelTitle,
    items: (page.items ?? []).flatMap((item) => {
      const snippet = item.snippet;
      const videoId = snippet?.resourceId?.videoId;
      if (!videoId) return [];
      return [{
        id: videoId,
        title: snippet?.title ?? '',
        description: snippet?.description ?? '',
        publishedAt: snippet?.publishedAt ?? '',
        thumbnail: snippet?.thumbnails?.high?.url ??
          snippet?.thumbnails?.medium?.url ??
          snippet?.thumbnails?.default?.url ?? '',
      }];
    }),
    ...(page.nextPageToken ? { nextPageToken: page.nextPageToken } : {}),
  };
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(pageToken, { expiresAt: Date.now() + CACHE_DURATION, response: result });
  response.setHeader('Cache-Control', 'public, max-age=60');
  response.json(result);
}));

export default router;
