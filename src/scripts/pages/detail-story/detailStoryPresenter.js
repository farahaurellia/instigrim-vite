export default class DetailStoryPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
  }

  // PERUBAHAN UTAMA: Menerima 'mainContent' dan 'storyId'
  async showDetail(mainContent, storyId) {
    mainContent.innerHTML = '<p style="text-align:center; padding: 2rem;">Memuat cerita...</p>';

    try {
      const result = await this.model.loadStoryDetail(storyId);

      if (!result.success) {
        throw new Error(result.message || 'Gagal memuat cerita.');
      }
      
      const story = this.model.getStory();
      if (!story) {
        throw new Error('Data cerita tidak ditemukan.');
      }

      // 1. Dapatkan HTML dari view
      const html = await this.view.render(story);
      // 2. Render HTML langsung ke dalam container yang diberikan
      mainContent.innerHTML = html;

      // 3. Panggil afterRender untuk menginisialisasi peta pada DOM yang baru
      const { city, country } = await this.model.getCityCountryFromLatLon(story.lat, story.lon);
      await this.view.afterRender(story, { city, country });

    } catch (error) {
      console.error('Error in showDetail:', error);
      mainContent.innerHTML = `<p style="color:red; text-align:center;">${error.message}</p>`;
    }
  }
}
