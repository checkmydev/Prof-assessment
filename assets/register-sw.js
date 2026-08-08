if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // L'app fonctionne très bien sans service worker (juste pas installable).
    });
  });
}
