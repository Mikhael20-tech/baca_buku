import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { StageState } from '../types/stage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const INITIAL_STATE: StageState = {
  roomId: 'default-stage',
  activeSongId: '',
  title: '',
  subtitle: '',
  content: '',
  slideIndex: 0,
  totalSlides: 0,
  mode: 'BLACKOUT',
  tickerText: '',
  tickerActive: false,
  tickerSpeed: 28,
  updatedAt: Date.now(),
};

export function useStageSync(roomId: string, isPresenter: boolean) {
  const [state, setState] = useState<StageState>({ ...INITIAL_STATE, roomId });
  const bcRef = useRef<BroadcastChannel | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // 1. BroadcastChannel API untuk sinkronisasi lokal antar tab/jendela (Extended Monitor ~0ms)
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel(`stage-sync-${roomId}`);
      bcRef.current = bc;

      if (!isPresenter) {
        bc.onmessage = (event: MessageEvent<StageState>) => {
          if (event.data) {
            setState(event.data);
          }
        };
      }
    }

    // 2. Supabase Realtime Channel untuk sinkronisasi nirkabel lintas perangkat
    if (isSupabaseConfigured() && supabase) {
      try {
        const channel = supabase.channel(`stage-room:${roomId}`, {
          config: { broadcast: { self: false } },
        });

        if (!isPresenter) {
          channel.on('broadcast', { event: 'STAGE_UPDATE' }, ({ payload }) => {
            if (payload) {
              setState(payload as StageState);
            }
          });
        }

        channel.subscribe();
        channelRef.current = channel;
      } catch (err) {
        console.warn('Gagal menghubungkan Supabase Realtime untuk Stage Sync:', err);
      }
    }

    return () => {
      if (bc) {
        bc.close();
      }
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId, isPresenter]);

  const broadcastState = useCallback((nextState: StageState) => {
    const stampedState: StageState = { ...nextState, updatedAt: Date.now() };
    setState(stampedState);

    // 1. Kirim via BroadcastChannel (Instan untuk Extended Monitor)
    try {
      bcRef.current?.postMessage(stampedState);
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }

    // 2. Kirim via Supabase Realtime (Lintas Perangkat / Tablet ke Laptop)
    if (channelRef.current) {
      try {
        channelRef.current.send({
          type: 'broadcast',
          event: 'STAGE_UPDATE',
          payload: stampedState,
        });
      } catch (e) {
        console.warn('Supabase Realtime broadcast error:', e);
      }
    }
  }, []);

  return { state, broadcastState };
}

