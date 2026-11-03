import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Save } from 'lucide-react';
import type { CmsPostStatus, CmsTourItem } from '../../data/CmsTypes';
import { readJsonResponse } from '../../data/readJsonResponse';

type TourFields = Omit<CmsTourItem, 'id' | 'code' | 'publish'>;

interface PublishTourFormProps {
    draft: CmsTourItem | null;
    onSaveTour: (tour: CmsTourItem) => void;
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

const PublishTourForm: React.FC<PublishTourFormProps> = ({
    draft,
    onSaveTour,
    onFinishEditing,
}) => {
    const [formData, setFormData] = useState<TourFields>({
        month: String(new Date().getMonth() + 1).padStart(2, '0'),
        day: '',
        year: String(new Date().getFullYear()),
        band: '',
        tourName: '',
        venue: '',
        info: '',
        ticketsInfo: '',
        ticketsLow: false,
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
            month: draft.month,
            day: draft.day,
            year: draft.year,
            band: draft.band,
            tourName: draft.tourName,
            venue: draft.venue,
            info: draft.info,
            ticketsInfo: draft.ticketsInfo,
            ticketsLow: draft.ticketsLow,
            status: draft.status,
        });
        setPublishDate(toLocalDateTimeInput(draft.publish));
        setFormError(null);
        setSuccessMessage(null);
        formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [draft]);

    const updateField = <K extends keyof TourFields>(field: K, value: TourFields[K]) => {
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
                draft ? `/api/cms/tours/${encodeURIComponent(draft.id)}` : '/api/cms/tours',
                {
                    method: draft ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        month: formData.month.padStart(2, '0'),
                        day: formData.day.padStart(2, '0'),
                        band: formData.band.trim(),
                        tourName: formData.tourName.trim(),
                        venue: formData.venue.trim(),
                        info: formData.info.trim(),
                        ticketsInfo: formData.ticketsInfo.trim(),
                        publish: formData.status === 'PROGRAMADO'
                            ? new Date(publishDate).toISOString()
                            : '',
                    }),
                },
            );
            const savedTour = await readJsonResponse<CmsTourItem>(
                response,
                'No se pudo guardar la gira.',
            );

            onSaveTour(savedTour);
            setFormData({
                month: String(new Date().getMonth() + 1).padStart(2, '0'),
                day: '',
                year: String(new Date().getFullYear()),
                band: '',
                tourName: '',
                venue: '',
                info: '',
                ticketsInfo: '',
                ticketsLow: false,
                status: 'PUBLICADO',
            });
            setPublishDate('');
            setSuccessMessage(
                draft
                    ? `Borrador actualizado (${savedTour.code}).`
                    : `Gira guardada en post-tours.json (ID: ${savedTour.id}, código: ${savedTour.code}).`,
            );
            if (draft) onFinishEditing();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'No se pudo guardar la gira.');
        } finally {
            setIsSaving(false);
        }
    };

    const textField = (
        name: Exclude<keyof TourFields, 'month' | 'day' | 'year' | 'ticketsLow' | 'status'>,
        label: string,
        maxLength: number,
        placeholder = '',
    ) => (
        <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                {label}
            </span>
            <input
                type="text"
                required={name === 'band' || name === 'tourName' || name === 'venue'}
                maxLength={maxLength}
                value={formData[name]}
                onChange={(event) => updateField(name, event.target.value)}
                placeholder={placeholder}
                className={fieldClassName}
            />
        </label>
    );

    return (
        <div ref={formContainerRef} className="border border-zinc-800 bg-[#0E0E12] p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
                <h2 className="font-display font-black text-2xl uppercase text-white">
                    {draft ? 'CONTINUAR PUBLICACIÓN' : 'PUBLICAR GIRA'}
                </h2>
                <CalendarDays className="w-5 h-5 text-[#DC2626]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="block">
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            MES
                        </span>
                        <select
                            required
                            value={formData.month}
                            onChange={(event) => updateField('month', event.target.value)}
                            className={fieldClassName}
                        >
                            {Array.from({ length: 12 }, (_, index) => {
                                const month = String(index + 1).padStart(2, '0');
                                return (
                                    <option key={month} value={month}>
                                        {new Date(2026, index, 1).toLocaleDateString('es-MX', { month: 'long' }).toLocaleUpperCase('es')}
                                    </option>
                                );
                            })}
                        </select>
                    </label>
                    <label className="block">
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            DÍA
                        </span>
                        <input
                            type="number"
                            required
                            min={1}
                            max={31}
                            value={formData.day}
                            onChange={(event) => updateField('day', event.target.value)}
                            placeholder="01"
                            className={fieldClassName}
                        />
                    </label>
                    <label className="block">
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            AÑO
                        </span>
                        <input
                            type="number"
                            required
                            min={2000}
                            max={2100}
                            value={formData.year}
                            onChange={(event) => updateField('year', event.target.value)}
                            className={fieldClassName}
                        />
                    </label>
                    {textField('band', 'BANDA', 150, 'Nombre de la banda')}
                    {textField('tourName', 'NOMBRE DE LA GIRA', 200, 'Nombre de la gira o evento')}
                    {textField('venue', 'VENUE', 200, 'Recinto y ciudad')}
                </div>

                <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                        INFORMACIÓN DEL EVENTO
                    </span>
                    <textarea
                        maxLength={2000}
                        value={formData.info}
                        onChange={(event) => updateField('info', event.target.value)}
                        placeholder="Horario, detalles y otra información del evento"
                        rows={3}
                        className={fieldClassName}
                    />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {textField('ticketsInfo', 'INFORMACIÓN DE BOLETOS', 300, 'Puntos de venta, precio o enlace')}
                    <label className="flex items-center gap-3 self-end min-h-[42px] font-mono text-xs text-zinc-300">
                        <input
                            type="checkbox"
                            checked={formData.ticketsLow}
                            onChange={(event) => updateField('ticketsLow', event.target.checked)}
                            className="h-4 w-4 accent-[#DC2626]"
                        />
                        BOLETOS CON POCAS VENTAS
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
                        <Save className="w-4 h-4" /> {isSaving ? 'GUARDANDO…' : 'GUARDAR GIRA'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PublishTourForm;
