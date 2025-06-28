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
        // Filter agar tidak ada story dengan id yang sama dua kali
        const existingIds = new Set(this.stories.map(story => story.id));
        const uniqueNewStories = responseData.listStory.filter(story => !existingIds.has(story.id));
        this.stories = [...this.stories, ...uniqueNewStories];
        return {
          success: true,
          stories: this.stories,
          newStories: uniqueNewStories
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
