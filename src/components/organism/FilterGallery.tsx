import React, { useState } from 'react';
import { getGalleryFilters, type HomeGalleryItem } from '@/src/data/HomePics';
import { Search } from 'lucide-react';
import Gallery from '../Gallery/Gallery';

interface FilterGalleryProps {
    galleries: HomeGalleryItem[];
}

const FilterGallery: React.FC<FilterGalleryProps> = ({ galleries }) => {
    const [activeFilter, setActiveFilter] = useState('TODOS LOS EVENTOS');
    const [searchQuery, setSearchQuery] = useState('');
    const galleryFilters = getGalleryFilters(galleries);
    const filteredGalleries = galleries.filter((g) => {
        const matchesCategory =
            activeFilter === 'TODOS LOS EVENTOS' || g.category === activeFilter;
        const matchesSearch =
            !searchQuery.trim() ||
            g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.concert.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.credit.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="w-full pb-6">
            <div className="pb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0E0E12] border border-zinc-800 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {galleryFilters.map((f) => {
                            const active = activeFilter === f.id;
                            return (
                                <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setActiveFilter(f.id)}
                                    className={`px-3 sm:px-3.5 py-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-2 ${
                                        active
                                            ? 'bg-[#DC2626] text-white border-[#DC2626] font-bold'
                                            : 'bg-[#070709] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                                    }`}
                                >
                                    <span>{f.id}</span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 ${
                                            active ? 'bg-black/30 text-white' : 'bg-zinc-900 text-zinc-500'
                                        }`}
                                    >
                                        {f.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full lg:w-80">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar banda, recinto, ciudad..."
                            className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] text-xs font-mono text-white pl-10 pr-4 py-2.5 outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>
            <div>
                <Gallery galleries={filteredGalleries} />
            </div>
        </div>
    );
};

export default FilterGallery;
