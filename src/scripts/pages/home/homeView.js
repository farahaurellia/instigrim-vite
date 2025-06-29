import HomeModel from './homeModel.js';
import HomePresenter from './homePresenter.js';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class HomeView {
  #presenter;
  #model;

  constructor() {
    this.#model = new HomeModel();
    this.#presenter = new HomePresenter({
      model: this.#model,
      view: this
    });
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render() {
    const user = this.#model.getUserData();
    const isLoggedIn = user !== null;
    let nama = '';
    if (isLoggedIn) {
      try {
        nama = user.name || '';
      } catch {
        nama = '';
      }
    }
    if (!this.#presenter) {
      return '';
    }

    const mapLayerControlHtml = `
      <div class="map-layer-control-inline">
        <button id="mapStyleBtn" type="button" title="Pilih gaya peta" class="map-style-btn" style="top: 110px; right: 10px;">
          <i data-feather="settings"></i>
        </button>
        <div id="mapStylePopup" class="map-style-popup" style="top: 155px; right: 10px;">
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

    return `
      <main>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          <h1 style="font-family: 'Caveat', cursive; font-size: 2.2rem; color: #333; margin-left:20px;">
            ${
              isLoggedIn && nama
                ? `Halo, <span class="home-username">${nama}</span>! Jalan-jalan kemana hari ini?`
                : 'Beranda'
            }
          </h1>
          ${mapLayerControlHtml}
        </div>
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

    storiesList.querySelectorAll('.story-card').forEach(card => {
      card.addEventListener('click', () => {
        const storyId = card.getAttribute('data-story-id');
        this.#model.navigateTo(`/stories/${storyId}`);
      });
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const storyId = card.getAttribute('data-story-id');
          this.#model.navigateTo(`/stories/${storyId}`);
        }
      });
    });

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

    const mapStyleBtn = document.getElementById('mapStyleBtn');
    const mapStylePopup = document.getElementById('mapStylePopup');
    if (mapStyleBtn && mapStylePopup) {
      mapStyleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mapStylePopup.style.display = mapStylePopup.style.display === 'none' ? 'block' : 'none';
      });

      document.addEventListener('click', (e) => {
        if (!mapStylePopup.contains(e.target) && e.target !== mapStyleBtn) {
          mapStylePopup.style.display = 'none';
        }
      });

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

    if (window.feather) {
      window.feather.replace();
    }
  }
}
