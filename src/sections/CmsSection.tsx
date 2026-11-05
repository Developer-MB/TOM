import React, { useEffect, useMemo, useState } from 'react';
import type { AudioTrack, SectionId } from '../data/mockData';
import HeadCMS from '../components/CMS/HeadCMS';
import ControlModule, { type CmsComposerType } from '../components/CMS/ControlModule';
import Nodo from '../components/CMS/Nodo';
import HeadPubliRegister from '../components/CMS/HeadPubliRegister';
import FilterRegister from '../components/CMS/FilterRegister';
import PublishDiscForm from '../components/CMS/PublishDiscForm';
import PublishGalleryForm from '../components/CMS/PublishGalleryForm';
import {
  INITIAL_CMS_GALLERIES,
  INITIAL_CMS_ITEMS,
  type CmsMerchProduct,
  type CmsVideoItem,
  type CmsTourItem,
  type CmsGalleryItem,
  type CmsPostCreateInput,
  type CmsPostItem,
} from '../data/Cms';
import {
  CMS_PERMISSION_LABELS,
  CMS_USERS_UPDATED_EVENT,
  clearCmsSession,
  getRoleStyle,
  getStoredCmsSession,
  hasSectionPermission,
  readUsersDictionary,
  type CmsAuthSession,
  type CmsSectionPermission,
} from '../data/CmsUsers';
import {
  MERCH_UPDATED_EVENT,
  normalizeMerchProduct,
  readStoredMerchCatalog,
  writeStoredMerchCatalog,
} from '../data/Merch';
import {
  RADIO_UPDATED_EVENT,
  readStoredRadioTracks,
  writeStoredRadioTracks,
  type CmsRadioTrack,
} from '../data/Radio';
import { readJsonResponse, readJsonResponseOrFallback } from '../data/readJsonResponse';
import PublishVideoForm from '../components/CMS/PublishVideoForm';
import { INITIAL_CMS_VIDEOS } from '../data/HomeVideo';
import PublishTourForm from '../components/CMS/PublishTourForm';
import { INITIAL_CMS_TOURS } from '../data/HomeTours';
import PublishMerchForm from '../components/CMS/PublishMerchForm';
import PublishRadioForm from '../components/CMS/PublishRadioForm';
import ManageUsersForm from '../components/CMS/ManageUsersForm';
import CmsLogin from '../components/CMS/CmsLogin';
import { authenticatedCmsFetch } from '../lib/firebaseClient';

interface CmsSectionProps {
  onSelectSection: (section: SectionId) => void;
  currentTrack?: AudioTrack;
  isPlaying?: boolean;
  audioAnalyser?: AnalyserNode | null;
}

const COMPOSER_CATALOG: Array<{
  value: CmsComposerType;
  label: string;
  permission: CmsSectionPermission;
  superAdminOnly?: boolean;
}> = [
    { value: 'RECOMENDACION', label: 'RECOMENDACIONES', permission: 'RECOMENDACION' },
    { value: 'GALERIA', label: 'GALERÍA', permission: 'GALERIA' },
    { value: 'VIDEO', label: 'VIDEOS', permission: 'VIDEO' },
    { value: 'TOUR', label: 'GIRAS', permission: 'TOUR' },
    { value: 'RADIO', label: 'RADIO 24/7', permission: 'RADIO' },
    { value: 'MERCH', label: 'MERCH / MERCANCÍA', permission: 'MERCH' },
    {
      value: 'USUARIOS',
      label: 'USUARIOS Y PERMISOS (SUPERADMIN)',
      permission: 'CMS',
      superAdminOnly: true,
    },
  ];

export const CmsSection: React.FC<CmsSectionProps> = (props) => {
  const [session, setSession] = useState<CmsAuthSession | null>(() => getStoredCmsSession());

  useEffect(() => {
    const syncSession = () => {
      setSession(getStoredCmsSession());
    };
    window.addEventListener(CMS_USERS_UPDATED_EVENT, syncSession);
    window.addEventListener('storage', syncSession);
    return () => {
      window.removeEventListener(CMS_USERS_UPDATED_EVENT, syncSession);
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  if (!session) {
    return <CmsLogin onLoginSuccess={(newSession) => setSession(newSession)} />;
  }

  const roleStyle = getRoleStyle(session.role);

  return (
    <>
      <div className="border-b border-zinc-800 bg-[#09090b] font-mono text-[10px] text-zinc-400">
        <div className="max-w-[1440px] mx-auto px-8 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="uppercase tracking-widest text-zinc-500">SECCIONES HABILITADAS:</span>
            {session.permissions.map((perm) => (
              <span
                key={perm}
                className="border border-zinc-800 bg-[#0E0E12] px-2 py-0.5 text-[9px] uppercase text-zinc-300"
              >
                {CMS_PERMISSION_LABELS[perm]}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="flex items-center gap-1.5 text-xs">
              <strong className="text-white">{session.username}</strong>
              <span className={`font-bold uppercase ${roleStyle.textClass}`}>
                ({roleStyle.label})
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                clearCmsSession();
                setSession(null);
              }}
              className="cursor-pointer border border-zinc-700 px-3 py-1.5 uppercase text-white hover:border-[#DC2626]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
      <CmsWorkspace
        key={session.username}
        session={session}
        onSessionUpdated={() => setSession(getStoredCmsSession())}
        {...props}
      />
    </>
  );
};

interface CmsWorkspaceProps extends CmsSectionProps {
  session: CmsAuthSession;
  onSessionUpdated: () => void;
}

const CmsWorkspace: React.FC<CmsWorkspaceProps> = ({
  session,
  onSessionUpdated,
  onSelectSection,
  currentTrack,
  isPlaying,
  audioAnalyser,
}) => {
  const [items, setItems] = useState<CmsPostItem[]>(INITIAL_CMS_ITEMS);
  const [galleries, setGalleries] = useState<CmsGalleryItem[]>(INITIAL_CMS_GALLERIES);
  const [videos, setVideos] = useState<CmsVideoItem[]>(INITIAL_CMS_VIDEOS);
  const [tours, setTours] = useState<CmsTourItem[]>(INITIAL_CMS_TOURS);
  const [radioTracks, setRadioTracks] = useState<CmsRadioTrack[]>(() => readStoredRadioTracks());
  const [merchProducts, setMerchProducts] = useState<CmsMerchProduct[]>(() => readStoredMerchCatalog());
  const [userCount, setUserCount] = useState<number>(() => Object.keys(readUsersDictionary()).length);
  const [editingGallery, setEditingGallery] = useState<CmsGalleryItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<CmsVideoItem | null>(null);
  const [editingTour, setEditingTour] = useState<CmsTourItem | null>(null);
  const [editingRadio, setEditingRadio] = useState<CmsRadioTrack | null>(null);
  const [editingMerch, setEditingMerch] = useState<CmsMerchProduct | null>(null);

  const allowedComposerOptions = useMemo(
    () =>
      COMPOSER_CATALOG.filter((option) => {
        if (option.superAdminOnly) return session.role === 'SUPERADMIN';
        return hasSectionPermission(session, option.permission);
      }),
    [session],
  );

  const [composerType, setComposerType] = useState<CmsComposerType>(
    () => allowedComposerOptions[0]?.value ?? 'RECOMENDACION',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  useEffect(() => {
    if (
      allowedComposerOptions.length > 0 &&
      !allowedComposerOptions.some((opt) => opt.value === composerType)
    ) {
      setComposerType(allowedComposerOptions[0].value);
    }
  }, [allowedComposerOptions, composerType]);

  useEffect(() => {
    const handleMerchSync = () => {
      setMerchProducts(readStoredMerchCatalog());
    };
    const handleRadioSync = () => {
      setRadioTracks(readStoredRadioTracks());
    };
    const handleUsersSync = () => {
      setUserCount(Object.keys(readUsersDictionary()).length);
    };
    window.addEventListener(MERCH_UPDATED_EVENT, handleMerchSync);
    window.addEventListener(RADIO_UPDATED_EVENT, handleRadioSync);
    window.addEventListener(CMS_USERS_UPDATED_EVENT, handleUsersSync);
    window.addEventListener('storage', handleMerchSync);
    window.addEventListener('storage', handleRadioSync);
    window.addEventListener('storage', handleUsersSync);
    return () => {
      window.removeEventListener(MERCH_UPDATED_EVENT, handleMerchSync);
      window.removeEventListener(RADIO_UPDATED_EVENT, handleRadioSync);
      window.removeEventListener(CMS_USERS_UPDATED_EVENT, handleUsersSync);
      window.removeEventListener('storage', handleMerchSync);
      window.removeEventListener('storage', handleRadioSync);
      window.removeEventListener('storage', handleUsersSync);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadPosts = async () => {
      try {
        const localMerch = readStoredMerchCatalog();
        const [postsResponse, galleriesResponse, videosResponse, toursResponse, merchResponse] = await Promise.all([
          authenticatedCmsFetch('/api/cms/posts', { signal: controller.signal }),
          authenticatedCmsFetch('/api/cms/galleries', { signal: controller.signal }),
          authenticatedCmsFetch('/api/cms/videos', { signal: controller.signal }),
          authenticatedCmsFetch('/api/cms/tours', { signal: controller.signal }),
          authenticatedCmsFetch('/api/cms/merch', { signal: controller.signal }),
        ]);
        const [posts, savedGalleries, savedVideos, savedTours, savedMerch] = await Promise.all([
          readJsonResponseOrFallback<unknown>(
            postsResponse,
            'No se pudieron cargar las publicaciones.',
            INITIAL_CMS_ITEMS,
          ),
          readJsonResponseOrFallback<unknown>(
            galleriesResponse,
            'No se pudieron cargar las galerías.',
            INITIAL_CMS_GALLERIES,
          ),
          readJsonResponseOrFallback<unknown>(
            videosResponse,
            'No se pudieron cargar los videos.',
            INITIAL_CMS_VIDEOS,
          ),
          readJsonResponseOrFallback<unknown>(
            toursResponse,
            'No se pudieron cargar las giras.',
            INITIAL_CMS_TOURS,
          ),
          readJsonResponseOrFallback<unknown>(
            merchResponse,
            'No se pudo cargar la mercancía.',
            localMerch,
          ),
        ]);
        if (
          !Array.isArray(posts) ||
          !Array.isArray(savedGalleries) ||
          !Array.isArray(savedVideos) ||
          !Array.isArray(savedTours) ||
          !Array.isArray(savedMerch)
        ) {
          throw new Error('El servidor devolvió registros del CMS no válidos.');
        }

        setItems(posts as CmsPostItem[]);
        setGalleries(savedGalleries as CmsGalleryItem[]);
        setVideos(savedVideos as CmsVideoItem[]);
        setTours(savedTours as CmsTourItem[]);
        const normalizedMerch = (savedMerch as CmsMerchProduct[]).map(normalizeMerchProduct);
        setMerchProducts(normalizedMerch);
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
    const response = await authenticatedCmsFetch('/api/cms/posts', {
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

  const handleSaveTour = (tour: CmsTourItem) => {
    setTours((currentTours) => [
      tour,
      ...currentTours.filter((current) => current.id !== tour.id),
    ]);
    setPersistenceError(null);
  };

  const handleSaveRadioTrack = (track: CmsRadioTrack) => {
    setRadioTracks((currentTracks) => {
      const exists = currentTracks.some((item) => item.id === track.id);
      const nextTracks = exists
        ? currentTracks.map((item) => (item.id === track.id ? track : item))
        : [track, ...currentTracks];
      writeStoredRadioTracks(nextTracks);
      return nextTracks;
    });
    setPersistenceError(null);
  };

  const handleSaveMerchProduct = (product: CmsMerchProduct) => {
    setMerchProducts((currentProducts) => {
      const existingIndex = currentProducts.findIndex((current) => current.id === product.id);
      const nextProducts = existingIndex >= 0
        ? currentProducts.map((current) => (current.id === product.id ? product : current))
        : [product, ...currentProducts];
      writeStoredMerchCatalog(nextProducts);
      return nextProducts;
    });
    setPersistenceError(null);
  };

  const handleContinueGallery = (id: string) => {
    if (!hasSectionPermission(session, 'GALERIA')) return;
    const gallery = galleries.find((item) => item.id === id);
    if (!gallery) {
      setPersistenceError('No se encontró el borrador de galería seleccionado.');
      return;
    }

    setEditingGallery(gallery);
    setComposerType('GALERIA');
  };

  const handleContinueVideo = (id: string) => {
    if (!hasSectionPermission(session, 'VIDEO')) return;
    const video = videos.find((item) => item.id === id);
    if (!video) {
      setPersistenceError('No se encontró el borrador de video seleccionado.');
      return;
    }

    setEditingVideo(video);
    setComposerType('VIDEO');
  };

  const handleContinueTour = (id: string) => {
    if (!hasSectionPermission(session, 'TOUR')) return;
    const tour = tours.find((item) => item.id === id);
    if (!tour) {
      setPersistenceError('No se encontró el registro de gira seleccionado.');
      return;
    }

    setEditingTour(tour);
    setComposerType('TOUR');
  };

  const handleContinueRadio = (id: string) => {
    if (!hasSectionPermission(session, 'RADIO')) return;
    const track = radioTracks.find((item) => item.id === id);
    if (!track) {
      setPersistenceError('No se encontró el tema de radio seleccionado.');
      return;
    }

    setEditingRadio(track);
    setComposerType('RADIO');
  };

  const handleContinueMerch = (id: string) => {
    if (!hasSectionPermission(session, 'MERCH')) return;
    const product = merchProducts.find((item) => item.id === id);
    if (!product) {
      setPersistenceError('No se encontró el producto de mercancía seleccionado.');
      return;
    }

    setEditingMerch(product);
    setComposerType('MERCH');
  };

  const handleDeleteItem = async (id: string, type: 'post' | 'video' | 'tour' | 'radio' | 'merch') => {
    try {
      if (type === 'radio') {
        setRadioTracks((currentTracks) => {
          const remaining = currentTracks.filter((item) => item.id !== id);
          writeStoredRadioTracks(remaining);
          return remaining;
        });
        setPersistenceError(null);
        return;
      }

      const endpoint = {
        post: 'posts',
        video: 'videos',
        tour: 'tours',
        merch: 'merch',
      }[type];
      try {
        const response = await authenticatedCmsFetch(
          `/api/cms/${endpoint}/${encodeURIComponent(id)}`,
          { method: 'DELETE' },
        );
        if (!response.ok) {
          await readJsonResponse<unknown>(
            response,
            type === 'video'
              ? 'No se pudo eliminar el video.'
              : type === 'tour'
                ? 'No se pudo eliminar la gira.'
                : type === 'merch'
                  ? 'No se pudo eliminar el producto.'
                  : 'No se pudo eliminar la publicación.',
          );
        }
      } catch (apiError) {
        if (type !== 'merch') throw apiError;
      }

      if (type === 'video') setVideos((currentVideos) => currentVideos.filter((item) => item.id !== id));
      else if (type === 'tour') setTours((currentTours) => currentTours.filter((item) => item.id !== id));
      else if (type === 'merch') {
        setMerchProducts((currentProducts) => {
          const remaining = currentProducts.filter((item) => item.id !== id);
          writeStoredMerchCatalog(remaining);
          return remaining;
        });
      }
      else setItems((currentItems) => currentItems.filter((item) => item.id !== id));
      setPersistenceError(null);
    } catch (error) {
      setPersistenceError(error instanceof Error ? error.message : 'No se pudo eliminar la publicación.');
    }
  };

  const composerForm = (() => {
    switch (composerType) {
      case 'RECOMENDACION':
        if (!hasSectionPermission(session, 'RECOMENDACION')) return null;
        return (
          <PublishDiscForm
            type={composerType}
            onCreatePost={handleCreatePost}
            onCreatePostError={handleCreatePostError}
            disabled={isLoadingPosts}
          />
        );
      case 'GALERIA':
        if (!hasSectionPermission(session, 'GALERIA')) return null;
        return (
          <PublishGalleryForm
            draft={editingGallery}
            onSaveGallery={handleSaveGallery}
            onFinishEditing={() => setEditingGallery(null)}
          />
        );
      case 'VIDEO':
        if (!hasSectionPermission(session, 'VIDEO')) return null;
        return (
          <PublishVideoForm
            draft={editingVideo}
            onSaveVideo={handleSaveVideo}
            onFinishEditing={() => setEditingVideo(null)}
          />
        );
      case 'TOUR':
        if (!hasSectionPermission(session, 'TOUR')) return null;
        return (
          <PublishTourForm
            draft={editingTour}
            onSaveTour={handleSaveTour}
            onFinishEditing={() => setEditingTour(null)}
          />
        );
      case 'RADIO':
        if (!hasSectionPermission(session, 'RADIO')) return null;
        return (
          <PublishRadioForm
            draft={editingRadio}
            existingTracks={radioTracks}
            onSaveTrack={handleSaveRadioTrack}
            onFinishEditing={() => setEditingRadio(null)}
          />
        );
      case 'MERCH':
        if (!hasSectionPermission(session, 'MERCH')) return null;
        return (
          <PublishMerchForm
            draft={editingMerch}
            existingProducts={merchProducts}
            onSaveProduct={handleSaveMerchProduct}
            onFinishEditing={() => setEditingMerch(null)}
          />
        );
      case 'USUARIOS':
        if (session.role !== 'SUPERADMIN') return null;
        return (
          <ManageUsersForm
            currentUsername={session.username}
            onSessionUpdated={onSessionUpdated}
          />
        );
      default:
        return null;
    }
  })();

  const visibleEntriesCount =
    (hasSectionPermission(session, 'RECOMENDACION') ? items.length : 0) +
    (hasSectionPermission(session, 'GALERIA') ? galleries.length : 0) +
    (hasSectionPermission(session, 'VIDEO') ? videos.length : 0) +
    (hasSectionPermission(session, 'TOUR') ? tours.length : 0) +
    (hasSectionPermission(session, 'RADIO') ? radioTracks.length : 0) +
    (hasSectionPermission(session, 'MERCH') ? merchProducts.length : 0);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TOP ADMIN COMMAND BAR */}
        <div className="border border-zinc-800 bg-[#0E0E12] px-6 py-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <HeadCMS onSelectSection={onSelectSection} />
        </div>

        {/* MAIN CMS WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR NAVIGATION (3 COLS) */}
          <aside className="lg:col-span-3 space-y-6">
            <ControlModule
              session={session}
              activeComposer={composerType}
              onSelectComposer={setComposerType}
              recommendationCount={items.filter((item) => item.type === 'RECOMENDACION').length}
              videoCount={videos.length}
              galleryCount={galleries.length}
              tourCount={tours.length}
              radioCount={radioTracks.length}
              merchCount={merchProducts.length}
              userCount={userCount}
            />

            {/* Icecast / FLAC Server Status Card (Visible to SUPERADMIN or users with RADIO permission) */}
            {(session.role === 'SUPERADMIN' || hasSectionPermission(session, 'RADIO')) && (
              <Nodo
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                audioAnalyser={audioAnalyser}
              />
            )}
          </aside>

          {/* MAIN WORKSPACE AREA (9 COLS) */}
          <div className="lg:col-span-9 space-y-6">
            <section className="border border-zinc-800 bg-[#0E0E12] p-6 flex flex-wrap items-end justify-between gap-4">
              <label className="block w-full max-w-sm">
                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  MÓDULO / SECCIÓN A MODIFICAR
                </span>
                <select
                  value={composerType}
                  onChange={(event) => setComposerType(event.target.value as CmsComposerType)}
                  className="w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none"
                >
                  {allowedComposerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {session.role === 'SUPERADMIN' && (
                <button
                  type="button"
                  onClick={() => setComposerType(composerType === 'USUARIOS' ? 'RECOMENDACION' : 'USUARIOS')}
                  className={`border px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${composerType === 'USUARIOS'
                    ? 'border-[#DC2626] bg-[#DC2626] text-white'
                    : 'border-zinc-700 bg-[#070709] text-zinc-200 hover:border-[#DC2626] hover:text-white'
                    }`}
                >
                  {composerType === 'USUARIOS' ? '← VOLVER A PUBLICACIONES' : 'GESTIONAR USUARIOS Y ROLES'}
                </button>
              )}
            </section>

            {composerForm}

            {/* EDITORIAL QUEUE TABLE */}
            <div className="border border-zinc-800 bg-[#0E0E12] p-6">
              {isLoadingPosts && (
                <p className="mb-6 border border-zinc-800 bg-[#0E0E12] px-4 py-3 text-xs text-zinc-400">
                  Cargando publicaciones, galerías, videos, giras y mercancía guardados…
                </p>
              )}
              {persistenceError && (
                <div role="alert" className="mb-4 border border-red-900 bg-red-950/40 px-4 py-3 text-xs text-red-300">
                  {persistenceError}
                </div>
              )}
              <HeadPubliRegister count={visibleEntriesCount} />
              <FilterRegister
                items={items}
                galleries={galleries}
                videos={videos}
                tours={tours}
                radioTracks={radioTracks}
                merchProducts={merchProducts}
                allowedPermissions={session.permissions}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onSelectSection={onSelectSection}
                onDeleteItem={handleDeleteItem}
                onContinueGallery={handleContinueGallery}
                onContinueVideo={handleContinueVideo}
                onContinueTour={handleContinueTour}
                onContinueRadio={handleContinueRadio}
                onContinueMerch={handleContinueMerch}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
