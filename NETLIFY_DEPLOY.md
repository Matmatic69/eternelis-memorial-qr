# 🚀 Déploiement sur Netlify - Eternelis Memorial QR

Guide complet pour déployer votre système de QR codes commémoratifs sur Netlify.

## 📋 Prérequis

- Compte Netlify (gratuit)
- Repository Git (GitHub, GitLab, ou Bitbucket)
- Accès à votre compte eternelis.com

## 🔧 Configuration Netlify

### 1. Déploiement initial

1. **Connecter le repository**
   - Allez sur [netlify.com](https://netlify.com)
   - Cliquez sur "New site from Git"
   - Connectez votre repository GitHub/GitLab

2. **Configuration de build**
   ```
   Build command: npm run build
   Publish directory: public
   Functions directory: netlify/functions
   ```

### 2. Variables d'environnement

Dans les Settings Netlify > Environment variables :

```
ADMIN_USERNAME=votre_nom_admin
ADMIN_PASSWORD_HASH=hash_bcrypt_de_votre_mot_de_passe
SITE_URL=https://memorial.eternelis.com
```

### 3. Nom de domaine personnalisé

**Option A: Sous-domaine**
- Dans Netlify: Domain settings > Add custom domain
- Ajoutez: `memorial.eternelis.com`
- Configurez le CNAME dans votre DNS:
  ```
  memorial.eternelis.com CNAME votre-site.netlify.app
  ```

**Option B: Intégration directe**
- Déployez sur `eternelis.netlify.app`
- Puis configurez votre domaine principal

## 🔐 Sécurisation

### 1. Changer les identifiants admin

Générez un nouveau hash bcrypt :
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('votre_nouveau_mdp', 10);
console.log(hash); // Utilisez ce hash dans les variables d'environnement
```

### 2. Configuration HTTPS

Netlify active automatiquement HTTPS. Assurez-vous que tous les liens utilisent `https://`.

## 📁 Structure Netlify

```
eternelis-memorial-qr/
├── netlify.toml              # Configuration Netlify
├── package.json              # Dépendances
├── public/                   # Site statique
│   ├── index.html
│   └── admin.html
└── netlify/functions/        # Fonctions serverless
    ├── login.js
    ├── logout.js
    ├── check-auth.js
    ├── memorials.js
    └── memorial.js
```

## 🗄️ Base de données

### Option recommandée: FaunaDB

1. **Création compte FaunaDB**
   - Allez sur [fauna.com](https://fauna.com)
   - Créez une base "eternelis-memorials"

2. **Configuration**
   ```javascript
   // À ajouter dans les fonctions Netlify
   const faunadb = require('faunadb');
   const q = faunadb.query;
   const client = new faunadb.Client({
     secret: process.env.FAUNA_SECRET_KEY
   });
   ```

3. **Variables d'environnement**
   ```
   FAUNA_SECRET_KEY=votre_clé_fauna
   ```

### Alternative: Airtable

Plus simple pour débuter :
```
AIRTABLE_API_KEY=votre_clé_airtable
AIRTABLE_BASE_ID=votre_base_id
```

## 📸 Stockage des médias

### Option recommandée: Cloudinary

1. **Compte Cloudinary gratuit**
   - 25GB de stockage gratuit
   - Optimisation automatique des images

2. **Configuration**
   ```
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   ```

3. **Upload dans les fonctions**
   ```javascript
   const cloudinary = require('cloudinary').v2;
   
   // Configuration automatique avec les variables d'environnement
   const uploadResult = await cloudinary.uploader.upload(file.path, {
     folder: 'eternelis-memorials',
     public_id: `memorial-${memorialId}-${Date.now()}`
   });
   ```

## 🔄 Déploiement automatique

### 1. Build hooks

Netlify redéploie automatiquement à chaque push sur votre branche principale.

### 2. Preview deployments

Chaque pull request génère une preview URL pour tester.

## 📱 Configuration mobile

### 1. PWA (Progressive Web App)

Ajoutez un `manifest.json` dans le dossier public :
```json
{
  "name": "Eternelis Memorial QR",
  "short_name": "Eternelis QR",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#2C3E50",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 2. Service Worker

Pour le cache hors ligne des mémoriaux.

## 🌐 Intégration avec eternelis.com

### 1. Lien depuis votre site principal

Ajoutez sur eternelis.com :
```html
<a href="https://memorial.eternelis.com" class="memorial-link">
  🌹 Mémoriaux Numériques QR
</a>
```

### 2. Design harmonisé

Récupérez les couleurs de votre site et adaptez les CSS.

### 3. Formulaire de contact

Intégrez Netlify Forms pour les demandes :
```html
<form name="memorial-request" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="memorial-request" />
  <!-- Vos champs -->
</form>
```

## 📊 Analytics et monitoring

### 1. Google Analytics

Ajoutez le tracking code dans vos pages HTML.

### 2. Netlify Analytics

Activé automatiquement, donne les stats de visite.

### 3. Monitoring des fonctions

Surveillez les erreurs dans les logs Netlify.

## 💰 Coûts estimés

**Plan gratuit Netlify** (largement suffisant pour débuter) :
- ✅ 100GB de bande passante/mois
- ✅ 125k appels de fonctions/mois
- ✅ SSL automatique
- ✅ Deploy previews

**Services complémentaires** :
- FaunaDB : Gratuit jusqu'à 100k lectures/mois
- Cloudinary : Gratuit jusqu'à 25GB
- **Total : 0€/mois pour commencer**

## 🚀 Étapes de déploiement

1. ✅ Push le code sur GitHub
2. ✅ Connecter le repo à Netlify
3. ✅ Configurer les variables d'environnement
4. ✅ Configurer le domaine custom
5. ✅ Tester l'interface admin
6. ✅ Créer le premier mémorial test
7. ✅ Vérifier le QR code généré

## 🆘 Dépannage

### Fonctions qui ne marchent pas
- Vérifiez les logs dans Netlify Functions
- Assurez-vous que les dépendances sont dans package.json

### Domaine personnalisé
- Attendez 24-48h pour la propagation DNS
- Vérifiez la configuration CNAME

### Upload de fichiers
- Limite de 6MB par fonction Netlify
- Utilisez Cloudinary pour les gros fichiers

## 📞 Support

Une fois déployé, vous aurez :
- Interface admin : `https://memorial.eternelis.com/admin`
- API documentée dans les fonctions
- Système prêt pour vos premiers clients

Le système est maintenant prêt pour la production sur Netlify ! 🎉
