import React from 'react'
import { AudioTrack, SectionId } from '../../data/mockData';
import { Disc, Radio } from 'lucide-react';
import { ASSETS } from '@/src/data/Assets'

interface HeadSectionProps {
    currentTrack: AudioTrack;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onSelectSection: (section: SectionId) => void;
    onPlayCustomTrack: (track: Partial<AudioTrack>) => void;
}

export const HeadHome: React.FC<HeadSectionProps> = ({
    currentTrack,
    isPlaying,
    onTogglePlay,
    onSelectSection,
}) => {
    const spectrumBars = [45, 72, 60, 88, 95, 70, 55, 82, 92, 64, 78, 85, 50, 90, 68, 42];

    return (
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Column (7 cols) */}
                <div className="lg:col-span-7">
                    <h1 className="font-display font-extrabold text-xl sm:text-4xl lg:text-[48px] leading-[0.96] tracking-tight uppercase">
                        <img src={ASSETS.logoRed2} alt="TOM Logo" className="w-48 sm:w-64 lg:w-80" />
                    </h1>

                    <p className="text-[#a1a1aa] text-sm sm:text-base max-w-2xl leading-relaxed">
                        "Un espacio hecho por y para fans del metal"
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                            onClick={() => {
                                onTogglePlay();
                            }}
                            className="flex items-center gap-2.5 px-5 py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-sm crimson-glow transition-all cursor-pointer"
                        >
                            <Radio className="w-4 h-4" />
                            <span>{isPlaying ? 'PAUSAR RADIO [192 KBPS]' : 'SINTONIZAR RADIO [192 KBPS]'}</span>
                        </button>

                        <button
                            onClick={() => onSelectSection('resenas')}
                            className="flex items-center gap-2 px-5 py-3 bg-[#121214] hover:bg-[#18181b] text-[#f4f4f5] border border-[#3f3f46] hover:border-[#71717a] font-mono text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                        >
                            <Disc className="w-4 h-4 text-[#a1a1aa]" />
                            <span>EXPLORAR LANZAMIENTOS</span>
                        </button>
                    </div>

                    {/* Telemetry Micro Bar */}
                    <div className="pt-2 flex flex-wrap items-center gap-6 font-mono text-[11px] text-[#71717a]">
                        <span className="flex items-center gap-1.5">
                            <span className="text-[#ef4444]">((•))</span>
                            <strong className="text-[#e4e4e7]">666</strong> Oyentes Activos
                        </span>
                        <span>• Latencia: <strong className="text-[#e4e4e7]">666ms</strong></span>
                        <span>• Codec: <strong className="text-[#e4e4e7]">Direct Stream FLAC/Opus</strong></span>
                    </div>
                </div>

                {/* Right Column: Cabina Central en Directo Card (5 cols) */}
                <div className="lg:col-span-5">
                    <div className="bg-[#121214] border border-[#27272a] rounded-sm p-5 space-y-5 shadow-2xl relative">
                        {/* Top Header */}
                        <div className="flex items-center justify-between border-b border-[#27272a] pb-3 font-mono text-[10px] uppercase tracking-wider">
                            <span className="flex items-center gap-2 text-[#f4f4f5] font-semibold">
                                <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
                                RADIO EN DIRECTO
                            </span>
                        </div>

                        {/* Host & Show Info */}
                        <div className="flex items-center gap-4">
                            <div className="relative w-40 h-40 rounded-sm overflow-hidden border border-[#3f3f46] shrink-0">
                                <img
                                    src={currentTrack.cover}
                                    alt={`${currentTrack.artist} - ${currentTrack.title}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="font-mono text-[14px] text-[#ef4444] uppercase tracking-wider block">
                                    {currentTrack.artist}
                                </span>
                                <h3 className="font-display font-bold text-lg text-white leading-tight">
                                    {currentTrack.title}
                                </h3>
                            </div>
                        </div>

                        {/* Frequency Monitor Box */}
                        <div className="bg-[#09090b] border border-[#27272a] rounded-sm p-3.5 space-y-3">
                            <div className="h-10 flex items-end gap-1.5 pt-2">
                                {spectrumBars.map((val, idx) => (
                                    <div
                                        key={idx}
                                        className="flex-1 bg-gradient-to-t from-[#991b1b] to-[#ef4444] rounded-t-[1px] transition-all duration-300"
                                        style={{
                                            height: isPlaying ? `${val}%` : `${Math.max(20, val * 0.4)}%`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeadHome