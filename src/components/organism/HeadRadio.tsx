import React from 'react'
import { Activity, Users } from 'lucide-react'

const HeadRadio = () => {
    return (
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-8 pb-6">
            <div className="flex items-center gap-3 mb-3">
                <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" /> SEÑAL EN VIVO
                </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-5xl uppercase tracking-tight leading-[0.92] text-white">
                LA FRECUENCIA DEL <span className="text-[#DC2626]">ABISMO</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl pb-6 mt-3 leading-relaxed">
                Emisora dedicada exclusivamente al underground mundial, prensas originales en vinilo y sesiones en directo. Cero compresión comercial; directo de nuestra consola analógica a tus oídos.
            </p>
            {/* Live Telemetry Counters */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-end">
                <div className="border border-zinc-800 bg-[#0E0E12] px-4 py-3 flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#DC2626]" />
                    <div>
                        <div className="font-display font-black text-xl text-white leading-none">
                            666
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-1">
                            OYENTES ACTIVOS
                        </div>
                    </div>
                </div>
                <div className="border border-zinc-800 bg-[#0E0E12] px-4 py-3 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <div>
                        <div className="font-display font-black text-xl text-emerald-400 leading-none">
                            1411 KBPS
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-1">
                            MASTER FLAC 24-BIT
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeadRadio