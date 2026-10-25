import React from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

type GalleryPic = {
    id: string;
    img: { id: number; pic: string }[];
    concert: string;
    date: string;
    title: string;
    credit: string;
    venue?: string;
};

interface ModalGalleryProps {
    gallery: GalleryPic;
    photoIndex: number;
    onClose: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

const ModalGal = ({ gallery, photoIndex, onClose, onPrevious, onNext }: ModalGalleryProps) => {
    const currentPhoto = gallery.img[photoIndex];
    if (!currentPhoto) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={`Galería ${gallery.concert}`}
                className="max-w-3xl w-full border border-zinc-800 bg-[#0B0B0E] overflow-hidden"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                    <div>
                        <span className="font-black text-[12px] text-[#DC2626] uppercase tracking-widest block">
                            {gallery.venue ?? gallery.concert} ({gallery.date})
                        </span>
                        <h4 className="font-display font-black text-lg uppercase text-white">
                            {gallery.title}
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
                        FOTOGRAFÍA: <span className="text-blue-700 font-light text-[12px] uppercase">{gallery.credit}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-zinc-900 hover:bg-[#DC2626] text-white border border-zinc-700 px-4 py-2 uppercase tracking-wider text-[11px] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" /> CERRAR VISOR
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ModalGal