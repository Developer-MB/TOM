import postPics from '../../data/post-pics.json';
import type { CmsGalleryItem } from './Cms';
import { ASSETS } from './Assets';

export interface HomeGalleryItem extends CmsGalleryItem {
    category: string;
    photographer: string;
    photosCount: string;
    image?: string;
}

const bundledAssetPaths: Record<string, string> = {
    '/src/assets/images/metal_studio_podcast_1791593120127.jpg': ASSETS.studioPodcast,
    '/src/assets/images/metal_concert_pyro_1791593129897.jpg': ASSETS.concertPyro,
    '/src/assets/images/album_catacombs_cover_1791593139425.jpg': ASSETS.albumCatacombs,
    '/src/assets/images/album_black_metal_cover_1791593147308.jpg': ASSETS.albumBlackMetal,
    '/src/assets/images/dj_ravn_portrait_1791593164383.jpg': ASSETS.djRavn,
};

const resolveImagePath = (imagePath: string) => bundledAssetPaths[imagePath] ?? imagePath;

const galleryRecords = postPics as (CmsGalleryItem & {
    category?: string;
    photographer?: string;
    photosCount?: string;
    image?: string;
})[];

export const toHomeGalleryItems = (
    galleries: CmsGalleryItem[],
    now = Date.now(),
): HomeGalleryItem[] => galleries.map((gallery) => {
    const extendedGallery = gallery as CmsGalleryItem & {
        category?: string;
        photographer?: string;
        photosCount?: string;
        image?: string;
    };
    const img = gallery.img.map((photo) => ({
        ...photo,
        pic: resolveImagePath(photo.pic),
    }));
    const image = extendedGallery.image
        ? resolveImagePath(extendedGallery.image)
        : img[0]?.pic;
    const status = gallery.status ?? 'PUBLICADO';
    return {
        ...gallery,
        concert: gallery.concert || gallery.title,
        credit: gallery.credit || extendedGallery.photographer || '',
        photographer: extendedGallery.photographer || gallery.credit || '',
        category: extendedGallery.category || gallery.city,
        photosCount: extendedGallery.photosCount || `${img.length} FOTOS`,
        img,
        ...(image ? { image } : {}),
    };
}).filter((gallery) =>
    (gallery.status ?? 'PUBLICADO') === 'PUBLICADO' ||
    (gallery.status === 'PROGRAMADO' &&
        Number.isFinite(Date.parse(gallery.publish ?? '')) &&
        Date.parse(gallery.publish ?? '') <= now),
);

export const HOME_PICS = toHomeGalleryItems(galleryRecords);

export const getGalleryFilters = (galleries: HomeGalleryItem[]) => [
    { id: 'TODOS LOS EVENTOS', count: '' },
    ...[...new Set(galleries.map((gallery) => gallery.category))]
        .filter((category) => category && category !== 'TODOS LOS EVENTOS')
        .map((category) => ({ id: category, count: '' })),
];

export const GALLERY_FILTERS = getGalleryFilters(HOME_PICS);
