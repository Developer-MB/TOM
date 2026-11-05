import React, { useEffect, useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import {
    formatTourMonth,
    INITIAL_CMS_TOURS,
    UPCOMING_TOURS,
    type HomeTour,
} from '@/src/data/HomeTours';
import type { SectionId } from '@/src/data/mockData';
import { readJsonResponseOrFallback } from '@/src/data/readJsonResponse';

interface NextTourProps {
    onSelectSection?: (section: SectionId) => void;
    showAll?: boolean;
}

const NextTour: React.FC<NextTourProps> = ({ onSelectSection, showAll = false }) => {
    const [allTours, setAllTours] = useState<HomeTour[]>(UPCOMING_TOURS);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const loadTours = async () => {
            try {
                const response = await fetch('/api/home/tours', { signal: controller.signal });
                const publishedTours = await readJsonResponseOrFallback<HomeTour[]>(
                    response,
                    'No se pudieron cargar las giras publicadas.',
                    INITIAL_CMS_TOURS.filter((tour) => tour.status === 'PUBLICADO'),
                );
                if (!Array.isArray(publishedTours)) {
                    throw new Error('El servidor devolvió una lista de giras no válida.');
                }
                setAllTours(publishedTours);
                setLoadError(null);
            } catch (error) {
                if (controller.signal.aborted) return;
                setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar las giras publicadas.');
            }
        };

        void loadTours();
        return () => controller.abort();
    }, []);

    const tours = showAll ? allTours : allTours.slice(0, 3);

    return (
        <div
            id={showAll ? 'eventos' : undefined}
            className={showAll ? 'max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6' : 'w-full space-y-6'}
        >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
                        PRÓXIMOS EVENTOS &amp; GIRAS
                    </h2>
                </div>
            </div>

            <div className="space-y-3 pb-16 sm:pb-20">
                {loadError && (
                    <p role="alert" className="border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                        {loadError} Se muestran las giras incluidas en el sitio.
                    </p>
                )}
                {tours.map((tour) => (
                    <div
                        key={tour.id}
                        className="bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                    >
                        <div className="flex items-start sm:items-center gap-4 min-w-0">
                            <div className="w-14 h-14 bg-[#18181b] border border-[#27272a] rounded-sm flex flex-col items-center justify-center font-mono shrink-0">
                                <span className="text-[9px] text-[#ef4444] uppercase font-bold">
                                    {formatTourMonth(tour.month)}
                                </span>
                                <span className="text-lg font-extrabold text-white leading-none my-0.5">
                                    {tour.day}
                                </span>
                                <span className="text-[9px] text-[#71717a]">{tour.year}</span>
                            </div>
                            <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-display font-bold text-base sm:text-lg text-white">
                                        {tour.band}
                                    </h3>
                                    <span className="px-2 py-0.5 bg-[#18181b] border border-[#3f3f46] font-mono text-[10px] text-[#ef4444] rounded-sm">
                                        {tour.tourName}
                                    </span>
                                </div>
                                <p className="font-mono text-xs text-[#a1a1aa] flex flex-wrap items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
                                    <span className="break-words">
                                        {tour.venue}{tour.info ? ` • ${tour.info}` : ''}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                            <span
                                className={`font-mono text-[10px] px-2.5 py-1 rounded-sm border uppercase ${
                                    tour.ticketsLow
                                        ? 'bg-[#dc2626]/15 border-[#991b1b] text-[#ef4444]'
                                        : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa]'
                                }`}
                            >
                                {tour.ticketsInfo || 'INFORMACIÓN PRÓXIMAMENTE'}
                            </span>
                        </div>
                    </div>
                ))}
                {!showAll && onSelectSection && (
                    <div className="flex justify-end pt-2">
                        <a
                            href="#eventos"
                            onClick={(event) => {
                                event.preventDefault();
                                onSelectSection('eventos');
                            }}
                            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#a1a1aa] hover:text-white transition-colors"
                        >
                            VER TODOS LOS EVENTOS
                            <ArrowRight className="h-4 w-4 text-[#ef4444]" />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NextTour;
