import React, { useEffect, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Download, Eye, MapPin, X } from 'lucide-react'
import { HOME_PICS } from '@/src/data/HomePics'

const BigPhoto = () => {
    const fotoGallery = HOME_PICS[0]
    const photos = fotoGallery?.img ?? []
    const featuredPhoto = photos[0]
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    const [lightboxItem, setLightboxItem] = useState<{
        title: string;
        date: string;
        venue: string;
        photographer: string;
        image: string;
        exif: string;
    } | null>(null);

    const openPhoto = (index: number) => {
        const photo = photos[index]
        if (!fotoGallery || !photo) return

        setCurrentPhotoIndex(index)
        setLightboxItem({
            title: fotoGallery.title ?? '',
            venue: fotoGallery.concert ?? '',
            date: fotoGallery.date ?? '',
            photographer: fotoGallery.credit ?? '',
            image: photo.pic,
            exif: 'DATOS EXIF NO DISPONIBLES',
        })
    }

    useEffect(() => {
        if (!lightboxItem) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setLightboxItem(null)
            } else if (event.key === 'ArrowRight' && photos.length > 1) {
                setCurrentPhotoIndex((index) => (index + 1) % photos.length)
            } else if (event.key === 'ArrowLeft' && photos.length > 1) {
                setCurrentPhotoIndex((index) => (index - 1 + photos.length) % photos.length)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [lightboxItem, photos.length])

    const currentPhoto = photos[currentPhotoIndex]

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
                                            alt={`${fotoGallery.title} - foto ${idx + 1}`}
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
            {lightboxItem && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="max-w-3xl w-full border border-zinc-800 bg-[#0B0B0E] overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                            <div>
                                <span className="font-black text-[12px] text-[#DC2626] uppercase tracking-widest block">
                                    {lightboxItem.venue} ({lightboxItem.date})
                                </span>
                                <h4 className="font-display font-black text-lg uppercase text-white">
                                    {lightboxItem.title}
                                </h4>
                            </div>
                            <button
                                onClick={() => setLightboxItem(null)}
                                className="p-2 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative aspect-[16/9] bg-black flex items-center justify-center overflow-hidden">
                            <img
                                src={currentPhoto?.pic ?? lightboxItem.image}
                                alt={lightboxItem.title}
                                className="w-full h-full object-cover"
                            />
                            {photos.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Foto anterior"
                                        onClick={() =>
                                            setCurrentPhotoIndex((index) => (index - 1 + photos.length) % photos.length)
                                        }
                                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/70 p-2 text-white hover:bg-[#DC2626] cursor-pointer"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Foto siguiente"
                                        onClick={() =>
                                            setCurrentPhotoIndex((index) => (index + 1) % photos.length)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-black/70 p-2 text-white hover:bg-[#DC2626] cursor-pointer"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <span className="absolute bottom-3 right-3 bg-black/75 px-3 py-1 font-mono text-xs text-white">
                                        {currentPhotoIndex + 1} / {photos.length}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                            <div className="text-zinc-400">
                                FOTOGRAFÍA: <span className="text-blue-700 font-light text-[12px] uppercase">{lightboxItem.photographer}</span>{' '}
                            </div>
                            <button
                                onClick={() => setLightboxItem(null)}
                                className="bg-zinc-900 hover:bg-[#DC2626] text-white border border-zinc-700 px-4 py-2 uppercase tracking-wider text-[11px] flex items-center gap-2 transition-colors cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" /> CERRAR VISOR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BigPhoto