import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, Search, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, 
  BookOpen, Sparkles, Compass, ExternalLink, Info, Check, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function BibleTruthChartsModal({ 
  isOpen, 
  onClose, 
  onNavigateToVerse, 
  bibleLang = 'id',
  onOpenBook,
  allBooks = [],
  onOpenLibrary
}) {
  const [charts, setCharts] = useState([]);
  const [selectedChartId, setSelectedChartId] = useState('chart-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [isLoadingSvg, setIsLoadingSvg] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const svgContainerRef = useRef(null);

  // 1. Fetch metadata all 23 charts
  useEffect(() => {
    if (!isOpen) return;
    fetch('/truthcharts/truth_charts_data.json')
      .then(res => res.json())
      .then(data => {
        setCharts(data);
        if (data.length > 0 && !selectedChartId) {
          setSelectedChartId(data[0].id);
        }
      })
      .catch(err => console.error('Failed to load truth charts:', err));
  }, [isOpen]);

  const currentChart = charts.find(c => c.id === selectedChartId) || charts[0];

  // 2. Fetch SVG when chart changes
  useEffect(() => {
    if (!currentChart?.svg_file || !isOpen) return;
    setIsLoadingSvg(true);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });

    fetch(currentChart.svg_file)
      .then(res => res.text())
      .then(svgText => {
        setSvgContent(svgText);
        setIsLoadingSvg(false);
        // Default select func1 if available
        if (currentChart.nodes && currentChart.nodes.func1) {
          setActiveNode(currentChart.nodes.func1);
        } else if (currentChart.nodes && Object.keys(currentChart.nodes).length > 0) {
          const firstKey = Object.keys(currentChart.nodes)[0];
          setActiveNode(currentChart.nodes[firstKey]);
        } else {
          setActiveNode(null);
        }
      })
      .catch(err => {
        console.error('Failed to load SVG:', err);
        setIsLoadingSvg(false);
      });
  }, [currentChart?.svg_file, isOpen]);

  // 3. Register global onclick handlers for SVG nodes
  useEffect(() => {
    if (!currentChart?.nodes) return;
    const nodeKeys = Object.keys(currentChart.nodes);
    nodeKeys.forEach(fnKey => {
      window[fnKey] = () => {
        setActiveNode(currentChart.nodes[fnKey]);
      };
    });

    return () => {
      nodeKeys.forEach(fnKey => {
        delete window[fnKey];
      });
    };
  }, [currentChart]);

  // Pan & Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('text') || e.target.closest('polygon') || e.target.closest('rect')) {
      // Allow clicking nodes
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Filtered chart list
  const filteredCharts = charts.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.title_en.toLowerCase().includes(q) ||
      (c.title_id && c.title_id.toLowerCase().includes(q)) ||
      String(c.number).includes(q)
    );
  });

  // Check if reference points to a book available locally in the app
  const matchedLocalBook = useMemo(() => {
    if (!activeNode?.reference || !allBooks || allBooks.length === 0) return null;
    const refText = activeNode.reference.toLowerCase();
    
    return allBooks.find(b => {
      const titleLower = (b.title || '').toLowerCase();
      if (titleLower.includes('central line') && refText.includes('central line')) return true;
      if (titleLower.includes('job') && refText.includes('job')) return true;
      if (titleLower.includes('all-inclusive christ') && refText.includes('all-inclusive christ')) return true;
      if (titleLower.includes('economy of god') && (refText.includes('economy of god') || refText.includes('divine economy'))) return true;
      if (titleLower.includes('knowledge of life') && refText.includes('knowledge of life')) return true;
      if (titleLower.includes('experience of life') && refText.includes('experience of life')) return true;
      if (titleLower.includes('glorious church') && refText.includes('glorious church')) return true;
      if (titleLower.includes('spiritual authority') && refText.includes('spiritual authority')) return true;
      if (titleLower.includes('normal christian') && refText.includes('normal christian')) return true;
      if (titleLower.includes('release of the spirit') && refText.includes('release of the spirit')) return true;
      if (titleLower.includes('matius') && (refText.includes('matthew') || refText.includes('matius'))) return true;
      if (titleLower.includes('markus') && (refText.includes('mark') || refText.includes('markus'))) return true;
      if (titleLower.includes('lukas') && (refText.includes('luke') || refText.includes('lukas'))) return true;
      if (titleLower.includes('yohanes') && (refText.includes('john') || refText.includes('yohanes'))) return true;
      if (titleLower.includes('roma') && (refText.includes('romans') || refText.includes('roma'))) return true;
      if (titleLower.includes('korintus') && (refText.includes('corinthians') || refText.includes('korintus'))) return true;
      if (titleLower.includes('galatia') && (refText.includes('galatians') || refText.includes('galatia'))) return true;
      if (titleLower.includes('efesus') && (refText.includes('ephesians') || refText.includes('efesus'))) return true;
      if (titleLower.includes('filipi') && (refText.includes('philippians') || refText.includes('filipi'))) return true;
      if (titleLower.includes('kolose') && (refText.includes('colossians') || refText.includes('kolose'))) return true;
      if (titleLower.includes('ibrani') && (refText.includes('hebrews') || refText.includes('ibrani'))) return true;
      if (titleLower.includes('wahyu') && (refText.includes('revelation') || refText.includes('wahyu'))) return true;
      if (titleLower.includes('kejadian') && (refText.includes('genesis') || refText.includes('kejadian'))) return true;
      return false;
    });
  }, [activeNode, allBooks]);

  const currentIndex = charts.findIndex(c => c.id === selectedChartId);
  const handlePrevChart = () => {
    if (currentIndex > 0) {
      setSelectedChartId(charts[currentIndex - 1].id);
    }
  };
  const handleNextChart = () => {
    if (currentIndex < charts.length - 1) {
      setSelectedChartId(charts[currentIndex + 1].id);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#fcfaf5] dark:bg-zinc-950 rounded-2xl sm:rounded-3xl max-w-7xl w-full h-[95vh] shadow-2xl border border-amber-300/80 dark:border-amber-700/60 flex flex-col overflow-hidden animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-amber-50 flex items-center justify-between gap-3 border-b border-amber-700/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/25 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs tracking-wider uppercase text-amber-400 font-mono">
                  {bibleLang === 'en' ? 'Divine Truth Charts' : 'Bagan Kebenaran Ilahi'}
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.2 rounded-full font-mono border border-amber-400/30">
                  Living Stream Ministry (22 Charts)
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-serif font-bold text-amber-100 truncate">
                {currentChart ? `${currentChart.number}. ${bibleLang === 'en' ? currentChart.title_en : (currentChart.title_id || currentChart.title_en)}` : 'Truth Charts'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Chart Navigation */}
            <button
              onClick={handlePrevChart}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 cursor-pointer text-amber-200"
              title="Bagan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-amber-300/90 hidden sm:inline">
              {currentIndex + 1} / {charts.length}
            </span>
            <button
              onClick={handleNextChart}
              disabled={currentIndex >= charts.length - 1}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 cursor-pointer text-amber-200"
              title="Bagan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header: Chart Selector & Zoom Controls */}
        <div className="px-4 py-2 bg-[#f4ecd8] dark:bg-zinc-900 border-b border-amber-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          {/* Chart Dropdown / Picker */}
          <div className="flex items-center gap-2 flex-1 min-w-[280px] max-w-md">
            <select
              value={selectedChartId}
              onChange={(e) => setSelectedChartId(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-amber-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-stone-900 dark:text-zinc-100 shadow-2xs cursor-pointer truncate"
            >
              {charts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.number}. {c.title_id || c.title_en} ({c.title_en})
                </option>
              ))}
            </select>
          </div>

          {/* Zoom & Pan Controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-stone-600 dark:text-zinc-400 mr-1 hidden md:inline">
              Zoom: {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              className="h-7 w-7 p-0 rounded-md bg-white dark:bg-zinc-800 border-amber-300 dark:border-zinc-700 cursor-pointer"
              title="Perbesar Bagan"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              className="h-7 w-7 p-0 rounded-md bg-white dark:bg-zinc-800 border-amber-300 dark:border-zinc-700 cursor-pointer"
              title="Perkecil Bagan"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
              className="h-7 px-2 text-[11px] font-bold rounded-md bg-white dark:bg-zinc-800 border-amber-300 dark:border-zinc-700 cursor-pointer flex items-center gap-1"
              title="Reset Tampilan"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          </div>
        </div>

        {/* Main Body: Grid with SVG on Top/Left and Explanatory Panel at Bottom */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Left/Main Area: Interactive SVG Viewer */}
          <div 
            ref={svgContainerRef}
            className="flex-1 bg-white dark:bg-zinc-900 relative overflow-hidden flex items-center justify-center p-2 sm:p-4 select-none cursor-grab active:cursor-grabbing border-b md:border-b-0 md:border-r border-amber-200 dark:border-zinc-800"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isLoadingSvg ? (
              <div className="flex flex-col items-center justify-center p-12 text-amber-800">
                <div className="w-9 h-9 border-3 border-amber-800/30 border-t-amber-800 rounded-full animate-spin mb-3"></div>
                <p className="text-xs font-mono font-bold">Memuat Diagram Bagan...</p>
              </div>
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center'
                }}
              >
                <div 
                  className="w-full h-full max-h-[75vh] flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:h-auto [&_svg]:w-auto [&_text]:cursor-pointer [&_polygon]:cursor-pointer [&_path]:cursor-pointer"
                  dangerouslySetInnerHTML={{ __html: svgContent }}
                />
              </div>
            )}

            {/* Hint overlay */}
            <div className="absolute bottom-2 left-2 pointer-events-none bg-stone-900/70 text-amber-100 text-[10px] px-2.5 py-1 rounded-md backdrop-blur-xs flex items-center gap-1.5 font-sans">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Klik tulisan atau simbol pada bagan untuk membaca firman &amp; penjelasan buku hayat. Geser untuk geser layar.</span>
            </div>
          </div>

          {/* Right/Bottom Area: Explanatory Detail Card */}
          <div className="w-full md:w-[420px] lg:w-[460px] bg-[#faf5ea] dark:bg-zinc-950 flex flex-col shrink-0 max-h-[42vh] md:max-h-none overflow-hidden">
            <div className="px-4 py-2.5 bg-[#f0e4c8] dark:bg-zinc-900 border-b border-amber-300 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-800 dark:text-amber-400" />
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-zinc-100">
                  Penjelasan &amp; Ayat Firman
                </span>
              </div>
              {activeNode && (
                <Badge variant="outline" className="text-[10px] bg-amber-100 text-amber-900 border-amber-300 font-mono">
                  Aktif
                </Badge>
              )}
            </div>

            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
              {activeNode ? (
                <>
                  {/* Node Title */}
                  <div className="border-b border-amber-200 dark:border-zinc-800 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold block mb-0.5">
                      Topik Bagan Terpilih:
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-stone-950 dark:text-zinc-100 leading-snug">
                      {activeNode.title || 'Topik Kebenaran'}
                    </h3>
                  </div>

                  {/* Ministry Reference */}
                  {activeNode.reference ? (
                    <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-300/80 dark:border-amber-800/60 text-xs text-amber-950 dark:text-amber-200 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-mono">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Rujukan Buku Pelayanan:</span>
                        </span>
                        {matchedLocalBook && (
                          <Badge className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1 shadow-2xs">
                            <Check className="w-2.5 h-2.5" /> Ada di Buku Lokal
                          </Badge>
                        )}
                      </div>

                      {/* Tombol Baca Buku Lokal jika tersedia */}
                      {matchedLocalBook && onOpenBook && (
                        <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-400 dark:border-emerald-700/60 space-y-2 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📖</span>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200 block truncate">
                                {matchedLocalBook.title}
                              </span>
                              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                {matchedLocalBook.author} • Buku Lokal Tersedia
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              onClose();
                              onOpenBook(matchedLocalBook);
                            }}
                            className="w-full bg-[#3B4B34] hover:bg-[#2D3927] text-white text-xs font-bold rounded-xl py-2 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                            <span>Buka &amp; Baca Buku di Aplikasi</span>
                          </Button>
                        </div>
                      )}

                      {/* Detail Kutipan & Tautan Online LSM */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-600 dark:text-zinc-400 font-semibold block">
                          Kutipan Rujukan / Pesan:
                        </span>
                        <div 
                          className="leading-relaxed text-[11px] [&_a]:text-amber-900 dark:[&_a]:text-amber-300 [&_a]:underline [&_a]:font-bold [&_a]:hover:text-amber-700 cursor-pointer"
                          dangerouslySetInnerHTML={{ 
                            __html: activeNode.reference.replace(/<a\s+(?!.*?target=)/gi, '<a target="_blank" rel="noopener noreferrer" ') 
                          }}
                        />
                      </div>

                      {onOpenLibrary && (
                        <div className="pt-2 border-t border-amber-300/40 dark:border-amber-800/40 flex items-center justify-between text-[11px]">
                          <button
                            onClick={() => {
                              onClose();
                              onOpenLibrary();
                            }}
                            className="text-amber-800 dark:text-amber-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>📚 Jelajahi Katalog Buku Lokal →</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Bible Verses */}
                  {activeNode.verses && (
                    <div className="space-y-2">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-stone-700 dark:text-zinc-400 block font-mono">
                        Ayat Alkitab Pendukung:
                      </span>
                      <div 
                        className="text-xs sm:text-[13px] leading-relaxed text-stone-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-amber-200 dark:border-zinc-800 shadow-2xs space-y-2 font-serif [&_p]:mb-2 [&_p:last-child]:mb-0"
                        dangerouslySetInnerHTML={{ __html: activeNode.verses }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                  <Compass className="w-10 h-10 text-amber-500/40 mb-2 stroke-1" />
                  <p className="font-serif font-bold text-stone-800 dark:text-zinc-200 text-sm">
                    Pilih Titik pada Bagan
                  </p>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
                    Klik teks, lingkaran, atau panah manapun pada bagan di samping untuk membaca ayat Alkitab dan berita buku hayat penjelasnya.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Footer Info */}
            <div className="p-3 bg-[#ede2c5] dark:bg-zinc-900 border-t border-amber-200/80 dark:border-zinc-800 text-[11px] text-stone-600 dark:text-zinc-400 flex items-center justify-between shrink-0 font-sans">
              <span>Bagan: <b>{currentChart?.number}</b> dari 22</span>
              <span>LSM &amp; MSWE Truth Charts</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
