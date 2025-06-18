import Api from '../../data/api';
import Auth from '../../utils/auth';

export default class HomeModel {
  constructor() {
    this.page = 1;
    this.size = 10;
    this.stories = [];
  }

  isAuthenticated() {
    return Auth.checkAuth();
  }

  getUserData() {
    return JSON.parse(localStorage.getItem('user'));
  }

  async loadStories() {
    const user = this.getUserData();
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    try {
      const responseData = await Api.getStories(this.page, this.size, user.token);

      if (responseData.error === false) {
        this.stories = [...this.stories, ...responseData.listStory];
        return {
          success: true,
          stories: this.stories,
          newStories: responseData.listStory
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to load stories'
        };
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      throw error;
    }
  }

  getStories() {
    return this.stories;
  }

}
