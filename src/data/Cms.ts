import cmsPosts from '../../data/post-disc.json';
import cmsGalleries from '../../data/post-pics.json';
import type { CmsGalleryItem, CmsPostItem } from './CmsTypes';

export type {
    CmsGalleryItem,
    CmsPostCreateInput,
    CmsPostItem,
    CmsPostStatus,
    CmsPostType,
    CmsVideoItem,
} from './CmsTypes';

export const INITIAL_CMS_ITEMS = cmsPosts as CmsPostItem[];
export const INITIAL_CMS_GALLERIES = cmsGalleries as CmsGalleryItem[];
