import '../../../styles/styles.css';
import RegisterModel from './registerModel.js';
import RegisterPresenter from './registerPresenter.js';

export default class RegisterView {
  #presenter;
  #model;

  constructor() {
    // Initialize model and presenter
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
      <!-- Container Utama -->
      <main id="main-content" class="register-main" aria-label="Registration Page">
        <div class="register-container">
          <!-- Card Registrasi -->
          <div class="register-card">
            <div class="text-center">
              <h1 class="register-title">Register</h1>
            </div>
            <!-- Form Registrasi -->
            <form id="registerForm" class="register-form" aria-label="Registration form" onsubmit="return false;">
              <!-- Input Nama -->
              <div>
                <label for="name" class="register-label">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  required 
                  class="register-input"
                  aria-required="true"
                  autocomplete="name"
                />
              </div>
              <!-- Input Email -->
              <div>
                <label for="email" class="register-label">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  required 
                  class="register-input"
                  aria-required="true"
                  autocomplete="email"
                />
              </div>
              <!-- Input Password -->
              <div>
                <label for="password" class="register-label">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  minlength="8" 
                  required 
                  class="register-input"
                  aria-required="true"
                  autocomplete="new-password"
                  aria-describedby="passwordHelp"
                />
                <p class="register-help" id="passwordHelp">Password must be at least 8 characters long.</p>
              </div>
              <!-- Tombol Submit -->
              <button 
                type="submit" 
                class="register-btn"
                aria-label="Create new account"
              >
                Register
              </button>
            </form>
            <!-- Link Login -->
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

  /**
   * Menangani interaksi setelah halaman dirender
   * Mengatur event listener untuk form registrasi
   */
  async afterRender() {
    this.setupEventListeners();
  }

  /**
   * Sets up all event listeners for the registration form
   */
  setupEventListeners() {
    const registerForm = document.getElementById('registerForm');
    
    if (!registerForm) {
      console.error('Registration form not found!');
      return;
    }

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent form submission
      
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

  /**
   * Shows a success message to the user
   * @param {string} message - Success message to display
   */
  showSuccess(message) {
    alert(message);
  }

  /**
   * Shows an error message to the user
   * @param {string} message - Error message to display
   */
  showError(message) {
    alert(message);
  }

  /**
   * Redirects the user to the login page
   */
  redirectToHome() {
    window.location.hash = '#/';
  }
}