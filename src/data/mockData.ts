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

export const BREAKING_NEWS = [
  {
    id: 'news-1',
    tag: 'FESTIVALES',
    title: 'Brutal Assault confirma a Bloodbath, Gorgoroth y 22 bandas más',
    excerpt: 'La fortaleza de Josefov sumará 24 actos de pura brutalidad sonora y escenarios subterráneos dedicados al sonido analógico.',
    author: 'M. Varg',
    image: ASSETS.concertPyro,
  },
  {
    id: 'news-2',
    tag: 'ENTREVISTA',
    title: 'Nergal habla sin tapujos sobre el próximo ritual de Behemoth',
    excerpt: '"El metal contemporáneo ha perdido el peligro; nuestro objetivo es recuperar la hostilidad visceral de las catacumbas."',
    author: 'Alex Steiner',
    image: ASSETS.djRavn,
  },
  {
    id: 'news-3',
    tag: 'NUEVO SENCILLO',
    title: 'Cannibal Corpse estrena "Vortex of Evisceration" en cinta',
    excerpt: 'Un asalto percusivo a 260 BPM que redefine los estándares de la escuela de Florida sin triggers digitales.',
    author: 'K. Lindgren',
    image: ASSETS.studioPodcast,
  },
  {
    id: 'news-4',
    tag: 'GIRA MUNDIAL',
    title: 'Kreator y Testament anuncian tour conjunto por Latinoamérica',
    excerpt: 'Dieciocho fechas imperdibles donde ambas leyendas interpretarán discos íntegros de su época clásica de los 80.',
    author: 'Redacción',
    image: ASSETS.concertPyro,
  },
];

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

export const PHOTO_GALLERIES = [
  {
    id: 'gal-1',
    date: '02 NOV 2024',
    venue: 'CIRCO VOLADOR, CDMX',
    photosCount: '32 FOTOS HD',
    title: 'ROTTING CHRIST + BORKNAGAR: MISTICISMO EN CDMX',
    desc: 'Una sesión hipnótica de misticismo helénico y metal pagano nórdico. Sakis Tolis lideró un aquelarre sonoro con un despliegue lumínico escarlata que transformó el recinto.',
    photographer: 'JAVIER R.',
    category: 'CLUBES & UNDERGROUND',
    image: ASSETS.concertPyro,
  },
  {
    id: 'gal-2',
    date: '14 OCT 2024',
    venue: 'BRUTAL ASSAULT, REP. CHECA',
    photosCount: '48 FOTOS HD',
    title: 'GORGOROTH EN LLAMAS EN EL ESCENARIO PRINCIPAL',
    desc: 'Invocación cruda entre los muros de la fortaleza de Josefov. Los noruegos desplegaron una descarga inflexible de furia analógica, rodeados por antorchas y niebla.',
    photographer: 'M. LINDQVIST',
    category: 'FESTIVALES',
    image: ASSETS.concertPyro,
  },
  {
    id: 'gal-3',
    date: '18 ENE 2025',
    venue: 'BLACK TRIDENT, ESTOCOLMO',
    photosCount: '40 FOTOS HD',
    title: 'WATAIN: CEREMONIA DE SANGRE Y FUEGO SAGRADO',
    desc: 'Una misa siniestra en su propia tierra natal. Olor a azufre, sudor en primera fila y una atmósfera asfixiante capturada al filo de los tridentes llameantes en el foso más peligroso.',
    photographer: 'ELENA S.',
    category: 'EXCLUSIVAS PIT',
    image: ASSETS.albumBlackMetal,
  },
  {
    id: 'gal-4',
    date: '05 FEB 2025',
    venue: 'MARYLAND DEATHFEST, EE.UU.',
    photosCount: '28 FOTOS HD',
    title: 'AUTOPSY & NECROPHAGIA: CARNICERÍA EN BALTIMORE',
    desc: 'Carnicería pura en los escenarios de Baltimore. Chris Reifert desató su gutural demencial tras los tambores mientras el foso se abría en un torbellino de cuero y cadenas.',
    photographer: 'TRAVIS K.',
    category: 'FESTIVALES',
    image: ASSETS.studioPodcast,
  },
  {
    id: 'gal-5',
    date: '28 ENE 2025',
    venue: 'ARENA CDMX, MÉXICO',
    photosCount: '52 FOTOS HD',
    title: 'CANNIBAL CORPSE: CICLÓN DE DEATH METAL TÉCNICO',
    desc: 'El legendario cabeceo circular de Corpsegrinder capturado a 1/1000s. Una demostración demoledora de death metal técnico y contundente ante 12,000 fanáticos.',
    photographer: 'JAVIER R.',
    category: 'GIRAS MUNDIALES',
    image: ASSETS.concertPyro,
  },
  {
    id: 'gal-6',
    date: '12 DIC 2024',
    venue: 'ROADBURN, PAÍSES BAJOS',
    photosCount: '36 FOTOS HD',
    title: 'CANDLEMASS: CATEDRALES DEL EPIC DOOM METAL',
    desc: 'Melancolía pesada y tempos fúnebres. Luces cavernosas dibujaron siluetas monumentales mientras Johan Längqvist impartía lecciones de agonía vocal que estremecieron Tilburg.',
    photographer: 'ARJEN V.',
    category: 'FESTIVALES',
    image: ASSETS.albumCatacombs,
  },
];

export const RADIO_HISTORY = [
  { time: '15:42', title: 'Obscura', band: 'Gorguts', album: 'Obscura (1998, Olympic Recordings)', cover: ASSETS.albumCatacombs },
  { time: '15:37', title: 'Where Dead Angels Lie', band: 'Dissection', album: 'Storm of the Light\'s Bane (1995, Nuclear Blast)', cover: ASSETS.albumBlackMetal },
  { time: '15:31', title: 'Chapel of Ghouls', band: 'Morbid Angel', album: 'Altars of Madness (1989, Earache)', cover: ASSETS.albumCatacombs },
  { time: '15:25', title: 'The Sun No Longer Rises', band: 'Immortal', album: 'Pure Holocaust (1993, Osmose Productions)', cover: ASSETS.albumBlackMetal },
  { time: '15:19', title: 'The Echo (Replacement)', band: 'Demilich', album: 'Nespithe (1993, Necropolis Records)', cover: ASSETS.studioPodcast },
  { time: '15:12', title: 'Left Hand Path', band: 'Entombed', album: 'Left Hand Path (1990, Earache)', cover: ASSETS.albumCatacombs },
];

export const RADIO_SCHEDULE = [
  {
    id: 'sch-1',
    time: '10:00 - 13:00 CET',
    status: 'EMITIDO',
    isLive: false,
    title: 'ALBA DE AZUFRE',
    desc: 'Doom metal cavernoso, sludge pantanoso y stoner denso para despertar el abismo matutino.',
    host: 'Con DJ Mortis',
    action: 'Oír Repetición',
  },
  {
    id: 'sch-2',
    time: '13:00 - 16:00 CET',
    status: 'EMITIDO',
    isLive: false,
    title: 'TRINCHERAS DEL THRASH',
    desc: 'Ataque frontal teutónico y riffs cortantes del Bay Area. Velocidad desenfrenada y agresividad pura.',
    host: 'Con Alex Steiner',
    action: 'Oír Repetición',
  },
  {
    id: 'sch-3',
    time: '16:00 - 19:00 CET',
    status: 'TRANSMITIENDO',
    badgeTop: 'EN EL AIRE AHORA',
    isLive: true,
    title: 'LA HORA DE LAS BESTIAS',
    desc: 'Programa estelar: Especial Black & Death Metal Nórdico con charla exclusiva y discos legendarios en vinilo.',
    host: 'Con DJ Ravn',
    action: 'SINTONIZANDO',
  },
  {
    id: 'sch-4',
    time: '19:00 - 22:00 CET',
    status: 'A CONTINUACIÓN',
    isLive: false,
    title: 'RITOS MONOGRÁFICOS',
    desc: 'Inmersión histórica de 3 horas analizando la edad dorada del Swedish Death Metal (1989-1993) y Sunlight Studios.',
    host: 'Mesa Redonda Redacción',
    action: 'Avisarme',
  },
  {
    id: 'sch-5',
    time: '22:00 - 02:00 CET',
    status: 'NOCTURNO',
    isLive: false,
    title: 'VIGILIA FUNERAL',
    desc: 'Funeral doom hipnótico, paisajes sonoros dark ambient y drone reverberante para la oscuridad absoluta.',
    host: 'Con Elena S.',
    action: 'Avisarme',
  },
  {
    id: 'sch-6',
    time: '02:00 - 08:00 CET',
    status: 'MADRUGADA',
    isLive: false,
    title: 'ROTACIÓN CONTINUA UNDERGROUND',
    desc: 'Flujo ininterrumpido sin locución. Demos oscuros en casete, splits de 7 pulgadas y lanzamientos independientes.',
    host: 'Autoplayer 24/7 Analógico',
    action: 'Sin pausas',
  },
];

export const RADIO_DJS = [
  {
    name: 'DJ RAVN',
    specialty: 'BLACK & DEATH METAL NÓRDICO',
    bio: 'Coleccionista de primeras prensas de Mayhem, Bathory y Darkthrone. Transmitiendo desde Estocolmo.',
    image: ASSETS.djRavn,
  },
  {
    name: 'ALEX STEINER',
    specialty: 'THRASH, SPEED & HEAVY TRADICIONAL',
    bio: 'Veterano de festivales en Alemania y fanzinero de los 90. Fanático absoluto de Sodom y Kreator.',
    image: ASSETS.studioPodcast,
  },
  {
    name: 'ELENA S.',
    specialty: 'FUNERAL DOOM, DRONE & AMBIENT',
    bio: 'Diseñadora sonora y especialista en ritmos lentos, afinaciones ultra graves y monolitos funerarios.',
    image: ASSETS.concertPyro,
  },
  {
    name: 'DJ MORTIS',
    specialty: 'SLUDGE, GRINDCORE & POWERVIOLENCE',
    bio: 'Músico activo en bandas underground. Rastreador de cintas de demo perdidas y grabaciones de sótano.',
    image: ASSETS.djRavn,
  },
];
