// src/pages/saved-stories/savedStoriesModel.js

import StoryDb from '../../data/story-db'; // Import IndexedDB helper

class SavedStoriesModel {
  async getSavedStories() {
    return StoryDb.getAllStories();
  }

  async deleteSavedStory(id) {
    return StoryDb.deleteStory(id);
  }
}

export default SavedStoriesModel;