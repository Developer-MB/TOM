import React from 'react'
import { ASSETS, SectionId } from '@/src/data/mockData';
import { Camera } from 'lucide-react';

interface ContentGalleryProps {
    onSelectSection: (section: SectionId) => void;
}

const ContentGallery = ({ onSelectSection }: ContentGalleryProps) => {
    return (
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#ef4444]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                        <span>DESDE EL FOSO DEL MOSHPIT</span>
                    </div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
                        GALERÍA DE CONCIERTOS
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
                {[
                    {
                        festival: 'BRUTAL ASSAULT FESTIVAL',
                        date: '14 OCT 2024',
                        title: 'Gorgoroth en Llamas en el Escenario Principal',
                        credit: 'Fotografía por Javier R. • Foso Exclusivo',
                        img: ASSETS.concertPyro,
                    },
                    {
                        festival: 'CIRCO VOLADOR (CDMX)',
                        date: '02 NOV 2024',
                        title: 'Rotting Christ: El Moshpit Ritual del Inframundo',
                        credit: 'Fotografía por Elena S. • Cobertura LATAM',
                        img: ASSETS.studioPodcast,
                    },
                    {
                        festival: 'WACKEN OPEN AIR',
                        date: '08 AGO 2024',
                        title: 'La Quema Sagrada: Clausura de los Escenarios Faster & Harder',
                        credit: 'Fotografía por M. Lindqvist • Prensa Internacional',
                        img: ASSETS.concertPyro,
                    },
                ].map((item, idx) => (
                    <div
                        key={idx}
                        onClick={() => onSelectSection('galeria')}
                        className="bg-[#121214] border border-[#27272a] hover:border-[#dc2626] rounded-sm overflow-hidden group cursor-pointer transition-colors"
                    >
                        <div className="h-52 overflow-hidden bg-[#18181b]">
                            <img
                                src={item.img}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-5 space-y-2">
                            <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                                <span className="text-[#ef4444] font-semibold">{item.festival}</span>
                                <span className="text-[#71717a]">{item.date}</span>
                            </div>
                            <h3 className="font-display font-bold text-base text-white group-hover:text-[#ef4444] transition-colors">
                                {item.title}
                            </h3>
                            <p className="font-mono text-[11px] text-[#71717a]">{item.credit}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ContentGallery