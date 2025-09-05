const multipart = require('parse-multipart-data');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Fonction utilitaire pour vérifier l'authentification
function isAuthenticated(event) {
  const cookies = event.headers.cookie || '';
  return cookies.includes('auth=authenticated');
}

// Simulation d'une base de données (en production, utilisez une vraie DB)
let memorials = [];

// Charger les mémoriaux depuis un fichier (simulation)
function loadMemorials() {
  try {
    // En production, vous utiliseriez une base de données
    // Pour Netlify, vous pourriez utiliser FaunaDB, Airtable, ou autre
    return memorials;
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    return [];
  }
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

    memorials = loadMemorials();
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
      // Pour Netlify, nous devons adapter le traitement des fichiers
      // Cette version simplifiée accepte les données de base
      const body = JSON.parse(event.body);
      const { name, birth_date, death_date, biography, message } = body;
      
      const memorialId = uuidv4();
      
      // Générer le QR Code (data URL pour Netlify)
      const qrUrl = `https://eternelis.com/memorial/${memorialId}`;
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
        biography,
        message,
        photos: [], // À adapter pour le stockage cloud
        videos: [], // À adapter pour le stockage cloud
        qr_code: qrCodeDataUrl,
        qr_url: qrUrl,
        created_at: new Date().toISOString()
      };
      
      memorials.push(memorial);
      
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
      console.error('Erreur:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Erreur lors de la création' })
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
      
      memorials = loadMemorials();
      const index = memorials.findIndex(m => m.id === id);
      
      if (index === -1) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Mémorial non trouvé' })
        };
      }
      
      memorials.splice(index, 1);
      
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
