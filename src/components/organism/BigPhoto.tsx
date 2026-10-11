import React, { useState } from 'react'
import { ASSETS } from '@/src/data/mockData'
import { Calendar, Download, Eye, MapPin, X } from 'lucide-react'

const BigPhoto = () => {
    const [lightboxItem, setLightboxItem] = useState<{
        title: string;
        venue: string;
        date: string;
        photographer: string;
        image: string;
        exif: string;
    } | null>(null);
    return (
        <div className="border border-zinc-800 bg-[#0E0E12] relative overflow-hidden group">
            <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left / Main Image */}
                <div className="lg:col-span-8 relative min-h-[380px] sm:min-h-[480px] overflow-hidden bg-black">
                    <img
                        src={ASSETS.concertPyro}
                        alt="Behemoth Wacken Open Air"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />
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
                                <MapPin className="w-3.5 h-3.5 text-[#DC2626]" /> WACKEN, ALEMANIA
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-zinc-500" /> 03 AGO 2024
                            </span>
                        </div>

                        <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white leading-tight mb-4">
                            BEHEMOTH: LA LITURGIA DEL FUEGO EN WACKEN OPEN AIR
                        </h2>

                        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                            Ante más de 85,000 almas bajo la tormenta del norte alemán, Nergal y su legión polaca transformaron el escenario principal en una catedral ardiente. Columnas de fuego de 15 metros y una ejecución quirúrgica capturada desde el foso de prensa durante los primeros tres temas.
                        </p>

                        {/* Mini Thumbnail Strip */}
                        <div className="mb-6">
                            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2.5">
                                VISTA PREVIA DEL CARRETE (04 / 64):
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    ASSETS.concertPyro,
                                    ASSETS.albumBlackMetal,
                                    ASSETS.studioPodcast,
                                    ASSETS.albumCatacombs,
                                ].map((thumb, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() =>
                                            setLightboxItem({
                                                title: `BEHEMOTH — NEGATIVO #0${idx + 1} (WACKEN 2024)`,
                                                venue: 'WACKEN, ALEMANIA',
                                                date: '03 AGOSTO 2024',
                                                photographer: 'M. LINDQVIST',
                                                image: thumb,
                                                exif: 'LEICA SL2-S · 35MM f/1.4 · ISO 3200',
                                            })
                                        }
                                        className="aspect-square border border-zinc-800 hover:border-[#DC2626] overflow-hidden relative group/thumb cursor-pointer"
                                    >
                                        <img
                                            src={thumb}
                                            alt={`Frame ${idx + 1}`}
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
                            <span className="text-zinc-500 uppercase">FOTÓGRAFO JEFE:</span>
                            <span className="text-white font-bold">M. LINDQVIST (ACREDITADO)</span>
                        </div>

                        <button
                            onClick={() =>
                                setLightboxItem({
                                    title: 'BEHEMOTH: LA LITURGIA DEL FUEGO EN WACKEN OPEN AIR',
                                    venue: 'WACKEN, ALEMANIA (MAIN STAGE)',
                                    date: '03 AGOSTO 2024',
                                    photographer: 'M. LINDQVIST',
                                    image: ASSETS.concertPyro,
                                    exif: 'LEICA SL2-S · 35MM f/1.4 · ISO 3200 · 1/500s',
                                })
                            }
                            className="w-full bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest py-3.5 px-5 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            <Eye className="w-4 h-4" /> EXPLORAR LAS 64 FOTOS EN HD
                        </button>
                    </div>
                </div>
            </div>
            {/* LIGHTBOX MODAL */}
            {lightboxItem && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="max-w-3xl w-full border border-zinc-800 bg-[#0B0B0E] overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                            <div>
                                <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                                    VISOR DE NEGATIVOS RAW // {lightboxItem.venue} ({lightboxItem.date})
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
                                src={lightboxItem.image}
                                alt={lightboxItem.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="px-6 py-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                            <div className="text-zinc-400">
                                FOTÓGRAFO: <span className="text-white font-bold">{lightboxItem.photographer}</span>{' '}
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