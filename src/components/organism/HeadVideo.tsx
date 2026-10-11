import React from 'react'
import { Youtube, Disc } from 'lucide-react';

type HeadVideoProps = {
    onTogglePlay: () => void;
    onToggleVideo?: () => void;
};

const HeadVideo: React.FC<HeadVideoProps> = ({ onTogglePlay, onToggleVideo }) => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-zinc-800/80">
            <div>
                <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-[0.92] text-white">
                    VIDEO <span className="text-[#DC2626]">PODCAST</span> OFICIAL
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mt-3 leading-relaxed">
                    Conversaciones profundas sin censura, disección de ingeniería acústica y charlas cara a cara con los arquitectos del metal extremo mundial. Grabado en cinta multipista y video 4K.
                </p>
            </div>

            {/* Subscription Badges */}
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
                <a
                    href="#youtube"
                    onClick={(e) => {
                        e.preventDefault();
                        onToggleVideo?.();
                    }}
                    className="bg-[#0E0E12] hover:bg-zinc-900 border border-zinc-800 hover:border-[#DC2626] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white flex items-center gap-2 transition-colors"
                >
                    <Youtube className="w-4 h-4 text-[#DC2626]" /> YOUTUBE 4K
                </a>
                <a
                    href="#spotify"
                    onClick={(e) => {
                        e.preventDefault();
                        onTogglePlay();
                    }}
                    className="bg-[#0E0E12] hover:bg-zinc-900 border border-zinc-800 hover:border-[#DC2626] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white flex items-center gap-2 transition-colors"
                >
                    <Disc className="w-4 h-4 text-emerald-500" /> SPOTIFY LOSSLESS
                </a>
            </div>
        </div>
    )
}

export default HeadVideo