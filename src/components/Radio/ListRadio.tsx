import React, { useEffect, useState } from 'react';
import type { AudioTrack } from '../../data/mockData';
import {
    RADIO_UPDATED_EVENT,
    readStoredRadioTracks,
    type CmsRadioTrack,
} from '../../data/Radio';

interface ListRadioProps {
    currentTrack: AudioTrack;
    onSelectTrack: (track: Partial<AudioTrack>) => void;
}

const ListRadio: React.FC<ListRadioProps> = ({ currentTrack, onSelectTrack }) => {
    const [tracks, setTracks] = useState<CmsRadioTrack[]>(() => readStoredRadioTracks());

    useEffect(() => {
        const handleSync = () => {
            setTracks(readStoredRadioTracks());
        };
        window.addEventListener(RADIO_UPDATED_EVENT, handleSync);
        window.addEventListener('storage', handleSync);
        return () => {
            window.removeEventListener(RADIO_UPDATED_EVENT, handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, []);

    return (
        <div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-500 pb-3 mb-4 border-b border-zinc-800">
                <span>EN CABINA AHORA (16:00 - 19:00 CET)</span>
            </div>

            <div className="border-t border-zinc-800 pt-4">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
                    Lista de reproducción ({tracks.length})
                </h3>
                <div className="h-[248px] space-y-2 overflow-y-auto overscroll-contain pr-2" aria-label="Canciones disponibles">
                    {tracks.map((track) => (
                        <button
                            key={track.id}
                            type="button"
                            aria-current={currentTrack.id === track.id ? 'true' : undefined}
                            onClick={() => onSelectTrack({
                                id: track.id,
                                title: track.title,
                                artist: track.band,
                                album: track.disc,
                                src: track.src,
                                cover: track.cover,
                                duration: '',
                                currentTime: '',
                                bitrate: '192 kbps',
                            })}
                            className={`h-14 w-full text-left border px-3 py-2 transition-colors cursor-pointer ${currentTrack.id === track.id
                                    ? 'border-[#DC2626] bg-[#DC2626]/10'
                                    : 'border-zinc-800 bg-[#070709] hover:border-zinc-600'
                                }`}
                        >
                            <span className="block truncate font-mono text-xs text-white">
                                {track.title}
                            </span>
                            <span className="mt-1 block truncate font-mono text-[10px] text-zinc-500">
                                {track.band} · {track.disc}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ListRadio;
