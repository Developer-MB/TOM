import type { IncomingMessage, ServerResponse } from 'node:http';
import videos from '../../data/post-video.json';

const resolveHomeVideoUrl = (url: string) => {
  const parsedUrl = new URL(url);
  const host = parsedUrl.hostname.toLowerCase();
  const isYoutubeHost = [
    'youtube.com',
    'www.youtube.com',
    'm.youtube.com',
    'youtu.be',
    'www.youtu.be',
  ].includes(host);
  const videoId = host.endsWith('youtu.be')
    ? parsedUrl.pathname.slice(1)
    : parsedUrl.searchParams.get('v') ??
      parsedUrl.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ??
      '';

  if (!['http:', 'https:'].includes(parsedUrl.protocol) || !isYoutubeHost || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    throw new Error('URL de YouTube no válida en los videos publicados.');
  }
  return {
    videoId,
    embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
    thumbnailUrl: `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`,
  };
};

export default function handler(request: IncomingMessage, response: ServerResponse) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.statusCode = 405;
    response.end(JSON.stringify({ error: 'Método no permitido.' }));
    return;
  }
  const now = Date.now();
  const items = videos
    .filter((video) =>
      video.status === 'PUBLICADO' ||
      (video.status === 'PROGRAMADO' &&
        Number.isFinite(Date.parse(video.publish)) &&
        Date.parse(video.publish) <= now),
    )
    .sort((first, second) => Date.parse(second.publish) - Date.parse(first.publish))
    .map((video) => ({
      ...video,
      fecha: video.publish,
      ...resolveHomeVideoUrl(video.url),
    }));
  response.statusCode = 200;
  response.end(JSON.stringify({ items }));
}
