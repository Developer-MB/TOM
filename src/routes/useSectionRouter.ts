import { useLayoutEffect, useState } from 'react';
import type { SectionId } from '../data/mockData';

export const SECTION_PATHS: Record<SectionId, string> = {
  inicio: '/',
  resenas: '/recomendaciones',
  galeria: '/galeria',
  videopodcast: '/videos',
  eventos: '/giras',
  radio: '/radio',
  merch: '/merch',
  contacto: '/contacto',
  cms: '/cms-admin',
};

const PATH_SECTIONS: Record<string, SectionId> = {
  '/': 'inicio',
  '/inicio': 'inicio',
  '/recomendaciones': 'resenas',
  '/galeria': 'galeria',
  '/videos': 'videopodcast',
  '/giras': 'eventos',
  '/radio': 'radio',
  '/merch': 'merch',
  '/mercancia': 'merch',
  '/contacto': 'contacto',
  '/prensa': 'contacto',
  '/cms-admin': 'cms',
};

const VALID_SECTIONS = new Set<SectionId>(Object.keys(SECTION_PATHS) as SectionId[]);

export const getSectionFromLocation = (
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
): SectionId => {
  const pathname = location.pathname.replace(/\/+$/, '').toLowerCase() || '/';
  const pathSection = PATH_SECTIONS[pathname];
  if (pathSection) return pathSection;

  const params = new URLSearchParams(location.search);
  const sectionParam = params.get('section') || location.hash.replace(/^#/, '');
  return VALID_SECTIONS.has(sectionParam as SectionId) ? (sectionParam as SectionId) : 'inicio';
};

export const useSectionRouter = () => {
  const [activeSection, setActiveSection] = useState<SectionId>(() =>
    typeof window === 'undefined' ? 'inicio' : getSectionFromLocation(window.location),
  );

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    const handlePopState = () => {
      setActiveSection(getSectionFromLocation(window.location));
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  const navigateToSection = (section: SectionId) => {
    const nextPath = SECTION_PATHS[section];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ section }, '', nextPath);
    }
    setActiveSection(section);
    window.scrollTo(0, 0);
  };

  return { activeSection, navigateToSection };
};
