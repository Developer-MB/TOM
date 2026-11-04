import cmsPosts from '../../data/post-disc.json';
import cmsGalleries from '../../data/post-pics.json';
import type { CmsGalleryItem, CmsPostItem } from './CmsTypes';
import { INITIAL_CMS_MERCH } from './Merch';

export type {
    CmsGalleryItem,
    CmsMerchProduct,
    CmsNodeStatus,
    CmsPostCreateInput,
    CmsPostItem,
    CmsPostStatus,
    CmsPostType,
    CmsTourItem,
    CmsVideoItem,
    MerchCategory,
} from './CmsTypes';
export { MERCH_CATEGORIES } from './CmsTypes';

export const INITIAL_CMS_ITEMS = cmsPosts as CmsPostItem[];
export const INITIAL_CMS_GALLERIES = cmsGalleries as CmsGalleryItem[];
export { INITIAL_CMS_MERCH };
