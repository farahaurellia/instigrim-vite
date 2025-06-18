export default class HomePresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    this.#view.setPresenter(this);
  }

  async init() {
    await this.loadStories();
  }

  async isAuthenticated() {
    return this.#model.isAuthenticated();
  }

  async loadStories() {
    try {
      const result = await this.#model.loadStories();
      
      if (result.success) {
        this.#view.displayStories();
      } else {
        this.#view.showError(result.message);
      }
    } catch (error) {
      console.error('Error in loadStories:', error);
      this.#view.showError('An error occurred while loading stories');
    }
  }

  getStories() {
    return this.#model.getStories();
  }
}
