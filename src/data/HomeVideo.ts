export interface HomeVideo {
    id: number;
    title: string;
    description: string;
    url: string;
    fecha: string;
}

export interface ResolvedHomeVideo extends HomeVideo {
    videoId: string;
    embedUrl: string;
    thumbnailUrl: string;
}

export interface HomeVideosResponse {
    items: ResolvedHomeVideo[];
}

export const HOME_VIDEOS: HomeVideo[] = [
    {
        id: 1,
        title: "KRONIK OF METAL: #4 CDMX | 🔥IRON MAIDEN EN MÉXICO🔥",
        description: `En esta edición de Kronik of Metal, viajamos desde León, Guanajuato, hasta la Ciudad de México para vivir la experiencia de Iron Maiden y su gira Run For Your Lives Tour 2026.
        Acompáñanos en este recorrido lleno de hermandad, carretera y mucho metal, gracias a la invitación de nuestros amigos de CONECTA León.`,
        url: 'https://www.youtube.com/watch?v=Fa1dOifrxAw&t=1s',
        fecha: "2026-10-15",
    },
    {
        id: 2,
        title: "🔥ENTREVISTA CON EL EQUIPO DE TRAS DE: THE MASTER OF STRINGS🔥 | TIME OF METAL",
        description: `¿Qué pasa cuando la música de Metallica se encuentra con la fuerza de una orquesta?
        En esta entrevista platicamos con parte del equipo detrás de Master of Strings, un espectáculo que lleva los clásicos de Metallica a un formato sinfónico con The Sandmans + OSSA y más de 30 músicos en escena.
        Nos cuentan qué hay detrás de esta producción, cómo se construye la experiencia, los retos de fusionar el metal con una orquesta y, sobre todo, qué puede esperar el público de este show.`,
        url: 'https://www.youtube.com/watch?v=6ivCeeAxxuA&t=11s',
        fecha: "2026-10-01",
    },
    {
        id: 3,
        title: "KRONIK OF METAL: #3 LEON |🔥COMO SE VIVEN DOS FESTIVALES EN UNA NOCHE🔥",
        description: `La tercera entrega de Kronik of metal es de una noche muy especial pues nos dispusimos a documentar nuestra experiencia en 2 festival a la vez en León.
        Una vez más demostramos que en León el metal está más vivo que nunca. `,
        url: 'https://www.youtube.com/watch?v=Wn_-WXGsPHY&t=3s',
        fecha: "2026-08-21",
    },
    {
        id: 4,
        title: "KRONIK OF METAL: #2 LEON |🔥 MARRANEITORS EN LEÓN 🔥",
        description: `¿Quieres saber cómo se vive un toquín de Pornogore Grind? 🤘💀
        Te invitamos a ver el episodio #2 de Kronik of Metal, donde nos lanzamos a la última visita de @marraneitors a la ciudad de León, en @lacadenadelrock.
        🎥 Ruido, slam, desmadre y toda la experiencia desde adentro del toquín.
        Además, el soporte local estuvo a cargo de:
        ⚔️ Tortura
        ⚔️ @malafortuna136
        ⚔️ Rotten of the Mind
        🔥 ¡Ya disponible! Échale un vistazo y cuéntanos qué te pareció el toquín.`,
        url: 'https://www.youtube.com/watch?v=-Sy9tZ9N9hM&t=5s',
        fecha: "2026-08-15",
    },
    {
        id: 5,
        title: "🔥KRONIK OF METAL: #1 MORELIA | GIRA DE ORIGIN y UNMERCIFUL🔥",
        description: `Acompáñanos en esta nueva aventura llamada KRONIK of metal.
        Nuestra primer parada fue Morelia el pasado 24 de Julio en la cobertura de la gira de Origin y Unmerciful.
        Acompáñanos dónde te compartimos tips de viaje, costos y mucho más.`,
        url: 'https://www.youtube.com/watch?v=F6iTYdCxv90',
        fecha: "2026-08-14",
    },
];

export const HOME_VIDEO = HOME_VIDEOS;

export const resolveHomeVideoUrl = (url: string) => {
    const parsedUrl = new URL(url);
    const videoId = parsedUrl.searchParams.get('v') ??
        (parsedUrl.hostname === 'youtu.be' ? parsedUrl.pathname.slice(1) : '') ??
        '';

    if (!videoId) {
        throw new Error(`La URL del video de YouTube no es válida: ${url}`);
    }

    return {
        videoId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
        thumbnailUrl: `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`,
    };
};