import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Automatically detect new versions, activate immediately without waiting, and refresh
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
  onOfflineReady() {
    console.log('GoetheVocab is ready for offline usage.');
  },
  onRegistered(registration) {
    if (registration) {
      // Check for updates every 15 minutes in the background
      setInterval(() => {
        registration.update();
      }, 15 * 60 * 1000);
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
