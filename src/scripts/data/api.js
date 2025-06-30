const BASE_URL = 'https://story-api.dicoding.dev/v1';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const ENDPOINTS = {
  LOGIN: `${BASE_URL}/login`,
  REGISTER: `${BASE_URL}/register`,
  STORIES: `${BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
  GUEST_STORY: `${BASE_URL}/stories/guest`,
  SUBSCRIBE: `${BASE_URL}/notifications/subscribe`,
  // UNSUBSCRIBE endpoint sama dengan SUBSCRIBE (method DELETE)
};

// Helper untuk mengambil access token dari localStorage (atau dari tempat lain jika perlu)
function getAccessToken() {
  // Ambil dari user di localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token ? user.token : null;
}

class Api {
  static async login(email, password) {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  static async register(name, email, password) {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  }

  static async getStories(page = 1, size = 10, token) {
    const response = await fetch(`${ENDPOINTS.STORIES}?page=${page}&size=${size}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }

  static async getStoryDetail(id, token) {
    const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }

  static async addStory(formData, token) {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  }

  static async addGuestStory(formData) {
    const response = await fetch(ENDPOINTS.GUEST_STORY, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  }

  static async subscribePushNotification({ endpoint, keys }) {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return {
        error: true,
        message: 'User not authenticated',
      };
    }

    try {
      const response = await fetch(ENDPOINTS.SUBSCRIBE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          endpoint,
          keys: {
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
        }),
      });
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return {
        error: true,
        message: 'Failed to subscribe to push notifications',
      };
    }
  }

  static async unsubscribePushNotification({ endpoint }) {
    const accessToken = getAccessToken();
    if (!accessToken) {
      return {
        error: true,
        message: 'User not authenticated',
      };
    }

    try {
      const response = await fetch(ENDPOINTS.SUBSCRIBE, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ endpoint }),
      });
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return {
        error: true,
        message: 'Failed to unsubscribe from push notifications',
      };
    }
  }
}

export default Api;
