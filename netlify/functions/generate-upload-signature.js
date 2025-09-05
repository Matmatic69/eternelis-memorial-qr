const cloudinary = require('cloudinary').v2;
const process = require('process');

// Fonction pour vérifier l'authentification
function isAuthenticated(event) {
  const cookies = event.headers.cookie || '';
  return cookies.includes('auth=authenticated');
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  if (!isAuthenticated(event)) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Authentication required' })
    };
  }

  // Configure Cloudinary avec les variables d'environnement
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  try {
    const body = JSON.parse(event.body);
    const { paramsToSign } = body;

    if (!paramsToSign) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing parameters to sign' })
      };
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature })
    };

  } catch (error) {
    console.error('Error generating signature:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error generating upload signature' })
    };
  }
};
