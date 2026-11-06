import { ASSETS } from "./Assets";
export { ASSETS } from "./Assets";

export type SectionId = 'inicio' | 'resenas' | 'galeria' | 'videopodcast' | 'eventos' | 'radio' | 'merch' | 'contacto' | 'cms';
export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  src?: string;
  duration: string;
  currentTime: string;
  isLive?: boolean;
  bitrate: string;
  cover: string;
}
