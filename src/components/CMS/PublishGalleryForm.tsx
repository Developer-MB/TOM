import React, { useEffect, useRef, useState } from 'react';
import { Camera, Save, X } from 'lucide-react';
import type { CmsGalleryItem, CmsPostStatus } from '../../data/Cms';
import { readJsonResponse } from '../../data/readJsonResponse';

type GalleryFields = Omit<CmsGalleryItem, 'id' | 'img' | 'code' | 'publish'> & {
    status: CmsPostStatus;
};

const fieldClassName =
    'w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none';
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const maxImageSize = 5 * 1024 * 1024;
const maxImages = 15;

const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                reject(new Error(`No se pudo leer ${file.name}.`));
                return;
            }
            resolve(reader.result.slice(reader.result.indexOf(',') + 1));
        };
        reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}.`));
        reader.readAsDataURL(file);
    });

interface PublishGalleryFormProps {
    draft: CmsGalleryItem | null;
    onSaveGallery: (gallery: CmsGalleryItem) => void;
    onFinishEditing: () => void;
}

const toLocalDateTimeInput = (value: string | undefined) => {
    if (!value) return '';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return '';
    const timezoneOffset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const PublishGalleryForm: React.FC<PublishGalleryFormProps> = ({
    draft,
    onSaveGallery,
    onFinishEditing,
}) => {
    const [formData, setFormData] = useState<GalleryFields>({
        concert: '',
        date: '',
        venue: '',
        city: '',
        title: '',
        desc: '',
        credit: '',
        status: 'PUBLICADO',
    });
    const [publishDate, setPublishDate] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const imagesInputRef = useRef<HTMLInputElement>(null);
    const formContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!draft) return;
        setFormData({
            concert: draft.concert,
            date: draft.date,
            venue: draft.venue,
            city: draft.city,
            title: draft.title,
            desc: draft.desc,
            credit: draft.credit,
            status: draft.status ?? 'BORRADOR',
        });
        setPublishDate(toLocalDateTimeInput(draft.publish));
        setImages([]);
        setFormError(null);
        setSuccessMessage(null);
        if (imagesInputRef.current) imagesInputRef.current.value = '';
        formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [draft]);

    const updateField = <K extends keyof GalleryFields>(field: K, value: string) => {
        setFormData((current) => ({ ...current, [field]: value }));
        setSuccessMessage(null);
    };

    const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedImages = Array.from(event.target.files ?? []);
        setFormError(null);
        setSuccessMessage(null);

        if (selectedImages.length + (draft?.img.length ?? 0) > maxImages) {
            setImages([]);
            event.target.value = '';
            setFormError(`La galería admite un máximo de ${maxImages} fotografías en total.`);
            return;
        }

        const invalidImage = selectedImages.find((file) => !allowedImageTypes.includes(file.type));
        if (invalidImage) {
            setImages([]);
            event.target.value = '';
            setFormError('Elige imágenes JPG, PNG, WebP o GIF.');
            return;
        }

        const oversizedImage = selectedImages.find((file) => file.size > maxImageSize);
        if (oversizedImage) {
            setImages([]);
            event.target.value = '';
            setFormError('Cada imagen debe pesar 5 MB o menos.');
            return;
        }

        setImages(selectedImages);
    };

    const removeImage = (indexToRemove: number) => {
        setImages((current) => current.filter((_, index) => index !== indexToRemove));
        if (imagesInputRef.current) imagesInputRef.current.value = '';
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSaving) return;
        if (!draft && formData.status !== 'BORRADOR' && images.length === 0) {
            setFormError('Selecciona al menos una imagen para la galería.');
            return;
        }
        if (draft && draft.img.length + images.length > maxImages) {
            setFormError(`La galería no puede superar ${maxImages} fotografías en total.`);
            return;
        }
        if (formData.status === 'PROGRAMADO' && !publishDate) {
            setFormError('Indica la fecha y hora de publicación programada.');
            return;
        }

        setIsSaving(true);
        setFormError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(
                draft ? `/api/cms/galleries/${encodeURIComponent(draft.id)}` : '/api/cms/galleries',
                {
                method: draft ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    credit: formData.credit.trim().toLocaleUpperCase('es'),
                    publish: formData.status === 'PROGRAMADO'
                        ? new Date(publishDate).toISOString()
                        : '',
                    img: await Promise.all(images.map(async (file) => ({
                        mimeType: file.type,
                        data: await toBase64(file),
                    }))),
                }),
                },
            );
            const created = await readJsonResponse<CmsGalleryItem>(
                response,
                'No se pudo guardar la galería.',
            );

            onSaveGallery(created);
            setFormData({
                concert: '',
                date: '',
                venue: '',
                city: '',
                title: '',
                desc: '',
                credit: '',
                status: 'PUBLICADO',
            });
            setPublishDate('');
            setImages([]);
            if (imagesInputRef.current) imagesInputRef.current.value = '';
            setSuccessMessage(
                draft
                    ? `Borrador actualizado (${created.code ?? created.id}).`
                    : `Galería guardada en post-pics.json (ID: ${created.id}).`,
            );
            if (draft) onFinishEditing();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'No se pudo guardar la galería.');
        } finally {
            setIsSaving(false);
        }
    };

    const textField = (
        name: Exclude<keyof GalleryFields, 'date' | 'desc' | 'status'>,
        label: string,
        placeholder = '',
    ) => (
        <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                {label}
            </span>
            <input
                type="text"
                required
                maxLength={name === 'concert' || name === 'venue' ? 150 : name === 'title' ? 200 : 100}
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
                <div>
                    <h2 className="font-display font-black text-2xl uppercase text-white">
                        {draft ? 'CONTINUAR PUBLICACIÓN' : 'PUBLICAR FOTOGRAFÍAS'}
                    </h2>
                </div>
                <Camera className="w-5 h-5 text-[#DC2626]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {textField('concert', 'CONCIERTO / BANDA', 'Nombre del concierto o banda')}
                    <label className="block">
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            FECHA DEL EVENTO
                        </span>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(event) => updateField('date', event.target.value)}
                            className={fieldClassName}
                        />
                    </label>
                    {textField('venue', 'VENUE', 'Auditorio, estadio....')}
                    {textField('city', 'CIUDAD', 'Ciudad')}
                    {textField('title', 'TÍTULO DEL EVENTO', 'Nombre de la gira')}
                    {textField('credit', 'CRÉDITOS / FOTÓGRAFO', 'Nombre del fotógrafo')}
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
                    {formData.status === 'PROGRAMADO' && (
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
                    )}
                    {draft && (
                        <div className="self-end border border-zinc-800 bg-[#070709] px-3 py-2.5 font-mono text-xs text-zinc-400">
                            CÓDIGO: <span className="text-white">{draft.code ?? draft.id}</span>
                        </div>
                    )}
                </div>

                <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                        DESCRIPCIÓN DEL EVENTO
                    </span>
                    <textarea
                        required
                        maxLength={2000}
                        value={formData.desc}
                        onChange={(event) => updateField('desc', event.target.value)}
                        placeholder="Describe el evento y el contenido de la galería"
                        rows={4}
                        className={fieldClassName}
                    />
                </label>

                <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                        FOTOGRAFÍAS (JPG, PNG, WEBP O GIF; MÁX. 15 DE 5 MB)
                    </span>
                    <input
                        ref={imagesInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        disabled={Boolean(draft && draft.img.length >= maxImages)}
                        required={!draft && formData.status !== 'BORRADOR' && images.length === 0}
                        onChange={handleImagesChange}
                        className={`${fieldClassName} file:mr-3 file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-white`}
                    />
                    <span className="mt-1.5 block font-mono text-[10px] text-zinc-500">
                        {draft
                            ? `${draft.img.length} fotos guardadas; puedes agregar ${Math.max(0, maxImages - draft.img.length)} más.`
                            : `${images.length} de ${maxImages} imágenes seleccionadas. Los borradores pueden guardarse sin fotos.`}
                    </span>
                </label>

                {draft && (
                    <p className="font-mono text-[10px] text-zinc-500">
                        Las fotos existentes se conservarán al guardar.
                    </p>
                )}

                {(draft || images.length > 0) && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {draft?.img.map((image) => (
                            <li key={image.id} className="flex items-center gap-3 border border-zinc-800 bg-[#070709] px-3 py-2">
                                <img src={image.pic} alt="" className="h-10 w-14 object-cover" />
                                <span className="truncate font-mono text-[10px] text-zinc-400">
                                    Foto existente {image.id}
                                </span>
                            </li>
                        ))}
                        {images.map((image, index) => (
                            <li
                                key={`${image.name}-${image.lastModified}`}
                                className="flex items-center justify-between gap-3 border border-zinc-800 bg-[#070709] px-3 py-2"
                            >
                                <span className="truncate font-mono text-[10px] text-zinc-400">
                                    {image.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    aria-label={`Quitar ${image.name}`}
                                    className="shrink-0 p-1 text-zinc-400 hover:text-red-400"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="font-mono text-[11px]">
                        {formError ? (
                            <span role="alert" className="text-red-300 font-bold">{formError}</span>
                        ) : successMessage ? (
                            <span role="status" className="text-emerald-400 font-bold">{successMessage}</span>
                        ) : (
                            <span className="text-zinc-500">
                                {draft
                                    ? 'Al guardar se actualizará este borrador sin cambiar sus fotos existentes.'
                                    : 'Las imágenes se guardarán en public/image/concerts/.'}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {draft && (
                            <button
                                type="button"
                                onClick={onFinishEditing}
                                disabled={isSaving}
                                className="border border-zinc-700 px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white disabled:opacity-50"
                            >
                                CANCELAR
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-[#DC2626] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'GUARDANDO…' : draft ? 'GUARDAR Y CONTINUAR' : 'GUARDAR GALERÍA'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PublishGalleryForm;