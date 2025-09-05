const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { saveMemorial, getAllMemorials, deleteMemorial } = require('./blob-storage');

// Fonction utilitaire pour vérifier l'authentification
function isAuthenticated(event) {
  const cookies = event.headers.cookie || '';
  return cookies.includes('auth=authenticated');
}


exports.handler = async (event, context) => {
  const { httpMethod, path: requestPath } = event;
  
  // Cors headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // GET - Liste des mémoriaux
  if (httpMethod === 'GET') {
    if (!isAuthenticated(event)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authentication required' })
      };
    }

    const memorials = await getAllMemorials();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(memorials)
    };
  }

  // POST - Créer un mémorial
  if (httpMethod === 'POST') {
    if (!isAuthenticated(event)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authentication required' })
      };
    }

    try {
      console.log('Réception requête POST pour créer mémorial');
      console.log('Body reçu:', event.body);
      
      const body = JSON.parse(event.body);
      const { name, birth_date, death_date, biography, message, photos, videos } = body;
      
      console.log('Données parsées:', { name, birth_date, death_date });
      
      if (!name || !birth_date || !death_date) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Nom, date de naissance et date de décès sont obligatoires' })
        };
      }
      
      const memorialId = uuidv4();
      console.log('ID généré:', memorialId);
      
      // Générer le QR Code avec l'URL du site Netlify
      const baseUrl = process.env.SITE_URL || 'https://crazy-wescoff.netlify.app';
      const qrUrl = `${baseUrl}/memorial/${memorialId}`;
      console.log('URL QR:', qrUrl);
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#2C3E50',
          light: '#FFFFFF'
        }
      });
      
      const memorial = {
        id: memorialId,
        name,
        birth_date,
        death_date,
        biography: biography || '',
        message: message || '',
        photos: photos || [],
        videos: videos || [],
        qr_code: qrCodeDataUrl,
        qr_url: qrUrl,
        created_at: new Date().toISOString()
      };
      
      await saveMemorial(memorial);
      console.log('Mémorial sauvegardé:', memorial.name);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          memorial: memorial,
          qr_url: qrUrl
        })
      };
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erreur serveur: ' + error.message })
      };
    }
  }

  // DELETE - Supprimer un mémorial
  if (httpMethod === 'DELETE') {
    if (!isAuthenticated(event)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Authentication required' })
      };
    }

    try {
      const pathSegments = event.path.split('/');
      const id = pathSegments[pathSegments.length - 1];
      
      await deleteMemorial(id);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erreur lors de la suppression' })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
