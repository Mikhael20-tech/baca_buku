import JSZip from 'jszip';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { SlideItem } from '../types/stage';
import { chunkTextToSlides } from './chunkLyrics';

// Konfigurasi worker PDF.js untuk Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Resize/kompres gambar ke DataURL (max 1600px) agar ringan disinkronkan ke layar LiveOutput.
 */
function fileToOptimizedImageUrl(file: File, maxDim = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export async function parseImageFiles(files: File[]): Promise<SlideItem[]> {
  const slides: SlideItem[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageUrl = await fileToOptimizedImageUrl(file);
    slides.push({
      id: `img-${Date.now()}-${i}`,
      label: files.length === 1 ? file.name : `Gambar ${i + 1}`,
      content: '',
      imageUrl,
    });
  }
  return slides;
}

export async function parsePdfFile(
  file: File,
  onProgress?: (page: number, total: number) => void
): Promise<SlideItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const total = pdf.numPages;
  const slides: SlideItem[] = [];

  for (let p = 1; p <= total; p++) {
    onProgress?.(p, total);
    const page = await pdf.getPage(p);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (ctx) {
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const imageUrl = canvas.toDataURL('image/jpeg', 0.86);
      slides.push({
        id: `pdf-${Date.now()}-${p}`,
        label: `Halaman ${p}`,
        content: '',
        imageUrl,
      });
    }
  }
  return slides;
}

export async function parseWordFile(file: File): Promise<{ slides: SlideItem[]; rawText: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = (result.value || '').trim();
  if (!rawText) {
    throw new Error('Dokumen Word kosong atau tidak memiliki teks yang dapat dibaca.');
  }
  const slides = chunkTextToSlides(rawText, 4).map((s, idx) => ({
    ...s,
    id: `docx-${Date.now()}-${idx}`,
    label: `Bagian ${idx + 1}`,
  }));
  return { slides, rawText };
}

export async function parsePptxFile(file: File): Promise<{ slides: SlideItem[]; rawText: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const numA = Number(a.match(/slide(\d+)\.xml/i)?.[1] || 0);
      const numB = Number(b.match(/slide(\d+)\.xml/i)?.[1] || 0);
      return numA - numB;
    });

  if (slidePaths.length === 0) {
    throw new Error('Tidak ditemukan slide di dalam file PowerPoint (.pptx) ini.');
  }

  const parser = new DOMParser();
  const slides: SlideItem[] = [];
  const rawParts: string[] = [];

  for (let i = 0; i < slidePaths.length; i++) {
    const xmlStr = await zip.files[slidePaths[i]].async('string');
    const doc = parser.parseFromString(xmlStr, 'application/xml');
    const paragraphs = Array.from(doc.getElementsByTagName('a:p'));

    const lines = paragraphs
      .map((p) => {
        const texts = Array.from(p.getElementsByTagName('a:t')).map((t) => t.textContent || '');
        return texts.join('').trim();
      })
      .filter((line) => line.length > 0);

    const content = lines.join('\n').trim() || `(Slide ${i + 1} tanpa teks — ekspor ke PDF/Gambar jika berisi desain grafis)`;
    rawParts.push(content);
    slides.push({
      id: `pptx-${Date.now()}-${i + 1}`,
      label: `Slide ${i + 1}`,
      content,
    });
  }

  return { slides, rawText: rawParts.join('\n\n') };
}
