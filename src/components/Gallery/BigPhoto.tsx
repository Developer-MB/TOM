import React, { useEffect, useState } from 'react'
import { Calendar, Eye, MapPin } from 'lucide-react'
import { HOME_PICS } from '@/src/data/HomePics'
import ModalGal from './ModalGal'

type HomePhotoGallery = {
    id: string;
    img: { id: number; pic: string }[];
    concert: string;
    date: string;
    city: string;
    title: string;
    desc: string;
    credit: string;
    venue: string;
};

const BigPhoto = () => {
    const fotoGallery = HOME_PICS.find(
        (gallery): gallery is HomePhotoGallery =>
            Array.isArray(gallery.img) &&
            typeof gallery.concert === 'string' &&
            typeof gallery.credit === 'string',
    )
    const photos = fotoGallery?.img ?? []
    const featuredPhoto = photos[0]
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openPhoto = (index: number) => {
        if (!fotoGallery || !photos[index]) return

        setCurrentPhotoIndex(index)
        setIsModalOpen(true)
    }

    useEffect(() => {
        if (!isModalOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsModalOpen(false)
            } else if (event.key === 'ArrowRight' && photos.length > 1) {
                setCurrentPhotoIndex((index) => (index + 1) % photos.length)
            } else if (event.key === 'ArrowLeft' && photos.length > 1) {
                setCurrentPhotoIndex((index) => (index - 1 + photos.length) % photos.length)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isModalOpen, photos.length])

    return (
        <div className="border border-zinc-800 bg-[#0E0E12] relative overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left / Main Image */}
                <div className="lg:col-span-8 relative min-h-[380px] sm:min-h-[480px] overflow-hidden bg-black">
                    {featuredPhoto ? (
                        <img
                            src={featuredPhoto.pic}
                            alt={fotoGallery?.title ?? 'Fotografía destacada'}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-500 font-mono text-sm">
                            NO HAY FOTOGRAFÍAS DISPONIBLES
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-black/40" />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                        <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                            COBERTURA ESTELAR
                        </span>
                    </div>
                </div>

                {/* Right / Editorial Details */}
                <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-800 bg-[#0B0B0E]">
                    <div>
                        <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 mb-4 pb-3 border-b border-zinc-800/80">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#DC2626]" /> {fotoGallery?.venue} / {fotoGallery?.city}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-zinc-500" /> {fotoGallery?.date}
                            </span>
                        </div>

                        <h2 className="font-display text-2xl sm:text-3xl tracking-tight leading-tight text-[#DC2626]">
                            {fotoGallery?.concert}
                        </h2>
                        <span className='font-display text-2xl sm:text-3xl tracking-tight leading-tight text-[#f0f0f0a2]'>
                            {fotoGallery?.title}
                        </span>

                        {/* Mini Thumbnail Strip */}
                        <div className="mb-6">
                            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-4">
                                VISTA PREVIA DEL CARRETE ({String(photos.length).padStart(2, '0')} FOTOS):
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {photos.slice(0, 4).map((photo, idx) => (
                                    <button
                                        key={photo.id}
                                        onClick={() => openPhoto(idx)}
                                        className="aspect-square border border-zinc-800 hover:border-[#DC2626] overflow-hidden relative group/thumb cursor-pointer"
                                    >
                                        <img
                                            src={photo.pic}
                                            alt={`${fotoGallery?.title ?? 'Galería'} - foto ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-transparent transition-colors" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800/80 space-y-4">
                        <div className="flex items-center justify-between font-mono text-xs">
                            <span className="text-zinc-500 uppercase">FOTOGRAFÍA:</span>                            <span className="text-blue-700 font-light text-[15px] uppercase">
                                {fotoGallery?.credit}
                            </span>
                        </div>

                        {featuredPhoto && (
                            <button
                                onClick={() => openPhoto(0)}
                                className="w-full bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest py-3.5 px-5 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <Eye className="w-4 h-4" /> VER GALERIA ({photos.length} FOTOS)
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {/* LIGHTBOX MODAL */}
            {isModalOpen && fotoGallery && (
                <ModalGal
                    gallery={fotoGallery}
                    photoIndex={currentPhotoIndex}
                    onClose={() => setIsModalOpen(false)}
                    onPrevious={() => setCurrentPhotoIndex((index) =>
                        (index - 1 + photos.length) % photos.length
                    )}
                    onNext={() => setCurrentPhotoIndex((index) =>
                        (index + 1) % photos.length
                    )}
                />
            )}
        </div>
    )
}

export default BigPhoto