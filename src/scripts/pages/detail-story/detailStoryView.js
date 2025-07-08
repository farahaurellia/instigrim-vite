import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import DetailStoryModel from './detailStoryModel.js'; // Note: This model is for fetching story from API if used here, not for IndexedDB directly

// Perbaiki masalah ikon default yang tidak muncul pada bundler seperti Vite
const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default class DetailStoryView {
  #map;
  #mapLayers;
  #currentBaseLayer;
  #model; // Ini adalah DetailStoryModel, bukan StoryDbModel

  constructor() {
    this.#model = new DetailStoryModel(); // Ini model untuk ambil story dari API
  }

  // ⭐ MODIFIKASI render() UNTUK MENAMBAHKAN TOMBOL SAVE/UNSAVE ⭐
  async render(story, isStorySaved) { // Menerima `isStorySaved` dari presenter
    console.log('[DetailStoryView] render start with story:', story);
    console.log('[DetailStoryView] render - isStorySaved:', isStorySaved); // Debugging

    return `
      <main>
        <section class="detail-story" aria-labelledby="detail-story-title">
            <button id="backToHomeBtn" class="auth-btn" style="margin-bottom:18px; align-self: flex-start;">&larr; Kembali</button>
            <h2 id="detail-story-title">${story?.name || 'Judul tidak tersedia'}</h2>
            <img
              src="${story?.photoUrl || ''}"
              alt="Foto cerita oleh ${story?.name || ''}"
              onerror="this.onerror=null;this.src='https://placehold.co/400x300/e2e8f0/64748b?text=Gambar+Rusak';"
            >
            <p>${story?.description || 'Deskripsi tidak tersedia.'}</p>
            <small>Dibuat pada: ${new Date(story.createdAt).toLocaleString('id-ID')}</small>
            <br>
            
            <button id="saveStoryBtn" class="auth-btn save-story-btn" style="margin-top: 18px;">
              ${isStorySaved ? 'Hapus dari Tersimpan' : 'Simpan Cerita'}
            </button>

            ${story?.lat && story?.lon ? `
              <div id="mapLayerControl" style="width:100%;margin:12px 0 8px 0;display:flex;gap:10px;align-items:center;">
                <label for="mapLayerSelect" style="font-weight:bold;">Gaya Peta:</label>
                <select id="mapLayerSelect" class="login-input" style="width: auto; padding: 8px;">
                  <option value="osm">Default</option>
                  <option value="topo">Topografi</option>
                  <option value="esri">Satelit</option>
                </select>
              </div>
              <div class="map-detail-wrapper" style="width: 100%; position: relative;">
                <div id="map-detail" style="height: 300px; width: 100%; border-radius: 10px;"></div>
              </div>
              <small id="location-description">Lokasi: ${story.lat}, ${story.lon}</small>
            ` : '<p>Tidak ada data lokasi untuk cerita ini.</p>'}
        </section>
      </main>
    `;
  }

  // ⭐ MODIFIKASI afterRender() UNTUK TOMBOL SAVE/UNSAVE ⭐
  // Menerima `story` object dan `presenter` instance
  async afterRender(story, presenter, location = {}) {
    console.log('[DetailStoryView] afterRender start with story:', story, 'and presenter:', presenter);

    const backBtn = document.getElementById('backToHomeBtn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.#model.backToHome(); // this.#model is DetailStoryModel, it's ok for back button
      });
    }

    // ⭐ EVENT LISTENER UNTUK TOMBOL SAVE/UNSAVE ⭐
    const saveStoryBtn = document.getElementById('saveStoryBtn');
    if (saveStoryBtn && presenter && typeof presenter.toggleSaveStory === 'function') {
      saveStoryBtn.addEventListener('click', async () => {
        console.log('[DetailStoryView] Save/Unsave button clicked. Calling presenter.toggleSaveStory().');
        await presenter.toggleSaveStory(story); // Panggil metode di presenter
      });
    } else {
      console.log('error', saveStoryBtn, presenter);
      console.error('[DetailStoryView] Save/Unsave button not found or presenter.toggleSaveStory is not available.');
    }


    if (story?.lat && story?.lon) {
      const mapContainer = document.getElementById('map-detail');
      if (mapContainer && !mapContainer._leaflet_id) {
        this.#map = L.map(mapContainer, {
          center: [story.lat, story.lon],
          zoom: 15,
        });

        this.#mapLayers = {
          osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }),
          topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
          }),
          esri: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          })
        };

        this.#currentBaseLayer = this.#mapLayers.osm;
        this.#map.addLayer(this.#currentBaseLayer);

        const layerSelect = document.getElementById('mapLayerSelect');
        if(layerSelect) { // Added check for layerSelect
            layerSelect.addEventListener('change', (e) => {
              const selectedLayer = e.target.value;
              if (this.#mapLayers[selectedLayer]) {
                this.#map.removeLayer(this.#currentBaseLayer);
                this.#currentBaseLayer = this.#mapLayers[selectedLayer];
                this.#map.addLayer(this.#currentBaseLayer);
              }
            });
        }


        const { city, country } = location; // location object comes from presenter
        const locationText = city && country ? `${city}, ${country}` : (city || country || '');

        const locElement = document.getElementById('location-description');
        if (locElement && locationText) {
          locElement.innerText = `Lokasi: ${locationText}`;
        }

        L.marker([story.lat, story.lon]).addTo(this.#map)
          .bindPopup(`
            <div style="width:150px; font-family: 'Poppins', sans-serif;">
              <img src="${story.photoUrl}" alt="${story.name}" style="width:100%; height:100px; border-radius:4px; margin-bottom:8px; object-fit: cover;">
              <b style="font-size: 1rem; display: block; text-align: center;">${story.name}</b><br>
              <i style="font-size:0.8rem; display: block; text-align: center; color: #555;">${locationText}</i>
            </div>
          `)
          .openPopup();

        setTimeout(() => {
          this.#map.invalidateSize();
        }, 100);
      }
    }
    console.log('[DetailStoryView] afterRender end');
  }

  // ⭐ BARU: Metode untuk memperbarui tampilan tombol "Simpan/Hapus" ⭐
  updateSaveButton(isSaved) {
    console.log('[DetailStoryView] updateSaveButton called with isSaved:', isSaved); // Debugging
    const saveStoryBtn = document.getElementById('saveStoryBtn');
    if (saveStoryBtn) {
      saveStoryBtn.textContent = isSaved ? 'Hapus dari Tersimpan' : 'Simpan Cerita';
    }
  }
}