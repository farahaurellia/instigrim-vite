import { getPage } from '../routes/routes';
import { getActiveRoute, parseActivePathname } from '../routes/url-parser';
import { isCurrentPushSubscriptionAvailable, subscribeToNotification, unsubscribeFromNotification, notificationRequestPermission } from '../utils/notification-hub';
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
    // No routing listeners here, they will be in init()
  }

  // ⭐ ADD THIS NEW METHOD ⭐
  async init() {
    console.log('App: init() started. Setting up routing listeners.');
    // 1. Initial render when the app loads
    await this.renderPage();

    // 2. Listen for hash changes to re-render the page
    window.addEventListener('hashchange', () => {
      console.log('App: Hash changed detected. Re-rendering page.');
      this.renderPage(); // Call renderPage when hash changes
    });
    console.log('App: Routing listeners set up.');
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
    console.log('setupPushNotification start');
    const notifNavList = document.getElementById('notif-nav-list');
    if (!notifNavList) {
      console.log('notifNavList not found');
      return;
    }

    console.log('before isCurrentPushSubscriptionAvailable');
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    console.log('after isCurrentPushSubscriptionAvailable', isSubscribed);

    notifNavList.innerHTML = isSubscribed
      ? UnsubscribeNotificationBtn()
      : SubscribeNotificationBtn();

    const subscribeBtn = document.getElementById('subscribe-notif-btn');
    if (subscribeBtn) {
      subscribeBtn.addEventListener('click', async () => {
        const granted = await notificationRequestPermission();
        if (!granted) return; // Stop jika user tidak memberi izin

        const success = await subscribeToNotification();
        if (success) {
          // It's generally better to just update the UI state here,
          // rather than re-running the entire setup function.
          // The re-run was common in older patterns, but can be less efficient.
          notifNavList.innerHTML = UnsubscribeNotificationBtn();
          // this.#setupPushNotification(); // Consider removing this line
        }
      });
    }

    const unsubscribeBtn = document.getElementById('unsubscribe-notif-btn');
    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener('click', async () => {
        const success = await unsubscribeFromNotification();
        if (success) {
          notifNavList.innerHTML = SubscribeNotificationBtn();
          // this.#setupPushNotification(); // Consider removing this line
        }
      });
    }
    console.log('setupPushNotification end');
  }

  async renderPage() {
    console.log('renderPage start');
    const url = getActiveRoute();
    console.log('Active URL:', url);
    const page = getPage(url);
    console.log('Page found:', page);

    // Tampilkan indikator loading sementara
    this.#content.innerHTML = '<div style="text-align:center; padding: 2rem;">Memuat Halaman...</div>';

    // Logika render halaman
    try {
      if (typeof page.showDetail === 'function') {
        // Ini adalah case untuk halaman detail (misalnya, /detail/:id)
        const { id } = parseActivePathname();
        console.log('before showDetail');
        await page.showDetail(this.#content, id);
        console.log('after showDetail');
      } else {
        // Ini adalah case untuk halaman biasa atau NotFoundView
        console.log('before render');
        const renderedContent = await page.render();
        console.log('after render');
        this.#content.innerHTML = renderedContent;

        // Panggil afterRender jika ada
        if (page.afterRender) {
          console.log('before afterRender');
          await page.afterRender();
          console.log('after afterRender');
        }
      }
    } catch (error) {
      console.error('Error rendering page:', error);
    }

    console.log('before setupPushNotification');
    await this.#setupPushNotification();
    console.log('after setupPushNotification');
    console.log('renderPage end');
  }
}

export default App;