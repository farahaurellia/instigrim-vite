import '../styles/styles.css';
import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  const handleRouteChange = async () => {
    if (document.startViewTransition) {
      await document.startViewTransition(async () => {
        await app.renderPage();
      });
    } else {
      await app.renderPage();
    }
  };

  window.addEventListener('hashchange', handleRouteChange);
  window.addEventListener('navigate', (e) => {
    let path = e.detail.path;
    if (!path.startsWith('#')) path = `#${path}`;
    window.location.hash = path;
  });
});
