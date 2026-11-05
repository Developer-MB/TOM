import { Router } from 'express';
import type {
  CmsGalleryItem,
  CmsPostItem,
  CmsPostStatus,
  CmsTourItem,
  CmsVideoItem,
} from '../../models/cms.js';
import { publicDocuments } from '../../services/scheduledPublication.js';
import { asyncRoute } from '../../utils/http.js';

const router = Router();
type PublishedGallery = CmsGalleryItem & { status: CmsPostStatus; publish: string };
const resolveYoutube = (value: string) => {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  const videoId = host === 'youtu.be' || host === 'www.youtu.be'
    ? url.pathname.slice(1)
    : url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ?? '';
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error('YouTube video ID is invalid.');
  return {
    videoId,
    embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
    thumbnailUrl: `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`,
  };
};

router.get('/posts', asyncRoute(async (_request, response) => {
  const posts = await publicDocuments<CmsPostItem>('cms_posts');
  response.setHeader('Cache-Control', 'no-store');
  response.json(posts);
}));

router.get('/galleries', asyncRoute(async (_request, response) => {
  const galleries = await publicDocuments<PublishedGallery>('cms_galleries');
  response.setHeader('Cache-Control', 'no-store');
  response.json(galleries);
}));

router.get('/tours', asyncRoute(async (_request, response) => {
  const tours = await publicDocuments<CmsTourItem>('cms_tours');
  response.setHeader('Cache-Control', 'no-store');
  response.json(tours);
}));

router.get('/videos', asyncRoute(async (_request, response) => {
  const videos = await publicDocuments<CmsVideoItem>('cms_videos');
  const items = videos.map((video) => ({
    ...video,
    fecha: video.publish,
    ...resolveYoutube(video.url),
  }));
  response.setHeader('Cache-Control', 'no-store');
  response.json({ items });
}));

router.get('/merch', asyncRoute(async (_request, response) => {
  const products = await publicDocuments<{
    id: string;
    status: CmsTourItem['status'];
    publish: string;
  } & Record<string, unknown>>('cms_merch');
  response.setHeader('Cache-Control', 'no-store');
  response.json(products);
}));

export default router;
