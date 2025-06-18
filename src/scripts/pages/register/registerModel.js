import Api from '../../data/api';

export default class RegisterModel {
  constructor() {
  }

  async register(name, email, password) {
    try {
      const responseData = await Api.register(name, email, password);
      return responseData;
    } catch (error) {
      console.error('Error in register model:', error);
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
} 