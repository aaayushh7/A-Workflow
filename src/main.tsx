import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

async function enableMocking() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./api/msw/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        quiet: true,
      });
      console.log('[MSW] Mock Service Worker started');
    } catch (err) {
      console.warn('[MSW] Failed to start Mock Service Worker:', err);
    }
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

