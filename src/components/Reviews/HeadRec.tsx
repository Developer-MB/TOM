import type { FC } from 'react';
import { ASSETS } from '@/src/data/Assets';
import Filter, { type ReviewFilters } from '../Reviews/Filter';
import type { CmsPostItem } from '@/src/data/Cms';

interface HeadRecProps {
    reviews: CmsPostItem[];
    filters: ReviewFilters;
    onFiltersChange: (filters: ReviewFilters) => void;
}

const HeadRec: FC<HeadRecProps> = ({ reviews, filters, onFiltersChange }) => {
    return (
        <div className="w-full space-y-8 sm:space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-center">
                <img
                    src={ASSETS.logoTONM2}
                    alt="Time of New Music Logo"
                    className="w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[400px] h-auto object-contain"
                />
            </div>

            {/* SEARCH & GENRE FILTER BAR */}
            <div className="bg-[#121214] border border-[#27272a] rounded-sm p-4 sm:p-5 space-y-4">
                <Filter reviews={reviews} filters={filters} onFiltersChange={onFiltersChange} />
            </div>
        </div>
    );
};

export default HeadRec;
