class DetailStoryView {
  constructor() {
    this.appContainer = document.createElement('main');
    this.appContainer.id = 'main-content';
    this.appContainer.setAttribute('aria-label', 'Detail Story');
    this.appContainer.tabIndex = -1; 
    this._map = null;
    this._mapLayers = null;
    this._currentBaseLayer = null;
  }

  async render({ id, model, token }) {
    this.appContainer.innerHTML = '<p>Loading...</p>';
    try {
      const data = await model.getDetailStory({ id, token });
      if (data.error) {
        this.appContainer.innerHTML = `<p style="color:red;">${data.message || 'Gagal memuat detail story.'}</p>`;
        return this.appContainer;
      }
      const story = data.story;
      this.appContainer.innerHTML = `
        <section class="detail-story" aria-labelledby="detail-story-title">
          <button id="backToHomeBtn" class="auth-btn" style="margin-bottom:16px;">&larr; Kembali ke Beranda</button>
          <h2 id="detail-story-title">${story.name}</h2>
          <img 
            src="${story.photoUrl}" 
            alt="Foto cerita oleh ${story.name}" 
            style="max-width:300px;display:block;margin-bottom:12px;" 
            onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=No+Image';"
          >
          <p>${story.description || ''}</p>
          <small>Dibuat: ${new Date(story.createdAt).toLocaleString()}</small>
          <br>
          ${
            story.lat && story.lon ? `
            <div id="mapLayerControl" style="width:100%;margin:12px 0 8px 0;display:flex;gap:10px;align-items:center;">
              <label for="mapLayerSelect" style="font-weight:bold;">Gaya Peta:</label>
              <select id="mapLayerSelect" style="padding:6px 12px;border-radius:6px;">
                <option value="osm">Default</option>
                <option value="topo">OpenTopoMap</option>
                <option value="esri">Esri World Imagery</option>
              </select>
            </div>
            <div id="map-detail" style="height:250px;width:100%;margin-top:0;border-radius:8px;overflow:hidden;" aria-label="Lokasi pada peta"></div>
            <small>Lokasi: ${story.lat}, ${story.lon}</small>
            ` : ''
          }
        </section>
      `;

      const backBtn = this.appContainer.querySelector('#backToHomeBtn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.location.hash = '/';
        });
      }

      if (story.lat && story.lon && window.L) {
        setTimeout(() => {
          const mapDiv = document.getElementById('map-detail');
          if (mapDiv) {
            if (this._map) {
              this._map.remove();
            }
            this._mapLayers = {
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
            this._map = L.map(mapDiv, { attributionControl: false, zoomControl: false });
            this._mapLayers["osm"].addTo(this._map);
            this._currentBaseLayer = this._mapLayers["osm"];
            this._map.setView([parseFloat(story.lat), parseFloat(story.lon)], 13);

            setTimeout(() => {
              this._map.invalidateSize();
            }, 0);

            L.marker([parseFloat(story.lat), parseFloat(story.lon)]).addTo(this._map);

            const mapLayerSelect = document.getElementById('mapLayerSelect');
            if (mapLayerSelect) {
              mapLayerSelect.addEventListener('change', (e) => {
                const selected = e.target.value;
                if (this._currentBaseLayer) {
                  this._map.removeLayer(this._currentBaseLayer);
                }
                this._mapLayers[selected].addTo(this._map);
                this._currentBaseLayer = this._mapLayers[selected];
              });
            }
          }
        }, 0);
      }
    } catch (err) {
      this.appContainer.innerHTML = `<p style="color:red;">${err.message || 'Gagal memuat detail story.'}</p>`;
    }
    return this.appContainer;
  }
}

const hash = window.location.hash.slice(1);
const id = hash.split('/')[2]; 

export default DetailStoryView;