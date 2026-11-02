import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import type { CmsPostItem, CmsPostStatus, CmsPostType } from '../../data/Cms';

interface PublisherFormProps {
    onCreatePost: (post: Omit<CmsPostItem, 'id' | 'code'>) => CmsPostItem;
}

const PublisherForm: React.FC<PublisherFormProps> = ({ onCreatePost }) => {
    const [publishToast, setPublishToast] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newType, setNewType] = useState<CmsPostType>('RESEÑA');
    const [newCategory, setNewCategory] = useState('BLACK / DEATH METAL');
    const [newScore, setNewScore] = useState('9.2');
    const [newStatus, setNewStatus] = useState<CmsPostStatus>('PUBLICADO');
    const [newExcerpt, setNewExcerpt] = useState('');

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        const created = onCreatePost({
            title: newTitle.trim(),
            type: newType,
            category: newCategory.toUpperCase(),
            author: 'Admin Redacción',
            date: 'AHORA MISMO',
            score: newType === 'RESEÑA' ? `${newScore} / 10` : undefined,
            excerpt: newExcerpt.trim() || undefined,
            status: newStatus,
        });

        setNewTitle('');
        setNewExcerpt('');
        setPublishToast(`✓ ENTRADA [${created.code}] REGISTRADA EN EL BÚNKER EDITORIAL.`);
        setTimeout(() => setPublishToast(null), 4000);
    };
    return (
        <div className="border border-zinc-800 bg-[#0E0E12] p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
                <div>
                    <span className="font-mono text-[10px] text-[#DC2626] uppercase tracking-widest block">
                    // PUBLICADOR DIRECTO AL PORTAL
                    </span>
                    <h2 className="font-display font-black text-2xl uppercase text-white">
                        REDACTAR NUEVA ENTRADA EDITORIAL
                    </h2>
                </div>
                <Plus className="w-5 h-5 text-[#DC2626]" />
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            TÍTULO DEL ARTÍCULO / DISCO / EPISODIO *
                        </label>
                        <input
                            type="text"
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Ej: Gorgoroth — Crónica y Fuego en Josefov..."
                            className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                        />
                    </div>

                    <div className="md:col-span-3">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            SECCIÓN DESTINO
                        </label>
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value as CmsPostType)}
                            className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3 py-2.5 text-xs font-mono text-white outline-none"
                        >
                            <option value="RESEÑA">RESEÑA DE DISCO</option>
                            <option value="CRÓNICA">CRÓNICA / GALERÍA</option>
                            <option value="PODCAST">VIDEOPODCAST 4K</option>
                            <option value="NOTICIA">NOTICIA URGENTE</option>
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            SUBGÉNERO / ETIQUETA
                        </label>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            EXTRACTO / VEREDICTO EDITORIAL
                        </label>
                        <input
                            type="text"
                            value={newExcerpt}
                            onChange={(e) => setNewExcerpt(e.target.value)}
                            placeholder="Síntesis mordaz para la portada principal..."
                            className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            CALIFICACIÓN
                        </label>
                        <input
                            type="text"
                            value={newScore}
                            onChange={(e) => setNewScore(e.target.value)}
                            disabled={newType !== 'RESEÑA'}
                            className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-[#DC2626] font-bold outline-none disabled:opacity-40"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400 mb-1.5">
                            ESTADO
                        </label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as CmsPostStatus)}
                            className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3 py-2.5 text-xs font-mono text-white outline-none"
                        >
                            <option value="PUBLICADO">PUBLICAR YA</option>
                            <option value="BORRADOR">BORRADOR</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="font-mono text-[11px] text-zinc-500">
                        {publishToast ? (
                            <span className="text-emerald-400 font-bold">{publishToast}</span>
                        ) : (
                            'Los cambios se sincronizan instantáneamente con el CDN global.'
                        )}
                    </div>
                    <button
                        type="submit"
                        className="bg-[#DC2626] hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-widest px-6 py-3 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <Save className="w-4 h-4" /> PUBLICAR EN EL PORTAL
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PublisherForm