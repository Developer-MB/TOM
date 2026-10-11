import { Calendar, Globe, Search } from 'lucide-react';
import React, { useState } from 'react'

const HeadRec = () => {
    const [sortOrder, setSortOrder] = useState('MÁS RECIENTES PRIMERO');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedYear, setSelectedYear] = useState('2025');
    const [activeGenre, setActiveGenre] = useState('TODOS');
    const genres = [
        'TODOS',
        'DEATH METAL',
        'BLACK METAL',
        'THRASH METAL',
        'DOOM / SLUDGE',
        'GRINDCORE',
        'HEAVY / SPEED',
        'DEMOS & SPLITS',
    ];

    return (
        <div className="max-w-[1440px] mx-auto px-4 pt-6 space-y-12">
            {/* Top Breadcrumb + Dictated Counter */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#18181b] pb-4 font-mono text-[10px] uppercase tracking-wider">
                <div className="flex items-center gap-2 text-[#71717a]">
                    <span>TIME OF METAL</span>
                    <span>/</span>
                    <span className="text-[#f4f4f5] font-semibold">RECOMENDACION DE DISCOS &amp; DEMOS</span>
                </div>
            </div>

            {/* HERO HEADER + METRICS BOX */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-8 space-y-4">
                    <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight uppercase leading-none">
                        <span className="text-white">JUICIO </span>
                        <span className="text-[#dc2626]">CRÍTICO</span>
                    </h1>
                    <p className="text-sm sm:text-base text-[#a1a1aa] max-w-xl leading-relaxed">
                        Desmenuzamos la arquitectura sonora y contundencia técnica de la música extrema y el underground internacional.
                    </p>
                </div>

                <div className="lg:col-span-4 bg-[#121214] border border-[#27272a] rounded-sm p-5 grid grid-cols-3 divide-x divide-[#27272a] text-center">
                    <div className="px-2">
                        <span className="font-mono text-[9px] text-[#71717a] uppercase block">PROMEDIO MES</span>
                        <span className="font-display font-extrabold text-2xl text-white mt-1 block">8.6</span>
                    </div>
                    <div className="px-2">
                        <span className="font-mono text-[9px] text-[#71717a] uppercase block">PERFECCIÓN (10/10)</span>
                        <span className="font-display font-extrabold text-2xl text-[#dc2626] mt-1 block">03</span>
                    </div>
                    <div className="px-2">
                        <span className="font-mono text-[9px] text-[#71717a] uppercase block">NEFASTOS (&lt;4.0)</span>
                        <span className="font-display font-extrabold text-2xl text-white mt-1 block">12</span>
                    </div>
                </div>
            </div>

            {/* SEARCH & GENRE FILTER BAR */}
            <div className="bg-[#121214] border border-[#27272a] rounded-sm p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-5 relative">
                        <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por banda, título de disco, disquera o productor..."
                            className="w-full bg-[#09090b] border border-[#27272a] focus:border-[#dc2626] rounded-sm pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-[#71717a] outline-none"
                        />
                    </div>
                    <div className="md:col-span-3">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded-sm px-3 py-2 text-xs font-mono text-[#e4e4e7] outline-none"
                        >
                            <option value="MÁS RECIENTES PRIMERO">ORDENAR: MÁS RECIENTES PRIMERO</option>
                            <option value="CALIFICACIÓN MÁS ALTA">ORDENAR: CALIFICACIÓN MÁS ALTA</option>
                            <option value="ORDEN ALFABÉTICO">ORDENAR: ORDEN ALFABÉTICO</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <button
                            onClick={() => setSelectedYear(selectedYear === '2025' ? '2024' : '2025')}
                            className="w-full bg-[#09090b] border border-[#27272a] rounded-sm px-3 py-2 text-xs font-mono text-[#e4e4e7] flex items-center justify-between cursor-pointer"
                        >
                            <span>AÑO: {selectedYear}</span>
                            <Calendar className="w-3.5 h-3.5 text-[#71717a]" />
                        </button>
                    </div>
                    <div className="md:col-span-2">
                        <div className="w-full bg-[#09090b] border border-[#27272a] rounded-sm px-3 py-2 text-xs font-mono text-[#e4e4e7] flex items-center justify-between">
                            <span>PAÍS: TODOS</span>
                            <Globe className="w-3.5 h-3.5 text-[#71717a]" />
                        </div>
                    </div>
                </div>

                {/* Genre Buttons Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px]">
                    <span className="text-[#71717a] uppercase mr-1">FILTRO GÉNERO:</span>
                    {genres.map((g) => (
                        <button
                            key={g}
                            onClick={() => setActiveGenre(g)}
                            className={`px-2.5 py-1 rounded-sm uppercase transition-colors cursor-pointer ${activeGenre === g
                                ? 'bg-[#dc2626] text-white font-bold'
                                : 'bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white'
                                }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default HeadRec