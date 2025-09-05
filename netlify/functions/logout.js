exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': 'auth=; HttpOnly; Path=/; Max-Age=0',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ success: true })
  };
};
