import Api from '../../data/api';
import Auth from '../../utils/auth';

export default class AddStoryModel {

  isAuthenticated() {
    return Auth.checkAuth();
  }

  getUserData() {
    return JSON.parse(localStorage.getItem('user'));
  }

  async addStory(formData) {
    const user = this.getUserData();
    
    if (!user || !user.token) {
      throw new Error('User not authenticated');
    }

    try {
      const responseData = await Api.addStory(formData, user.token);

      if (!responseData.error) {
        return {
          success: true,
          message: 'Story added successfully'
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to add story'
        };
      }
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  }

  validateStoryInput(data) {
    const { description, file, capturedBlob, includeLocation, lat, lon } = data;

    if (!description) {
      return {
        valid: false,
        message: 'Please enter a story description'
      };
    }

    if (!file && !capturedBlob) {
      return {
        valid: false,
        message: 'Please select or capture a photo'
      };
    }

    if (file && file.size > 1024 * 1024) {
      return {
        valid: false,
        message: 'File must be less than 1MB'
      };
    }

    if (includeLocation && (!lat || !lon)) {
      return {
        valid: false,
        message: 'Please select a location on the map or use current location'
      };
    }

    return {
      valid: true
    };
  }
}
