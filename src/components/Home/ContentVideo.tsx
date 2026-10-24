import React from 'react'
import { HOME_VIDEO } from '../../data/HomeVideo';

const getYouTubeEmbedUrl = (videoUrl: string) => {
    const url = new URL(videoUrl);
    const videoId = url.hostname === 'youtu.be'
    ? url.pathname.slice(1)
    : url.searchParams.get('v');
    
    if (!videoId) {
        throw new Error(`La URL de YouTube no contiene un ID de video: ${videoUrl}`);
    }

    const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
    const startTime = Number.parseInt(url.searchParams.get('t') ?? '', 10);
    if (Number.isFinite(startTime)) {
        embedUrl.searchParams.set('start', String(startTime));
    }

    return embedUrl.toString();
};

interface ContentVideoProps {
    podcastPlaying: boolean;
    setPodcastPlaying: (playing: boolean) => void;
}
const video = HOME_VIDEO[0]

export const ContentVideo: React.FC<ContentVideoProps> = () => {
    return (
        <div className="bg-[#121214] border border-[#27272a] rounded-sm p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Video Frame (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
                <div className="relative aspect-video bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden group">
                    <iframe
                        className="absolute inset-0 h-full w-full"
                        src={getYouTubeEmbedUrl(video.url)}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        loading="lazy"
                        allowFullScreen
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[10px]">
                        <span className="px-2 py-0.5 bg-[#09090b]/80 border border-[#3f3f46] text-[#e4e4e7] rounded-sm">
                            4K FULL HD
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Info (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
                <div className="font-mono text-[10px] text-[#ef4444] uppercase tracking-widest flex items-center gap-2">
                    <span>▶ VIDEOPODCAST OFICIAL</span>
                </div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase leading-tight">
                    {video.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                    {video.description}
                </p>
            </div>
        </div>
    )
}

export default ContentVideo