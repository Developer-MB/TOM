import React, { useMemo } from 'react'
import { ArrowRight } from 'lucide-react';
import { SectionId } from '@/src/data/mockData';
import { HOME_VIDEOS, resolveHomeVideoUrl } from '../../data/HomeVideo';
import type { ResolvedHomeVideo } from '../../data/HomeVideo';

interface ContentVideoProps {
    onSelectSection: (section: SectionId) => void;
}

export const ContentVideo: React.FC<ContentVideoProps> = ({ onSelectSection }) => {
    const video = useMemo<ResolvedHomeVideo | undefined>(() => HOME_VIDEOS
        .map((item) => ({
            ...item,
            ...resolveHomeVideoUrl(item.url),
        }))
        .sort((first, second) =>
            new Date(second.fecha).getTime() - new Date(first.fecha).getTime()
        )[0], []);

    return (
        <div>
            <div className="flex justify-end mb-3">
                <button
                    type="button"
                    onClick={() => onSelectSection('videopodcast')}
                    className="font-mono text-xs text-[#a1a1aa] hover:text-white flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                    <span>VER TODOS LOS PODCAST</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
            {video ? (
                <div className="bg-[#121214] border border-[#27272a] rounded-sm p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-7 space-y-3">
                        <div className="relative aspect-video bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden group">
                            <iframe
                                className="absolute inset-0 h-full w-full"
                                src={video.embedUrl}
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
            ) : (
                <p className="border border-[#27272a] bg-[#121214] p-6 text-sm text-[#a1a1aa]">
                    No hay videos destacados configurados.
                </p>
            )}
        </div>
    )
}

export default ContentVideo