import React, { useEffect, useRef, useState } from 'react';
import { Play, Save } from 'lucide-react';
import type { CmsPostStatus, CmsVideoItem } from '../../data/Cms';
import { readJsonResponse } from '../../data/readJsonResponse';

type VideoFields = Pick<CmsVideoItem, 'title' | 'description' | 'url' | 'status'>;

interface PublishVideoFormProps {
    draft: CmsVideoItem | null;
    onSaveVideo: (video: CmsVideoItem) => void;
    onFinishEditing: () => void;
}

const fieldClassName =
    'w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none';

const toLocalDateTimeInput = (value: string | undefined) => {
    if (!value) return '';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    const timezoneOffset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const PublishVideoForm: React.FC<PublishVideoFormProps> = ({
    draft,
    onSaveVideo,
    onFinishEditing,
}) => {
    const [formData, setFormData] = useState<VideoFields>({
        title: '',
        description: '',
        url: '',
        status: 'PUBLICADO',
    });
    const [publishDate, setPublishDate] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const formContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!draft) return;
        setFormData({
            title: draft.title,
            description: draft.description,
            url: draft.url,
            status: draft.status,
        });
        setPublishDate(toLocalDateTimeInput(draft.publish));
        setFormError(null);
        setSuccessMessage(null);
        formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [draft]);

    const updateField = <K extends keyof VideoFields>(field: K, value: VideoFields[K]) => {
        setFormData((current) => ({ ...current, [field]: value }));
        setSuccessMessage(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSaving) return;
        if (formData.status === 'PROGRAMADO' && !publishDate) {
            setFormError('Indica la fecha y hora de publicación programada.');
            return;
        }

        setIsSaving(true);
        setFormError(null);
        setSuccessMessage(null);
        try {
            const response = await fetch(
                draft ? `/api/cms/videos/${encodeURIComponent(draft.id)}` : '/api/cms/videos',
                {
                    method: draft ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        title: formData.title.trim(),
                        description: formData.description.trim(),
                        url: formData.url.trim(),
                        publish: formData.status === 'PROGRAMADO'
                            ? new Date(publishDate).toISOString()
                            : '',
                    }),
                },
            );
            const savedVideo = await readJsonResponse<CmsVideoItem>(
                response,
                'No se pudo guardar el video.',
            );

            onSaveVideo(savedVideo);
            setFormData({
                title: '',
                description: '',
                url: '',
                status: 'PUBLICADO',
            });
            setPublishDate('');
            setSuccessMessage(
                draft
                    ? `Borrador actualizado (${savedVideo.code}).`
                    : `Video guardado en post-video.json (ID: ${savedVideo.id}, código: ${savedVideo.code}).`,
            );
            if (draft) onFinishEditing();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'No se pudo guardar el video.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div ref={formContainerRef} className="border border-zinc-800 bg-[#0E0E12] p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
                <h2 className="font-display font-black text-2xl uppercase text-white">
                    {draft ? 'CONTINUAR PUBLICACIÓN' : 'PUBLICAR VIDEO'}
                </h2>
                <Play className="w-5 h-5 text-[#DC2626]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            TÍTULO
                        </span>
                        <input
                            type="text"
                            required
                            maxLength={200}
                            value={formData.title}
                            onChange={(event) => updateField('title', event.target.value)}
                            placeholder="Título del video"
                            className={fieldClassName}
                        />
                    </label>

                    <label className="block">
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            URL DE YOUTUBE
                        </span>
                        <input
                            type="url"
                            required
                            maxLength={2048}
                            value={formData.url}
                            onChange={(event) => updateField('url', event.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className={fieldClassName}
                        />
                    </label>

                    <label className="block">
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            ESTADO
                        </span>
                        <select
                            value={formData.status}
                            onChange={(event) => updateField('status', event.target.value as CmsPostStatus)}
                            className={fieldClassName}
                        >
                            <option value="BORRADOR">BORRADOR</option>
                            <option value="PUBLICADO">PUBLICADO</option>
                            <option value="PROGRAMADO">PROGRAMADO</option>
                        </select>
                    </label>

                    {formData.status === 'PROGRAMADO' ? (
                        <label className="block">
                            <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                                FECHA Y HORA DE PUBLICACIÓN
                            </span>
                            <input
                                type="datetime-local"
                                required
                                value={publishDate}
                                onChange={(event) => setPublishDate(event.target.value)}
                                className={fieldClassName}
                            />
                        </label>
                    ) : (
                        <div>
                            <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                                PUBLICACIÓN
                            </span>
                            <p className={`${fieldClassName} text-zinc-400`}>
                                {formData.status === 'PUBLICADO' ? 'Se registra la fecha y hora actuales' : 'Sin publicar'}
                            </p>
                        </div>
                    )}
                </div>

                <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                        DESCRIPCIÓN
                    </span>
                    <textarea
                        required
                        maxLength={2000}
                        value={formData.description}
                        onChange={(event) => updateField('description', event.target.value)}
                        placeholder="Describe el contenido del video"
                        rows={4}
                        className={fieldClassName}
                    />
                </label>

                {draft && (
                    <p className="font-mono text-[10px] text-zinc-500">
                        ID: {draft.id} · CÓDIGO: {draft.code}
                    </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="font-mono text-[11px] text-zinc-500">
                        {formError ? (
                            <span role="alert" className="text-red-300 font-bold">{formError}</span>
                        ) : successMessage ? (
                            <span className="text-emerald-400 font-bold">{successMessage}</span>
                        ) : (
                            ''
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-[#DC2626] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <Save className="w-4 h-4" /> {isSaving ? 'GUARDANDO…' : 'GUARDAR VIDEO'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PublishVideoForm;
