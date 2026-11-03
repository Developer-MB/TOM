import type { IncomingMessage, ServerResponse } from 'node:http';
import videos from '../../data/post-video.json';
import { respondWithJsonGet } from '../../backend/vercelApi';

export default function handler(request: IncomingMessage, response: ServerResponse) {
  respondWithJsonGet(request, response, videos);
}
