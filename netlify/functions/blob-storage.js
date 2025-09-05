const { getStore } = require('@netlify/blobs');

const storeName = 'memorials';

// Fallback mémoire (utile si Blobs n'est pas configuré)
const memoryMemorials = new Map();

function getMemorialsStore() {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.BLOBS_TOKEN;

  if (siteID && token) {
    return getStore({ name: storeName, siteID, token });
  }
  // L'environnement Netlify Functions devrait injecter la config automatiquement
  // Si ce n'est pas le cas, getStore() lèvera une erreur capturable côté appelant
  return getStore({ name: storeName });
}

async function saveMemorial(memorial) {
  try {
    const memorialsStore = getMemorialsStore();
    await memorialsStore.set(memorial.id, JSON.stringify(memorial));
  } catch (e) {
    // Fallback mémoire si Blobs indisponible
    if (e && (e.name === 'MissingBlobsEnvironmentError' || String(e.message || '').includes('MissingBlobsEnvironment'))) {
      memoryMemorials.set(memorial.id, memorial);
      return;
    }
    throw e;
  }
}

async function getMemorial(id) {
  try {
    const memorialsStore = getMemorialsStore();
    const memorialData = await memorialsStore.get(id);
    return memorialData ? JSON.parse(memorialData) : null;
  } catch (e) {
    if (e && (e.name === 'MissingBlobsEnvironmentError' || String(e.message || '').includes('MissingBlobsEnvironment'))) {
      return memoryMemorials.get(id) || null;
    }
    throw e;
  }
}

async function getAllMemorials() {
  try {
    const memorialsStore = getMemorialsStore();
    const { blobs } = await memorialsStore.list();
    const memorials = [];
    for (const blob of blobs) {
      const memorialData = await memorialsStore.get(blob.key);
      if (memorialData) {
        memorials.push(JSON.parse(memorialData));
      }
    }
    return memorials.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (e) {
    if (e && (e.name === 'MissingBlobsEnvironmentError' || String(e.message || '').includes('MissingBlobsEnvironment'))) {
      // Retourner les éléments du fallback mémoire
      return Array.from(memoryMemorials.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    throw e;
  }
}

async function deleteMemorial(id) {
  try {
    const memorialsStore = getMemorialsStore();
    await memorialsStore.delete(id);
  } catch (e) {
    if (e && (e.name === 'MissingBlobsEnvironmentError' || String(e.message || '').includes('MissingBlobsEnvironment'))) {
      memoryMemorials.delete(id);
      return;
    }
    throw e;
  }
}

module.exports = { saveMemorial, getMemorial, getAllMemorials, deleteMemorial };
