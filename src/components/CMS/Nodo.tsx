import React from 'react'
import { Server } from 'lucide-react'

const Nodo = () => {
    return (
        <div className="border border-zinc-800 bg-[#0E0E12] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#DC2626]" /> NODO ICECAST FLAC
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-2.5 font-mono text-xs">
                <div className="flex justify-between">
                    <span className="text-zinc-500">SERVIDOR MASTER:</span>
                    <span className="text-zinc-200">ESTOCOLMO-01</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">UPTIME STREAM:</span>
                    <span className="text-emerald-400 font-bold">99.98% (412 DÍAS)</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">CARGA CPU / DSP:</span>
                    <span className="text-zinc-200">18.4% @ 96kHz</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">ANCHO DE BANDA:</span>
                    <span className="text-[#DC2626] font-bold">1.94 Gbps</span>
                </div>
            </div>
        </div>
    )
}

export default Nodo