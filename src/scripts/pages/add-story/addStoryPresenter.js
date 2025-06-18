export default class AddStoryPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    this.#view.setPresenter(this);
  }

  init() {
    if (!this.#model.isAuthenticated()) {
      window.location.hash = '#/login';
      return false;
    }
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

      const result = await this.#model.addStory(data);
      
      if (result.success) {
        this.#view.showSuccess('Story added successfully');
        window.location.hash = '#/';
      } else {
        this.#view.showError(result.message);
        this.#view.showLoading(false);
      }
    } catch (error) {
      this.#view.showError('An error occurred while adding the story');
      this.#view.showLoading(false);
    }
  }
}
