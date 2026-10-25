import React from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { HOME_PICS } from '@/src/data/HomePics'

type HomePhotoGallery = (typeof HOME_PICS)[number] & {
    img: { id: number; pic: string }[];
    concert: string;
    date: string;
    title: string;
    credit: string;
    venue?: string;
};

interface ModalHomePicsProps {
    gallery: HomePhotoGallery;
    photoIndex: number;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

const ModalHomePics = ({ gallery, photoIndex, onClose, onPrevious, onNext }: ModalHomePicsProps) => {
    const currentPhoto = gallery.img[photoIndex];
    if (!currentPhoto) return null;

    return (
        <div
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={`Galería ${gallery.concert}`}
                className="max-w-4xl w-full border border-zinc-800 bg-[#0B0B0E] overflow-hidden"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-800">
                    <div>
                        <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                            {gallery.venue ?? gallery.concert} · {gallery.date}
                        </span>
                        <h4 className="font-display font-black text-lg uppercase text-white">
                            {gallery.concert} — {gallery.title}
                        </h4>
                    </div>
                    <button
                        type="button"
                        aria-label="Cerrar galería"
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative aspect-[16/9] bg-black flex items-center justify-center overflow-hidden">
                    <img
                        src={currentPhoto.pic}
                        alt={`${gallery.concert} - foto ${photoIndex + 1}`}
                        className="w-full h-full object-contain"
                    />
                    {gallery.img.length > 1 && (
                        <>
                            <button
                                type="button"
                                aria-label="Foto anterior"
                                onClick={onPrevious}
                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/70 p-2 text-white hover:bg-[#DC2626] cursor-pointer"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                aria-label="Foto siguiente"
                                onClick={onNext}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/70 p-2 text-white hover:bg-[#DC2626] cursor-pointer"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <span className="absolute bottom-3 right-3 bg-black/75 px-3 py-1 font-mono text-xs text-white">
                                {photoIndex + 1} / {gallery.img.length}
                            </span>
                        </>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                    <div className="text-zinc-400">
                        FOTOGRAFÍA: <span className="text-blue-700 font-light text-[12px] uppercase">{gallery.credit}</span>{' '}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModalHomePics