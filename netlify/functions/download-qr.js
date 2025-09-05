const QRCode = require('qrcode');
const { getMemorial } = require('./blob-storage');

exports.handler = async (event, context) => {
  const { id } = event.queryStringParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Memorial ID is required' })
    };
  }

  const memorial = await getMemorial(id);

  if (!memorial) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Memorial not found' })
    };
  }

  try {
    const qrCodeBuffer = await QRCode.toBuffer(memorial.qr_url, {
      type: 'png',
      width: 500,
      margin: 2,
      color: {
        dark: '#2C3E50',
        light: '#FFFFFF'
      }
    });

    const fileName = `QR-${memorial.name.replace(/[^a-zA-Z0-9]/g, '_')}.png`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
      body: qrCodeBuffer.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate QR code' })
    };
  }
};
