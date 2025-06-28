import LoginModel from './loginModel.js';
import LoginPresenter from './loginPresenter.js';

export default class LoginView {
  #presenter;
  #model;

  constructor() {
    this.#model = new LoginModel();
    this.#presenter = new LoginPresenter({
      model: this.#model,
      view: this,
    });
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  async render() {
    const user = localStorage.getItem('user');
    const isLoggedIn = user !== null;
    const nama  = isLoggedIn ? JSON.parse(user).name : '';

    return `
      <main id="main-content" class="login-sec" aria-label="Login Page">
        <div class="login-container">
          <div class="login-card">
            <div class="text-center">
              <h1 class="login-title">${isLoggedIn ? `Welcome, ${nama}`: 'Login'}</h1>
            </div>
            <form id="loginForm" class="login-form" aria-label="Login form" ${!isLoggedIn ? '' : 'style="display:none;"'}>
              <div>
                <label for="email" class="login-label">Email</label>
                <input type="email" id="email" name="email" required class="login-input" aria-required="true" autocomplete="email" />
              </div>
              <div>
                <label for="password" class="login-label">Password</label>
                <input type="password" id="password" name="password" required class="login-input" aria-required="true" autocomplete="current-password"/>
              </div>
              <button type="submit" id="loginButton" class="login-btn" aria-label="Login to your account">
                Login
              </button>
            </form>
            ${isLoggedIn ? `
              <button type="button" id="logoutBtn" class="auth-logout-btn" aria-label="Logout from your account">
                Logout
              </button>
            ` : ''}
            <div class="register-link">
              <p class="register-text">
                ${!isLoggedIn ? "Don't have an account?" : ""}
                <a href="${!isLoggedIn ? '#/register' : ''}" class="register-link-text" aria-label="Go to registration page">
                  ${!isLoggedIn ? 'Register here' : ''}
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
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginButton) {
      loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (this.#presenter) {
          this.#presenter.handleLogin(email, password);
        } else {
          console.error('Presenter not set!');
        }
      });

      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (this.#presenter) {
          this.#presenter.handleLogin(email, password);
        } else {
          console.error('Presenter not set!');
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.#presenter.handleLogout();  
      });
    }
  }

  showSuccess(message) {
    alert(message);
  }

  showError(message) {
    alert(message);
  }

  redirectToHome() {
    window.location.hash = '#';
  }
}
