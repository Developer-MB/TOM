export type CmsPostStatus = 'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR';
export type MerchCategory =
  | 'PLAYERAS'
  | 'VASOS'
  | 'TARROS'
  | 'GORRAS'
  | 'LLAVEROS'
  | 'MOUSEPADS'
  | 'OTROS';

export interface CmsPostItem {
  id: string;
  code: string;
  type: 'RECOMENDACION' | 'GALERIA' | 'VIDEO' | 'GIRAS';
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

export interface CmsMerchProduct {
  id: string;
  code: string;
  name: string;
  category: MerchCategory;
  description: string;
  price: number;
  stock: number;
  image: string;
  purchaseUrl: string;
  status: CmsPostStatus;
  publish: string;
}

export const MERCH_CATEGORIES: MerchCategory[] = [
  'PLAYERAS', 'VASOS', 'TARROS', 'GORRAS', 'LLAVEROS', 'MOUSEPADS', 'OTROS',
];
