import React from 'react';
import { SectionId } from '../../data/mockData';
import { Disc, Radio, Send, ShoppingBag } from 'lucide-react';
import { ASSETS } from '@/src/data/Assets';

interface HeadSectionProps {
    onSelectSection: (section: SectionId) => void;
}

export const HeadHome: React.FC<HeadSectionProps> = ({ onSelectSection }) => {
    return (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
                <h1 className="font-display font-extrabold text-xl sm:text-4xl lg:text-[48px] leading-[0.96] tracking-tight uppercase">
                    <img
                        src={ASSETS.logoRed2}
                        alt="TOM Logo"
                        className="w-full max-w-[220px] sm:max-w-[300px] lg:max-w-[360px] h-auto object-contain"
                    />
                </h1>

                <p className="text-[#a1a1aa] text-sm sm:text-base max-w-2xl leading-relaxed">
                    "Un espacio hecho por y para fans del metal" · Crítica especializada, cobertura fotográfica desde el foso, radio 24/7 y tienda oficial.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                        type="button"
                        onClick={() => onSelectSection('resenas')}
                        className="flex items-center gap-2 px-5 py-3 bg-[#dc2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                    >
                        <Disc className="w-4 h-4" />
                        <span>EXPLORAR LANZAMIENTOS</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectSection('radio')}
                        className="flex items-center gap-2 px-5 py-3 bg-[#121214] hover:bg-[#18181b] text-[#f4f4f5] border border-[#3f3f46] hover:border-[#dc2626] font-mono text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                    >
                        <Radio className="w-4 h-4 text-[#dc2626]" />
                        <span>RADIO EN VIVO 24/7</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectSection('merch')}
                        className="flex items-center gap-2 px-5 py-3 bg-[#121214] hover:bg-[#18181b] text-[#f4f4f5] border border-[#3f3f46] hover:border-[#71717a] font-mono text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                    >
                        <ShoppingBag className="w-4 h-4 text-[#a1a1aa]" />
                        <span>TIENDA MERCH</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectSection('contacto')}
                        className="flex items-center gap-2 px-5 py-3 bg-[#121214] hover:bg-[#18181b] text-[#f4f4f5] border border-[#3f3f46] hover:border-[#71717a] font-mono text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer"
                    >
                        <Send className="w-4 h-4 text-[#a1a1aa]" />
                        <span>ENVIAR DEMO / PRENSA</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeadHome;
