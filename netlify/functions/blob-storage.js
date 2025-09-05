const { getStore } = require('@netlify/blobs');

const storeName = 'memorials';

async function saveMemorial(memorial) {
  const memorialsStore = getStore(storeName);
  await memorialsStore.set(memorial.id, JSON.stringify(memorial));
}

async function getMemorial(id) {
  const memorialsStore = getStore(storeName);
  const memorialData = await memorialsStore.get(id);
  return memorialData ? JSON.parse(memorialData) : null;
}

async function getAllMemorials() {
  const memorialsStore = getStore(storeName);
  const { blobs } = await memorialsStore.list();
  const memorials = [];
  for (const blob of blobs) {
    const memorialData = await memorialsStore.get(blob.key);
    if (memorialData) {
      memorials.push(JSON.parse(memorialData));
    }
  }
  return memorials.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function deleteMemorial(id) {
  const memorialsStore = getStore(storeName);
  await memorialsStore.delete(id);
}

module.exports = { saveMemorial, getMemorial, getAllMemorials, deleteMemorial };
