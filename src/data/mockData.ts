import { ASSETS } from "./Assets";
export { ASSETS } from "./Assets";

export type SectionId = 'inicio' | 'resenas' | 'galeria' | 'videopodcast' | 'radio' | 'cms';
export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  src?: string;
  duration: string;
  currentTime: string;
  isLive?: boolean;
  bitrate: string;
  cover: string;
}

export const DEFAULT_RADIO_STREAM: AudioTrack = {
  id: 'live-stream-1',
  title: 'Transilvanian Hunger',
  artist: 'Darkthrone',
  album: 'Time of Metal Radio Extreme 24/7',
  duration: '05:12',
  currentTime: '03:24',
  isLive: true,
  bitrate: 'FLAC HQ',
  cover: ASSETS.albumBlackMetal,
};

export const PODCAST_EPISODES = [
  {
    id: 'ep-47',
    epNumber: 'EP. #47',
    duration: '1H 45M',
    date: '14 NOV 2024',
    badge: 'OSLO SPECIAL',
    title: 'LA HEREJÍA DE MAYHEM Y EL SONIDO CRUDO DE EURONYMOUS',
    feat: 'FEAT. NECROBUTCHER (MAYHEM)',
    desc: 'Detalles inéditos sobre las sesiones de grabación en Grieghallen con Pytten, el aislamiento acústico arcaico de guitarra y cintas originales.',
    tags: ['BLACK METAL 90S', 'GRIEGHALLEN', 'GUITARRAS'],
    category: 'ENTREVISTAS LEGENDARIAS',
    image: ASSETS.studioPodcast,
  },
  {
    id: 'ep-46',
    epNumber: 'EP. #46',
    duration: '1H 22M',
    date: '07 NOV 2024',
    badge: 'MASTERCLASS',
    title: 'BLAST BEATS EXTREMOS: RESISTENCIA FÍSICA Y TÉCNICA SIN TRIGGERS',
    feat: 'FEAT. FLO MOUNIER (CRYPTOPSY)',
    desc: 'Demostración frente a micrófonos analógicos de bombo natural a 260 BPM. La resistencia biológica, control de rebote y microfonía.',
    tags: ['BATERÍA ACÚSTICA', 'NO TRIGGERS', 'TECH DEATH'],
    category: 'PRODUCCIÓN & ESTUDIOS',
    image: ASSETS.concertPyro,
  },
  {
    id: 'ep-45',
    epNumber: 'EP. #45',
    duration: '1H 35M',
    date: '30 OCT 2024',
    badge: 'INDUSTRIA CRUDO',
    title: 'EL AUGE DEL VINILO UNDERGROUND Y LA MUERTE DEL STREAMING',
    feat: 'FEAT. MATT BRUSSA (DARK DESCENT RECORDS)',
    desc: '¿Cómo sobrevive un sello de death y doom extremo en la era de los algoritmos? Costos reales de prensado en 180 gramos y distribución.',
    tags: ['UNDERGROUND', 'PRENSADO VINILO', 'SELLOS DIY'],
    category: 'DEBATES & HISTORIA',
    image: ASSETS.djRavn,
  },
  {
    id: 'ep-44',
    epNumber: 'EP. #44',
    duration: '1H 51M',
    date: '22 OCT 2024',
    badge: 'TEORÍA & CAOS',
    title: 'DISECCIÓN DE RIFFS: MODOS FRIGIOS Y DISONANCIAS EXTREMAS',
    feat: 'FEAT. COLIN MARSTON (KRALLICE / GORGUTS)',
    desc: 'Sesión con guitarra barítono en mano en su estudio The Thousand Caves. Análisis armónico de tritonos, acordes extendidos y tensión.',
    tags: ['TEORÍA MUSICAL', 'DISONANCIAS', 'GUITARRAS'],
    category: 'PRODUCCIÓN & ESTUDIOS',
    image: ASSETS.studioPodcast,
  },
  {
    id: 'ep-43',
    epNumber: 'EP. #43',
    duration: '1H 18M',
    date: '15 OCT 2024',
    badge: 'CRÓNICAS DE GIRA',
    title: 'GIRAS INFERNALES EN FURGONETA: 30 DÍAS EN EUROPA DEL ESTE',
    feat: 'FEAT. KEIJO NIINIMAA (ROTTEN SOUND)',
    desc: 'Sobrevivir tocando grindcore extremo noche tras noche en sótanos húmedos. Incidentes fronterizos, amplificadores quemados y hermandad.',
    tags: ['GRINDCORE', 'TOUR DIY', 'FINLANDIA'],
    category: 'EN VIVO DESDE FESTIVALES',
    image: ASSETS.concertPyro,
  },
  {
    id: 'ep-42',
    epNumber: 'EP. #42',
    duration: '1H 42M',
    date: '02 OCT 2024',
    badge: 'LEYENDAS VIVAS',
    title: 'EL RENACIMIENTO DEL OSDM (OLD SCHOOL DEATH METAL)',
    feat: 'FEAT. CHRIS REIFERT (AUTOPSY / DEATH)',
    desc: 'Desde las sesiones de "Scream Bloody Gore" con Chuck Schuldiner hasta el sonido podrido de "Severed Survival" en cinta analógica.',
    tags: ['OLD SCHOOL', 'AUTOPSY', 'HISTORIA 1987'],
    category: 'ENTREVISTAS LEGENDARIAS',
    image: ASSETS.studioPodcast,
  },
];


