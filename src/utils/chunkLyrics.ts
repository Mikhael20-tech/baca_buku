import { SlideItem } from '../types/stage';

/**
 * Memecah teks mentah (kidung atau pasal bacaan) menjadi array slide
 * berdasarkan baris kosong (paragraf/bait) atau batas maksimal baris per slide.
 */
export function chunkTextToSlides(rawText: string, maxLinesPerSlide = 4): SlideItem[] {
  if (!rawText) return [];

  const stanzas = rawText
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const slides: SlideItem[] = [];

  stanzas.forEach((stanza, sIdx) => {
    const lines = stanza.split('\n').map((l) => l.trim()).filter(Boolean);

    if (lines.length <= maxLinesPerSlide) {
      slides.push({
        id: `slide-${sIdx}-0`,
        label: `Bait ${sIdx + 1}`,
        content: lines.join('\n'),
      });
    } else {
      for (let i = 0; i < lines.length; i += maxLinesPerSlide) {
        const chunk = lines.slice(i, i + maxLinesPerSlide);
        const partNumber = Math.floor(i / maxLinesPerSlide) + 1;
        slides.push({
          id: `slide-${sIdx}-${partNumber}`,
          label: `Bait ${sIdx + 1} (${partNumber})`,
          content: chunk.join('\n'),
        });
      }
    }
  });

  return slides;
}

