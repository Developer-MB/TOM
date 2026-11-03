export const resolveHomeVideoUrl = (url: string) => {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLocaleLowerCase();
    const isYoutubeHost = [
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtu.be',
        'www.youtu.be',
    ].includes(host);
    const videoId = host.endsWith('youtu.be')
        ? parsedUrl.pathname.slice(1)
        : parsedUrl.searchParams.get('v') ??
          parsedUrl.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] ??
          '';

    if (
        !['http:', 'https:'].includes(parsedUrl.protocol) ||
        !isYoutubeHost ||
        !/^[A-Za-z0-9_-]{11}$/.test(videoId)
    ) {
        throw new Error(`La URL del video de YouTube no es válida: ${url}`);
    }

    return {
        videoId,
        embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
        thumbnailUrl: `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`,
    };
};
