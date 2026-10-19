import React, { useState } from 'react'
import { ASSETS, AudioTrack } from '@/src/data/mockData';
import { Pause, Play, Radio, Volume2, VolumeX } from 'lucide-react';

interface RadioSectionProps {
    currentTrack: AudioTrack;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onSelectTrack: (track: Partial<AudioTrack>) => void;
}

const ContentRadio = ({ currentTrack, isPlaying, onTogglePlay, onSelectTrack }: RadioSectionProps) => {
    const [volume, setVolume] = useState(88);
    const [isMuted, setIsMuted] = useState(false);
    return (
        <div className="border-2 border-zinc-800 bg-[#0E0E12] relative overflow-hidden">
            {/* Top Technical Bar */}
            <div className="bg-[#09090C] border-b border-zinc-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                        CABINA CDMX
                    </span>
                </div>
            </div>

            {/* Main Console Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left 7 Cols: Turntable & Current Track */}
                <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Vinyl Artwork */}
                        <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0 border border-zinc-700 bg-black overflow-hidden group">
                            <img
                                src={currentTrack.cover}
                                alt={currentTrack.title}
                                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'opacity-80'
                                    }`}
                            />
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 font-mono text-[10px] text-[#DC2626] uppercase tracking-widest mb-3">
                                <Radio className="w-3.5 h-3.5" /> PROGRAMA ACTUAL: LA HORA DE LAS BESTIAS
                            </div>
                            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white leading-none mb-2">
                                {currentTrack.title}
                            </h2>
                            <div className="font-display font-bold text-lg text-[#DC2626] uppercase tracking-wide mb-1">
                                {currentTrack.artist}
                            </div>
                            <div className="font-mono text-xs text-zinc-400 mb-5">
                                ÁLBUM: {currentTrack.album}
                            </div>

                            {/* Animated Spectrum Visualizer Bars */}
                            <div className="bg-[#070709] border border-zinc-800 p-3 mb-4">
                                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-1.5">
                                    <span>ESPECTRO DE FRECUENCIAS (L/R)</span>
                                    <span className="text-emerald-400">PEAK -0.4 dB</span>
                                </div>
                                <div className="h-9 flex items-end gap-1">
                                    {[
                                        45, 78, 92, 60, 85, 95, 70, 50, 88, 96, 64, 72, 90, 55, 80, 94,
                                        68, 42, 76, 89, 62, 84, 91, 58, 73, 86, 65, 48, 77, 60,
                                    ].map((h, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 transition-all duration-300 ${h > 85
                                                ? 'bg-[#DC2626]'
                                                : h > 65
                                                    ? 'bg-amber-500'
                                                    : 'bg-zinc-600'
                                                }`}
                                            style={{
                                                height: isPlaying ? `${h}%` : '18%',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deck Controls Bar */}
                    <div className="pt-6 mt-6 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onTogglePlay}
                                className="bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3.5 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                                {isPlaying ? (
                                    <>
                                        <Pause className="w-4 h-4 fill-current" /> DETENER SEÑAL
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 fill-current" /> CONECTAR SEÑAL EN VIVO
                                    </>
                                )}
                            </button>

                            {/* Volume Control */}
                            <div className="flex items-center gap-2.5 bg-[#070709] border border-zinc-800 px-3.5 py-2.5">
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="text-zinc-400 hover:text-white cursor-pointer"
                                >
                                    {isMuted ? (
                                        <VolumeX className="w-4 h-4 text-[#DC2626]" />
                                    ) : (
                                        <Volume2 className="w-4 h-4" />
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => {
                                        setVolume(Number(e.target.value));
                                        setIsMuted(false);
                                    }}
                                    className="w-24 accent-[#DC2626] cursor-pointer"
                                />
                                <span className="font-mono text-[11px] text-zinc-300 w-8 text-right">
                                    {isMuted ? '0%' : `${volume}%`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right 5 Cols: Active Host & Song Request Box */}
                <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0B0B0E] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-500 pb-3 mb-4 border-b border-zinc-800">
                            <span>EN CABINA AHORA (16:00 - 19:00 CET)</span>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <img
                                src={ASSETS.djRavn}
                                alt="DJ Ravn"
                                className="w-20 h-20 object-cover border border-zinc-700 shrink-0"
                            />
                            <div>
                                <h3 className="font-display font-black text-2xl uppercase text-white">
                                    DJ MANRO
                                </h3>
                                <div className="font-mono text-xs text-[#DC2626] font-bold uppercase mb-1">
                                    BRUTAL ZONE
                                </div>
                                <p className="text-zinc-400 text-xs leading-relaxed">
                                    Seleccionando prensas originales de Osmose Productions, Deathlike Silence y Earache Records (1988–1995).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Request Track Form
              <div className="bg-[#070709] border border-zinc-800 p-5">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#DC2626]" /> SOLICITAR TEMA A CABINA
                </div>
                <p className="text-zinc-400 text-xs mb-3">
                  Envía tu petición directamente al locutor en turno para el bloque de vinilos a petición:
                </p>
                <form onSubmit={handleSendRequest} className="flex gap-2">
                  <input
                    type="text"
                    value={requestInput}
                    onChange={(e) => setRequestInput(e.target.value)}
                    placeholder="Ej: Dissection - Night's Blood (1995)..."
                    className="flex-1 bg-[#0E0E12] border border-zinc-800 focus:border-[#DC2626] px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 transition-colors cursor-pointer shrink-0"
                  >
                    PEDIR
                  </button>
                </form>
                {requestSent && (
                  <p className="font-mono text-[11px] text-emerald-400 mt-2">
                    ✓ PETICIÓN RECIBIDA EN LA CONSOLA DE DJ RAVN.
                  </p>
                )}
              </div> */}
                </div>
            </div>
        </div>
    )
}

export default ContentRadio