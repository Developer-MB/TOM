import type { IncomingMessage, ServerResponse } from 'node:http';
import posts from '../../data/post-disc.json';
import { respondWithJsonGet } from '../../backend/vercelApi';

export default function handler(request: IncomingMessage, response: ServerResponse) {
  respondWithJsonGet(request, response, posts);
}
