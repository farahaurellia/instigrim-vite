import '../styles/styles.css';
import App from './pages/app';

const app = new App({
  content: document.querySelector('#main-content'),
  drawerButton: document.querySelector('#drawer-button'),
  navigationDrawer: document.querySelector('#navigation-drawer'),
});

document.addEventListener('DOMContentLoaded', () => {
  if (document.startViewTransition) {
    document.startViewTransition(() => app.renderPage());
  } else {
    app.renderPage();
  }
});

// Untuk navigasi SPA (hashchange)
window.addEventListener('hashchange', () => {
  if (document.startViewTransition) {
    document.startViewTransition(() => app.renderPage());
  } else {
    app.renderPage();
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registration succeeded:', reg))
    .catch(err => console.error('SW registration failed:', err));
}
