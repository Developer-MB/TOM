import type { IncomingMessage, ServerResponse } from 'node:http';
import videos from '../../data/post-video.json';
import { resolveHomeVideoUrl } from '../../src/data/YouTubeUrl';
import { respondWithJsonGet } from '../../backend/vercelApi';

export default function handler(request: IncomingMessage, response: ServerResponse) {
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
  respondWithJsonGet(request, response, { items });
}
