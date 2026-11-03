import React, { useRef, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import type { CmsPostCreateInput, CmsPostItem, CmsPostStatus, CmsPostType } from '../../data/Cms';

type CmsPostFields = Omit<CmsPostItem, 'id' | 'code' | 'cover' | 'publish' | 'type'>;

interface PublishDiscFormProps {
    type: CmsPostType;
    onCreatePost: (post: CmsPostCreateInput) => Promise<CmsPostItem>;
    onCreatePostError: (error: unknown) => void;
    disabled?: boolean;
}

const fieldClassName =
    'w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none';
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const maxImageSize = 5 * 1024 * 1024;

const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                reject(new Error('No se pudo leer la imagen seleccionada.'));
                return;
            }
            resolve(reader.result.slice(reader.result.indexOf(',') + 1));
        };
        reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
        reader.readAsDataURL(file);
    });

const PublishDiscForm: React.FC<PublishDiscFormProps> = ({
    type,
    onCreatePost,
    onCreatePostError,
    disabled = false,
}) => {
    const [publishToast, setPublishToast] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const [publishDate, setPublishDate] = useState('');
    const [formData, setFormData] = useState<CmsPostFields>({
        band: '',
        disc: '',
        genre: '',
        genreKey: '',
        label: '',
        country: '',
        flag: '',
        year: String(new Date().getFullYear()),
        duration: '',
        excerpt: '',
        status: 'PUBLICADO',
        author: 'Admin Redacción',
    });

    const updateField = <K extends keyof CmsPostFields>(field: K, value: CmsPostFields[K]) => {
        setFormData((current) => ({ ...current, [field]: value }));
    };

    const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        setFormError(null);
        if (file && !allowedImageTypes.includes(file.type)) {
            setCoverImage(null);
            event.target.value = '';
            setFormError('Elige una imagen JPG, PNG, WebP o GIF.');
            return;
        }
        if (file && file.size > maxImageSize) {
            setCoverImage(null);
            event.target.value = '';
            setFormError('La imagen no puede superar los 5 MB.');
            return;
        }
        setCoverImage(file);
    };

    const handleCreatePost = async (event: React.FormEvent) => {
        event.preventDefault();
        if (disabled || isSaving) return;
        if (!coverImage) {
            setFormError('Selecciona una imagen de portada.');
            return;
        }
        if (formData.status === 'PROGRAMADO' && !publishDate) {
            setFormError('Indica la fecha y hora de publicación programada.');
            return;
        }

        setIsSaving(true);
        setFormError(null);
        try {
            const created = await onCreatePost({
                ...formData,
                type,
                author: formData.author.trim().toLocaleUpperCase('es'),
                publish: formData.status === 'PROGRAMADO' ? new Date(publishDate).toISOString() : '',
                coverImage: {
                    mimeType: coverImage.type,
                    data: await toBase64(coverImage),
                },
            });
            setFormData((current) => ({ ...current, band: '', disc: '', excerpt: '' }));
            setCoverImage(null);
            if (coverInputRef.current) coverInputRef.current.value = '';
            setPublishDate('');
            setPublishToast(`✓ ENTRADA [${created.code}] GUARDADA EN post-disc.json.`);
            window.setTimeout(() => setPublishToast(null), 4000);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'No se pudo guardar la publicación.';
            setFormError(message);
            onCreatePostError(error);
        } finally {
            setIsSaving(false);
        }
    };

    const textField = (
        name: Exclude<keyof CmsPostFields, 'type' | 'status' | 'excerpt'>,
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
                value={formData[name]}
                onChange={(event) => updateField(name, event.target.value)}
                placeholder={placeholder}
                className={fieldClassName}
            />
        </label>
    );

    return (
        <div className="border border-zinc-800 bg-[#0E0E12] p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
                <h2 className="font-display font-black text-2xl uppercase text-white">
                    REDACTAR NUEVA ENTRADA EDITORIAL
                </h2>
                <Plus className="w-5 h-5 text-[#DC2626]" />
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {textField('band', 'BANDA', 'Ej: SMOULDER')}
                    {textField('disc', 'DISCO', 'Nombre del álbum')}
                    {textField('genre', 'GÉNERO', 'Ej: DOOM / POWER METAL')}
                    {textField('genreKey', 'CLAVE DE GÉNERO', 'Ej: DOOM / POWER')}
                    {textField('label', 'SELLO', 'Sello discográfico')}
                    {textField('country', 'PAÍS', 'Ej: CAN/USA')}
                    {textField('flag', 'BANDERA', 'Ej: 🇨🇦🇺🇸')}
                    {textField('year', 'AÑO', '2026')}
                    {textField('duration', 'DURACIÓN', '42:58')}

                    <label className="block">
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            PORTADA (JPG, PNG, WEBP O GIF; MÁX. 5 MB)
                        </span>
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            required
                            onChange={handleCoverChange}
                            className={`${fieldClassName} file:mr-3 file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-white`}
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
                                PUBLICAR EL
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
                        <div className="block">
                            <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                                PUBLICACIÓN
                            </span>
                            <p className={`${fieldClassName} text-zinc-400`}>
                                {formData.status === 'PUBLICADO' ? 'Se registra la fecha y hora actuales' : 'Sin publicar'}
                            </p>
                        </div>
                    )}

                    {textField('author', 'AUTOR', 'Nombre del autor')}
                </div>

                <label className="block">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                        EXTRACTO / DESCRIPCIÓN
                    </span>
                    <textarea
                        required
                        maxLength={2000}
                        value={formData.excerpt}
                        onChange={(event) => updateField('excerpt', event.target.value)}
                        placeholder="Descripción de la publicación"
                        rows={3}
                        className={fieldClassName}
                    />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="font-mono text-[11px] text-zinc-500">
                        {formError ? (
                            <span role="alert" className="text-red-300 font-bold">{formError}</span>
                        ) : publishToast ? (
                            <span className="text-emerald-400 font-bold">{publishToast}</span>
                        ) : (
                            'El servidor guardará la imagen y generará ID y código automáticamente.'
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={disabled || isSaving}
                        className="bg-[#DC2626] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <Save className="w-4 h-4" /> {isSaving ? 'GUARDANDO…' : 'GUARDAR PUBLICACIÓN'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PublishDiscForm;
