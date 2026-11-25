import React from 'react';
import { useStageSync } from '../hooks/useStageSync';

export default function LiveOutput() {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const roomId = urlParams?.get('room') || 'main-hall';

  const { state } = useStageSync(roomId, false);
  const theme = state.theme || 'default';

  const isLowerThird = theme === 'lower-third';
  const isGold = theme === 'amber-gold';
  const isTickerVisible = Boolean(state.tickerActive && state.tickerText && state.mode !== 'BLACKOUT');

  return (
    <div className={`w-screen h-screen select-none overflow-hidden relative flex flex-col ${
      isLowerThird 
        ? 'bg-transparent justify-end p-8 md:p-12' 
        : 'bg-black justify-center items-center p-8 md:p-14'
    }`}>
      {/* Keyframes Animasi Teks Berjalan */}
      <style>{`
        @keyframes stageTickerMarquee {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        .animate-stage-ticker {
          display: inline-block;
          white-space: nowrap;
          will-change: transform;
          animation: stageTickerMarquee ${state.tickerSpeed || 28}s linear infinite;
        }
      `}</style>

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
          <div className="max-w-6xl w-full text-center transition-all duration-300 animate-in fade-in zoom-in-95 px-4">
            <p 
              style={{ fontSize: state.fontSize ? `${state.fontSize}px` : undefined }}
              className={`font-bold whitespace-pre-line leading-snug md:leading-tight tracking-tight drop-shadow-md ${
                !state.fontSize ? 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl' : ''
              } ${
                isGold ? 'text-amber-300 drop-shadow-[0_4px_24px_rgba(251,191,36,0.35)]' : 'text-white'
              }`}
            >
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

      {/* Pill Badge Lagu & Nomor Slide - Ditampilkan DI BAWAH & DI TENGAH */}
      {state.mode === 'LIVE' && state.title && !isLowerThird && (
        <div 
          style={{ fontSize: state.badgeFontSize ? `${state.badgeFontSize}px` : undefined }}
          className={`fixed left-1/2 -translate-x-1/2 text-center text-zinc-100 font-medium tracking-wide bg-black/80 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/15 shadow-2xl flex items-center justify-center gap-2.5 transition-all duration-300 z-30 max-w-[90vw] whitespace-nowrap overflow-hidden text-ellipsis ${
            !state.badgeFontSize ? 'text-xs sm:text-sm' : ''
          } ${
            isTickerVisible ? 'bottom-16' : 'bottom-6'
          }`}
        >
          <span className="font-semibold tracking-wide drop-shadow-sm">{state.title}</span>
          {state.subtitle && <span className="text-zinc-400 font-normal">({state.subtitle})</span>}
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-300 tabular-nums font-mono font-normal drop-shadow-sm">
            {state.slideIndex + 1}/{state.totalSlides}
          </span>
        </div>
      )}

      {/* Teks Berjalan (Running Text / Ticker) untuk Pengumuman */}
      {isTickerVisible && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-black/85 backdrop-blur-xl border-t border-white/10 px-4 py-2.5 flex items-center overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shrink-0 mr-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Pengumuman
          </div>
          <div className="overflow-hidden whitespace-nowrap flex-1 relative flex items-center">
            <div className="animate-stage-ticker text-white text-base sm:text-lg md:text-xl font-medium tracking-wide drop-shadow-sm">
              {state.tickerText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
