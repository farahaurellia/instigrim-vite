// src/pages/saved-stories/savedStoriesView.js

class SavedStoriesView {
  async render() {
    return `
      <main class="saved-stories-section">
        <h1 class="saved-stories-title">Cerita Tersimpan</h1>
        <div id="savedStoriesList" class="saved-stories-grid">
          <p>Memuat cerita tersimpan...</p>
        </div>
      </main>
    `;
  }

  async afterRender() {
    // Event listener atau logika setelah render view
    // Presenter akan menangani mengisi daftar cerita
  }

  // Metode untuk menampilkan cerita
  displayStories(stories) {
    const savedStoriesListContainer = document.getElementById('savedStoriesList');
    if (!savedStoriesListContainer) return;

    if (stories.length === 0) {
      savedStoriesListContainer.innerHTML = '<p class="no-stories-message">Belum ada cerita yang tersimpan.</p>';
      return;
    }

    savedStoriesListContainer.innerHTML = stories.map(story => `
      <article class="story-card" tabindex="0" role="button" aria-pressed="false" data-story-id="${story.id}" aria-label="Cerita oleh ${story.name}">
        <h2 class="story-card-title">${story.name}</h2>
        <p class="story-card-description">${story.description.substring(0, 100)}...</p>
        <button class="delete-saved-story-btn" data-id="${story.id}">Hapus</button>
        <a href="#/stories/${story.id}" class="view-story-btn">Lihat Detail</a>
      </article>
    `).join('');
  }
}

export default SavedStoriesView;