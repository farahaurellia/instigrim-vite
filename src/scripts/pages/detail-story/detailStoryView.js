class DetailStoryView {
  constructor() {
    this.appContainer = document.createElement('main');
    this.appContainer.id = 'main-content';
    this.appContainer.setAttribute('aria-label', 'Detail Story');
    this.appContainer.tabIndex = -1; // Agar skip-link bisa fokus ke sini
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
          ${story.lat && story.lon ? `
            <div id="map-detail" style="height:250px;width:100%;margin-top:16px;border-radius:8px;overflow:hidden;" aria-label="Lokasi pada peta"></div>
            <small>Lokasi: ${story.lat}, ${story.lon}</small>
          ` : ''}
        </section>
      `;

      // Event tombol kembali
      const backBtn = this.appContainer.querySelector('#backToHomeBtn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          window.location.hash = '/';
        });
      }

      // Tampilkan peta jika ada lat/lon
      if (story.lat && story.lon && window.L) {
        setTimeout(() => {
          const mapDiv = document.getElementById('map-detail');
          if (mapDiv) {
            if (window.myMap) {
              window.myMap.remove();
            }
            window.myMap = L.map(mapDiv).setView([parseFloat(story.lat), parseFloat(story.lon)], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(window.myMap);
            L.marker([parseFloat(story.lat), parseFloat(story.lon)]).addTo(window.myMap);
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
const id = hash.split('/')[2]; // /stories/:id

export default DetailStoryView;