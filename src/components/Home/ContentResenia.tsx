import React from 'react'
import { CRITIC_VAULT_REVIEWS } from '@/src/data/HomeReviews';

export const ContentResenia: React.FC = () => {
    return (
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {CRITIC_VAULT_REVIEWS.slice(0, 3).map((rev) => (
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
                                    {rev.excerpt}
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