// Import halaman-halaman aplikasi
import HomeView from '../pages/home/homeView';
import LoginView from '../pages/login/loginView';
import RegisterView from '../pages/register/registerView';
// import StoriesView from '../pages/stories/story/stories-view';
import DetailStoryView from '../pages/detail-story/detailStoryView';
import DetailStoryModel from '../pages/detail-story/detailStoryModel';
import DetailStoryPresenter from '../pages/detail-story/detailStoryPresenter';
import AddStoryView from '../pages/add-story/addStoryView';
// import AddGuestStoryView from '../pages/stories/guests-story/add-guest-story-view';

/**
 * Konfigurasi rute aplikasi
 * Menentukan halaman yang akan ditampilkan berdasarkan URL
 */
const routes = {
  '/': new HomeView(),                    // Halaman Utama
  '/login': new LoginView(),              // Halaman Login
  '/register': new RegisterView(),        // Halaman Register
  // '/stories': new StoriesView(),          // Halaman Daftar Cerita
  '/stories/:id': new DetailStoryPresenter({
    view: new DetailStoryView(),
    model: new DetailStoryModel(),
  }),  // Halaman Detail Cerita
  '/add-story': new AddStoryView(),     // Halaman Tambah Cerita (User)
  // '/add-guest-story': new AddGuestStoryView(), // Halaman Tambah Cerita (Tamu)
};

export default routes;
