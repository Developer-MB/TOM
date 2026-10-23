import React from 'react'
import { ArrowRight } from 'lucide-react'
import { SectionId } from '../../data/mockData';
import { ASSETS } from '@/src/data/Assets';


interface HeadResniasProps {
    onSelectSection: (section: SectionId) => void;
}

export const HeadResenias: React.FC<HeadResniasProps> = ({ onSelectSection }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between">
            <div>
                <img src={ASSETS.logoTONM}
                    alt="Time of New Music Logo"
                    className="w-48 sm:w-64 lg:w-80"
                />
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