import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Radio, RotateCcw } from 'lucide-react';
import type { CmsRadioTrack } from '../../data/Radio';

interface PublishRadioFormProps {
    draft?: CmsRadioTrack | null;
    existingTracks: CmsRadioTrack[];
    onSaveTrack: (track: CmsRadioTrack) => void;
    onFinishEditing?: () => void;
}

const fieldClassName =
    'w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none';

const PublishRadioForm: React.FC<PublishRadioFormProps> = ({
    draft = null,
    existingTracks,
    onSaveTrack,
    onFinishEditing,
}) => {
    const formRef = useRef<HTMLDivElement | null>(null);
    const [band, setBand] = useState('');
    const [title, setTitle] = useState('');
    const [disc, setDisc] = useState('');
    const [src, setSrc] = useState('/audio/01 - blinded by fear.mp3');
    const [cover, setCover] = useState('/image/covers/298.jpeg');
    const [status, setStatus] = useState<'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR'>('PUBLICADO');
    const [savedNotice, setSavedNotice] = useState<string | null>(null);

    useEffect(() => {
        if (!draft) {
            setBand('');
            setTitle('');
            setDisc('');
            setSrc('/audio/01 - blinded by fear.mp3');
            setCover('/image/covers/298.jpeg');
            setStatus('PUBLICADO');
            return;
        }
        setBand(draft.band);
        setTitle(draft.title);
        setDisc(draft.disc);
        setSrc(draft.src);
        setCover(draft.cover);
        setStatus(draft.status ?? 'PUBLICADO');
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [draft]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!band.trim() || !title.trim() || !disc.trim()) return;

        const nextIndex = existingTracks.length + 1;
        const track: CmsRadioTrack = {
            id: draft?.id ?? `radio-${Date.now()}`,
            code: draft?.code ?? `TOM-RAD-${String(nextIndex).padStart(4, '0')}`,
            band: band.trim(),
            title: title.trim(),
            disc: disc.trim(),
            src: src.trim() || '/audio/01 - blinded by fear.mp3',
            cover: cover.trim() || '/image/covers/298.jpeg',
            status,
            publish: draft?.publish ?? new Date().toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }).toUpperCase(),
        };

        onSaveTrack(track);
        setSavedNotice(
            draft
                ? `Tema "${track.band} — ${track.title}" actualizado en la programación de Radio.`
                : `Tema "${track.band} — ${track.title}" agregado a la programación de Radio 24/7.`,
        );
        if (draft) {
            onFinishEditing?.();
        } else {
            setBand('');
            setTitle('');
            setDisc('');
        }
        window.setTimeout(() => setSavedNotice(null), 4000);
    };

    return (
        <div ref={formRef} className="border border-zinc-800 bg-[#0E0E12] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <Radio className="w-5 h-5 text-[#DC2626]" />
                    <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#DC2626] block">
                            {draft ? `MODO EDICIÓN · ${draft.code ?? draft.id}` : 'PROGRAMACIÓN CABINA 24/7'}
                        </span>
                        <h2 className="font-display text-xl font-black uppercase text-white">
                            {draft ? 'Modificar Tema de Radio' : 'Agregar Tema a Radio 24/7'}
                        </h2>
                    </div>
                </div>
                {draft && (
                    <button
                        type="button"
                        onClick={onFinishEditing}
                        className="inline-flex items-center gap-1.5 border border-zinc-700 px-3 py-1.5 font-mono text-[10px] uppercase text-zinc-300 hover:border-[#DC2626] hover:text-white cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Cancelar edición
                    </button>
                )}
            </div>

            {savedNotice && (
                <div className="mb-5 flex items-center gap-2 border border-emerald-700/60 bg-emerald-950/40 px-4 py-3 font-mono text-xs text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{savedNotice}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                        Banda / Artista *
                    </span>
                    <input
                        required
                        type="text"
                        value={band}
                        onChange={(e) => setBand(e.target.value)}
                        placeholder="Ej: At The Gates"
                        className={fieldClassName}
                    />
                </label>

                <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                        Título del Tema *
                    </span>
                    <input
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ej: Blinded by Fear"
                        className={fieldClassName}
                    />
                </label>

                <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                        Álbum / Disco *
                    </span>
                    <input
                        required
                        type="text"
                        value={disc}
                        onChange={(e) => setDisc(e.target.value)}
                        placeholder="Ej: Slaughter of the Soul"
                        className={fieldClassName}
                    />
                </label>

                <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                        Estado en Cabina
                    </span>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'PUBLICADO' | 'PROGRAMADO' | 'BORRADOR')}
                        className={fieldClassName}
                    >
                        <option value="PUBLICADO">PUBLICADO (EN ROTACIÓN)</option>
                        <option value="PROGRAMADO">PROGRAMADO</option>
                        <option value="BORRADOR">BORRADOR</option>
                    </select>
                </label>

                <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                        Ruta / URL de Audio (MP3/FLAC)
                    </span>
                    <input
                        type="text"
                        value={src}
                        onChange={(e) => setSrc(e.target.value)}
                        placeholder="/audio/01 - blinded by fear.mp3"
                        className={fieldClassName}
                    />
                </label>

                <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                        Portada del Álbum (URL)
                    </span>
                    <input
                        type="text"
                        value={cover}
                        onChange={(e) => setCover(e.target.value)}
                        placeholder="/image/covers/298.jpeg"
                        className={fieldClassName}
                    />
                </label>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                        type="submit"
                        className="bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors cursor-pointer"
                    >
                        {draft ? 'ACTUALIZAR TEMA EN RADIO' : 'PUBLICAR TEMA EN RADIO'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PublishRadioForm;

