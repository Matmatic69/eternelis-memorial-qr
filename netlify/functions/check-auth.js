exports.handler = async (event, context) => {
  const cookies = event.headers.cookie || '';
  const isAuthenticated = cookies.includes('auth=authenticated');
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ authenticated: isAuthenticated })
  };
};
