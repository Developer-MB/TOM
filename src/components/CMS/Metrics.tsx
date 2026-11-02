import React from 'react'

const Metrics = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-zinc-800 bg-[#0E0E12] p-5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    LECTORES MENSUALES
                </div>
                <div className="font-display font-black text-3xl text-white">284.6K</div>
                <div className="font-mono text-[10px] text-emerald-400 mt-1">
                    +14.2% VS MES ANTERIOR
                </div>
            </div>

            <div className="border border-zinc-800 bg-[#0E0E12] p-5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    RESEÑAS PUBLICADAS
                </div>
                <div className="font-display font-black text-3xl text-white">318</div>
                <div className="font-mono text-[10px] text-zinc-400 mt-1">
                    PROMEDIO GLOBAL: 8.4 / 10
                </div>
            </div>

            <div className="border border-zinc-800 bg-[#0E0E12] p-5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    OYENTES PICO RADIO
                </div>
                <div className="font-display font-black text-3xl text-[#DC2626]">1,428</div>
                <div className="font-mono text-[10px] text-zinc-300 mt-1">
                    82% EN STREAM FLAC LOSSLESS
                </div>
            </div>

            <div className="border border-zinc-800 bg-[#0E0E12] p-5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    ARCHIVO FOTOGRÁFICO
                </div>
                <div className="font-display font-black text-3xl text-white">6,410</div>
                <div className="font-mono text-[10px] text-amber-400 mt-1">
                    148 FESTIVALES & GIRAS
                </div>
            </div>
        </div>
    )
}

export default Metrics