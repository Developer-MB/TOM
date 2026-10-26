import React from 'react'
import { Video, Disc } from 'lucide-react';
import { ASSETS } from '../../data/Assets';

type HeadVideoProps = {
    onTogglePlay: () => void;
    onToggleVideo?: () => void;
};

const HeadVideo: React.FC<HeadVideoProps> = ({ onTogglePlay, onToggleVideo }) => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-zinc-800/80">
            <div>
                <img src={ASSETS.logoTOMVP}
                    alt="Time of New Music Logo"
                    className="w-100 sm:w-64 lg:w-100"
                />
            </div>

            {/* Subscription Badges */}
            <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
                <a
                    href="https://www.youtube.com/@TimeOfMetal-mx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-[#DC2626] border border-[#DC2626] hover:border-zinc-800 hover:bg-[#0E0E12] px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-white flex items-center gap-2 transition-colors cursor-metal"
                >
                    <Video className="w-4 h-4 text-white group-hover:text-[#DC2626]" /> YOUTUBE 4K
                </a>
                <a
                    href="https://open.spotify.com/show/46Lm5as6pkUglvkIAzUjLd?si=95c591231fef4f80"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-emerald-500 border border-emerald-500 hover:border-emerald-500 hover:bg-black px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-zinc-950 hover:text-emerald-500 flex items-center gap-2 transition-colors cursor-metal"
                >
                    <Disc className="w-4 h-4 text-zinc-950 group-hover:text-emerald-500" /> SPOTIFY
                </a>
            </div>
        </div>
    )
}

export default HeadVideo