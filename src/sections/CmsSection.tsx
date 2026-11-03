import React, { useEffect, useState } from 'react';
import type { SectionId } from '../data/mockData';
import HeadCMS from '../components/CMS/HeadCMS';
import ControlModule from '../components/CMS/ControlModule';
import Nodo from '../components/CMS/Nodo';
import Metrics from '../components/CMS/Metrics';
import HeadPubliRegister from '../components/CMS/HeadPubliRegister';
import FilterRegister from '../components/CMS/FilterRegister';
import PublishDiscForm from '../components/CMS/PublishDiscForm';
import PublishGalleryForm from '../components/CMS/PublishGalleryForm';
import {
  INITIAL_CMS_GALLERIES,
  INITIAL_CMS_ITEMS,
  type CmsVideoItem,
  type CmsGalleryItem,
  type CmsPostCreateInput,
  type CmsPostItem,
} from '../data/Cms';
import { readJsonResponse } from '../data/readJsonResponse';
import PublishVideoForm from '../components/CMS/PublishVideoForm';
import { INITIAL_CMS_VIDEOS } from '../data/HomeVideo';

interface CmsSectionProps {
  onSelectSection: (section: SectionId) => void;
}

type CmsComposerType = 'RECOMENDACION' | 'GALERIA' | 'VIDEO';

export const CmsSection: React.FC<CmsSectionProps> = ({ onSelectSection }) => {
  const [items, setItems] = useState<CmsPostItem[]>(INITIAL_CMS_ITEMS);
  const [galleries, setGalleries] = useState<CmsGalleryItem[]>(INITIAL_CMS_GALLERIES);
  const [videos, setVideos] = useState<CmsVideoItem[]>(INITIAL_CMS_VIDEOS);
  const [editingGallery, setEditingGallery] = useState<CmsGalleryItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<CmsVideoItem | null>(null);
  const [composerType, setComposerType] = useState<CmsComposerType>('RECOMENDACION');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadPosts = async () => {
      try {
        const [postsResponse, galleriesResponse, videosResponse] = await Promise.all([
          fetch('/api/cms/posts', { signal: controller.signal }),
          fetch('/api/cms/galleries', { signal: controller.signal }),
          fetch('/api/cms/videos', { signal: controller.signal }),
        ]);
        const [posts, savedGalleries, savedVideos] = await Promise.all([
          readJsonResponse<unknown>(postsResponse, 'No se pudieron cargar las publicaciones.'),
          readJsonResponse<unknown>(galleriesResponse, 'No se pudieron cargar las galerías.'),
          readJsonResponse<unknown>(videosResponse, 'No se pudieron cargar los videos.'),
        ]);
        if (!Array.isArray(posts) || !Array.isArray(savedGalleries) || !Array.isArray(savedVideos)) {
          throw new Error('El servidor devolvió registros del CMS no válidos.');
        }

        setItems(posts as CmsPostItem[]);
        setGalleries(savedGalleries as CmsGalleryItem[]);
        setVideos(savedVideos as CmsVideoItem[]);
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
    const intervalId = window.setInterval(() => {
      void loadPosts();
    }, 15_000);
    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, []);

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

  const handleSaveGallery = (gallery: CmsGalleryItem) => {
    setGalleries((currentGalleries) => [
      gallery,
      ...currentGalleries.filter((current) => current.id !== gallery.id),
    ]);
    setPersistenceError(null);
  };

  const handleSaveVideo = (video: CmsVideoItem) => {
    setVideos((currentVideos) => [
      video,
      ...currentVideos.filter((current) => current.id !== video.id),
    ]);
    setPersistenceError(null);
  };

  const handleContinueGallery = (id: string) => {
    const gallery = galleries.find((item) => item.id === id);
    if (!gallery) {
      setPersistenceError('No se encontró el borrador de galería seleccionado.');
      return;
    }

    setEditingGallery(gallery);
    setComposerType('GALERIA');
  };

  const handleContinueVideo = (id: string) => {
    const video = videos.find((item) => item.id === id);
    if (!video) {
      setPersistenceError('No se encontró el borrador de video seleccionado.');
      return;
    }

    setEditingVideo(video);
    setComposerType('VIDEO');
  };

  const handleDeleteItem = async (id: string, isVideo: boolean) => {
    try {
      const response = await fetch(
        `/api/cms/${isVideo ? 'videos' : 'posts'}/${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      );
      if (!response.ok) {
        await readJsonResponse<unknown>(
          response,
          isVideo ? 'No se pudo eliminar el video.' : 'No se pudo eliminar la publicación.',
        );
      }

      if (isVideo) setVideos((currentVideos) => currentVideos.filter((item) => item.id !== id));
      else setItems((currentItems) => currentItems.filter((item) => item.id !== id));
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

            <section className="border border-zinc-800 bg-[#0E0E12] p-6">
              <label className="block max-w-sm">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  TIPO DE PUBLICACIÓN
                </span>
                <select
                  value={composerType}
                  onChange={(event) => setComposerType(event.target.value as CmsComposerType)}
                  className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                >
                  <option value="RECOMENDACION">RECOMENDACIÓN</option>
                  <option value="GALERIA">GALERÍA</option>
                  <option value="VIDEO">VIDEOS</option>
                </select>
              </label>
            </section>

            {composerType === 'RECOMENDACION' ? (
              <PublishDiscForm
                type={composerType}
                onCreatePost={handleCreatePost}
                onCreatePostError={handleCreatePostError}
                disabled={isLoadingPosts}
              />
            ) : composerType === 'GALERIA' ? (
              <PublishGalleryForm
                draft={editingGallery}
                onSaveGallery={handleSaveGallery}
                onFinishEditing={() => setEditingGallery(null)}
              />
            ) : (
              <PublishVideoForm
                draft={editingVideo}
                onSaveVideo={handleSaveVideo}
                onFinishEditing={() => setEditingVideo(null)}
              />
            )}

            {/* EDITORIAL QUEUE TABLE */}
            <div className="border border-zinc-800 bg-[#0E0E12] p-6">
              {isLoadingPosts && (
                <p className="mb-6 border border-zinc-800 bg-[#0E0E12] px-4 py-3 text-xs text-zinc-400">
                  Cargando publicaciones, galerías y videos guardados…
                </p>
              )}
              {persistenceError && (
                <div role="alert" className="mb-4 border border-red-900 bg-red-950/40 px-4 py-3 text-xs text-red-300">
                  {persistenceError}
                </div>
              )}
              <HeadPubliRegister
                count={items.length + galleries.length + videos.length}
              />
              <FilterRegister
                items={items}
                galleries={galleries}
                videos={videos}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSelectSection={onSelectSection}
                onDeleteItem={handleDeleteItem}
                onContinueGallery={handleContinueGallery}
                onContinueVideo={handleContinueVideo}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
