import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Auto-reload on dynamic import / chunk load failure (e.g. after a new deployment)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected (likely new deployment). Reloading page...', event);
  const reloadKey = 'vite_chunk_reload_' + window.location.pathname;
  if (!sessionStorage.getItem(reloadKey)) {
    sessionStorage.setItem(reloadKey, 'true');
    window.location.reload();
  }
});

window.addEventListener('load', () => {
  sessionStorage.removeItem('vite_chunk_reload_' + window.location.pathname);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for offline PWA support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

