import '../styles/styles.css';
import App from './pages/app';
import { registerServiceWorker } from './utils';
import { SubscribeNotificationBtn, UnsubscribeNotificationBtn } from './notifBtn.js';

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

  // // Render tombol ke navbar
  // const notifNavList = document.getElementById('notif-nav-list');
  // if (notifNavList) {
  //   // Cek status subscribe dari localStorage atau API, lalu render tombol yang sesuai
  //   const isSubscribed = localStorage.getItem('isPushSubscribed') === 'true';
  //   notifNavList.innerHTML = isSubscribed
  //     ? UnsubscribeNotificationBtn()
  //     : SubscribeNotificationBtn();
  // }

  await registerServiceWorker();

  window.addEventListener('hashchange', handleRouteChange);
  window.addEventListener('navigate', (e) => {
    let path = e.detail.path;
    if (!path.startsWith('#')) path = `#${path}`;
    window.location.hash = path;
  });
});
