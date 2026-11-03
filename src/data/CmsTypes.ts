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

export interface CmsVideoItem {
    id: string;
    code: string;
    title: string;
    description: string;
    url: string;
    status: CmsPostStatus;
    publish: string;
}

export type CmsPostCreateInput = Omit<CmsPostItem, 'id' | 'code' | 'cover'> & {
    coverImage: {
        mimeType: string;
        data: string;
    };
};
