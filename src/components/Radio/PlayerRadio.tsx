import React, { useEffect, useState } from 'react';
import type { AudioTrack } from '@/src/data/mockData';
import { Radio, Volume2, VolumeX } from 'lucide-react';

interface PlayerRadioProps {
    currentTrack: AudioTrack;
    isPlaying: boolean;
    audioAnalyser: AnalyserNode | null;
    isMuted: boolean;
    onToggleMute: () => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
}

const PlayerRadio: React.FC<PlayerRadioProps> = ({
    currentTrack,
    isPlaying,
    audioAnalyser,
    isMuted,
    onToggleMute,
    volume,
    onVolumeChange,
}) => {
    const [spectrum, setSpectrum] = useState<number[]>([]);

    useEffect(() => {
        if (!audioAnalyser) {
            setSpectrum([]);
            return;
        }

        const frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount);
        let animationFrame = 0;
        let lastUpdate = 0;
        const barCount = 30;

        const updateSpectrum = (timestamp: number) => {
            animationFrame = window.requestAnimationFrame(updateSpectrum);
            if (timestamp - lastUpdate < 40) return;
            lastUpdate = timestamp;

            audioAnalyser.getByteFrequencyData(frequencyData);
            const levels = Array.from({ length: barCount }, (_, index) => {
                const start = Math.floor(index * frequencyData.length / barCount);
                const end = Math.max(start + 1, Math.floor((index + 1) * frequencyData.length / barCount));
                const average = frequencyData
                    .slice(start, end)
                    .reduce((sum, value) => sum + value, 0) / (end - start);
                return Math.max(4, Math.round(average / 255 * 100));
            });
            setSpectrum(levels);
        };

        animationFrame = window.requestAnimationFrame(updateSpectrum);
        return () => window.cancelAnimationFrame(animationFrame);
    }, [audioAnalyser]);

    return (
        <div className="lg:col-span-7 p-5 sm:p-8 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Vinyl Artwork */}
                <div className="relative w-40 h-40 sm:w-52 sm:h-52 shrink-0 border border-zinc-700 bg-black overflow-hidden group">
                    <img
                        src={currentTrack.cover}
                        alt={currentTrack.title}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                            isPlaying ? 'scale-105' : 'opacity-80'
                        }`}
                    />
                </div>

                {/* Track Info */}
                <div className="flex-1 w-full min-w-0 text-center sm:text-left">
                    <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 font-mono text-[10px] text-[#DC2626] uppercase tracking-widest mb-3">
                        <Radio className="w-3.5 h-3.5" />
                    </div>
                    <h2 className="font-display font-black text-xl sm:text-2xl lg:text-3xl uppercase tracking-tight text-white leading-tight mb-2 break-words">
                        {currentTrack.title}
                    </h2>
                    <div className="font-display font-bold text-base sm:text-lg text-[#DC2626] uppercase tracking-wide mb-1">
                        {currentTrack.artist}
                    </div>
                    <div className="font-mono text-xs text-zinc-400 mb-5">
                        ÁLBUM: {currentTrack.album}
                    </div>

                    {/* Animated Spectrum Visualizer Bars */}
                    <div className="bg-[#070709] border border-zinc-800 p-3 mb-4">
                        <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500 mb-1.5">
                            <span>ESPECTRO DE FRECUENCIAS (L/R)</span>
                        </div>
                        <div className="h-9 flex items-end gap-1">
                            {Array.from({ length: 30 }, (_, index) => (
                                <div
                                    key={index}
                                    className={`flex-1 transition-all duration-100 ${
                                        (spectrum[index] ?? (isPlaying ? 4 : 0)) > 70
                                            ? 'bg-blue-700'
                                            : (spectrum[index] ?? 0) > 40
                                                ? 'bg-amber-500'
                                                : 'bg-[#DC2626]'
                                    }`}
                                    style={{
                                        height: `${spectrum[index] ?? 4}%`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Volume Control */}
            <div className="pt-6 mt-6 border-t border-zinc-800">
                <div className="flex sm:inline-flex items-center justify-between sm:justify-start gap-2.5 bg-[#070709] border border-zinc-800 px-3.5 py-2.5">
                    <button
                        type="button"
                        onClick={onToggleMute}
                        className="text-zinc-400 hover:text-white cursor-pointer"
                        aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                    >
                        {isMuted ? (
                            <VolumeX className="w-4 h-4 text-[#DC2626]" />
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => onVolumeChange(Number(e.target.value))}
                        className="flex-1 sm:w-28 accent-[#DC2626] cursor-pointer"
                    />
                    <span className="font-mono text-[11px] text-zinc-300 w-8 text-right">
                        {isMuted ? '0%' : `${volume}%`}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PlayerRadio;
