import Api from '../../data/api';
import Auth from '../../utils/auth';

export default class AddStoryModel {

  isAuthenticated() {
    return Auth.checkAuth();
  }

  getUserData() {
    return JSON.parse(localStorage.getItem('user'));
  }

  async addStory(formData, token) {
    try {
      const responseData = await Api.addStory(formData, token);
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

  async addStoryasGuest(formData) {
    try {
      const responseData = await Api.addGuestStory(formData);
      if (!responseData.error) {
        return {
          success: true,
          message: 'Story added successfully as guest'
        };
      } else {
        return {
          success: false,
          message: responseData.message || 'Failed to add story as guest'
        };
      }
    } catch (error) {
      console.error('Error adding guest story:', error);
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

  async getLocationDescription(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const city = data.address.city || data.address.town || data.address.village || '';
      const state = data.address.state || '';
      return city && state
        ? `${city}, ${state}`
        : (city || state || 'Lokasi tidak diketahui');
    } catch {
      return 'Lokasi tidak diketahui';
    }
  }

  navigateTo(path) {
    window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
  }
}
