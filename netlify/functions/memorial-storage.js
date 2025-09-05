// Simple stockage persistant pour les mémoriaux
// En production, utilisez une vraie base de données

// Stockage temporaire en mémoire (sera remplacé par une vraie DB)
const memorials = new Map();

// Pour les tests, créons un mémorial d'exemple
const testMemorial = {
  id: 'test-memorial-123',
  name: 'Marie Dupont',
  birth_date: '1940-05-15',
  death_date: '2023-08-20',
  biography: 'Une femme merveilleuse qui a consacré sa vie à sa famille et à l\'enseignement.',
  message: 'Tu nous manques chaque jour. Ton sourire et ta gentillesse resteront à jamais gravés dans nos cœurs.',
  photos: [],
  videos: [],
  qr_code: 'data:image/png;base64,test',
  qr_url: 'https://crazy-wescoff.netlify.app/memorial/test-memorial-123',
  created_at: new Date().toISOString()
};

memorials.set('test-memorial-123', testMemorial);

// Fonctions utilitaires
function getAllMemorials() {
  return Array.from(memorials.values());
}

function getMemorialById(id) {
  return memorials.get(id) || null;
}

function addMemorial(memorial) {
  memorials.set(memorial.id, memorial);
  return memorial;
}

function deleteMemorial(id) {
  return memorials.delete(id);
}

module.exports = {
  getAllMemorials,
  getMemorialById,
  addMemorial,
  deleteMemorial
};
