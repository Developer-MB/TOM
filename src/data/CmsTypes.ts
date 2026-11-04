export type CmsPostType = 'RECOMENDACION' | 'GALERIA' | 'VIDEO' | 'GIRAS';
export type CmsPostStatus = 'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR';
export const MERCH_CATEGORIES = [
    'PLAYERAS',
    'VASOS',
    'TARROS',
    'GORRAS',
    'LLAVEROS',
    'MOUSEPADS',
    'OTROS',
] as const;
export type MerchCategory = (typeof MERCH_CATEGORIES)[number];

export interface CmsMerchProduct {
    id: string;
    code: string;
    name: string;
    category: MerchCategory;
    description: string;
    price: number;
    image: string;
    purchaseUrl: string;
    status: CmsPostStatus;
    publish: string;
}

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

export interface CmsTourItem {
    id: string;
    code: string;
    month: string;
    day: string;
    year: string;
    band: string;
    tourName: string;
    venue: string;
    info: string;
    ticketsInfo: string;
    ticketsLow: boolean;
    status: CmsPostStatus;
    publish: string;
}

export type CmsPostCreateInput = Omit<CmsPostItem, 'id' | 'code' | 'cover'> & {
    coverImage: {
        mimeType: string;
        data: string;
    };
};

export interface CmsNodeStatus {
    serverName: string;
    platform: string;
    processUptimeSeconds: number;
    systemUptimeSeconds: number;
    cpuUsagePercent: number;
    cpuCores: number;
    memoryUsedMb: number;
    memoryTotalMb: number;
    memoryPercent: number;
    rssMb: number;
    activeRequests: number;
    totalRequests: number;
    bytesTransferred: number;
    throughputBps: number;
    audioTracksCount: number;
    timestamp: string;
}
