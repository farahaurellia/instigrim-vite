import HomeModel from './homeModel.js';
import HomePresenter from './homePresenter.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class HomeView {
  #presenter;

  constructor() {
    this.#presenter = new HomePresenter({
      model: new HomeModel(),
      view: this
    });
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render() {
    const user = localStorage.getItem('user');
    const isLoggedIn = user !== null;
    if (!this.#presenter) {
      return '';
    }

    const stories = this.#presenter.getStories();

    return `
      <main>
        <h1 style="font-family: 'Caveat', cursive; font-size: 2.2rem; color: #333; margin-bottom: 18px;">Beranda</h1>
        <section id="storiesList" style="display: flex; flex-wrap: wrap; gap: 24px;background: #FFFDE7;" aria-label="Daftar Stories">
          <p>${isLoggedIn ? 'Memuat stories...' : 'Silakan login untuk melihat stories.'}</p>
        </section>
      </main>
    `;
  }

  async afterRender() {
    if (this.#presenter) {
      await this.#presenter.init();
    }
  }

  displayStories() {
    const storiesList = document.getElementById('storiesList');
    const stories = this.#presenter.getStories();

    storiesList.innerHTML = stories.map((story) => `
      <article class="story-card" tabindex="0" data-story-id="${story.id}" aria-label="Story oleh ${story.name}" 
        style="
          background: #FFCC80;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          border-radius: 14px;
          padding: 18px 16px 14px 16px;
          width: 320px;
          transition: box-shadow 0.2s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 10px;
        ">
        <figure style="margin-bottom: 8px;">
          <img src="${story.photoUrl}" 
              alt="Foto oleh ${story.name}" 
              onerror="this.onerror=null;this.src='https://via.placeholder.com/220x140?text=No+Image';" 
              style="width:100%;height:180px;object-fit:cover;border-radius:10px;">
          <figcaption style="font-weight:bold; margin-top: 6px; color: #333;">${story.name}</figcaption>
        </figure>
        <p style="color:#444; font-size:1.05rem; min-height:40px;">${story.description || ''}</p>
        <small style="color:#888;">${new Date(story.createdAt).toLocaleString()}</small>
        ${
          story.lat && story.lon
            ? `<div id="map-${story.id}" class="story-map" style="height:120px;border-radius:8px;overflow:hidden;margin-top:8px;"></div>`
            : ''
        }
      </article>
    `).join('');

    // Tambahkan event listener untuk navigasi ke detail story
    storiesList.querySelectorAll('.story-card').forEach(card => {
      card.addEventListener('click', () => {
        const storyId = card.getAttribute('data-story-id');
        window.location.hash = `/stories/${storyId}`;
      });
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const storyId = card.getAttribute('data-story-id');
          window.location.hash = `/stories/${storyId}`;
        }
      });
    });

    stories.forEach(story => {
      if (story.lat && story.lon) {
        const mapElement = document.getElementById(`map-${story.id}`);
        const map = L.map(mapElement).setView([parseFloat(story.lat), parseFloat(story.lon)], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        L.marker([parseFloat(story.lat), parseFloat(story.lon)]).addTo(map);
      }
    });
  }
}
