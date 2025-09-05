// Stockage temporaire - doit être synchronisé avec memorials.js
// En production, utilisez une vraie base de données partagée
let memorials = [];

// Initialiser avec le même mémorial de test que dans memorials.js
if (memorials.length === 0) {
  memorials.push({
    id: 'test-memorial-123',
    name: 'Marie Dupont (Test)',
    birth_date: '1940-05-15',
    death_date: '2023-08-20',
    biography: 'Un exemple de mémorial pour tester le système. Cette personne a vécu une vie pleine d\'amour et de joie.',
    message: 'Tu nous manques chaque jour. Merci pour tous ces beaux souvenirs.',
    photos: [],
    videos: [],
    qr_code: 'data:image/png;base64,test',
    qr_url: 'https://crazy-wescoff.netlify.app/memorial/test-memorial-123',
    created_at: new Date().toISOString()
  });
}

function generateMemorialPage(memorial) {
  const photosHtml = memorial.photos.map(photo => 
    `<img src="${photo.url}" alt="Photo de ${memorial.name}" class="memorial-photo">`
  ).join('');
  
  const videosHtml = memorial.videos.map(video => 
    `<video controls class="memorial-video">
       <source src="${video.url}" type="video/mp4">
       Votre navigateur ne supporte pas la lecture vidéo.
     </video>`
  ).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>En mémoire de ${memorial.name} - Eternelis</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Georgia', serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
            }
            
            .memorial-container {
                max-width: 800px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                backdrop-filter: blur(10px);
            }
            
            .memorial-header {
                background: linear-gradient(45deg, #2C3E50, #34495E);
                color: white;
                padding: 40px 30px;
                text-align: center;
                position: relative;
            }
            
            .memorial-header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23stars)"/></svg>');
                opacity: 0.3;
            }
            
            .memorial-name {
                font-size: 2.5em;
                margin-bottom: 15px;
                position: relative;
                z-index: 1;
            }
            
            .memorial-dates {
                font-size: 1.2em;
                opacity: 0.9;
                position: relative;
                z-index: 1;
            }
            
            .memorial-content {
                padding: 40px 30px;
            }
            
            .memorial-section {
                margin-bottom: 40px;
            }
            
            .section-title {
                font-size: 1.5em;
                color: #2C3E50;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #E8E8E8;
            }
            
            .memorial-biography {
                font-size: 1.1em;
                line-height: 1.6;
                color: #555;
                text-align: justify;
            }
            
            .memorial-message {
                font-style: italic;
                font-size: 1.1em;
                color: #7F8C8D;
                text-align: center;
                padding: 20px;
                background: #F8F9FA;
                border-radius: 10px;
                border-left: 4px solid #3498DB;
            }
            
            .media-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            
            .memorial-photo {
                width: 100%;
                height: 200px;
                object-fit: cover;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
            }
            
            .memorial-photo:hover {
                transform: scale(1.05);
            }
            
            .memorial-video {
                width: 100%;
                max-height: 300px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            
            .eternelis-footer {
                text-align: center;
                padding: 30px;
                background: #F8F9FA;
                color: #7F8C8D;
                font-size: 0.9em;
            }
            
            .eternelis-footer a {
                color: #3498DB;
                text-decoration: none;
            }
            
            .eternelis-footer a:hover {
                text-decoration: underline;
            }
            
            @media (max-width: 768px) {
                .memorial-container {
                    margin: 10px;
                    border-radius: 15px;
                }
                
                .memorial-header {
                    padding: 30px 20px;
                }
                
                .memorial-name {
                    font-size: 2em;
                }
                
                .memorial-content {
                    padding: 30px 20px;
                }
                
                .media-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="memorial-container">
            <div class="memorial-header">
                <h1 class="memorial-name">${memorial.name}</h1>
                <p class="memorial-dates">${memorial.birth_date} - ${memorial.death_date}</p>
            </div>
            
            <div class="memorial-content">
                ${memorial.biography ? `
                <div class="memorial-section">
                    <h2 class="section-title">Biographie</h2>
                    <p class="memorial-biography">${memorial.biography}</p>
                </div>
                ` : ''}
                
                ${memorial.photos.length > 0 ? `
                <div class="memorial-section">
                    <h2 class="section-title">Photos</h2>
                    <div class="media-grid">
                        ${photosHtml}
                    </div>
                </div>
                ` : ''}
                
                ${memorial.videos.length > 0 ? `
                <div class="memorial-section">
                    <h2 class="section-title">Vidéos</h2>
                    <div class="media-grid">
                        ${videosHtml}
                    </div>
                </div>
                ` : ''}
                
                ${memorial.message ? `
                <div class="memorial-section">
                    <div class="memorial-message">
                        "${memorial.message}"
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="eternelis-footer">
                <p>Mémorial créé avec amour par <a href="https://eternelis.com" target="_blank">Eternelis</a></p>
                <p>Service d'entretien de sépultures et mémoriaux numériques</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function generateNotFoundPage() {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mémorial non trouvé - Eternelis</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 50px; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
            }
            .error { 
                background: rgba(255, 255, 255, 0.9);
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                color: #e74c3c; 
            }
            .error h1 {
                color: #2C3E50;
                margin-bottom: 20px;
            }
            .error a {
                color: #3498DB;
                text-decoration: none;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="error">
            <h1>Mémorial non trouvé</h1>
            <p>Le mémorial que vous recherchez n'existe pas ou a été supprimé.</p>
            <p><a href="https://eternelis.com">Retour au site Eternelis</a></p>
        </div>
    </body>
    </html>
  `;
}

exports.handler = async (event, context) => {
  const { queryStringParameters } = event;
  const memorialId = queryStringParameters?.id;
  
  if (!memorialId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: generateNotFoundPage()
    };
  }
  
  // Chercher le mémorial (en production, requête base de données)
  const memorial = memorials.find(m => m.id === memorialId);
  
  if (!memorial) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/html' },
      body: generateNotFoundPage()
    };
  }
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: generateMemorialPage(memorial)
  };
};
