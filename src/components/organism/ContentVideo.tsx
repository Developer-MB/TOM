import React from 'react'
import { ASSETS } from '../../data/mockData'
import { Clock, Pause, Play } from 'lucide-react';

interface ContentVideoProps {
    podcastPlaying: boolean;
    setPodcastPlaying: (playing: boolean) => void;
}

export const ContentVideo: React.FC<ContentVideoProps> = ({
    podcastPlaying, setPodcastPlaying
}) => {
    return (
        <div className="bg-[#121214] border border-[#27272a] rounded-sm p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Video Frame (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
                <div className="relative aspect-video bg-[#09090b] border border-[#27272a] rounded-sm overflow-hidden group">
                    <img
                        src={ASSETS.studioPodcast}
                        alt="Videopodcast Oficial"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <button
                            onClick={() => setPodcastPlaying(!podcastPlaying)}
                            className="w-16 h-16 rounded-sm bg-[#dc2626] hover:bg-[#ef4444] text-white flex items-center justify-center crimson-glow transition-transform hover:scale-105 cursor-pointer"
                        >
                            {podcastPlaying ? (
                                <Pause className="w-7 h-7 fill-current" />
                            ) : (
                                <Play className="w-7 h-7 fill-current ml-1" />
                            )}
                        </button>
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[10px]">
                        <span className="px-2 py-0.5 bg-[#dc2626] text-white font-bold uppercase rounded-sm">
                            EPISODIO 42
                        </span>
                        <span className="px-2 py-0.5 bg-[#09090b]/80 border border-[#3f3f46] text-[#e4e4e7] rounded-sm">
                            4K ULTRA HD
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-[#71717a]">
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Duración: 1h 14m 20s
                    </span>
                    <span>Capítulo 3 / 6: &quot;El culto a la producción analógica&quot;</span>
                </div>
            </div>

            {/* Right Info (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
                <div className="font-mono text-[10px] text-[#ef4444] uppercase tracking-widest flex items-center gap-2">
                    <span>▶ VIDEOPODCAST OFICIAL</span>
                </div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase leading-tight">
                    EL RESURGIMIENTO DEL DEATH METAL OLD SCHOOL: ¿NOSTALGIA O AUTENTICIDAD?
                </h2>
                <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                    Nos adentramos con productores e historiadores en el fenómeno de las nuevas bandas que desechan los triggers digitales para abrazar el polvo de cinta y los riffs podridos de 1989.
                </p>

                {/* Key topics box */}
                <div className="bg-[#18181b] border border-[#27272a] rounded-sm p-4 space-y-2.5">
                    <span className="font-mono text-[10px] font-bold text-[#ef4444] uppercase tracking-wider block">
                        TEMAS CLAVE DEL EPISODIO:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#e4e4e7]">
                        <li className="flex items-start gap-2">
                            <span className="text-[#dc2626] mt-0.5">•</span>
                            <span>El impacto del pedal Boss HM-2 en la juventud europea actual.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#dc2626] mt-0.5">•</span>
                            <span>Democratización del cassette: ¿Por qué las cintas superan al vinilo en ventas clandestinas?</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-[#dc2626] mt-0.5">•</span>
                            <span>Debate: La sobreproducción moderna frente a la crudeza de Morrisound Recording.</span>
                        </li>
                    </ul>
                </div>

                {/* Guests */}
                <div className="pt-1 flex flex-wrap items-center gap-2 font-mono text-[10px]">
                    <span className="text-[#71717a] uppercase">INVITADOS:</span>
                    <span className="px-2.5 py-1 bg-[#18181b] border border-[#27272a] text-[#e4e4e7] rounded-sm">
                        Dan Swanö (Audio Master)
                    </span>
                    <span className="px-2.5 py-1 bg-[#18181b] border border-[#27272a] text-[#e4e4e7] rounded-sm">
                        Luc Lemay (Gorguts)
                    </span>
                </div>
            </div>
        </div>
    )
}

export default ContentVideo