import type { IncomingMessage, ServerResponse } from 'node:http';
import tours from '../../data/post-tours.json';
import { respondWithJsonGet } from '../../backend/vercelApi';

export default function handler(request: IncomingMessage, response: ServerResponse) {
  respondWithJsonGet(request, response, tours);
}
