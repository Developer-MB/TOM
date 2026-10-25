import type { FC } from 'react';
import { ASSETS } from '@/src/data/Assets';
import Filter, { type ReviewFilters } from '../Reviews/Filter';

interface HeadRecProps {
    filters: ReviewFilters;
    onFiltersChange: (filters: ReviewFilters) => void;
}

const HeadRec: FC<HeadRecProps> = ({ filters, onFiltersChange }) => {
    return (
        <div className="max-w-[1440px] mx-auto px-4 space-y-12">
            {/* HERO HEADER + METRICS BOX */}

            <div className="flex flex-col lg:flex-row lg:items-end justify-center">
                <img src={ASSETS.logoTONM}
                    alt="Time of New Music Logo"
                    className="w-100 sm:w-64 lg:w-96"
                />
            </div>


            {/* SEARCH & GENRE FILTER BAR */}
            <div className="bg-[#121214] border border-[#27272a] rounded-sm p-4 space-y-4">
                <Filter filters={filters} onFiltersChange={onFiltersChange} />
            </div>
        </div>
    )
}

export default HeadRec