import routes from '../routes/routes';
// Perbarui impor untuk menyertakan parseActivePathname
import { getActiveRoute, parseActivePathname } from '../routes/url-parser';

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
    // Tampilkan loading state yang lebih baik
    this.#content.innerHTML = '<div style="text-align:center; padding: 2rem;">Memuat Halaman...</div>'; 

    if (page && typeof page.showDetail === 'function') {
      // Dapatkan ID dari URL
      const { id } = parseActivePathname();
      
      // PERUBAHAN UTAMA:
      // Panggil presenter dan berikan elemen kontennya.
      // Presenter sekarang bertanggung jawab penuh untuk me-render ke dalam elemen ini.
      // Kita tidak perlu lagi menangani nilai kembaliannya.
      await page.showDetail(this.#content, id);

    } else if (page) {
      // Alur untuk halaman biasa (Beranda, Login, dll.) tetap sama
      const renderedContent = await page.render();
      this.#content.innerHTML = renderedContent;
      await page.afterRender();
    } else {
        this.#content.innerHTML = '<p>Halaman tidak ditemukan.</p>';
    }
  }
}

export default App;
