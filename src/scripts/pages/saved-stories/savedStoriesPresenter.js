// src/pages/saved-stories/savedStoriesPresenter.js

class SavedStoriesPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async render() {
    // Memanggil render dari view untuk struktur dasar halaman
    const renderedContent = await this.#view.render();
    return renderedContent;
  }

  async afterRender() {
    // Setelah view di-render, ambil data dari model dan tampilkan
    const stories = await this.#model.getSavedStories();
    this.#view.displayStories(stories);

    // Tambahkan event listener untuk tombol hapus
    const savedStoriesListContainer = document.getElementById('savedStoriesList');
    if (savedStoriesListContainer) {
      savedStoriesListContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-saved-story-btn')) {
          const storyId = event.target.dataset.id;
          if (confirm('Anda yakin ingin menghapus cerita ini dari daftar tersimpan?')) {
            await this.#model.deleteSavedStory(storyId);
            // Muat ulang daftar setelah penghapusan
            this.#view.displayStories(await this.#model.getSavedStories());
            alert('Cerita berhasil dihapus!');
          }
        } else if (event.target.classList.contains('view-story-btn')) {
            // Logika untuk navigasi ke detail story
            // Gunakan window.location.hash untuk navigasi
            // Contoh: window.location.hash = `#/stories/${event.target.dataset.id}`;
        }
      });
    }
  }
}

export default SavedStoriesPresenter;