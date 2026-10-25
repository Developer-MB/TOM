import React, { useEffect, useState } from 'react'
import { SectionId } from '@/src/data/mockData';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { HOME_PICS } from '@/src/data/HomePics';
import ModalHomePics from './ModalHomePics';

type HomePhotoGallery = (typeof HOME_PICS)[number] & {
    img: { id: number; pic: string }[];
    concert: string;
    date: string;
    title: string;
    credit: string;
};

const homePhotoGalleries = HOME_PICS.filter(
    (item): item is HomePhotoGallery =>
        Array.isArray(item.img) &&
        typeof item.concert === 'string' &&
        typeof item.date === 'string' &&
        typeof item.title === 'string' &&
        typeof item.credit === 'string',
);

interface ContentGalleryProps {
    onSelectSection: (section: SectionId) => void;
}

const ContentGallery = ({ onSelectSection }: ContentGalleryProps) => {
    const [selectedGallery, setSelectedGallery] = useState<HomePhotoGallery | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const currentPhoto = selectedGallery?.img[currentPhotoIndex];

    const openGallery = (gallery: HomePhotoGallery) => {
        setCurrentPhotoIndex(0);
        setSelectedGallery(gallery);
    };

    useEffect(() => {
        if (!selectedGallery) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedGallery(null);
            } else if (event.key === 'ArrowRight') {
                setCurrentPhotoIndex((index) => (index + 1) % selectedGallery.img.length);
            } else if (event.key === 'ArrowLeft') {
                setCurrentPhotoIndex((index) => (index - 1 + selectedGallery.img.length) % selectedGallery.img.length);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedGallery]);

    return (
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
                        GALERIA DE CONCIERTOS
                    </h2>
                </div>
                <button
                    onClick={() => onSelectSection('galeria')}
                    className="font-mono text-xs text-[#a1a1aa] hover:text-white flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                    <span>VER TODAS LAS COBERTURAS</span>
                    <Camera className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {homePhotoGalleries.map((item) => (
                    <button
                        type="button"
                        key={item.id}
                        onClick={() => openGallery(item)}
                        className="text-left bg-[#121214] border border-[#27272a] hover:border-[#dc2626] rounded-sm overflow-hidden group cursor-pointer transition-colors"
                    >
                        <div className="h-52 overflow-hidden bg-[#18181b]">
                            <img
                                src={item.img[0]?.pic}
                                alt={`${item.concert} - ${item.title}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-5 space-y-2">
                            <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                                <span className="text-[#ef4444] font-semibold">{item.concert}</span>
                                <span className="text-[#71717a]">{item.date}</span>
                            </div>
                            <h3 className="font-display font-bold text-base text-white group-hover:text-[#ef4444] transition-colors">
                                {item.title}
                            </h3>
                            <p className="font-mono text-[11px] text-[#71717a]">{item.credit}</p>
                        </div>
                    </button>
                ))}
            </div>

            {selectedGallery && currentPhoto && (
                <ModalHomePics
                    gallery={selectedGallery}
                    photoIndex={currentPhotoIndex}
                    onClose={() => setSelectedGallery(null)}
                    onPrevious={() => setCurrentPhotoIndex((index) => (
                        index - 1 + selectedGallery.img.length
                    ) % selectedGallery.img.length)}
                    onNext={() => setCurrentPhotoIndex((index) => (
                        index + 1
                    ) % selectedGallery.img.length)}
                />
            )}
        </div>
    )
}

export default ContentGallery