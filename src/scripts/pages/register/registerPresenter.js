import LoginModel from "../login/loginModel";

export default class RegisterPresenter {
  #model;
  #view;
  #loginModel;

  constructor({ model, view }) {
    this.#model = model;
    this.#loginModel = new LoginModel();
    this.#view = view;
    this.#view.setPresenter(this);
  }

  async init() {}

  async handleRegister(name, email, password) {
    if (!name || !email || !password) {
      this.#view.showError('Please fill in all fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.#view.showError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      this.#view.showError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      const responseData = await this.#model.register(name, email, password);
      const loginData = await this.#loginModel.login(email, password);
      if (loginData.error) {
        this.#view.showError(loginData.message || 'Login failed after registration. Please try again.');
        return;
      }

      if (responseData.error === false) {
        this.#model.saveUserData(loginData.loginResult);
        this.#view.showSuccess('Registration successful');
        this.#view.redirectToHome();
      } else {
        this.#view.showError(responseData.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      this.#view.showError('An error occurred during registration. Please try again.');
    }
  }
}
