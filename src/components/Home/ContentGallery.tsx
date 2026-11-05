import React, { useEffect, useState } from 'react';
import { SectionId } from '@/src/data/mockData';
import { Camera } from 'lucide-react';
import type { HomeGalleryItem } from '@/src/data/HomePics';
import ModalHomePics from './ModalHomePics';

type HomePhotoGallery = HomeGalleryItem & {
    img: { id: number; pic: string }[];
    concert: string;
    date: string;
    title: string;
    credit: string;
};

interface ContentGalleryProps {
    onSelectSection: (section: SectionId) => void;
    galleries: HomeGalleryItem[];
}

const ContentGallery = ({ onSelectSection, galleries }: ContentGalleryProps) => {
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
        <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
                        GALERÍA DE CONCIERTOS
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={() => onSelectSection('galeria')}
                    className="font-mono text-xs text-[#a1a1aa] hover:text-white flex items-center gap-1.5 uppercase tracking-wider cursor-pointer self-start sm:self-end"
                >
                    <span>VER TODAS LAS COBERTURAS</span>
                    <Camera className="w-3.5 h-3.5 shrink-0" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((item) => (
                    <button
                        type="button"
                        key={item.id}
                        onClick={() => openGallery(item)}
                        className="text-left bg-[#121214] border border-[#27272a] hover:border-[#dc2626] rounded-sm overflow-hidden group cursor-pointer transition-colors flex flex-col justify-between"
                    >
                        <div className="w-full">
                            <div className="h-52 overflow-hidden bg-[#18181b]">
                                <img
                                    src={item.img[0]?.pic}
                                    alt={`${item.concert} - ${item.title}`}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-5 space-y-2">
                                <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase">
                                    <span className="text-[#ef4444] font-semibold truncate">{item.concert}</span>
                                    <span className="text-[#71717a] shrink-0">{item.date}</span>
                                </div>
                                <h3 className="font-display font-bold text-base text-white group-hover:text-[#ef4444] transition-colors">
                                    {item.title}
                                </h3>
                                <p className="font-mono text-[11px] text-[#71717a]">{item.credit}</p>
                            </div>
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
    );
};

export default ContentGallery;
