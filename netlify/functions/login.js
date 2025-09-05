const bcrypt = require('bcrypt');

// Identifiants admin (à personnaliser)
const adminCredentials = {
  username: 'admin',
  password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // 'password'
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, password } = JSON.parse(event.body);
    
    if (username === adminCredentials.username && 
        await bcrypt.compare(password, adminCredentials.password)) {
      return {
        statusCode: 200,
        headers: {
          'Set-Cookie': 'auth=authenticated; HttpOnly; Path=/; Max-Age=86400',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: true })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Identifiants invalides' })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur' })
    };
  }
};
