import React from 'react'
import { AudioTrack } from '@/src/data/mockData';
import { ASSETS } from '@/src/data/Assets';
import PlayerRadio from './PlayerRadio';
import ListRadio from './ListRadio';

interface RadioSectionProps {
    currentTrack: AudioTrack;
    isPlaying: boolean;
    audioAnalyser: AnalyserNode | null;
    isMuted: boolean;
    onToggleMute: () => void;
    volume: number;
    onVolumeChange: (volume: number) => void;
    onSelectTrack: (track: Partial<AudioTrack>) => void;
}

const ContentRadio = ({
    currentTrack,
    isPlaying,
    audioAnalyser,
    isMuted,
    onToggleMute,
    volume,
    onVolumeChange,
    onSelectTrack,
}: RadioSectionProps) => {
    return (
        <div className="border-2 border-zinc-800 bg-[#0E0E12] relative overflow-hidden">
            {/* Top Technical Bar */}
            <div className="bg-[#09090C] border-b border-zinc-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                        CABINA CDMX
                    </span>
                </div>
            </div>

            {/* Main Console Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left 7 Cols: Turntable & Current Track */}
                <PlayerRadio
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    audioAnalyser={audioAnalyser}
                    isMuted={isMuted}
                    onToggleMute={onToggleMute}
                    volume={volume}
                    onVolumeChange={onVolumeChange}
                />

                {/* Right 5 Cols: Active Host & Song Request Box */}
                <div className="lg:col-span-5 p-6 sm:p-8 bg-[#0B0B0E] flex flex-col justify-between">
                    <ListRadio
                        currentTrack={currentTrack}
                        onSelectTrack={onSelectTrack}
                    />

                    {/* Request Track Form
              <div className="bg-[#070709] border border-zinc-800 p-5">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#DC2626]" /> SOLICITAR TEMA A CABINA
                </div>
                <p className="text-zinc-400 text-xs mb-3">
                  Envía tu petición directamente al locutor en turno para el bloque de vinilos a petición:
                </p>
                <form onSubmit={handleSendRequest} className="flex gap-2">
                  <input
                    type="text"
                    value={requestInput}
                    onChange={(e) => setRequestInput(e.target.value)}
                    placeholder="Ej: Dissection - Night's Blood (1995)..."
                    className="flex-1 bg-[#0E0E12] border border-zinc-800 focus:border-[#DC2626] px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 transition-colors cursor-pointer shrink-0"
                  >
                    PEDIR
                  </button>
                </form>
                {requestSent && (
                  <p className="font-mono text-[11px] text-emerald-400 mt-2">
                    ✓ PETICIÓN RECIBIDA EN LA CONSOLA DE DJ RAVN.
                  </p>
                )}
              </div> */}
                </div>
            </div>
        </div>
    )
}

export default ContentRadio