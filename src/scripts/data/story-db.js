// src/data/story-db.js (contoh sederhana)

import { openDB } from 'idb'; // Instal 'idb' library: npm install idb

const DATABASE_NAME = 'story-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories'; // Nama object store untuk menyimpan cerita

const openStoryDB = () => {
  return openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(database) {
      // Buat object store jika belum ada
      if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

const StoryDb = {
  async getStory(id) {
    const db = await openStoryDB();
    return db.get(OBJECT_STORE_NAME, id);
  },
  async getAllStories() {
    const db = await openStoryDB();
    return db.getAll(OBJECT_STORE_NAME);
  },
  async putStory(story) { // Menyimpan/memperbarui cerita
    const db = await openStoryDB();
    return db.put(OBJECT_STORE_NAME, story);
  },
  async deleteStory(id) {
    const db = await openStoryDB();
    return db.delete(OBJECT_STORE_NAME, id);
  },
};

export default StoryDb;