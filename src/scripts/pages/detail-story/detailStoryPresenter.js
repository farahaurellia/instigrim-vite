export default class DetailStoryPresenter {
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
  }

  async showDetail(storyId) {
    let token = null;
    const user = this.model.getUserData();
    if (user && user.token) {
      token = user.token;
    }

    const html = await this.view.render({
      id: storyId,
      model: {
        getDetailStory: async ({ id, token }) => {
          const result = await this.model.loadStoryDetail(id);
          if (result.success) {
            return { error: false, story: result.story };
          } else {
            return { error: true, message: result.message };
          }
        }
      },
      token
    });

    const container = document.getElementById('main-content');
    if (container) {
      container.innerHTML = html;
      await this.view.afterRender({ id: storyId });
    }
    return html;
  }
}