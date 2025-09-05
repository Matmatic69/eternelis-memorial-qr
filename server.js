const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration des sessions
app.use(session({
  secret: 'ethernelis-memorial-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24h
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Créer les dossiers nécessaires
const dirs = ['uploads/photos', 'uploads/videos', 'data', 'public/qr-codes'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration Multer pour upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('video/') ? 'uploads/videos' : 'uploads/photos';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image (JPEG, PNG, GIF) et vidéo (MP4, MOV, AVI, WebM) sont autorisés.'));
    }
  }
});

// Données en mémoire (en production, utilisez une base de données)
let memorials = [];
let adminCredentials = {
  username: 'admin',
  password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' // 'password'
};

// Middleware d'authentification
const requireAuth = (req, res, next) => {
  if (req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Routes d'authentification
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username === adminCredentials.username && 
      await bcrypt.compare(password, adminCredentials.password)) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Identifiants invalides' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Route pour vérifier l'authentification
app.get('/api/check-auth', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

// Routes API pour les mémoriaux
app.get('/api/memorials', requireAuth, (req, res) => {
  res.json(memorials);
});

app.post('/api/memorials', requireAuth, upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'videos', maxCount: 3 }
]), async (req, res) => {
  try {
    const { name, birth_date, death_date, biography, message } = req.body;
    const memorialId = uuidv4();
    
    const photos = req.files.photos ? req.files.photos.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path
    })) : [];
    
    const videos = req.files.videos ? req.files.videos.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path
    })) : [];
    
    // Générer le QR Code
    const qrUrl = `${req.protocol}://${req.get('host')}/memorial/${memorialId}`;
    const qrCodePath = `public/qr-codes/${memorialId}.png`;
    
    await QRCode.toFile(qrCodePath, qrUrl, {
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
      photos,
      videos,
      qr_code: `qr-codes/${memorialId}.png`,
      created_at: new Date().toISOString()
    };
    
    memorials.push(memorial);
    
    // Sauvegarder dans un fichier JSON (simulation base de données)
    fs.writeFileSync('data/memorials.json', JSON.stringify(memorials, null, 2));
    
    res.json({ 
      success: true, 
      memorial: memorial,
      qr_url: qrUrl 
    });
  } catch (error) {
    console.error('Erreur lors de la création du mémorial:', error);
    res.status(500).json({ error: 'Erreur lors de la création du mémorial' });
  }
});

// Route pour supprimer un mémorial
app.delete('/api/memorials/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const index = memorials.findIndex(m => m.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Mémorial non trouvé' });
  }
  
  const memorial = memorials[index];
  
  // Supprimer les fichiers associés
  [...memorial.photos, ...memorial.videos].forEach(file => {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.error('Erreur lors de la suppression du fichier:', err);
    }
  });
  
  // Supprimer le QR code
  try {
    fs.unlinkSync(`public/${memorial.qr_code}`);
  } catch (err) {
    console.error('Erreur lors de la suppression du QR code:', err);
  }
  
  memorials.splice(index, 1);
  fs.writeFileSync('data/memorials.json', JSON.stringify(memorials, null, 2));
  
  res.json({ success: true });
});

// Route publique pour afficher un mémorial
app.get('/memorial/:id', (req, res) => {
  const memorial = memorials.find(m => m.id === req.params.id);
  
  if (!memorial) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mémorial non trouvé - Ethernelis</title>
          <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #e74c3c; }
          </style>
      </head>
      <body>
          <div class="error">
              <h1>Mémorial non trouvé</h1>
              <p>Le mémorial que vous recherchez n'existe pas ou a été supprimé.</p>
          </div>
      </body>
      </html>
    `);
  }
  
  res.send(generateMemorialPage(memorial, req));
});

// Route pour l'interface d'administration
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fonction pour générer la page mémorial
function generateMemorialPage(memorial, req) {
  const photosHtml = memorial.photos.map(photo => 
    `<img src="/uploads/photos/${photo.filename}" alt="Photo de ${memorial.name}" class="memorial-photo">`
  ).join('');
  
  const videosHtml = memorial.videos.map(video => 
    `<video controls class="memorial-video">
       <source src="/uploads/videos/${video.filename}" type="video/mp4">
       Votre navigateur ne supporte pas la lecture vidéo.
     </video>`
  ).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>En mémoire de ${memorial.name} - Ethernelis</title>
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
            
            .ethernelis-footer {
                text-align: center;
                padding: 30px;
                background: #F8F9FA;
                color: #7F8C8D;
                font-size: 0.9em;
            }
            
            .ethernelis-footer a {
                color: #3498DB;
                text-decoration: none;
            }
            
            .ethernelis-footer a:hover {
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
            
            <div class="ethernelis-footer">
                <p>Mémorial créé avec amour par <a href="https://ethernelis.com" target="_blank">Ethernelis</a></p>
                <p>Service d'entretien de sépultures et mémoriaux numériques</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Charger les mémoriaux existants au démarrage
try {
  if (fs.existsSync('data/memorials.json')) {
    memorials = JSON.parse(fs.readFileSync('data/memorials.json', 'utf8'));
  }
} catch (error) {
  console.error('Erreur lors du chargement des mémoriaux:', error);
}

app.listen(PORT, () => {
  console.log(`Serveur Ethernelis Memorial QR démarré sur le port ${PORT}`);
  console.log(`Interface d'administration: http://localhost:${PORT}/admin`);
  console.log(`Identifiants par défaut: admin / password`);
});
