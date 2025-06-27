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
    let nama = '';
    if (isLoggedIn) {
      try {
        nama = JSON.parse(user).name || '';
      } catch {
        nama = '';
      }
    }
    if (!this.#presenter) {
      return '';
    }

    const stories = this.#presenter.getStories();

    return `
      <main>
        <h1 style="font-family: 'Caveat', cursive; font-size: 2.2rem; color: #333; margin-bottom: 18px;">
          ${isLoggedIn && nama ? `Halo, ${nama}! Jalan-jalan kemana hari ini?` : 'Beranda'}
        </h1>
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

    // Tombol settings bulat dengan popup pilihan gaya map
    let mapLayerControlHtml = `
      <div class="map-layer-control-wrapper" style="position:relative;width:100%;margin-bottom:18px;">
        <button id="mapStyleBtn" type="button" title="Pilih gaya peta" class="map-style-btn">
          <svg width="22" height="22" fill="none" stroke="#CA7842" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 8.6c.22 0 .43.03.64.08"/>
          </svg>
        </button>
        <div id="mapStylePopup" class="map-style-popup">
          <div class="map-style-popup-title">Pilih Gaya Peta</div>
          <button class="map-style-option" data-style="osm">
            <span class="map-style-dot" style="background:#B2CD9C;"></span>
            Default (OSM)
          </button>
          <button class="map-style-option" data-style="topo">
            <span class="map-style-dot" style="background:#CA7842;"></span>
            OpenTopoMap
          </button>
          <button class="map-style-option" data-style="esri">
            <span class="map-style-dot" style="background:#4B352A;"></span>
            Esri World Imagery
          </button>
        </div>
      </div>
    `;

    storiesList.innerHTML = mapLayerControlHtml + stories.map((story) => `
      <article class="story-card" tabindex="0" role="button" aria-pressed="false" data-story-id="${story.id}" aria-label="Story oleh ${story.name}">
        <figure>
          <img src="${story.photoUrl}" 
              alt="Foto oleh ${story.name}" 
              onerror="this.onerror=null;this.src='https://via.placeholder.com/220x140?text=No+Image';">
          <figcaption>${story.name}</figcaption>
        </figure>
        <p>${story.description || ''}</p>
        <small>${new Date(story.createdAt).toLocaleString()}</small>
        ${
          story.lat && story.lon
            ? `<div id="map-${story.id}" class="story-map"></div>`
            : ''
        }
      </article>
    `).join('');

    // Event listener untuk navigasi ke detail story
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

    // Untuk setiap map, buat tileLayer baru untuk setiap gaya
    const maps = [];
    const mapLayers = [];

    stories.forEach(story => {
      if (story.lat && story.lon) {
        const mapElement = document.getElementById(`map-${story.id}`);
        const map = L.map(mapElement, { attributionControl: false, zoomControl: false });
        const layers = {
          "osm": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }),
          "esri": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
          }),
          "topo": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'OpenTopoMap contributors'
          })
        };
        layers["osm"].addTo(map);
        map.setView([parseFloat(story.lat), parseFloat(story.lon)], 12);

        setTimeout(() => {
          map.invalidateSize();
        }, 0);

        L.marker([parseFloat(story.lat), parseFloat(story.lon)]).addTo(map);
        maps.push(map);
        mapLayers.push(layers);
        map._currentBaseLayer = layers["osm"];
      }
    });

    // --- Popup logic ---
    const mapStyleBtn = document.getElementById('mapStyleBtn');
    const mapStylePopup = document.getElementById('mapStylePopup');
    if (mapStyleBtn && mapStylePopup) {
      mapStyleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mapStylePopup.style.display = mapStylePopup.style.display === 'none' ? 'block' : 'none';
      });

      // Tutup popup jika klik di luar
      document.addEventListener('click', (e) => {
        if (!mapStylePopup.contains(e.target) && e.target !== mapStyleBtn) {
          mapStylePopup.style.display = 'none';
        }
      });

      // Pilihan gaya map
      mapStylePopup.querySelectorAll('.map-style-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const selected = btn.getAttribute('data-style');
          maps.forEach((map, idx) => {
            if (map._currentBaseLayer) {
              map.removeLayer(map._currentBaseLayer);
            }
            mapLayers[idx][selected].addTo(map);
            map._currentBaseLayer = mapLayers[idx][selected];
          });
          mapStylePopup.style.display = 'none';
        });
      });
    }
  }
}
