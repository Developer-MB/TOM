import cmsPosts from '../../data/post-disc.json';

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

export type CmsPostCreateInput = Omit<CmsPostItem, 'id' | 'code' | 'cover'> & {
    coverImage: {
        mimeType: string;
        data: string;
    };
};

export const INITIAL_CMS_ITEMS = cmsPosts as CmsPostItem[];
