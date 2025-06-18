/**
 * Kelas Auth
 * Menangani semua fungsi terkait autentikasi pengguna
 */
class Auth {
  /**
   * Memeriksa status autentikasi pengguna
   * @returns {boolean} Status autentikasi pengguna
   */
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

  /**
   * Mengambil data pengguna yang tersimpan
   * @returns {Object|null} Data pengguna atau null jika tidak ada
   */
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


  /**
   * Memperbarui tampilan navigasi berdasarkan status autentikasi
   * Menampilkan/menyembunyikan elemen berdasarkan status login
   */
  // static updateNavigation() {
  //   const authOnlyElements = document.querySelectorAll('.auth-only');
  //   const guestOnlyElements = document.querySelectorAll('.guest-only');
  //   const authRequiredLinks = document.querySelectorAll('.auth-required');

  //   if (this.isAuthenticated()) {
  //     // Menampilkan elemen untuk pengguna yang sudah login
  //     authOnlyElements.forEach(element => {
  //       element.classList.remove('hidden');
  //     });
  //     // Menyembunyikan elemen untuk pengguna yang belum login
  //     guestOnlyElements.forEach(element => element.classList.add('hidden'));
  //     // Mengaktifkan link yang membutuhkan autentikasi
  //     authRequiredLinks.forEach(link => {
  //       link.classList.remove('disabled');
  //       link.style.pointerEvents = 'auto';
  //     });
  //   } else {
  //     // Menyembunyikan elemen untuk pengguna yang sudah login
  //     authOnlyElements.forEach(element => element.classList.add('hidden'));
  //     // Menampilkan elemen untuk pengguna yang belum login
  //     guestOnlyElements.forEach(element => element.classList.remove('hidden'));
  //     // Menonaktifkan link yang membutuhkan autentikasi
  //     authRequiredLinks.forEach(link => {
  //       link.classList.add('disabled');
  //       link.style.pointerEvents = 'none';
  //     });
  //   }
  // }

  /**
   * Memeriksa status autentikasi dan mengarahkan ke halaman login jika belum login
   * @returns {boolean} Status autentikasi pengguna
   */
  static checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }
}

export default Auth; 