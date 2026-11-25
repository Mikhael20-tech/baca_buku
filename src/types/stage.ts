export type DisplayMode = 'LIVE' | 'CLEAR' | 'BLACKOUT';

export interface SlideFootnote {
  verse: number;
  note_idx: number;
  keyword: string;
  text: string;
}

export interface SlideItem {
  id: string;
  label: string;
  content: string;
  imageUrl?: string;
  markedContent?: string;
  footnotes?: SlideFootnote[];
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
  imageUrl?: string;
  slideIndex: number;
  totalSlides: number;
  mode: DisplayMode;
  theme?: 'default' | 'lower-third' | 'amber-gold';
  tickerText?: string;
  tickerActive?: boolean;
  tickerSpeed?: number;
  fontSize?: number;
  badgeFontSize?: number;
  updatedAt: number;
}

