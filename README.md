# 🌹 Ethernelis Memorial QR

Un système complet de QR codes commémoratifs pour préserver la mémoire de vos proches disparus.

## 📋 Fonctionnalités

- **Interface d'administration sécurisée** : Création et gestion des mémoriaux
- **Génération automatique de QR codes** : Codes uniques pour chaque mémorial
- **Support multimédia** : Photos (JPEG, PNG, GIF) et vidéos (MP4, MOV, AVI, WebM)
- **Pages mémoriaux responsives** : Optimisées pour mobile et desktop
- **Sécurité et confidentialité** : Accès uniquement via QR code
- **Interface élégante** : Design respectueux et moderne

## 🚀 Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Démarrer le serveur**
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

3. **Accéder à l'application**
- Site principal : http://localhost:3000
- Interface d'administration : http://localhost:3000/admin

## 🔐 Identifiants par défaut

- **Nom d'utilisateur** : `admin`
- **Mot de passe** : `password`

> ⚠️ **Important** : Changez ces identifiants en production !

## 📁 Structure du projet

```
ethernelis-memorial-qr/
├── server.js              # Serveur principal
├── package.json           # Dépendances
├── public/                # Fichiers statiques
│   ├── index.html         # Page d'accueil
│   ├── admin.html         # Interface d'administration
│   └── qr-codes/          # QR codes générés
├── uploads/               # Fichiers uploadés
│   ├── photos/            # Photos des mémoriaux
│   └── videos/            # Vidéos des mémoriaux
└── data/                  # Données persistées
    └── memorials.json     # Base de données des mémoriaux
```

## 🛠️ Utilisation

### Créer un mémorial

1. Allez sur `/admin` et connectez-vous
2. Remplissez les informations du défunt
3. Uploadez photos et vidéos
4. Cliquez sur "Créer le mémorial"
5. Le QR code est automatiquement généré

### Accéder à un mémorial

1. Scannez le QR code avec un smartphone
2. La page mémorial s'ouvre automatiquement
3. Consultez photos, vidéos et biographie

## 🔧 Configuration

### Changer les identifiants admin

Modifiez dans `server.js` :
```javascript
let adminCredentials = {
  username: 'votre_nom',
  password: 'hash_du_mot_de_passe' // Utilisez bcrypt pour hasher
};
```

### Personnaliser le domaine

Changez l'URL de base pour les QR codes dans `server.js` :
```javascript
const qrUrl = `https://votre-domaine.com/memorial/${memorialId}`;
```

### Limites de fichiers

Modifiez les limites dans `server.js` :
```javascript
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB par défaut
  }
});
```

## 🚀 Déploiement

### Option 1: Hébergement classique
1. Uploadez les fichiers sur votre serveur
2. Installez Node.js
3. Lancez `npm install && npm start`

### Option 2: Services cloud
- **Heroku** : Ajoutez un Procfile avec `web: node server.js`
- **Netlify Functions** : Adaptez le code pour les fonctions serverless
- **Vercel** : Compatible avec quelques modifications

### Variables d'environnement recommandées
```bash
PORT=3000
NODE_ENV=production
ADMIN_USERNAME=votre_admin
ADMIN_PASSWORD_HASH=hash_bcrypt_de_votre_mdp
BASE_URL=https://votre-domaine.com
```

## 📱 Compatibilité

- **Navigateurs** : Chrome, Firefox, Safari, Edge (versions récentes)
- **Mobiles** : iOS 12+, Android 8+
- **Scan QR** : Appareil photo natif ou applications QR

## 🔒 Sécurité

- Authentification par session pour l'admin
- Validation des types de fichiers
- Sanitisation des données utilisateur
- Accès aux mémoriaux uniquement via QR

## 🎨 Personnalisation

### Modifier les couleurs
Éditez les variables CSS dans les fichiers HTML :
```css
:root {
  --primary-color: #3498DB;
  --secondary-color: #2C3E50;
  --accent-color: #E74C3C;
}
```

### Ajouter votre logo
Remplacez les emojis dans les titres par vos logos :
```html
<h1><img src="/logo.png" alt="Logo"> Votre Marque</h1>
```

## 🐛 Dépannage

### Erreur d'upload de fichiers
- Vérifiez les permissions du dossier `uploads/`
- Augmentez les limites de taille si nécessaire

### QR codes non générés
- Assurez-vous que le dossier `public/qr-codes/` existe
- Vérifiez les permissions d'écriture

### Session expirée
- Les sessions durent 24h par défaut
- Modifiez `maxAge` dans la configuration session

## 📞 Support

Pour intégrer ce système à votre site ethernelis.com :

1. **Sous-domaine** : Hébergez sur `memorial.ethernelis.com`
2. **Intégration** : Ajoutez des liens depuis votre site principal
3. **Design** : Harmonisez les couleurs avec votre charte graphique

## 📄 Licence

Ce projet est créé spécifiquement pour Ethernelis.
Utilisation commerciale autorisée pour les services d'entretien de sépultures.

---

*Développé avec ❤️ pour honorer la mémoire de nos proches*
