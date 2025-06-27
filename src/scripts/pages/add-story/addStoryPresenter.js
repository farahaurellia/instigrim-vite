export default class AddStoryPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    this.#view.setPresenter(this);
  }

  init() {
    // Tidak redirect ke login, biarkan guest bisa add story
    // Bisa tambahkan info di view jika guest
    return true;
  }

  async submitForm(formData) {
    const validationResult = this.#model.validateStoryInput(formData);
    
    if (!validationResult.valid) {
      this.#view.showError(validationResult.message);
      return;
    }

    this.#view.showLoading(true);

    try {
      const data = new FormData();
      data.append('description', formData.description);

      if (formData.file) {
        data.append('photo', formData.file);
      } else if (formData.capturedBlob) {
        data.append('photo', formData.capturedBlob, 'captured.jpg');
      }

      if (formData.lat && formData.lon) {
        data.append('lat', formData.lat);
        data.append('lon', formData.lon);
      }

      // Cek apakah user login
      const user = localStorage.getItem('user');
      let result;
      if (user && JSON.parse(user).token) {
        // User login, kirim sebagai user
        result = await this.#model.addStory(data, JSON.parse(user).token);
      } else {
        // Guest, kirim sebagai guest (tanpa token)
        result = await this.#model.addStoryasGuest(data);
      }
      
      if (result.success) {
        this.#view.showSuccess('Story added successfully');
        window.location.hash = '#/';
      } else {
        this.#view.showError(result.message);
        this.#view.showLoading(false);
      }
    } catch (error) {
      this.#view.showError(error?.message || 'An error occurred while adding the story');
      this.#view.showLoading(false);
      console.error(error); // Tambahkan ini untuk debug
    }
  }
}
