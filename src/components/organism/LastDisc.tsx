import React, { useState } from 'react'
import { CRITIC_VAULT_REVIEWS } from '@/src/data/mockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LastDisc = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeGenre, setActiveGenre] = useState('TODOS');
    const [sortOrder, setSortOrder] = useState('MÁS RECIENTES PRIMERO');
    const [selectedYear, setSelectedYear] = useState('2025');
    const [activePage, setActivePage] = useState(1);
    const filteredReviews = CRITIC_VAULT_REVIEWS.filter((rev) => {
        const matchesGenre = activeGenre === 'TODOS' || rev.genreKey === activeGenre;
        const matchesSearch =
            !searchTerm ||
            rev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rev.band.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rev.label.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesGenre && matchesSearch;
    });
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase mt-1">
                        ÚLTIMOS LANZAMIENTOS EVALUADOS
                    </h2>
                </div>
                <span className="font-mono text-[11px] text-[#71717a] uppercase">
                    MOSTRANDO: <strong className="text-white">1 - {filteredReviews.length}</strong> DE 248 RESEÑAS
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReviews.map((rev) => (
                    <article
                        key={rev.id}
                        className="bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] rounded-sm overflow-hidden flex flex-col justify-between group transition-all"
                    >
                        <div>
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
                                <span className="absolute top-3 right-3 px-2.5 py-1 bg-[#dc2626] text-white font-mono text-xs font-bold rounded-sm">
                                    {rev.score} <span className="text-[9px] opacity-80">/10</span>
                                </span>
                                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between font-mono text-[10px]">
                                    <span className="px-2 py-0.5 bg-[#09090b]/90 border border-[#27272a] text-[#e4e4e7] rounded-sm">
                                        {rev.genre}
                                    </span>
                                    <span className="text-[#a1a1aa] uppercase">{rev.label}</span>
                                </div>
                            </div>

                            <div className="p-5 space-y-2.5">
                                <div className="flex items-center justify-between font-mono text-[10px] text-[#71717a] uppercase">
                                    <span>{rev.band}</span>
                                    <span>{rev.duration}</span>
                                </div>
                                <h3 className="font-display font-extrabold text-xl text-white uppercase leading-tight group-hover:text-[#ef4444] transition-colors">
                                    {rev.title}
                                </h3>
                                <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-3">
                                    {rev.excerpt}
                                </p>
                            </div>
                        </div>

                        <div className="px-5 pb-4 pt-3 border-t border-[#18181b] flex items-center justify-between font-mono text-[11px]">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#18181b] border border-[#3f3f46] flex items-center justify-center text-[10px] text-white font-bold">
                                    {rev.authorInitials}
                                </span>
                                <span className="text-[#71717a]">Por: <strong className="text-[#a1a1aa]">{rev.author}</strong></span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Pagination Strip */}
            <div className="pt-4 border-t border-[#18181b] flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                <span className="text-[#71717a] text-[11px]">
                    PÁGINA <strong className="text-white">{activePage}</strong> DE <strong className="text-white">48</strong> (1,482 ÁLBUMES DOCUMENTADOS)
                </span>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setActivePage(Math.max(1, activePage - 1))}
                        className="w-8 h-8 bg-[#121214] border border-[#27272a] rounded-sm flex items-center justify-center text-[#a1a1aa] hover:text-white cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[1, 2, 3, 4].map((p) => (
                        <button
                            key={p}
                            onClick={() => setActivePage(p)}
                            className={`w-8 h-8 rounded-sm font-mono text-xs cursor-pointer ${activePage === p
                                ? 'bg-[#dc2626] text-white font-bold'
                                : 'bg-[#121214] border border-[#27272a] text-[#a1a1aa] hover:text-white'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                    <span className="px-2 text-[#71717a]">...</span>
                    <button
                        onClick={() => setActivePage(48)}
                        className="w-8 h-8 bg-[#121214] border border-[#27272a] rounded-sm text-[#a1a1aa] hover:text-white cursor-pointer"
                    >
                        48
                    </button>
                    <button
                        onClick={() => setActivePage(Math.min(48, activePage + 1))}
                        className="w-8 h-8 bg-[#121214] border border-[#27272a] rounded-sm flex items-center justify-center text-[#a1a1aa] hover:text-white cursor-pointer"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

            </div>
        </div>
    )
}

export default LastDisc