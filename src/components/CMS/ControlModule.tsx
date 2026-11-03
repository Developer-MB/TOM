import React, { useState } from 'react'
import {
    Activity,
    Disc,
    Mic,
    Camera,
    Radio,
} from 'lucide-react'

interface ControlModuleProps {
    recommendationCount: number;
    videoCount: number;
    galleryCount: number;
}

const ControlModule: React.FC<ControlModuleProps> = ({
    recommendationCount,
    videoCount,
    galleryCount,
}) => {
    const [activeNav, setActiveNav] = useState('PANEL CENTRAL');
    return (
        <div className="border border-zinc-800 bg-[#0E0E12] p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 px-3 pb-3 mb-2 border-b border-zinc-800">
                MÓDULOS DE CONTROL
            </div>
            <nav className="space-y-1">
                {[
                    { label: 'PANEL CENTRAL', icon: Activity, count: 'LIVE' },
                    { label: 'RECOMENDACIONES', icon: Disc, count: recommendationCount },
                    { label: 'VIDEOPODCAST', icon: Mic, count: videoCount },
                    { label: 'GALERÍAS', icon: Camera, count: galleryCount },
                    { label: 'CABINA RADIO 24/7', icon: Radio, count: 'ON AIR', disableHover: true },
                ].map((nav) => {
                    const Icon = nav.icon;
                    const active = activeNav === nav.label;
                    return (
                        <button
                            key={nav.label}
                            onClick={() => setActiveNav(nav.label)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer ${active
                                    ? 'bg-[#DC2626] text-white font-bold'
                                    : `text-zinc-400 ${nav.disableHover ? '' : 'hover:bg-zinc-900 hover:text-white'}`
                                }`}
                        >
                            <span className="flex items-center gap-2.5 truncate">
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{nav.label}</span>
                            </span>
                            {nav.count !== '' && (
                                <span
                                    className={`text-[10px] px-1.5 py-0.5 ${active
                                            ? 'bg-black/30 text-white'
                                            : 'bg-[#070709] text-zinc-500 border border-zinc-800'
                                        }`}
                                >
                                    {nav.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    )
}

export default ControlModule