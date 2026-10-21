import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, BookOpen, Compass, ExternalLink, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function BibleScofieldIndexModal({
  isOpen,
  onClose,
  onSelectReference,
  bibleLang = 'id'
}) {
  const [indexData, setIndexData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedTopic, setCopiedTopic] = useState(null);

  const isEn = ['en', 'kjv', 'asv', 'net', 'scofield'].includes(bibleLang);

  useEffect(() => {
    if (!isOpen) return;
    if (indexData.length > 0) return;

    setIsLoading(true);
    fetch('/bible/scofield_index.json')
      .then(res => res.json())
      .then(data => {
        setIndexData(data || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load Scofield index:', err);
        setIsLoading(false);
      });
  }, [isOpen, indexData.length]);

  const alphabet = useMemo(() => {
    const letters = new Set();
    indexData.forEach(item => {
      const firstChar = item.topic.charAt(0).toUpperCase();
      if (firstChar >= 'A' && firstChar <= 'Z') {
        letters.add(firstChar);
      }
    });
    return Array.from(letters).sort();
  }, [indexData]);

  const filteredTopics = useMemo(() => {
    let result = indexData;

    if (selectedLetter !== 'ALL') {
      result = result.filter(item => item.topic.toUpperCase().startsWith(selectedLetter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.topic.toLowerCase().includes(q) || 
        item.definition.toLowerCase().includes(q) ||
        (item.references && item.references.some(r => r.toLowerCase().includes(q)))
      );
    }

    return result;
  }, [indexData, selectedLetter, searchQuery]);

  if (!isOpen) return null;

  const handleCopy = (topic) => {
    const text = `${topic.topic}\n${topic.definition}${topic.references?.length ? '\nRefs: ' + topic.references.join(', ') : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedTopic(topic.topic);
    setTimeout(() => setCopiedTopic(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-modal-backdrop-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#fcfaf5] dark:bg-zinc-900 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-amber-300/80 dark:border-amber-700/60 flex flex-col space-y-4 max-h-[88vh] animate-modal-card-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/70 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-serif font-black text-lg">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-zinc-100 font-serif">
                  {isEn ? 'Scofield 1917 Topical Index' : 'Indeks Topikal Scofield 1917'}
                </h3>
                <Badge variant="outline" className="text-[10px] bg-amber-100/80 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 font-mono">
                  {indexData.length} Topics
                </Badge>
              </div>
              <p className="text-xs text-stone-600 dark:text-zinc-400">
                {isEn 
                  ? 'Chain-reference doctrinal themes & theological subjects' 
                  : 'Rantai referensi doktrinal, tema teologis & tipologi'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700/60 dark:text-zinc-400" />
          <Input 
            placeholder={isEn ? "Search topics, doctrines, or verses (e.g. Grace, Covenants, Gen 1)..." : "Cari topik doktrinal atau ayat (contoh: Anugerah, Perjanjian, Gen 1)..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-2xl bg-white dark:bg-zinc-800 border-amber-200 dark:border-zinc-700 text-sm focus-visible:ring-amber-500"
            autoFocus
          />
        </div>

        {/* Alphabet Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedLetter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition shrink-0 ${
              selectedLetter === 'ALL'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-stone-200/60 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-300'
            }`}
          >
            ALL
          </button>
          {alphabet.map(letter => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-7 h-7 rounded-lg font-mono font-bold text-xs transition shrink-0 flex items-center justify-center ${
                selectedLetter === letter
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-stone-200/50 dark:bg-zinc-800/80 text-stone-700 dark:text-zinc-300 hover:bg-amber-100 hover:text-amber-900'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Topic List */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-3 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-amber-800/70 dark:text-amber-400 gap-2 font-serif">
              <Sparkles className="w-6 h-6 animate-spin" />
              <p className="text-sm">Memuat Indeks Scofield...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center py-16 text-stone-500 dark:text-zinc-400 text-sm font-serif">
              {isEn ? 'No topics found for this query.' : 'Tidak ada topik yang cocok dengan pencarian.'}
            </div>
          ) : (
            filteredTopics.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700/80 hover:border-amber-400 dark:hover:border-amber-600 transition space-y-2 shadow-2xs group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-base text-stone-900 dark:text-zinc-100 font-serif tracking-wide group-hover:text-amber-800 dark:group-hover:text-amber-400 transition">
                    {item.topic}
                  </h4>
                  <button
                    onClick={() => handleCopy(item)}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 p-1 transition"
                    title={isEn ? "Copy topic" : "Salin topik"}
                  >
                    {copiedTopic === item.topic ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 dark:text-zinc-300 font-serif leading-relaxed">
                  {item.definition}
                </p>

                {/* References Chips */}
                {item.references && item.references.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-stone-100 dark:border-zinc-700/60">
                    <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-zinc-400 font-mono self-center mr-1">
                      {isEn ? 'Scriptures:' : 'Ayat Terkait:'}
                    </span>
                    {item.references.map((refStr, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => {
                          if (onSelectReference) {
                            onSelectReference(refStr);
                            onClose();
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold bg-amber-100/70 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/80 transition shadow-2xs cursor-pointer"
                        title={isEn ? `Open scripture: ${refStr}` : `Buka ayat: ${refStr}`}
                      >
                        <span>{refStr}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-amber-200/70 dark:border-zinc-800 flex items-center justify-between text-xs text-stone-500">
          <span>
            {isEn ? `Showing ${filteredTopics.length} of ${indexData.length} topics` : `Menampilkan ${filteredTopics.length} dari ${indexData.length} topik`}
          </span>
          <Button
            onClick={onClose}
            className="rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs h-9 px-4"
          >
            {isEn ? 'Close' : 'Tutup'}
          </Button>
        </div>
      </div>
    </div>
  );
}
