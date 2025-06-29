import Api from '../../data/api';

export default class LoginModel {
  constructor() {
    //
  }

  getUserData() {
    return JSON.parse(localStorage.getItem('user'));
  }

  async login(email, password) {
    try {
      const responseData = await Api.login(email, password);
      return responseData;
    } catch (error) {
      console.error('Error in login model:', error);
      throw error;
    }
  }

  saveUserData(userData) {
    localStorage.setItem('user', JSON.stringify({
      id: userData.userId,
      name: userData.name,
      token: userData.token
    }));
  }

  removeUserData() {
    localStorage.removeItem('user');
  }

  navigateTo(path) {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
  }
}
