import React from 'react'
import { Calendar, Globe, Search } from 'lucide-react'
import { CRITIC_VAULT_REVIEWS, genres } from '@/src/data/HomeReviews';

export interface ReviewFilters {
    searchTerm: string;
    sortOrder: 'recent' | 'older' | 'ascendent' | 'descendent';
    year: string;
    country: string;
    genre: string;
}

interface FilterProps {
    filters: ReviewFilters;
    onFiltersChange: (filters: ReviewFilters) => void;
}

const years = [...new Set(CRITIC_VAULT_REVIEWS.map((review) => review.year))].sort((a, b) => Number(b) - Number(a));
const countries = [...new Set(CRITIC_VAULT_REVIEWS.map((review) => review.country))].sort();

const Filter: React.FC<FilterProps> = ({ filters, onFiltersChange }) => {
    const updateFilter = <K extends keyof ReviewFilters>(key: K, value: ReviewFilters[K]) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5 relative">
                    <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={filters.searchTerm}
                        onChange={(e) => updateFilter('searchTerm', e.target.value)}
                        placeholder="Buscar por banda, título de disco, disquera o productor..."
                        className="w-full bg-[#09090b] border border-[#27272a] focus:border-[#dc2626] rounded-sm pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-[#71717a] outline-none"
                    />
                </div>
                {/* FILTRO FECHA */}
                <div className="md:col-span-3">
                    <select
                        value={filters.sortOrder}
                        onChange={(e) => updateFilter('sortOrder', e.target.value as ReviewFilters['sortOrder'])}
                        className="w-full bg-[#09090b] border border-[#27272a] rounded-sm px-3 py-2 text-xs font-mono text-[#f00b0b] outline-none cursor-metal"
                    >
                        <option value="recent">ORDENAR: MÁS RECIENTES</option>
                        <option value="older">ORDENAR: MÁS VIEJOS</option>
                        <option value="ascendent">ORDENAR: ORDEN ALFABÉTICO ASCENDENTE</option>
                        <option value="descendent">ORDENAR: ORDEN ALFABÉTICO DESCENDENTE</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="relative block">
                        <span className="sr-only">Filtrar por año</span>
                        <select
                            value={filters.year}
                            onChange={(e) => updateFilter('year', e.target.value)}
                            className="w-full appearance-none bg-[#09090b] border border-[#27272a] rounded-sm px-3 py-2 pr-8 text-xs font-mono text-[#f00b0b] outline-none cursor-metal transition-colors hover:bg-[#e4e4e7] hover:text-[#09090b]"
                        >
                            <option value="TODOS">AÑO: TODOS</option>
                            {years.map((year) => <option key={year} value={year}>AÑO: {year}</option>)}
                        </select>
                        <Calendar className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717a] pointer-events-none" />
                    </label>
                </div>
                <div className="md:col-span-2">
                    <label className="relative block">
                        <span className="sr-only">Filtrar por país</span>
                        <select
                            value={filters.country}
                            onChange={(e) => updateFilter('country', e.target.value)}
                            className="w-full appearance-none bg-[#09090b] border border-[#27272a] rounded-sm px-3 py-2 pr-8 text-xs font-mono text-[#f00b0b] outline-none cursor-metal transition-colors hover:bg-[#e4e4e7] hover:text-[#09090b]"
                        >
                            <option value="TODOS">PAÍS: TODOS</option>
                            {countries.map((country) => <option key={country} value={country}>PAÍS: {country}</option>)}
                        </select>
                        <Globe className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71717a] pointer-events-none" />
                    </label>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-8 pb-3 font-mono text-[10px]">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex w-full flex-wrap items-center justify-start gap-2 font-mono text-[10px] sm:w-auto sm:justify-center">
                        <span className="w-full text-[#71717a] uppercase sm:w-auto sm:mr-1">FILTRAR:</span>
                        {genres.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => updateFilter('genre', cat)}
                                className={`px-2.5 py-1 rounded-sm uppercase transition-colors cursor-pointer ${filters.genre === cat
                                    ? 'bg-[#dc2626] text-white font-bold'
                                    : 'bg-[#121214] border border-[#27272a] text-[#a1a1aa] hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Filter