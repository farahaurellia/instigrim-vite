export default class LoginPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    
    this.#view.setPresenter(this);
  }

  async init() {}

  async handleLogin(email, password) {
    if (!email || !password) {
      this.#view.showError('Please enter both email and password');
      return;
    }
    
    try {
      const responseData = await this.#model.login(email, password);

      if (responseData.error === false) {
        this.#model.saveUserData(responseData.loginResult);
        this.#view.showSuccess('Login successful!');
        this.#view.redirectToHome();
      } else {
        this.#view.showError(responseData.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      this.#view.showError('An error occurred during login. Please try again.');
    }
  }

  async handleLogout() {
    this.#model.removeUserData();
    this.#view.redirectToHome();
  }
}
