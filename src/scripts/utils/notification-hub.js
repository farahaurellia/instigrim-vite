import CONFIG from '../config';
import API from '../data/api';

export function isNotifOn() {
  return Notification.permission === 'granted';
}

export function isNotifAvailable() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function notificationRequestPermission() {
  if (!isNotifAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotifOn()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  if (status === 'granted') {
    alert('Izin notifikasi diberikan.');
    return true;
  }

  return false;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export async function subscribeToNotification() {
  if (!isNotifAvailable()) {
    console.error('Notification API unsupported.');
    alert('Browser tidak mendukung Push Notification.');
    return false;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    console.error('User not authenticated.');
    alert('Anda harus login untuk mengaktifkan notifikasi.');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const existingSubscription = await registration.pushManager.getSubscription();

    // Unsubscribe existing subscription if any (optional, for clean state)
    // if (existingSubscription) await existingSubscription.unsubscribe();

    const subscription = existingSubscription || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY)
    });

    // Format sesuai API: { endpoint, keys: { p256dh, auth } }
    const { endpoint, keys } = subscription.toJSON();

    const response = await API.subscribePushNotification({
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      }
    });

    if (response.error) {
      console.error('Failed to subscribe to notifications:', response.message);
      alert('Gagal mengaktifkan notifikasi: ' + (response.message || 'Terjadi kesalahan.'));
      return false;
    }

    console.log('Subscribed to notifications successfully:', response);
    localStorage.setItem('isPushSubscribed', 'true');
    alert('Notifikasi berhasil diaktifkan!');
    return true;
  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    alert('Gagal mengaktifkan notifikasi.');
    return false;
  }
}

export async function unsubscribeFromNotification() {
  if (!isNotifAvailable()) {
    console.error('Notification API unsupported.');
    alert('Browser tidak mendukung Push Notification.');
    return false;
  }

  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.token) {
    console.error('User not authenticated.');
    alert('Anda harus login untuk menonaktifkan notifikasi.');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const { endpoint } = subscription;
      await subscription.unsubscribe();

      const response = await API.unsubscribePushNotification({ endpoint });

      if (response.error) {
        console.error('Failed to unsubscribe from notifications:', response.message);
        alert('Gagal menonaktifkan notifikasi: ' + (response.message || 'Terjadi kesalahan.'));
        return false;
      }

      console.log('Unsubscribed from notifications successfully:', response);
      localStorage.setItem('isPushSubscribed', 'false');
      alert('Notifikasi berhasil dinonaktifkan!');
      return true;
    } else {
      console.warn('No active subscription found.');
      alert('Tidak ada langganan notifikasi yang aktif.');
      return false;
    }
  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    alert('Gagal menonaktifkan notifikasi.');
    return false;
  }
}

// Helper: Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  // Pad base64 string
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}