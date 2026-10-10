import React from 'react'
import { ArrowRight } from 'lucide-react'
import { SectionId } from '../../data/mockData';

interface HeadResniasProps {
    onSelectSection: (section: SectionId) => void;
}

export const HeadResenias: React.FC<HeadResniasProps> = ({ onSelectSection }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
                    RESEÑAS DE DISCOS DESTACADAS
                </h2>
            </div>
            <button
                onClick={() => onSelectSection('cms')}
                className="font-mono text-xs text-[#a1a1aa] hover:text-white flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
            >
                <span>ARCHIVO PERIODÍSTICO COMPLETO</span>
                <ArrowRight className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}

export default HeadResenias