const cloudinary = require('cloudinary').v2;

function isAuthenticated(event) {
  const cookies = event.headers.cookie || '';
  return cookies.includes('auth=authenticated');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!isAuthenticated(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Authentication required' }) };
  }

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || 'memorial';
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET || 'memorial_upload';

  if (!api_key || !api_secret) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Cloudinary API credentials missing' }) };
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });

  try {
    // Try to fetch the preset
    await cloudinary.api.upload_preset(preset);
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, preset, existed: true })
    };
  } catch (err) {
    // If not found, create it as unsigned
    try {
      const resp = await cloudinary.api.create_upload_preset({
        name: preset,
        unsigned: true,
        folder: 'memorials',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        resource_type: 'auto',
        allowed_formats: ['jpg','jpeg','png','webp','gif','mp4','mov','heic','heif']
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, preset, created: true, resp })
      };
    } catch (createErr) {
      console.error('Failed to create upload preset:', createErr);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to ensure upload preset', details: createErr.message })
      };
    }
  }
};
