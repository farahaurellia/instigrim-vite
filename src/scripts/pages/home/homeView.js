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

    // Tombol kontrol layer peta (di luar card)
    let mapLayerControlHtml = `
      <div id="mapLayerControl" style="width:100%;margin-bottom:18px;display:flex;gap:10px;align-items:center;">
        <label for="mapLayerSelect" style="font-weight:bold;">Gaya Peta:</label>
        <select id="mapLayerSelect" style="padding:6px 12px;border-radius:6px;">
          <option value="osm">Default</option>
          <option value="topo">OpenTopoMap</option>
          <option value="esri">Esri World Imagery</option>
        </select>
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
    const mapLayers = []; // Array of {osm, esri, stamen} per map

    stories.forEach(story => {
      if (story.lat && story.lon) {
        const mapElement = document.getElementById(`map-${story.id}`);
        const map = L.map(mapElement, { attributionControl: false, zoomControl: false });
        // Buat tileLayer baru untuk setiap map
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

    // Event listener untuk select layer, mengubah semua peta sekaligus
    const mapLayerSelect = document.getElementById('mapLayerSelect');
    if (mapLayerSelect) {
      mapLayerSelect.addEventListener('change', (e) => {
        const selected = e.target.value;
        maps.forEach((map, idx) => {
          if (map._currentBaseLayer) {
            map.removeLayer(map._currentBaseLayer);
          }
          mapLayers[idx][selected].addTo(map);
          map._currentBaseLayer = mapLayers[idx][selected];
        });
      });
    }
  }
}
