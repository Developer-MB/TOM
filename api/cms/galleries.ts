import type { IncomingMessage, ServerResponse } from 'node:http';
import galleries from '../../data/post-pics.json';
import { respondWithJsonGet } from '../../backend/vercelApi';

export default function handler(request: IncomingMessage, response: ServerResponse) {
  respondWithJsonGet(request, response, galleries);
}
