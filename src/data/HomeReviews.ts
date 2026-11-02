import albumBlackMetal from '@/src/assets/images/album_black_metal_cover_1791593147308.jpg';
import albumCatacombs from '@/src/assets/images/album_catacombs_cover_1791593139425.jpg';
import concertPyro from '@/src/assets/images/metal_concert_pyro_1791593129897.jpg';
import studioPodcast from '@/src/assets/images/metal_studio_podcast_1791593120127.jpg';

export const genres = [
  'TODOS', 'AVANTGARDE', 'BLACK', 'CROSSOVER', 'DEATH', 'DJENT',
  'DOOM', 'EBM', 'FOLK', 'GLAM', 'GOTHIC', 'GRINDCORE',
  'GROOVE', 'HEAVY', 'INDUSTRIAL', 'METALCORE', 'POWER',
  'PROGRESSIVE', 'SLUDGE', 'SPEED', 'STONER', 'THRASH',
  'VIKING'
];

const bundledCovers: Record<string, string> = {
  'album_black_metal_cover_1791593147308.jpg': albumBlackMetal,
  'album_catacombs_cover_1791593139425.jpg': albumCatacombs,
  'metal_concert_pyro_1791593129897.jpg': concertPyro,
  'metal_studio_podcast_1791593120127.jpg': studioPodcast,
};

export const resolveReviewCover = (cover: string): string => {
  const filename = cover.split('/').pop();
  return filename ? bundledCovers[filename] ?? cover : cover;
};
