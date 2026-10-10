import React from 'react'
import { UPCOMING_TOURS } from '@/src/data/mockData'
import { MapPin } from 'lucide-react'

const NextTour = () => {
    return (
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mt-1">
                        PRÓXIMOS EVENTOS &amp; GIRAS
                    </h2>
                </div>
            </div>

            <div className="space-y-3">
                {UPCOMING_TOURS.map((tour) => (
                    <div
                        key={tour.id}
                        className="bg-[#121214] border border-[#27272a] hover:border-[#3f3f46] rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-[#18181b] border border-[#27272a] rounded-sm flex flex-col items-center justify-center font-mono shrink-0">
                                <span className="text-[9px] text-[#ef4444] uppercase font-bold">
                                    {tour.month}
                                </span>
                                <span className="text-lg font-extrabold text-white leading-none my-0.5">
                                    {tour.day}
                                </span>
                                <span className="text-[9px] text-[#71717a]">{tour.year}</span>
                            </div>
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h3 className="font-display font-bold text-base sm:text-lg text-white">
                                        {tour.title}
                                    </h3>
                                    <span className="px-2 py-0.5 bg-[#18181b] border border-[#3f3f46] font-mono text-[10px] text-[#ef4444] rounded-sm">
                                        {tour.badge}
                                    </span>
                                </div>
                                <p className="font-mono text-xs text-[#a1a1aa] flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#71717a]" />
                                    <span>
                                        {tour.venue} • {tour.doors}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                            <span
                                className={`font-mono text-[10px] px-2.5 py-1 rounded-sm border uppercase ${tour.statusUrgent
                                    ? 'bg-[#dc2626]/15 border-[#991b1b] text-[#ef4444]'
                                    : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa]'
                                    }`}
                            >
                                {tour.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NextTour