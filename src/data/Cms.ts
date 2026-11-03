import cmsPosts from '../../data/post-disc.json';
import cmsGalleries from '../../data/post-pics.json';

export type CmsPostType = 'RECOMENDACION' | 'GALERIA' | 'VIDEO' | 'GIRAS';
export type CmsPostStatus = 'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR';

export interface CmsPostItem {
    id: string;
    code: string;
    type: CmsPostType;
    band: string;
    disc: string;
    genre: string;
    genreKey: string;
    label: string;
    country: string;
    flag: string;
    year: string;
    duration: string;
    cover: string;
    excerpt: string;
    publish: string;
    status: CmsPostStatus;
    author: string;
}

export interface CmsGalleryItem {
    id: string;
    code?: string;
    status?: CmsPostStatus;
    publish?: string;
    concert: string;
    date: string;
    venue: string;
    city: string;
    title: string;
    desc: string;
    credit: string;
    img: { id: number; pic: string }[];
}

export type CmsPostCreateInput = Omit<CmsPostItem, 'id' | 'code' | 'cover'> & {
    coverImage: {
        mimeType: string;
        data: string;
    };
};

export const INITIAL_CMS_ITEMS = cmsPosts as CmsPostItem[];
export const INITIAL_CMS_GALLERIES = cmsGalleries as CmsGalleryItem[];
