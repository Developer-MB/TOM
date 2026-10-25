import type { FC } from 'react';
import { ASSETS } from '@/src/data/Assets';
import Filter, { type ReviewFilters } from '../Reviews/Filter';

interface HeadRecProps {
    filters: ReviewFilters;
    onFiltersChange: (filters: ReviewFilters) => void;
}

const HeadRec: FC<HeadRecProps> = ({ filters, onFiltersChange }) => {
    return (
        <div className="max-w-[1440px] mx-auto px-4 pt-6 space-y-12">
            {/* HERO HEADER + METRICS BOX */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-8 space-y-4">
                    <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight uppercase leading-none">
                        <img src={ASSETS.logoTONM}
                            alt="Time of New Music Logo"
                            className="w-100 pb-10 sm:w-64 lg:w-80"
                        />
                    </h1>
                    <p className="text-sm sm:text-base text-[#a1a1aa] max-w-xl leading-relaxed">
                        Desmenuzamos la arquitectura sonora y contundencia técnica de la música extrema y el underground internacional.
                    </p>
                </div>

                <div className="lg:col-span-4 bg-[#121214] border border-[#27272a] rounded-sm p-5 grid grid-cols-3 divide-x divide-[#27272a] text-center">
                    <div className="px-2">
                        <span className="font-mono text-[9px] text-[#71717a] uppercase block">PROMEDIO MES</span>
                        <span className="font-display font-extrabold text-2xl text-white mt-1 block">8.6</span>
                    </div>
                    <div className="px-2">
                        <span className="font-mono text-[9px] text-[#71717a] uppercase block">PERFECCIÓN (10/10)</span>
                        <span className="font-display font-extrabold text-2xl text-[#dc2626] mt-1 block">03</span>
                    </div>
                    <div className="px-2">
                        <span className="font-mono text-[9px] text-[#71717a] uppercase block">NEFASTOS (&lt;4.0)</span>
                        <span className="font-display font-extrabold text-2xl text-white mt-1 block">12</span>
                    </div>
                </div>
            </div>

            {/* SEARCH & GENRE FILTER BAR */}
            <div className="bg-[#121214] border border-[#27272a] rounded-sm p-4 space-y-4">
                <Filter filters={filters} onFiltersChange={onFiltersChange} />
            </div>
        </div>
    )
}

export default HeadRec