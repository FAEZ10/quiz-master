# 🚀 Guide de Déploiement QuizMaster

Ce guide vous explique comment déployer votre application QuizMaster sur Vercel et d'autres plateformes.

## 📋 Architecture du Projet

Le projet QuizMaster est composé de deux parties :
- **Frontend** : Application Next.js (port 3000)
- **Backend** : Serveur Socket.IO (port 3001)

## 🌐 Déploiement sur Vercel

### Étape 1 : Préparation du Frontend

1. **Installer Vercel CLI** (optionnel)
```bash
npm install -g vercel
```

2. **Créer un compte Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec GitHub, GitLab ou Bitbucket

### Étape 2 : Déployer le Frontend

#### Option A : Via l'interface web Vercel

1. **Pusher votre code sur GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/quiz-master.git
git push -u origin main
```

2. **Connecter à Vercel**
   - Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
   - Cliquez sur "New Project"
   - Importez votre repository GitHub
   - Vercel détectera automatiquement Next.js

3. **Configuration des variables d'environnement**
   - Dans les paramètres du projet Vercel
   - Ajoutez ces variables :
   ```
   NEXT_PUBLIC_SOCKET_URL=https://votre-backend-url.com
   NODE_ENV=production
   ```

#### Option B : Via CLI

```bash
# Dans le dossier du projet
vercel

# Suivez les instructions :
# - Set up and deploy? Y
# - Which scope? Votre compte
# - Link to existing project? N
# - Project name? quiz-master
# - Directory? ./
# - Override settings? N
```

### Étape 3 : Déployer le Backend Socket.IO

Le backend Socket.IO ne peut pas être hébergé sur Vercel (qui ne supporte que les fonctions serverless). Voici les alternatives :

#### Option A : Railway (Recommandé)

1. **Créer un compte sur [Railway](https://railway.app)**

2. **Créer un nouveau projet**
   - Connectez votre repository GitHub
   - Railway détectera automatiquement Node.js

3. **Configuration**
   - Railway déploiera automatiquement le serveur
   - Notez l'URL fournie (ex: `https://quiz-backend-production.up.railway.app`)

4. **Variables d'environnement**
   ```
   NODE_ENV=production
   PORT=3001
   ```

#### Option B : Render

1. **Créer un compte sur [Render](https://render.com)**

2. **Nouveau Web Service**
   - Connectez votre repository
   - Build Command: `npm install`
   - Start Command: `npm run dev:server`

#### Option C : Heroku

1. **Installer Heroku CLI**

2. **Créer une app Heroku**
```bash
heroku create quiz-master-backend
```

3. **Créer un Procfile**
```bash
echo "web: npm run dev:server" > Procfile
```

4. **Déployer**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Étape 4 : Connecter Frontend et Backend

1. **Mettre à jour les variables d'environnement Vercel**
   - Retournez dans les paramètres de votre projet Vercel
   - Modifiez `NEXT_PUBLIC_SOCKET_URL` avec l'URL de votre backend
   - Exemple : `https://quiz-backend-production.up.railway.app`

2. **Redéployer le frontend**
   - Vercel redéploiera automatiquement à chaque push
   - Ou manuellement via le dashboard

## 🔧 Configuration CORS

Assurez-vous que votre backend accepte les requêtes de votre frontend :

```javascript
// Dans server/index.ts
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://votre-app.vercel.app"  // Ajoutez votre URL Vercel
    ],
    methods: ["GET", "POST"]
  }
})
```

## 📝 Scripts de Déploiement

Ajoutez ces scripts à votre `package.json` :

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "deploy:frontend": "vercel --prod",
    "deploy:backend": "git push railway main"
  }
}
```

## 🌍 Domaine Personnalisé

### Sur Vercel
1. Allez dans les paramètres de votre projet
2. Section "Domains"
3. Ajoutez votre domaine personnalisé
4. Configurez les DNS selon les instructions

### Sur Railway
1. Paramètres du projet
2. Section "Networking"
3. Ajoutez votre domaine personnalisé

## 🔍 Vérification du Déploiement

1. **Frontend** : Visitez votre URL Vercel
2. **Backend** : Testez `https://votre-backend-url.com/health`
3. **WebSocket** : Créez un quiz pour tester la connexion temps réel

## 🐛 Dépannage

### Erreurs communes

1. **CORS Error**
   - Vérifiez la configuration CORS du backend
   - Assurez-vous que l'URL frontend est autorisée

2. **WebSocket Connection Failed**
   - Vérifiez que `NEXT_PUBLIC_SOCKET_URL` pointe vers le bon backend
   - Testez la connexion backend directement

3. **Build Errors**
   - Vérifiez que toutes les dépendances sont dans `package.json`
   - Assurez-vous que TypeScript compile sans erreurs

### Logs de débogage

```bash
# Vercel
vercel logs

# Railway
# Consultez les logs dans le dashboard Railway

# Heroku
heroku logs --tail
```

## 📊 Monitoring

### Vercel Analytics
- Activez Vercel Analytics dans les paramètres du projet
- Suivez les performances et l'utilisation

### Backend Monitoring
- Utilisez les outils de monitoring de votre plateforme
- Railway, Render et Heroku fournissent des métriques intégrées

## 🔄 Déploiement Automatique

### GitHub Actions (Optionnel)

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎯 URLs Finales

Après déploiement, vous aurez :
- **Frontend** : `https://votre-app.vercel.app`
- **Backend** : `https://votre-backend.railway.app`

## 💡 Conseils

1. **Testez localement** avant de déployer
2. **Utilisez des variables d'environnement** pour les URLs
3. **Surveillez les logs** après déploiement
4. **Configurez un domaine personnalisé** pour une meilleure expérience
5. **Activez HTTPS** partout (automatique sur Vercel/Railway)

## 🆘 Support

Si vous rencontrez des problèmes :
1. Consultez les logs de déploiement
2. Vérifiez la documentation de votre plateforme
3. Testez les connexions étape par étape

---

**Félicitations ! Votre QuizMaster est maintenant en ligne ! 🎉**
