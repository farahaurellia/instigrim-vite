class DetailStoryView {
  constructor() {
    this.appContainer = document.createElement('div');
  }

  async render({ id, model, token }) {
    this.appContainer.innerHTML = '<p>Loading...</p>';
    try {
      const data = await model.getDetailStory({ id, token });
      if (data.error) {
        this.appContainer.innerHTML = `<p style="color:red;">${data.message || 'Gagal memuat detail story.'}</p>`;
        return;
      }
      const story = data.story;
      this.appContainer.innerHTML = `
        <div class="detail-story">
          <button id="backToHomeBtn" class="auth-btn" style="margin-bottom:16px;">&larr; Kembali ke Beranda</button>
          <h2>${story.name}</h2>
          <img src="${story.photoUrl}" alt="photo of ${story.name}" style="max-width:300px;display:block;margin-bottom:12px;" 
            onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=No+Image';">
          <p>${story.description || ''}</p>
          <small>Dibuat: ${new Date(story.createdAt).toLocaleString()}</small>
          <br>
          ${story.lat && story.lon ? `
            <div id="map-detail" style="height:250px;width:100%;margin-top:16px;border-radius:8px;overflow:hidden;"></div>
            <small>Lokasi: ${story.lat}, ${story.lon}</small>
          ` : ''}
        </div>
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
        // Pastikan elemen sudah ada di DOM
        setTimeout(() => {
          const mapDiv = document.getElementById('map-detail');
          if (mapDiv) {
            if (window.myMap) {
              window.myMap.remove();
            }
            window.myMap = L.map(mapDiv).setView([story.lat, story.lon], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(window.myMap);
            L.marker([story.lat, story.lon]).addTo(window.myMap);    
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