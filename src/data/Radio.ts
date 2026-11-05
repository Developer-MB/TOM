export interface CmsRadioTrack {
    id: string;
    code?: string;
    src: string;
    band: string;
    title: string;
    disc: string;
    cover: string;
    status?: 'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR';
    publish?: string;
}

export const AUDIO_ASSETS: CmsRadioTrack[] = [
    {
        id: '1',
        code: 'TOM-RAD-0001',
        src: '/audio/01 - blinded by fear.mp3',
        band: 'At The Gates',
        title: 'Blinded by Fear',
        disc: 'Slaughter of the Soul',
        cover: '/image/covers/298.jpeg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '2',
        code: 'TOM-RAD-0002',
        src: '/audio/01 - Black Sabbath.mp3',
        band: 'Black Sabbath',
        title: 'Black Sabbath',
        disc: 'Black Sabbath',
        cover: '/image/covers/482.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '3',
        code: 'TOM-RAD-0003',
        src: '/audio/02 - Frühling.mp3',
        band: 'Nargaroth',
        title: 'Frühling',
        disc: 'Jahreszeiten',
        cover: '/image/covers/234612.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '4',
        code: 'TOM-RAD-0004',
        src: '/audio/01 - Sweet Leaf.mp3',
        band: 'Black Sabbath',
        title: 'Sweet Leaf',
        disc: 'Master of Reality',
        cover: '/image/covers/487.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '5',
        code: 'TOM-RAD-0005',
        src: '/audio/01 - Now Diabolical.mp3',
        band: 'Satyricon',
        title: 'Now, Diabolical',
        disc: 'Now, Diabolical',
        cover: '/image/covers/108134.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '6',
        code: 'TOM-RAD-0006',
        src: '/audio/02 - After Forever.mp3',
        band: 'Black Sabbath',
        title: 'After Forever',
        disc: 'Master of Reality',
        cover: '/image/covers/487.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '7',
        code: 'TOM-RAD-0007',
        src: "/audio/02 - Genies, Sorcerers and Mesopotamian Nights.mp3",
        band: 'Melechesh',
        title: "Genies, Sorcerers and Mesopotamian Nights",
        disc: 'Djinn',
        cover: '/image/covers/1948.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '8',
        code: 'TOM-RAD-0008',
        src: "/audio/01 - Luke's Wall - War Pigs.mp3",
        band: 'Black Sabbath',
        title: "Luke's Wall - War Pigs",
        disc: 'Paranoid',
        cover: '/image/covers/485.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '9',
        code: 'TOM-RAD-0009',
        src: '/audio/02 - slaughter of the soul.mp3',
        band: 'At The Gates',
        title: 'Slaughter of the Soul',
        disc: 'Slaughter of the Soul',
        cover: '/image/covers/298.jpeg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '10',
        code: 'TOM-RAD-0010',
        src: '/audio/02 - Paranoid.mp3',
        band: 'Black Sabbath',
        title: 'Paranoid',
        disc: 'Paranoid',
        cover: '/image/covers/485.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '11',
        code: 'TOM-RAD-0011',
        src: '/audio/03 - Nemesis.mp3',
        band: 'Arch Enemy',
        title: 'Nemesis',
        disc: 'Doomsday Machine',
        cover: '/image/covers/85305.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '12',
        code: 'TOM-RAD-0012',
        src: '/audio/03 - Planet Caravan.mp3',
        band: 'Black Sabbath',
        title: 'Planet Caravan',
        disc: 'Paranoid',
        cover: '/image/covers/485.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '13',
        code: 'TOM-RAD-0013',
        src: "/audio/04 - ravenous.mp3",
        band: 'Arch Enemy',
        title: "Ravenous",
        disc: 'Wages of Sin',
        cover: '/image/covers/450396.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '14',
        code: 'TOM-RAD-0014',
        src: '/audio/04 - Iron Man.mp3',
        band: 'Black Sabbath',
        title: 'Iron Man',
        disc: 'Paranoid',
        cover: '/image/covers/485.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '15',
        code: 'TOM-RAD-0015',
        src: '/audio/04 - The Pursuit Of Vikings.mp3',
        band: 'Amon Amarth',
        title: 'The Pursuit Of Vikings',
        disc: 'Fate of Norns',
        cover: '/image/covers/49215.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '16',
        code: 'TOM-RAD-0016',
        src: "/audio/04 - Children Of The Grave.mp3",
        band: 'Black Sabbath',
        title: "Children Of The Grave",
        disc: 'Master of Reality',
        cover: '/image/covers/487.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '17',
        code: 'TOM-RAD-0017',
        src: '/audio/06 - Nymphetamine (overdose).mp3',
        band: 'Cradle of Filth',
        title: 'Nymphetamine (Overdose)',
        disc: 'Nymphetamine',
        cover: '/image/covers/52863.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '18',
        code: 'TOM-RAD-0018',
        src: '/audio/04 - N.I.B..mp3',
        band: 'Black Sabbath',
        title: 'N.I.B.',
        disc: 'Black Sabbath',
        cover: '/image/covers/482.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '19',
        code: 'TOM-RAD-0019',
        src: "/audio/06 - Puritania.mp3",
        band: 'Dimmu Borgir',
        title: "Puritania",
        disc: 'Puritanical Euphoric Misanthropia',
        cover: '/image/covers/479639.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '20',
        code: 'TOM-RAD-0020',
        src: '/audio/14 - Nymphetamine (fix).mp3',
        band: 'Cradle of Filth',
        title: 'Nymphetamine (Fix)',
        disc: 'Nymphetamine',
        cover: '/image/covers/52863.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
    {
        id: '21',
        code: 'TOM-RAD-0021',
        src: '/audio/07 - The Insight and the Catharsis.mp3',
        band: 'Dimmu Borgir',
        title: 'The Insight and the Catharsis',
        disc: 'Spiritual Black Dimensions',
        cover: '/image/covers/342.jpg',
        status: 'PUBLICADO',
        publish: '04 NOV 2026',
    },
];

const RADIO_STORAGE_KEY = 'tom_radio_playlist_v1';
export const RADIO_UPDATED_EVENT = 'tom:radio-playlist-updated';

export const readStoredRadioTracks = (): CmsRadioTrack[] => {
    if (typeof window === 'undefined') return AUDIO_ASSETS;
    try {
        const raw = window.localStorage.getItem(RADIO_STORAGE_KEY);
        if (!raw) return AUDIO_ASSETS;
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed) || parsed.length === 0) return AUDIO_ASSETS;
        return parsed.map((item, idx) => ({
            id: String(item.id ?? idx + 1),
            code: item.code ?? `TOM-RAD-${String(idx + 1).padStart(4, '0')}`,
            src: String(item.src ?? '/audio/01 - blinded by fear.mp3'),
            band: String(item.band ?? 'Artista'),
            title: String(item.title ?? 'Tema'),
            disc: String(item.disc ?? 'Álbum'),
            cover: String(item.cover ?? '/image/covers/298.jpeg'),
            status: item.status ?? 'PUBLICADO',
            publish: item.publish ?? '04 NOV 2026',
        }));
    } catch {
        return AUDIO_ASSETS;
    }
};

export const writeStoredRadioTracks = (tracks: CmsRadioTrack[]): void => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(RADIO_STORAGE_KEY, JSON.stringify(tracks));
        window.dispatchEvent(new CustomEvent(RADIO_UPDATED_EVENT));
    } catch (error) {
        console.error('No se pudo guardar la programación de radio:', error);
    }
};
