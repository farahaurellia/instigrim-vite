import DetailStoryModel from "./detailStoryModel";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default class DetailStoryView {
  #presenter;
  #model;
  #map;
  #mapLayers;
  #currentBaseLayer;

  constructor() {
    this.#model = new DetailStoryModel();
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render({ id }) {
    let story = null;
    let locationDesc = '';
    let errorMsg = '';

    console.log('[DetailStoryView] render start');

    try {
      await this.#model.loadStoryDetail(id);
      story = this.#model.getStory();

      if (story.lat && story.lon) {
        try {
          locationDesc = await this.#model.getLocationDescription(story.lat, story.lon);
        } catch {
          locationDesc = '';
        }
      }
    } catch (err) {
      errorMsg = err?.message || 'Gagal memuat detail story.';
    }

    console.log('[DetailStoryView] render end');

    return `
      <main>
        <section class="detail-story" aria-labelledby="detail-story-title" style="max-width:500px;margin:auto;">
          ${errorMsg ? `<p style="color:red;">${errorMsg}</p>` : `
            <button id="backToHomeBtn" class="auth-btn" style="margin-bottom:18px;">&larr; Kembali ke Beranda</button>
            <h2 id="detail-story-title">${story?.name || ''}</h2>
            <img 
              src="${story?.photoUrl || ''}" 
              alt="Foto cerita oleh ${story?.name || ''}" 
              style="max-width:300px;display:block;margin-bottom:12px;" 
              onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=No+Image';"
            >
            <p>${story?.description || ''}</p>
            <small>Dibuat: ${story ? new Date(story.createdAt).toLocaleString() : ''}</small>
            <br>
            ${story?.lat && story?.lon ? `
              <div id="mapLayerControl" style="width:100%;margin:12px 0 8px 0;display:flex;gap:10px;align-items:center;">
                <label for="mapLayerSelect" style="font-weight:bold;">Gaya Peta:</label>
                <select id="mapLayerSelect" style="padding:6px 12px;border-radius:6px;">
                  <option value="osm">Default</option>
                  <option value="topo">OpenTopoMap</option>
                  <option value="esri">Esri World Imagery</option>
                </select>
              </div>
              <div id="map-detail" style="height:250px;width:100%;margin-top:0;border-radius:8px;overflow:hidden;" aria-label="Lokasi pada peta"></div>
              <small>Lokasi: ${locationDesc ? locationDesc : `${story.lat}, ${story.lon}`}</small>
            ` : ''}
          `}
        </section>
      </main>
    `;
  }

  async afterRender({ id }) {
    const backBtn = document.getElementById('backToHomeBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.hash = '/';
      });
    }

    const story = this.#model.getStory();
    console.log('[afterRender] story:', story);

    console.log('[DetailStoryView] afterRender start');

    if (story && story.lat && story.lon && window.L) {
      await new Promise(resolve => setTimeout(resolve, 0));
      const mapDiv = document.getElementById('map-detail');
      console.log('[afterRender] mapDiv:', mapDiv);

      if (mapDiv) {
        if (this.#map) {
          this.#map.remove();
        }
        this.#mapLayers = {
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
        console.log('[afterRender] L:', L);
        try {
          this.#map = L.map(mapDiv, { attributionControl: false, zoomControl: false });
          console.log('[afterRender] map initialized:', this.#map);
          this.#mapLayers["osm"].addTo(this.#map);
          console.log('[afterRender] OSM layer added');
          this.#currentBaseLayer = this.#mapLayers["osm"];
          this.#map.setView([parseFloat(story.lat), parseFloat(story.lon)], 13);
          setTimeout(() => {
            this.#map.invalidateSize();
            console.log('[afterRender] map.invalidateSize() called');
          }, 100);

          // Popup marker
          let popupLocation = 'Lokasi tidak diketahui';
          try {
            popupLocation = story.lat && story.lon ? (await this.#model.getLocationDescription(story.lat, story.lon)) : 'Lokasi tidak diketahui';
          } catch (e) {
            console.error('[DetailStoryView] getLocationDescription error:', e);
          }

          const popupHtml = `
            <div style="max-width:220px;">
              <img src="${story.photoUrl}" alt="Foto cerita" style="width:100%;border-radius:6px;object-fit:cover;margin-bottom:6px;" onerror="this.onerror=null;this.src='https://via.placeholder.com/220x140?text=No+Image';">
              <div style="font-size:1em;margin-bottom:4px;">
                <b>${popupLocation}</b>
              </div>
              <div style="font-size:0.97em;margin-bottom:4px;">
                <em>${story.description ? story.description : ''}</em>
              </div>
              <div style="font-size:0.97em;">
                <span style="color:#CA7842;font-weight:bold;">${story.name}</span>
              </div>
            </div>
          `;

          const marker = L.marker([parseFloat(story.lat), parseFloat(story.lon)]).addTo(this.#map);
          marker.bindPopup(popupHtml).openPopup();

          const mapLayerSelect = document.getElementById('mapLayerSelect');
          if (mapLayerSelect) {
            mapLayerSelect.addEventListener('change', (e) => {
              const selected = e.target.value;
              if (this.#currentBaseLayer) {
                this.#map.removeLayer(this.#currentBaseLayer);
              }
              this.#mapLayers[selected].addTo(this.#map);
              this.#currentBaseLayer = this.#mapLayers[selected];
            });
          }
        } catch (e) {
          console.error('[afterRender] Error initializing map:', e);
        }
      } else {
        console.error('[afterRender] #map-detail element not found in DOM');
      }
    } else {
      console.error('[afterRender] Data tidak lengkap atau Leaflet tidak tersedia', {
        story,
        lat: story?.lat,
        lon: story?.lon,
        L_exists: !!window.L
      });
    }

    console.log('[DetailStoryView] afterRender end');
  }
  // Hapus getLocationDescription dari view, sudah di model
}