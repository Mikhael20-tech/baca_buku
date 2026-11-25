import React from 'react';
import { useStageSync } from '../hooks/useStageSync';

export default function LiveOutput() {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const roomId = urlParams?.get('room') || 'main-hall';

  const { state } = useStageSync(roomId, false);
  const theme = state.theme || 'default';

  const isLowerThird = theme === 'lower-third';
  const isGold = theme === 'amber-gold';

  return (
    <div className={`w-screen h-screen select-none overflow-hidden relative flex flex-col ${
      isLowerThird 
        ? 'bg-transparent justify-end p-8 md:p-12' 
        : 'bg-black justify-center items-center p-8 md:p-14'
    }`}>
      {state.mode === 'LIVE' && state.content && (
        isLowerThird ? (
          <div className="max-w-5xl w-full mx-auto bg-black/85 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in slide-in-from-bottom-6 duration-300">
            <p className="text-2xl sm:text-4xl font-bold whitespace-pre-line leading-relaxed text-white drop-shadow-md">
              {state.content}
            </p>
            {state.title && (
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm text-zinc-200 font-medium tracking-wide">
                <span>{state.title}</span>
                {state.subtitle && <span className="text-zinc-400 opacity-80">({state.subtitle})</span>}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl w-full text-center transition-all duration-300 animate-in fade-in zoom-in-95">
            <p className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold whitespace-pre-line leading-snug md:leading-tight tracking-tight drop-shadow-md ${
              isGold ? 'text-amber-300 drop-shadow-[0_4px_24px_rgba(251,191,36,0.35)]' : 'text-white'
            }`}>
              {state.content}
            </p>
          </div>
        )
      )}

      {state.mode === 'CLEAR' && (
        <div className="text-zinc-800 text-sm italic select-none">
          {/* Layar siap (Clear Teks) */}
        </div>
      )}

      {state.mode === 'BLACKOUT' && (
        <div className="w-full h-full bg-black select-none fixed inset-0 z-50" />
      )}

      {state.mode === 'LIVE' && state.title && !isLowerThird && (
        <div className="fixed bottom-6 right-8 text-xs sm:text-sm text-zinc-200 font-medium tracking-wide bg-black/75 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-2xl flex items-center gap-2">
          <span>{state.title}</span>
          {state.subtitle && <span className="text-zinc-400">({state.subtitle})</span>}
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400 tabular-nums font-mono">{state.slideIndex + 1}/{state.totalSlides}</span>
        </div>
      )}
    </div>
  );
}
