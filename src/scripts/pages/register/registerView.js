import '../../../styles/styles.css';
import RegisterModel from './registerModel.js';
import RegisterPresenter from './registerPresenter.js';

export default class RegisterView {
  #presenter;
  #model;

  constructor() {
    this.#model = new RegisterModel();
    this.#presenter = new RegisterPresenter({
      model: this.#model,
      view: this,
    });
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render() {
    return `
      <main id="main-content" class="register-main" aria-label="Registration Page">
        <div class="register-container">
          <div class="register-card">
            <div class="text-center">
              <h1 class="register-title">Register</h1>
            </div>
            <form id="registerForm" class="register-form" aria-label="Registration form" onsubmit="return false;">
              <div>
                <label for="name" class="register-label">Name</label>
                <input class="register-input" type="text" id="name" name="name" required aria-required="true" autocomplete="name"/>
              </div>
              <div>
                <label for="email" class="register-label">Email</label>
                <input class="register-input" type="email" id="email" name="email" required aria-required="true" autocomplete="email" />
              </div>
              <div>
                <label for="password" class="register-label">Password</label>
                <input class="register-input" type="password" id="password" name="password" required aria-required="true" minlength="8" autocomplete="new-password"/>
              </div>
              <button type="submit" class="register-btn" aria-label="Create new account">
                Register
              </button>
            </form>
            <div class="register-link">
              <p class="register-text">
                Already have an account? 
                <a href="#/login" class="register-link-text" aria-label="Go to login page">
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  async afterRender() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const registerForm = document.getElementById('registerForm');
    
    if (!registerForm) {
      console.error('Registration form not found!');
      return;
    }

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault(); 
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (this.#presenter) {
        this.#presenter.handleRegister(name, email, password);
      } else {
        console.error('Presenter not set!');
      }
    });
  }

  showSuccess(message) {
    alert(message);
  }

  showError(message) {
    alert(message);
  }

  redirectToHome() {
    window.location.hash = '#/';
  }
}