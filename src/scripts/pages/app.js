import routes from '../routes/routes';
import { getActiveRoute, parseActivePathname } from '../routes/url-parser';
import { isCurrentPushSubscriptionAvailable, subscribeToNotification, unsubscribeFromNotification } from '../utils/notification-hub';
import { SubscribeNotificationBtn, UnsubscribeNotificationBtn } from '../notifBtn.js';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async #setupPushNotification() {
    const notifNavList = document.getElementById('notif-nav-list');
    if (!notifNavList) return;

    // Cek status subscribe
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    // Render tombol sesuai status
    notifNavList.innerHTML = isSubscribed
      ? UnsubscribeNotificationBtn()
      : SubscribeNotificationBtn();

    // Event handler tombol subscribe
    const subscribeBtn = document.getElementById('subscribe-notif-btn');
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', async () => {
        const success = await subscribeToNotification();
        if (success) {
          notifNavList.innerHTML = UnsubscribeNotificationBtn();
          this.#setupPushNotification(); // refresh event handler
        }
      });
    }

    // Event handler tombol unsubscribe
    const unsubscribeBtn = document.getElementById('unsubscribe-notif-btn');
    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener('click', async () => {
        const success = await unsubscribeFromNotification();
        if (success) {
          notifNavList.innerHTML = SubscribeNotificationBtn();
          this.#setupPushNotification(); // refresh event handler
        }
      });
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];
    this.#content.innerHTML = '<div style="text-align:center; padding: 2rem;">Memuat Halaman...</div>';

    if (page && typeof page.showDetail === 'function') {
      const { id } = parseActivePathname();
      await page.showDetail(this.#content, id);
    } else if (page) {
      const renderedContent = await page.render();
      this.#content.innerHTML = renderedContent;
      await page.afterRender();
    } else {
      this.#content.innerHTML = '<p>Halaman tidak ditemukan.</p>';
    }

    // Pastikan tombol notif di-refresh setiap renderPage
    await this.#setupPushNotification();
  }
}

export default App;
