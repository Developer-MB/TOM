import React from 'react';
import type { CmsPostType } from '../../data/Cms';

type CmsFilterType = CmsPostType | 'TODOS';

interface HeadPubliRegisterProps {
    count: number;
    filterType: CmsFilterType;
    onFilterChange: (filterType: CmsFilterType) => void;
}

const FILTER_TYPES: CmsFilterType[] = ['TODOS', 'RESEÑA', 'PODCAST', 'CRÓNICA', 'NOTICIA'];

const HeadPubliRegister: React.FC<HeadPubliRegisterProps> = ({
    count,
    filterType,
    onFilterChange,
}) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-zinc-800">
        <div>
            <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                // REGISTRO DE PUBLICACIONES
            </span>
            <h2 className="font-display font-black text-2xl uppercase text-white">
                COLA EDITORIAL ACTIVA ({count})
            </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            {FILTER_TYPES.map((type) => (
                <button
                    key={type}
                    type="button"
                    onClick={() => onFilterChange(type)}
                    aria-pressed={filterType === type}
                    className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider border transition-colors cursor-pointer ${filterType === type
                        ? 'bg-[#DC2626] text-white border-[#DC2626] font-bold'
                        : 'bg-[#070709] text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                >
                    {type}
                </button>
            ))}
        </div>
    </div>
);

export default HeadPubliRegister;
