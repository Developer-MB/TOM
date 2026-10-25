import React, { useState } from 'react'
import { GALLERY_FILTERS, HOME_PICS } from '@/src/data/HomePics';
import { Camera, MapPin, Maximize2, Search } from 'lucide-react';

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGalleries.map((item) => (
                        <article
                            key={item.id}
                            className="border border-zinc-800 bg-[#0E0E12] hover:border-zinc-600 transition-all flex flex-col justify-between group"
                        >
                            <div>
                                {/* Image container */}
                                <div className="relative aspect-[16/10] overflow-hidden bg-black border-b border-zinc-800">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-black/40" />

                                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                        <span className="bg-black/85 border border-zinc-700 text-zinc-200 font-mono text-[10px] uppercase tracking-widest px-2.5 py-1">
                                            {item.date}
                                        </span>
                                        <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1">
                                            <Camera className="w-3 h-3" /> {item.photosCount}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3">
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 bg-black/80 px-2.5 py-1 border border-zinc-800 flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3 text-[#DC2626]" /> {item.venue}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-[#DC2626] mb-2">
                                        {item.category}
                                    </div>
                                    <h3 className="font-display font-black text-xl uppercase tracking-tight text-white group-hover:text-[#DC2626] transition-colors mb-3 leading-snug">
                                        {item.title}
                                    </h3>
                                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="px-6 py-4 border-t border-zinc-800/80 bg-[#0A0A0D] flex items-center justify-between">
                                <div className="font-mono text-[11px] text-zinc-400">
                                    FOTOS: <span className="text-white font-bold">{item.photographer}</span>
                                </div>
                                <button
                                    onClick={() =>
                                        setLightboxItem({
                                            title: item.title,
                                            venue: item.venue,
                                            date: item.date,
                                            photographer: item.photographer,
                                            image: item.image,
                                            exif: 'NIKON Z9 · 24-70MM f/2.8 S · ISO 4000 · 1/640s',
                                        })
                                    }
                                    className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#DC2626] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    ABRIR GALERÍA <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FilterGallery