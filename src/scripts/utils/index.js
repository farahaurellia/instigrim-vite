export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Jadikan pendaftaran service worker sebagai fungsi
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker API not supported.');
    return;
  }
 
  try {
    const registration = await navigator.serviceWorker.register('./sw.js');
    console.log('Service worker registration succeeded:', registration);
  } catch (error) {
    console.error('Service worker registration failed:', error);
  }
}
