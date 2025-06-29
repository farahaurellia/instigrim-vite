import Api from '../../data/api';
import Auth from '../../utils/auth';

export default class DetailStoryModel {
  constructor() {
    this.story = null;
  }

  isAuthenticated() {
    return Auth.checkAuth();
  }

  getUserData() {
    return JSON.parse(localStorage.getItem('user'));
  }

  async loadStoryDetail(storyId) {
    const user = this.getUserData();
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    try {
      const responseData = await Api.getStoryDetail(storyId, user.token);

      if (responseData.error === false) {
        this.story = responseData.story;
        return {
          success: true,
          story: this.story,
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to load story detail',
        };
      }
    } catch (error) {
      console.error('Error loading story detail:', error);
      throw error;
    }
  }

  getStory() {
    return this.story;
  }
  
  async getCityCountryFromLatLon(lat, lon) {
    if (!lat || !lon) return { city: '', country: '' };
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      const response = await fetch(url);
      if (!response.ok) return { city: '', country: '' };

      const data = await response.json();
      const address = data.address || {};
      const city = address.city || address.town || address.village || '';
      const country = address.country || '';
      return { city, country };
    } catch (err) {
      console.error('[DetailStoryModel] getCityCountryFromLatLon error:', err);
      return { city: '', country: '' };
    }
  }
}
