import React from 'react';
import type { CmsPostItem } from '@/src/data/Cms';
import { resolveReviewCover } from '@/src/data/HomeReviews';

interface ContentReseniaProps {
    reviews: CmsPostItem[];
    isLoading: boolean;
    error: string | null;
}

export const ContentResenia: React.FC<ContentReseniaProps> = ({ reviews, isLoading, error }) => {
    return (
        <div className="w-full space-y-6">
            {error ? (
                <p role="alert" className="border border-red-900 bg-red-950/40 p-5 text-sm text-red-300">
                    No se pudieron cargar las recomendaciones: {error}
                </p>
            ) : isLoading ? (
                <p className="border border-[#27272a] bg-[#121214] p-5 text-sm text-[#a1a1aa]">
                    Cargando recomendaciones…
                </p>
            ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.slice(0, 3).map((rev) => (
                        <div
                            key={rev.id}
                            className="bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] rounded-sm overflow-hidden flex flex-col justify-between group transition-all"
                        >
                            <div>
                                {/* Square Album Art with Badges */}
                                <div className="relative aspect-square bg-[#18181b] overflow-hidden">
                                    <img
                                        src={resolveReviewCover(rev.cover)}
                                        alt={rev.disc}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-black/30" />
                                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#09090b]/90 border border-[#27272a] font-mono text-[10px] text-[#e4e4e7] rounded-sm">
                                        {rev.flag} {rev.country} • {rev.year}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                                        <span className="text-[#ef4444] font-semibold">{rev.genre}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-xl text-white leading-tight">
                                            {rev.disc}
                                        </h3>
                                        <p className="font-mono text-xs text-[#a1a1aa] uppercase mt-0.5">
                                            {rev.band}
                                        </p>
                                    </div>
                                    <p className="text-xs text-[#a1a1aa] italic leading-relaxed">
                                        {rev.excerpt}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="border border-[#27272a] bg-[#121214] p-5 text-sm text-[#a1a1aa]">
                    No hay recomendaciones publicadas todavía.
                </p>
            )}
        </div>
    );
};

export default ContentResenia;
