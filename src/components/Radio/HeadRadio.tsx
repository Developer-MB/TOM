import React from 'react';
import { Activity, Users } from 'lucide-react';
import { ASSETS } from '../../data/Assets';

const HeadRadio = () => {
    return (
        <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex flex-col items-start gap-4">
                <span className="bg-[#DC2626] text-white font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" /> SEÑAL EN VIVO
                </span>
                <img
                    src={ASSETS.logoRadio}
                    alt="Time of Metal Radio"
                    className="w-full max-w-[260px] sm:max-w-[340px] lg:max-w-[400px] h-auto object-contain"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-3 lg:justify-end w-full lg:w-auto">
                <div className="min-h-[72px] border border-zinc-800 bg-[#0E0E12] px-4 py-3 flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#DC2626] shrink-0" />
                    <div>
                        <div className="font-display font-black text-xl text-white leading-none">
                            666
                        </div>
                        <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-1">
                            OYENTES ACTIVOS
                        </div>
                    </div>
                </div>
                <div className="min-h-[72px] border border-zinc-800 bg-[#0E0E12] px-4 py-3 flex items-center gap-3">
                    <Activity className="w-5 h-5 text-emerald-500 shrink-0" />
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
    );
};

export default HeadRadio;
