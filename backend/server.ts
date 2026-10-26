import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { YouTubeVideo, YouTubeVideosResponse } from '../src/data/YouTube';

const app = express();
const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(backendDirectory, '..');
const port = Number(process.env.PORT ?? 3001);
const cacheDurationMs = 10 * 60 * 1000;
const maxCachedPages = 10;
const cachedPages = new Map<string, { expiresAt: number; data: YouTubeVideosResponse }>();

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

app.use(express.static(path.join(projectDirectory, 'dist')));
app.get('*', (_request, response) => {
  response.sendFile(path.join(projectDirectory, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.info(`TOM server listening on port ${port}`);
});
