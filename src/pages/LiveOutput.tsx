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

  // Perhitungan cerdas font size adaptif agar teks lirik tidak pernah overflow atau menabrak badge bawah
  const rawLines = state.content ? state.content.split('\n') : [];
  const lineCount = rawLines.length;
  const maxLineLength = rawLines.reduce((max, l) => Math.max(max, l.length), 0);
  const totalLength = state.content ? state.content.length : 0;

  const baseFontSize = state.fontSize || 48;

  // Skala penyesuaian otomatis berdasarkan kepadatan teks
  let densityScale = 1;
  if (totalLength > 180 || lineCount > 6 || maxLineLength > 52) {
    densityScale = 0.65;
  } else if (totalLength > 120 || lineCount > 4 || maxLineLength > 40) {
    densityScale = 0.78;
  } else if (totalLength > 75 || lineCount > 3 || maxLineLength > 28) {
    densityScale = 0.88;
  }

  // Batas maksimum responsif tinggi (vh) dan lebar (vw)
  const maxVh = lineCount > 4 ? 5.2 : lineCount > 2 ? 6.5 : 8.0;
  const maxVw = maxLineLength > 45 ? 5.0 : maxLineLength > 30 ? 6.0 : 7.5;
  const dynamicFontSize = `min(${Math.round(baseFontSize * densityScale)}px, ${maxVh}vh, ${maxVw}vw)`;

  return (
    <div className={`w-screen h-screen select-none overflow-hidden relative flex flex-col ${
      isLowerThird 
        ? 'bg-transparent justify-end p-6 md:p-12' 
        : 'bg-black justify-center items-center'
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

      {state.mode === 'LIVE' && state.imageUrl && (
        <div className={`w-full h-full flex items-center justify-center bg-black animate-in fade-in duration-300 ${isTickerVisible ? 'pb-14' : ''}`}>
          <img
            src={state.imageUrl}
            alt={state.title || 'Slide Presentasi'}
            className="max-w-full max-h-full w-full h-full object-contain select-none"
          />
        </div>
      )}

      {state.mode === 'LIVE' && !state.imageUrl && state.content && (
        isLowerThird ? (
          <div className="max-w-5xl w-full mx-auto bg-black/85 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in slide-in-from-bottom-6 duration-300 mb-4">
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
          <div className={`max-w-6xl w-full flex-1 flex flex-col justify-center items-center text-center transition-all duration-300 animate-in fade-in zoom-in-95 px-6 sm:px-12 pt-4 ${
            isTickerVisible ? 'pb-28' : 'pb-20'
          }`}>
            <p 
              style={{ fontSize: dynamicFontSize }}
              className={`font-bold whitespace-pre-line leading-snug tracking-tight drop-shadow-md transition-all duration-150 ${
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
      {state.mode === 'LIVE' && state.title && !isLowerThird && !state.imageUrl && (
        <div 
          style={{ fontSize: state.badgeFontSize ? `${state.badgeFontSize}px` : undefined }}
          className={`fixed left-1/2 -translate-x-1/2 text-center text-zinc-100 font-medium tracking-wide bg-black/85 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/15 shadow-2xl flex items-center justify-center gap-2.5 transition-all duration-300 z-30 max-w-[90vw] whitespace-nowrap overflow-hidden text-ellipsis ${
            !state.badgeFontSize ? 'text-xs sm:text-sm' : ''
          } ${
            isTickerVisible ? 'bottom-16' : 'bottom-5'
          }`}
        >
          <span className="font-semibold tracking-wide drop-shadow-sm">{state.title}</span>
          {state.subtitle && <span className="text-zinc-400 font-normal">({state.subtitle})</span>}
          {state.totalSlides > 1 && (
            <>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 tabular-nums font-mono font-normal drop-shadow-sm">
                {state.slideIndex + 1}/{state.totalSlides}
              </span>
            </>
          )}
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
