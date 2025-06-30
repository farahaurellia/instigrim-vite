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
        const success = await subscribeToNotification();
        if (success) {
          notifNavList.innerHTML = UnsubscribeNotificationBtn();
          this.#setupPushNotification();
        }
      });
    }

    const unsubscribeBtn = document.getElementById('unsubscribe-notif-btn');
    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener('click', async () => {
        const success = await unsubscribeFromNotification();
        if (success) {
          notifNavList.innerHTML = SubscribeNotificationBtn();
          this.#setupPushNotification();
        }
      });
    }
    console.log('setupPushNotification end');
  }

  async renderPage() {
    console.log('renderPage start');
    const url = getActiveRoute();
    const page = routes[url];
    this.#content.innerHTML = '<div style="text-align:center; padding: 2rem;">Memuat Halaman...</div>';

    if (page && typeof page.showDetail === 'function') {
      const { id } = parseActivePathname();
      console.log('before showDetail');
      await page.showDetail(this.#content, id);
      console.log('after showDetail');
    } else if (page) {
      console.log('before render');
      const renderedContent = await page.render();
      console.log('after render');
      this.#content.innerHTML = renderedContent;
      console.log('before afterRender');
      await page.afterRender();
      console.log('after afterRender');
    } else {
      this.#content.innerHTML = '<p>Halaman tidak ditemukan.</p>';
    }

    console.log('before setupPushNotification');
    await this.#setupPushNotification();
    console.log('after setupPushNotification');
    console.log('renderPage end');
  }
}

export default App;
