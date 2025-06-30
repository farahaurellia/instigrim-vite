import '../styles/styles.css';
import App from './pages/app';
import { SubscribeNotificationBtn, UnsubscribeNotificationBtn } from './notifBtn.js';

console.log('index.js loaded');
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
});

(async () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }

  async function main() {
    console.log('main() start');
    const content = document.querySelector('#main-content');
    const drawerButton = document.querySelector('#drawer-button');
    const navigationDrawer = document.querySelector('#navigation-drawer');
    console.log('content:', content);
    console.log('drawerButton:', drawerButton);
    console.log('navigationDrawer:', navigationDrawer);

    const app = new App({
      content,
      drawerButton,
      navigationDrawer,
    });
    console.log('App initialized');
    try {
      await app.renderPage();
      console.log('renderPage done');
    } catch (e) {
      console.error('Error in renderPage:', e);
    }

    const handleRouteChange = async () => {
      if (document.startViewTransition) {
        await document.startViewTransition(async () => {
          await app.renderPage();
        });
      } else {
        await app.renderPage();
      }
    };
    console.log('Handling route change...');
    registerServiceWorker();
    console.log('Registering notification buttons...');
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('navigate', (e) => {
      let path = e.detail.path;
      if (!path.startsWith('#')) path = `#${path}`;
      window.location.hash = path;
    });
  }
})();

export function registerServiceWorker() {
  console.log('Registering service worker...');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service worker registration succeeded:', registration);
      },
      (error) => {
        console.error('Service worker registration failed:', error);
      }
    );
  }
}
