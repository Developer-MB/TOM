import React, { useState } from 'react'
import { SectionId } from '../../data/mockData';
import { HOME_REVIEWS } from '@/src/data/HomeReviews';

interface ContentResniaProps {
    setReviewFilter: (filter: 'TODOS' | 'BLACK' | 'DEATH' | 'DOOM' | 'GOTHIC' | 'GRINDCORE' | 'HEAVY' | 'POWER' | 'PROGRESIVE' | 'SPEED' | 'STONER' | 'THRASH') => void;

    onSelectSection: (section: SectionId) => void;
}

export const ContentResenia: React.FC<ContentResniaProps> = () => {
    const [reviewFilter, setReviewFilter] = useState<'TODOS' | 'BLACK' | 'DEATH' | 'DOOM' | 'GOTHIC' | 'GRINDCORE' | 'HEAVY' | 'POWER' | 'PROGRESIVE' | 'SPEED' | 'STONER' | 'THRASH'>('TODOS');
    const filteredReviews =
        reviewFilter === 'TODOS'
            ? HOME_REVIEWS
            : HOME_REVIEWS.filter((r) => r.category === reviewFilter);

    return (
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div></div>
                {/* Filter Buttons */}
                <div className="flex w-full flex-wrap items-center justify-start gap-2 font-mono text-[10px] sm:w-auto sm:justify-end">
                    <span className="w-full text-[#71717a] uppercase sm:w-auto sm:mr-1">FILTRAR:</span>
                    {(['TODOS', 'BLACK', 'DEATH', 'DOOM', 'GOTHIC', 'GRINDCORE', 'HEAVY', 'POWER', 'PROGRESIVE', 'SPEED', 'STONER', 'THRASH'] as const).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setReviewFilter(cat)}
                            className={`px-2.5 py-1 rounded-sm uppercase transition-colors cursor-pointer ${reviewFilter === cat
                                ? 'bg-[#dc2626] text-white font-bold'
                                : 'bg-[#121214] border border-[#27272a] text-[#a1a1aa] hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredReviews.map((rev) => (
                    <div
                        key={rev.id}
                        className="bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] rounded-sm overflow-hidden flex flex-col justify-between group transition-all"
                    >
                        <div>
                            {/* Square Album Art with Badges */}
                            <div className="relative aspect-square bg-[#18181b] overflow-hidden">
                                <img
                                    src={rev.cover}
                                    alt={rev.title}
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
                                        {rev.title}
                                    </h3>
                                    <p className="font-mono text-xs text-[#a1a1aa] uppercase mt-0.5">
                                        {rev.band}
                                    </p>
                                </div>
                                <p className="text-xs text-[#a1a1aa] italic leading-relaxed">
                                    {rev.quote}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ContentResenia