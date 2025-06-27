import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

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

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    // Cek jika page punya presenter (misal DetailStoryView)
    if (page && typeof page.showDetail === 'function') {
      // Ambil id dari url hash: /stories/:id
      const hash = window.location.hash.slice(1);
      const id = hash.split('/')[2];
      this.#content.innerHTML = '';
      const detailElement = await page.showDetail(id);
      if (detailElement instanceof HTMLElement) {
        this.#content.appendChild(detailElement);
      } else if (typeof detailElement === 'string') {
        this.#content.innerHTML = detailElement;
      }
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    }
  }
}

export default App;
