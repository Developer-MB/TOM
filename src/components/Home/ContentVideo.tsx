import React, { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react';
import { SectionId } from '@/src/data/mockData';
import type { HomeVideosResponse, ResolvedHomeVideo } from '../../data/HomeVideo';

interface ContentVideoProps {
    onSelectSection: (section: SectionId) => void;
}

export const ContentVideo: React.FC<ContentVideoProps> = ({ onSelectSection }) => {
    const [video, setVideo] = useState<ResolvedHomeVideo>();
    const [loadError, setLoadError] = useState<string>();

    useEffect(() => {
        const controller = new AbortController();

        const loadVideo = async () => {
            try {
                const response = await fetch('/api/home/videos', { signal: controller.signal });
                const data = await response.json() as HomeVideosResponse & { error?: string };
                if (!response.ok) {
                    throw new Error(data.error ?? 'No se pudieron cargar los videos destacados.');
                }
                const featuredVideo = data.items[0];
                if (!featuredVideo) {
                    throw new Error('No hay videos configurados en HOME_VIDEOS.');
                }
                setVideo(featuredVideo);
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error('Error al cargar los videos destacados:', error);
                setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los videos destacados.');
            }
        };

        void loadVideo();
        return () => controller.abort();
    }, []);

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
            {loadError && (
                <p role="alert" className="mb-4 border border-red-900 bg-[#121214] p-4 text-sm text-red-300">
                    {loadError}
                </p>
            )}
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
            ) : !loadError ? (
                <p className="border border-[#27272a] bg-[#121214] p-6 text-sm text-[#a1a1aa]">
                    Cargando el video destacado...
                </p>
            ) : null}
        </div>
    )
}

export default ContentVideo