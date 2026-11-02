export type CmsPostType = 'RESEÑA' | 'CRÓNICA' | 'PODCAST' | 'NOTICIA';
export type CmsPostStatus = 'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR';

export interface CmsPostItem {
    id: string;
    code: string;
    title: string;
    type: CmsPostType;
    category: string;
    author: string;
    date: string;
    score?: string;
    excerpt?: string;
    status: CmsPostStatus;
}

export const INITIAL_CMS_ITEMS: CmsPostItem[] = [
    {
        id: 'cms-1',
        code: 'TOM-894',
        title: 'Blood Incantation — Absolute Elsewhere: La Trascendencia Cósmica',
        type: 'RESEÑA',
        category: 'DEATH METAL PROGRESIVO',
        author: 'K. Lindgren',
        date: 'HOY, 14:20',
        score: '9.8 / 10',
        status: 'PUBLICADO',
    },
    {
        id: 'cms-2',
        code: 'TOM-893',
        title: 'Ep. #48: Arquitectura de la Disonancia (Feat. Luc Lemay & Erik Rutan)',
        type: 'PODCAST',
        category: '4K STUDIO MASTER',
        author: 'Alex Steiner',
        date: 'HOY, 11:05',
        status: 'PUBLICADO',
    },
    {
        id: 'cms-3',
        code: 'TOM-892',
        title: 'Watain en Estocolmo: Ceremonia de Sangre y Fuego Sagrado (40 Fotos RAW)',
        type: 'CRÓNICA',
        category: 'FOTOPERIODISMO PIT',
        author: 'Elena S.',
        date: 'MAÑANA, 09:00',
        status: 'PROGRAMADO',
    },
    {
        id: 'cms-4',
        code: 'TOM-891',
        title: 'Ulcerate — Cutting the Throat of God: El Laberinto del Caos',
        type: 'RESEÑA',
        category: 'DISSONANT DEATH METAL',
        author: 'M. Varg',
        date: 'BORRADOR',
        score: '9.6 / 10',
        status: 'BORRADOR',
    },
    {
        id: 'cms-5',
        code: 'TOM-890',
        title: 'Brutal Assault 2025: Confirmados Bloodbath, Gorgoroth y 22 bandas más',
        type: 'NOTICIA',
        category: 'FESTIVALES EUROPEOS',
        author: 'M. Varg',
        date: 'AYER, 19:45',
        status: 'PUBLICADO',
    },
];