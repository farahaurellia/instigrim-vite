import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddStoryModel from './addStoryModel.js';
import AddStoryPresenter from './addStoryPresenter.js';

export default class AddStoryView {
  #presenter;
  #model;
  #map;
  #marker;
  #mediaStream;
  #capturedBlob;
  #mapPickerDiv;
  #latInput;
  #lonInput;

  constructor() {
    this.#model = new AddStoryModel();
    this.#presenter = new AddStoryPresenter({
      model: this.#model,
      view: this,
    });

    this.#map = null;
    this.#marker = null;
    this.#mediaStream = null;
    this.#capturedBlob = null;

    // Listen for page unload/hashchange to ensure camera is closed
    window.addEventListener('hashchange', () => this.stopCamera());
    window.addEventListener('beforeunload', () => this.stopCamera());
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render() {
    // Cek apakah user login
    const user = localStorage.getItem('user');
    const isGuest = !user;

    return `
      <main id="main-content" style="max-width: 800px; margin: 40px auto; padding: 20px;" aria-label="Tambah Cerita Baru">
        <div style="background: #fff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); padding: 30px;">
          <h1>Tambah Story Baru</h1>
          ${isGuest ? `<div style="margin-bottom:16px; color:#CA7842; font-weight:bold;">- Sebagai Tamu -</div>` : ''}
          <form id="addStoryForm" enctype="multipart/form-data">
            <div>
              <label for="description">Deskripsi:</label><br>
              <textarea id="description" name="description" rows="3" required></textarea>
            </div>
            <div>
              <label>Foto (max 1MB):</label><br>
              <input type="file" id="photo" name="photo" accept="image/*" style="display:none">
              <button type="button" id="openCameraBtn">Ambil dari Kamera</button>
              <button type="button" id="chooseFileBtn">Pilih dari File</button>
              <div id="cameraContainer" style="display:none; margin-top:10px;">
                <video id="video" autoplay playsinline width="300" style="border-radius:8px;"></video><br>
                <button type="button" id="captureBtn">Ambil Foto</button>
                <button type="button" id="closeCameraBtn">Tutup Kamera</button>
                <canvas id="canvas" style="display:none;"></canvas>
              </div>
              <div id="previewContainer" style="margin-top:10px;"></div>
            </div>
            <div>
              <label for="lat">Latitude (otomatis dari peta):</label><br>
              <input type="number" id="lat" name="lat" step="any" readonly>
            </div>
            <div>
              <label for="lon">Longitude (otomatis dari peta):</label><br>
              <input type="number" id="lon" name="lon" step="any" readonly>
            </div>
            <div style="margin:16px 0;">
              <label>Pilih lokasi pada peta:</label>
              <div id="map-picker" style="height:250px;width:100%;border-radius:8px;overflow:hidden;"></div>
            </div>
            <button type="submit" style="background: linear-gradient(90deg, #f58529 0%, #dd2a7b 50%, #515bd4 100%); color: white;">Tambah Story</button>
            <p id="errorMessage" style="color: red;"></p>
            <p id="successMessage" style="color: green;"></p>
          </form>
        </div>
      </main>
    `;
  }

  async afterRender() {
    this.#presenter.init();
    this.#setupPhotoEvents();
    this.#setupFormSubmission();

    this.#mapPickerDiv = document.getElementById('map-picker');
    this.#latInput = document.getElementById('lat');
    this.#lonInput = document.getElementById('lon');

    if (this.#mapPickerDiv) {
      const defaultLat = -6.200000;
      const defaultLon = 106.816666;
      const map = L.map(this.#mapPickerDiv).setView([defaultLat, defaultLon], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      let marker = null;

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        this.#latInput.value = lat;
        this.#lonInput.value = lng;

        let desc = '';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village || '';
          const state = data.address.state || '';
          desc = city && state ? `${city}, ${state}` : (city || state || 'Lokasi tidak diketahui');
        } catch {
          desc = 'Lokasi tidak diketahui';
        }

        if (marker) {
          marker.setLatLng([lat, lng]);
          marker.bindPopup(desc).openPopup();
        } else {
          marker = L.marker([lat, lng]).addTo(map);
          marker.bindPopup(desc).openPopup();
        }
      });
    }
  }

  #setupPhotoEvents() {
    const photoFile = document.getElementById('photo');
    const previewContainer = document.getElementById('previewContainer');
    const openCameraBtn = document.getElementById('openCameraBtn');
    const cameraContainer = document.getElementById('cameraContainer');
    const video = document.getElementById('video');
    const captureBtn = document.getElementById('captureBtn');
    const closeCameraBtn = document.getElementById('closeCameraBtn');
    const canvas = document.getElementById('canvas');

    openCameraBtn.addEventListener('click', async () => {
      cameraContainer.style.display = 'block';
      previewContainer.innerHTML = '';
      try {
        this.#mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = this.#mediaStream;
      } catch (err) {
        this.displayError('Izin akses kamera ditolak atau tidak tersedia.');
        cameraContainer.style.display = 'none';
      }
    });

    captureBtn.addEventListener('click', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          photoFile.files = this.fileListFromFile(file);
          previewContainer.innerHTML = `<img src="${URL.createObjectURL(blob)}" alt="Preview foto hasil kamera" style="max-width:200px;border-radius:8px;">`;
        }
      }, 'image/jpeg', 0.9);
      cameraContainer.style.display = 'none';
      this.stopCamera();
    });

    closeCameraBtn.addEventListener('click', () => {
      cameraContainer.style.display = 'none';
      this.stopCamera();
    });

    document.getElementById('chooseFileBtn').addEventListener('click', () => {
      photoFile.click();
    });

    photoFile.addEventListener('change', () => {
      if (photoFile.files && photoFile.files[0]) {
        const url = URL.createObjectURL(photoFile.files[0]);
        previewContainer.innerHTML = `<img src="${url}" alt="Preview foto yang dipilih" style="max-width:200px;border-radius:8px;">`;
      }
    });
  }

  stopCamera() {
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach(track => track.stop());
      this.#mediaStream = null;
    }
    // Sembunyikan container kamera jika masih terbuka
    const cameraContainer = document.getElementById('cameraContainer');
    if (cameraContainer) {
      cameraContainer.style.display = 'none';
    }
  }

  fileListFromFile(file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    return dataTransfer.files;
  }

  #setupFormSubmission() {
    const addStoryForm = document.getElementById('addStoryForm');

    addStoryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const latValue = this.#latInput.value;
      const lonValue = this.#lonInput.value;

      if (!latValue || !lonValue) {
        alert("Silakan pilih lokasi pada peta!");
        return;
      }

      const formData = {
        description: document.getElementById('description').value.trim(),
        file: document.getElementById('photo').files[0],
        capturedBlob: this.#capturedBlob,
        lat: latValue,
        lon: lonValue
      };

      await this.#presenter.submitForm(formData);
    });
  }

  showLoading(isLoading) {
    const submitButton = document.querySelector('button[type="submit"]');
    if (isLoading) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    } else {
      submitButton.disabled = false;
      submitButton.textContent = 'Tambah Story';
    }
  }

  showError(message) {
    alert(message);
  }

  showSuccess(message) {
    alert(message);
  }
}
