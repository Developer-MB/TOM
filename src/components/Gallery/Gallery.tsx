import React, { useState } from 'react'
import { HOME_PICS } from '@/src/data/HomePics'
import { Camera, MapPin, Maximize2 } from 'lucide-react'
import ModalGal from './ModalGal'

type GalleryPic = {
    id: string;
    img: { id: number; pic: string }[];
    concert: string;
    date: string;
    title: string;
    credit: string;
    venue: string;
};

const toGalleryPic = (item: (typeof HOME_PICS)[number]): GalleryPic => {
    const photos = 'img' in item && item.img
        ? item.img
        : 'image' in item && item.image
            ? [{ id: 1, pic: item.image }]
            : [];

    return {
        id: item.id,
        img: photos,
        concert: 'concert' in item && item.concert ? item.concert : item.title,
        date: item.date,
        title: item.title,
        credit: 'credit' in item && item.credit
            ? item.credit
            : 'photographer' in item && item.photographer
                ? item.photographer
                : '',
        venue: item.venue,
    };
};

const Gallery = () => {
    const [selectedGallery, setSelectedGallery] = useState<GalleryPic | null>(null)
    const [photoIndex, setPhotoIndex] = useState(0)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOME_PICS.map((item) => {
                const firstPhoto = 'img' in item && item.img?.[0]
                    ? item.img[0].pic
                    : 'image' in item
                        ? item.image
                        : undefined;
                const galleryTitle = 'concert' in item && item.concert
                    ? item.concert
                    : item.title;
                const photographer = 'credit' in item && item.credit
                    ? item.credit
                    : 'photographer' in item
                        ? item.photographer
                        : undefined;
                const category = 'category' in item
                    ? item.category
                    : 'city' in item
                        ? item.city
                        : '';

                return (
                <article
                    key={item.id}
                    className="border border-zinc-800 bg-[#0E0E12] hover:border-zinc-600 transition-all flex flex-col justify-between group"
                >
                    <div>
                        {/* Image container */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-black border-b border-zinc-800">
                            <img
                                src={firstPhoto}
                                alt={`${galleryTitle} - ${item.title}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-black/40" />

                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 flex items-center gap-1">
                                    <Camera className="w-3 h-3" /> {item.date}
                                </span>
                            </div>

                            <div className="absolute bottom-3 left-3">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-300 bg-black/80 px-2.5 py-1 border border-zinc-800 flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-[#DC2626]" /> {item.venue} / {item.city}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="font-mono font-bold text-[14px] uppercase tracking-widest text-[#dcd926] mb-2">
                                {category}
                            </div>
                            <h3 className="font-display font-light text-xl tracking-tight text-white transition-colors mb-3 leading-snug">
                                {item.title}
                            </h3>
                            <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3">
                                {item.desc}
                            </p>
                        </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 border-t border-zinc-800/80 bg-[#0A0A0D] flex items-center justify-between">
                        <div className="font-mono text-[12px] text-zinc-400">
                            FOTOS: <span className="text-blue-700 font-bold">{photographer}</span>
                        </div>
                        <button
                            onClick={() => {
                                setPhotoIndex(0)
                                setSelectedGallery(toGalleryPic(item))
                            }}
                            className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#DC2626] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            VER TODAS <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </article>
                );
            })}
            {selectedGallery && (
                <ModalGal
                    gallery={selectedGallery}
                    photoIndex={photoIndex}
                    onClose={() => setSelectedGallery(null)}
                    onPrevious={() => setPhotoIndex((index) =>
                        (index - 1 + selectedGallery.img.length) % selectedGallery.img.length
                    )}
                    onNext={() => setPhotoIndex((index) =>
                        (index + 1) % selectedGallery.img.length
                    )}
                />
            )}
        </div>
    )
}

export default Gallery