import React from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { SectionId } from '../../data/mockData'

interface HeadCMSProps {
    onSelectSection: (section: SectionId) => void;
}

const HeadCMS: React.FC<HeadCMSProps> = ({ onSelectSection }) => {
    return (
        <div>
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#DC2626] flex items-center justify-center text-white">
                    <Shield className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#DC2626]">
                            CONSOLA DE ADMINISTRACIÓN INTERNA // ACCESO NIVEL 01
                        </span>
                        <span className="bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 font-mono text-[9px] uppercase px-2 py-0.5">
                            NODO ACTIVO
                        </span>
                    </div>
                    <h1 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
                        TIME OF METAL — BÚNKER EDITORIAL CMS v4.2
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => onSelectSection('inicio')}
                    className="bg-[#070709] hover:bg-zinc-900 border border-zinc-800 px-4 py-2 font-mono text-xs uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#DC2626]" /> VOLVER AL PORTAL PÚBLICO
                </button>
            </div>
        </div>
    )
}

export default HeadCMS