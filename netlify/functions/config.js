exports.handler = async () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'memorial';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || '';

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ cloudName, apiKey, uploadPreset })
  };
};
