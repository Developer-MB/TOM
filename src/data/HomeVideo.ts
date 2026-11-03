import initialVideos from '../../data/post-video.json';
import type { CmsVideoItem } from './CmsTypes';
import { resolveHomeVideoUrl } from './YouTubeUrl';
export { resolveHomeVideoUrl } from './YouTubeUrl';

export interface HomeVideo {
    id: string;
    code: string;
    title: string;
    description: string;
    url: string;
    fecha: string;
    publish: string;
}

export interface ResolvedHomeVideo extends HomeVideo {
    videoId: string;
    embedUrl: string;
    thumbnailUrl: string;
}

export interface HomeVideosResponse {
    items: ResolvedHomeVideo[];
}

export const INITIAL_CMS_VIDEOS = initialVideos as CmsVideoItem[];
export const HOME_VIDEOS: HomeVideo[] = INITIAL_CMS_VIDEOS
    .filter((video) => video.status === 'PUBLICADO')
    .map((video) => ({
        ...video,
        fecha: video.publish,
    }));

export const INITIAL_RESOLVED_HOME_VIDEOS: ResolvedHomeVideo[] = HOME_VIDEOS.map((video) => ({
    ...video,
    ...resolveHomeVideoUrl(video.url),
})).sort((first, second) =>
    new Date(second.fecha).getTime() - new Date(first.fecha).getTime()
);

export const HOME_VIDEO = HOME_VIDEOS;