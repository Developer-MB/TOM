import React from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { SectionId } from '../../data/mockData'

interface HeadCMSProps {
    onSelectSection: (section: SectionId) => void;
}

const HeadCMS: React.FC<HeadCMSProps> = ({ onSelectSection }) => {
    return (
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
                <div className="w-9 h-9 bg-[#DC2626] flex items-center justify-center text-white">
                    <Shield className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <h1 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
                        TIME OF METAL — CMS
                    </h1>
                </div>
            </div>

            <div className="flex flex-col items-end gap-3">
                <span className="bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 font-mono text-[9px] uppercase px-2 py-0.5">
                    NODO ACTIVO
                </span>
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