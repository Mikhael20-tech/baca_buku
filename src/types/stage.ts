export type DisplayMode = 'LIVE' | 'CLEAR' | 'BLACKOUT';

export interface SlideItem {
  id: string;
  label: string;
  content: string;
}

export interface SongSetItem {
  id: string;
  title: string;
  subtitle?: string;
  rawText: string;
  slides: SlideItem[];
}

export interface StageState {
  roomId: string;
  activeSongId: string;
  title: string;
  subtitle?: string;
  content: string;
  slideIndex: number;
  totalSlides: number;
  mode: DisplayMode;
  theme?: 'default' | 'lower-third' | 'amber-gold';
  tickerText?: string;
  tickerActive?: boolean;
  tickerSpeed?: number;
  updatedAt: number;
}

