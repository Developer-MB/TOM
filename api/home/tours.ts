import type { IncomingMessage, ServerResponse } from 'node:http';
import tours from '../../data/post-tours.json';
import { respondWithJsonGet } from '../../backend/vercelApi';

export default function handler(request: IncomingMessage, response: ServerResponse) {
  const now = Date.now();
  const publishedTours = tours.filter((tour) =>
    tour.status === 'PUBLICADO' ||
    (tour.status === 'PROGRAMADO' &&
      Number.isFinite(Date.parse(tour.publish)) &&
      Date.parse(tour.publish) <= now),
  );
  respondWithJsonGet(request, response, publishedTours);
}
