import React, { useEffect, useState } from 'react';
import type { SectionId } from '../data/mockData';
import HeadCMS from '../components/CMS/HeadCMS';
import ControlModule from '../components/CMS/ControlModule';
import Nodo from '../components/CMS/Nodo';
import Metrics from '../components/CMS/Metrics';
import HeadPubliRegister from '../components/CMS/HeadPubliRegister';
import FilterRegister from '../components/CMS/FilterRegister';
import PublishDiscForm from '../components/CMS/PublishDiscForm';
import { INITIAL_CMS_ITEMS, type CmsPostCreateInput, type CmsPostItem, type CmsPostType } from '../data/Cms';
import { readJsonResponse } from '../data/readJsonResponse';

interface CmsSectionProps {
  onSelectSection: (section: SectionId) => void;
}

type CmsFilterType = CmsPostType | 'TODOS';

export const CmsSection: React.FC<CmsSectionProps> = ({ onSelectSection }) => {
  const [items, setItems] = useState<CmsPostItem[]>(INITIAL_CMS_ITEMS);
  const [filterType, setFilterType] = useState<CmsFilterType>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(import.meta.env.DEV);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const controller = new AbortController();

    const loadPosts = async () => {
      try {
        const response = await fetch('/api/cms/posts', { signal: controller.signal });
        const posts = await readJsonResponse<unknown>(
          response,
          'No se pudieron cargar las publicaciones.',
        );
        if (!Array.isArray(posts)) {
          throw new Error('El servidor devolvió una lista de publicaciones no válida.');
        }

        setItems(posts as CmsPostItem[]);
        setPersistenceError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'No se pudieron cargar las publicaciones.';
        setPersistenceError(message);
      } finally {
        if (!controller.signal.aborted) setIsLoadingPosts(false);
      }
    };

    void loadPosts();
    return () => controller.abort();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'TODOS' || item.type === filterType;
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !normalizedQuery ||
      item.band.toLowerCase().includes(normalizedQuery) ||
      item.disc.toLowerCase().includes(normalizedQuery) ||
      item.code.toLowerCase().includes(normalizedQuery) ||
      item.author.toLowerCase().includes(normalizedQuery);

    return matchesType && matchesSearch;
  });

  const handleCreatePost = async (post: CmsPostCreateInput): Promise<CmsPostItem> => {
    const response = await fetch('/api/cms/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    const created = await readJsonResponse<CmsPostItem>(
      response,
      'No se pudo guardar la publicación.',
    );
    setItems((currentItems) => [created, ...currentItems]);
    setPersistenceError(null);
    return created;
  };

  const handleCreatePostError = (error: unknown) => {
    setPersistenceError(error instanceof Error ? error.message : 'No se pudo guardar la publicación.');
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/cms/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok) {
        await readJsonResponse<unknown>(response, 'No se pudo eliminar la publicación.');
      }

      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
      setPersistenceError(null);
    } catch (error) {
      setPersistenceError(error instanceof Error ? error.message : 'No se pudo eliminar la publicación.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        {/* TOP ADMIN COMMAND BAR */}
        <div className="border border-zinc-800 bg-[#0E0E12] px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <HeadCMS onSelectSection={onSelectSection} />
        </div>

        {/* MAIN CMS WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR NAVIGATION (3 COLS) */}
          <aside className="lg:col-span-3 space-y-6">
            <ControlModule />

            {/* Icecast / FLAC Server Status Card */}
            <Nodo />
          </aside>

          {/* MAIN WORKSPACE AREA (9 COLS) */}
          <div className="lg:col-span-9 space-y-6">
            {/* 4 KPI METRIC CARDS */}
            <Metrics />

            {/* QUICK EDITORIAL PUBLISHER FORM */}
            <PublishDiscForm
              onCreatePost={handleCreatePost}
              onCreatePostError={handleCreatePostError}
              disabled={isLoadingPosts}
            />

            {/* EDITORIAL QUEUE TABLE */}
            <div className="border border-zinc-800 bg-[#0E0E12] p-6">
              {isLoadingPosts && (
                <p className="mb-6 border border-zinc-800 bg-[#0E0E12] px-4 py-3 text-xs text-zinc-400">
                  Cargando publicaciones guardadas…
                </p>
              )}
              {persistenceError && (
                <div role="alert" className="mb-4 border border-red-900 bg-red-950/40 px-4 py-3 text-xs text-red-300">
                  {persistenceError}
                </div>
              )}
              <HeadPubliRegister
                count={filteredItems.length}
                filterType={filterType}
                onFilterChange={setFilterType}
              />
              <FilterRegister
                items={filteredItems}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSelectSection={onSelectSection}
                onDeleteItem={handleDeleteItem}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
