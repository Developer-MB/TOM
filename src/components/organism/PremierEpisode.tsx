import React, { useState } from 'react'
import { ASSETS } from '@/src/data/mockData'
import { Pause, Play, Volume2 } from 'lucide-react';

const CHAPTER_MARKERS = [
    { time: '00:00', title: 'Intro: La filosofía del caos analógico en las catacumbas' },
    { time: '14:22', title: 'El mito de la producción limpia vs. la hostilidad orgánica' },
    { time: '38:45', title: 'Grabando baterías sin triggers ni reemplazo de muestras' },
    { time: '01:05:10', title: 'Amplificadores de válvulas modificados y gabinetes 4x12' },
    { time: '01:39:00', title: 'El futuro del vinilo extremo y cierre del episodio' },
];

type PremierEpisodeProps = {
    onTogglePlay: () => void;
};

export const PremierEpisode: React.FC<PremierEpisodeProps> = ({ onTogglePlay }) => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [activeChapter, setActiveChapter] = useState(0);
    const [activeEpisodeTitle, setActiveEpisodeTitle] = useState(
        'EP. #48: ARQUITECTURA DE LA DISONANCIA Y EL SONIDO DEL ABISMO'
    );
    const [activeEpisodeGuest, setActiveEpisodeGuest] = useState(
        'INVITADO ESPECIAL: LUC LEMAY (GORGUTS) & ERIK RUTAN (CANNIBAL CORPSE / MANA RECORDING)'
    );
    return (
        <div className="border border-zinc-800 bg-[#0E0E12]">
            <div className="grid grid-cols-1 lg:grid-cols-8">
                {/* Left 8 Cols: 4K Video Cinema Player */}
                <div className="lg:col-span-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800">
                    <div className="relative aspect-video bg-black overflow-hidden group">
                        <img
                            src={ASSETS.studioPodcast}
                            alt="Bunker Studio Podcast"
                            className={`w-full h-full object-cover transition-transform duration-700 ${isVideoPlaying ? 'scale-105 opacity-75' : 'opacity-85 group-hover:scale-102'
                                }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-black/30 to-black/50" />

                        {/* Top Status Bar */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> ESTRENO DE TEMPORADA
                                </span>
                            </div>
                        </div>

                        {/* Center Play Trigger */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button
                                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                                className="w-20 h-20 sm:w-24 sm:h-24 bg-[#DC2626]/95 hover:bg-[#DC2626] text-white flex items-center justify-center border-2 border-white/20 shadow-2xl transition-transform hover:scale-105 cursor-pointer"
                                aria-label="Reproducir Videopodcast"
                            >
                                {isVideoPlaying ? (
                                    <Pause className="w-10 h-10 fill-current" />
                                ) : (
                                    <Play className="w-10 h-10 fill-current ml-1" />
                                )}
                            </button>
                        </div>

                        {/* Bottom Player Scrubber Overlay */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 sm:p-6">
                            <div className="flex items-center justify-between font-mono text-[11px] text-zinc-300 mb-2">
                                <span>
                                    {isVideoPlaying ? 'REPRODUCIENDO EN 4K STUDIO STREAM...' : 'LISTO PARA REPRODUCIR'}
                                </span>
                                <span>
                                    {CHAPTER_MARKERS[activeChapter].time} / 02:14:08
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 overflow-hidden mb-3">
                                <div
                                    className="h-full bg-[#DC2626] transition-all duration-300"
                                    style={{ width: `${(activeChapter + 1) * 20}%` }}
                                />
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                                        className="font-mono text-xs font-bold uppercase tracking-wider text-white hover:text-[#DC2626] flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {isVideoPlaying ? (
                                            <>
                                                <Pause className="w-4 h-4 text-[#DC2626]" /> PAUSAR VIDEO
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 text-[#DC2626]" /> REPRODUCIR EPISODIO
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={onTogglePlay}
                                        className="font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Volume2 className="w-4 h-4 text-zinc-400" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
                                    <span>SUBTÍTULOS: ES / EN</span>
                                    <span>·</span>
                                    <span className="text-emerald-400">60 FPS</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Episode Meta Description Below Player */}
                    <div className="p-6 sm:p-8 bg-[#0B0B0E]">
                        <div className="font-mono text-xs font-bold text-[#DC2626] uppercase tracking-wider mb-1">
                            {activeEpisodeGuest}
                        </div>
                        <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white mb-3">
                            {activeEpisodeTitle}
                        </h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Reunimos en nuestro búnker de grabación a dos titanes absolutos de la vanguardia y la brutalidad sonora. Durante más de dos horas desglosamos el uso de disonancias cuartales, la microfonía de gabinetes en estudios legendarios y por qué la imperfección humana sigue siendo el arma más letal del metal extremo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PremierEpisode