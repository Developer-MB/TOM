import React, { useState } from 'react'
import { GALLERY_FILTERS, HOME_PICS } from '@/src/data/HomePics';
import { Camera, MapPin, Maximize2, Search } from 'lucide-react';
import Gallery from '../Gallery/Gallery';

type EditorialGallery = (typeof HOME_PICS)[number] & {
    id: string;
    date: string;
    venue: string;
    photosCount: string;
    title: string;
    desc: string;
    photographer: string;
    category: string;
    image: string;
};

const editorialGalleries = HOME_PICS.filter(
    (gallery): gallery is EditorialGallery =>
        typeof gallery.id === 'string' &&
        typeof gallery.date === 'string' &&
        typeof gallery.venue === 'string' &&
        typeof gallery.photosCount === 'string' &&
        typeof gallery.title === 'string' &&
        typeof gallery.desc === 'string' &&
        typeof gallery.photographer === 'string' &&
        typeof gallery.category === 'string' &&
        typeof gallery.image === 'string',
);

const FilterGallery = () => {
    const [activeFilter, setActiveFilter] = useState('TODOS LOS EVENTOS');
    const [searchQuery, setSearchQuery] = useState('');
    const filteredGalleries = editorialGalleries.filter((g) => {
        const matchesCategory =
            activeFilter === 'TODOS LOS EVENTOS' || g.category === activeFilter;
        const matchesSearch =
            !searchQuery.trim() ||
            g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.photographer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    const [lightboxItem, setLightboxItem] = useState<{
        title: string;
        venue: string;
        date: string;
        photographer: string;
        image: string;
        exif: string;
    } | null>(null);
    return (
        <section className="max-w-[1440px] mx-auto lg:px-8 pb-10">
            <div className="mx-auto pb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E0E12] border border-zinc-800 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        {GALLERY_FILTERS.map((f) => {
                            const active = activeFilter === f.id;
                            return (
                                <button
                                    key={f.id}
                                    onClick={() => setActiveFilter(f.id)}
                                    className={`px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-2 ${active
                                        ? 'bg-[#DC2626] text-white border-[#DC2626] font-bold'
                                        : 'bg-[#070709] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                                        }`}
                                >
                                    <span>{f.id}</span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 ${active ? 'bg-black/30 text-white' : 'bg-zinc-900 text-zinc-500'
                                            }`}
                                    >
                                        {f.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative w-full md:w-72">
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
                <Gallery />
            </div>
        </section>
    )
}

export default FilterGallery