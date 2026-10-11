import React, { useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { ASSETS } from '@/src/data/mockData'

const MonthDisc = () => {
    const [selectedReviewModal, setSelectedReviewModal] = useState<string | null>(null);
    return (
        <div>
            <div className="space-y-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
                    <span className="flex items-center gap-2 text-white font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
                        DISCO DEL MES
                    </span>
                    <span className="text-[#a1a1aa] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#dc2626]" />
                        CALIFICACIÓN MÁXIMA CERTIFICADA
                    </span>
                </div>

                <div className="bg-gradient-to-br from-[#18181b] via-[#121214] to-[#1a0a0c] border border-[#3f3f46] rounded-sm p-6 lg:p-8 relative space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        {/* Left Album Cover */}
                        <div className="lg:col-span-5">
                            <div className="relative aspect-square rounded-sm overflow-hidden border border-[#3f3f46] shadow-2xl">
                                <img
                                    src={ASSETS.albumCatacombs}
                                    alt="Catacombs of Eternal Agony"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-3 right-3 bg-[#09090b]/95 border border-[#dc2626] px-3.5 py-2 rounded-sm flex items-center gap-2">
                                    <div>
                                        <span className="font-mono text-[9px] text-[#a1a1aa] uppercase block">VEREDICTO</span>
                                        <span className="font-display font-extrabold text-2xl text-[#dc2626] leading-none">9.8</span>
                                    </div>
                                    <div className="font-mono text-[9px] text-[#e4e4e7] border-l border-[#27272a] pl-2 leading-tight">
                                        / 10<br />OBRA MAESTRA
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Review Details */}
                        <div className="lg:col-span-7 space-y-5">
                            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase text-[#a1a1aa]">
                                <span className="px-2 py-0.5 bg-[#dc2626]/20 border border-[#991b1b] text-[#ef4444] font-semibold rounded-sm">
                                    DEATH METAL CAVERNOSO
                                </span>
                                <span>• 🇸🇪 SUECIA • 2025 • DARK DESCENT RECORDS • 44:12 MIN</span>
                            </div>

                            <div>
                                <span className="font-mono text-xs text-[#a1a1aa] uppercase tracking-[0.15em] block">
                                    MORTUARY VEIL
                                </span>
                                <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white uppercase leading-[0.98] mt-1">
                                    CATACOMBS OF ETERNAL AGONY
                                </h2>
                            </div>

                            <blockquote className="bg-[#09090b]/80 border border-[#27272a] p-4 rounded-sm font-display italic text-sm sm:text-base text-[#e4e4e7]">
                                &ldquo;Un monumento implacable a la putrefacción sónica que redefine el death metal contemporáneo sin sacrificar la asfixia analógica de los 90.&rdquo;
                            </blockquote>

                            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
                                Grabado en cinta de dos pulgadas y mezclado en los legendarios Sunlight Studios, este opus despliega riffs cromáticos pantanosos, dobles bombos cavernosos y un gutural cavernoso que trasciende la mera técnica para convertirse en una liturgia funesta. Cada transición entre el doom claustrofóbico y ráfagas a 240 BPM está milimétricamente cincelada con odio puro.
                            </p>

                        </div>
                    </div>

                </div>
            </div>

            {selectedReviewModal && (
                <div className="bg-[#18181b] border border-[#dc2626] rounded-sm p-5 flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="font-mono text-[10px] text-[#ef4444] uppercase">ARCHIVO EDITORIAL ACTIVO</span>
                        <h4 className="font-display font-bold text-lg text-white">{selectedReviewModal}</h4>
                        <p className="text-xs text-[#a1a1aa]">
                            Ingeniero de mezcla: Tomas Skogsberg • Cinta Ampex 456 2&quot; • Prensado en vinilo 180g por Dark Descent Records.
                        </p>
                    </div>
                    <button
                        onClick={() => setSelectedReviewModal(null)}
                        className="px-3 py-1.5 bg-[#dc2626] text-white font-mono text-xs uppercase rounded-sm cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            )}
        </div>
    )
}

export default MonthDisc