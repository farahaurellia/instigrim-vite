class Auth {

  static isAuthenticated() {
    const user = localStorage.getItem('user');
    if (!user) return false;

    try {
      const userData = JSON.parse(user);
      return !!userData.token;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return false;
    }
  }

  static getUser() {
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  static checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }
}

export default Auth; 