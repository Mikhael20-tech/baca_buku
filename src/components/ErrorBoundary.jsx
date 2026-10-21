import React from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // If it's a dynamic module import failure (e.g. after a new deployment), attempt auto reload once
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed');

    if (isChunkError) {
      const hasReloaded = sessionStorage.getItem('chunk_error_reloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_error_reloaded', 'true');
        console.warn('Chunk loading failed after new deployment, auto-reloading page...');
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem('chunk_error_reloaded');
    sessionStorage.removeItem('vite_chunk_reload_' + window.location.pathname);
    window.location.reload();
  };

  handleGoHome = () => {
    sessionStorage.removeItem('chunk_error_reloaded');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.name === 'ChunkLoadError' ||
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Importing a module script failed');

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#fcfaf5] dark:bg-zinc-900 border border-amber-300 dark:border-amber-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-zinc-100">
              {isChunkError ? 'Versi Baru Aplikasi Tersedia' : 'Terjadi Gangguan Tampilan'}
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-zinc-400 leading-relaxed">
              {isChunkError
                ? 'Aplikasi telah diperbarui dengan fitur terbaru di server. Silakan muat ulang halaman untuk memuat versi terkini.'
                : 'Halaman ini mengalami kendala teknis saat memuat komponen. Silakan segarkan halaman untuk melanjutkan.'}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Button
                onClick={this.handleReload}
                className="w-full sm:w-auto bg-[#3B4B34] hover:bg-[#2d3a27] text-white rounded-xl text-xs font-bold px-5 py-2.5 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto rounded-xl text-xs font-semibold px-4 py-2.5 border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 mr-1" />
                <span>Beranda</span>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
