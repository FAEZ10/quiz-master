# 🚀 Déploiement Rapide - QuizMaster

Guide express pour déployer votre QuizMaster en 10 minutes !

## ⚡ Déploiement Express

### 1. Préparer le code (2 min)

```bash
# Initialiser Git
git init
git add .
git commit -m "Initial commit - QuizMaster ready for deployment"

# Créer un repository GitHub
# Allez sur github.com et créez un nouveau repository "quiz-master"

# Connecter au repository
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/quiz-master.git
git push -u origin main
```

### 2. Déployer le Frontend sur Vercel (3 min)

1. **Allez sur [vercel.com](https://vercel.com)**
2. **Connectez-vous avec GitHub**
3. **Cliquez "New Project"**
4. **Sélectionnez votre repository "quiz-master"**
5. **Cliquez "Deploy"** (Vercel détecte automatiquement Next.js)

✅ **Frontend déployé !** Notez l'URL : `https://quiz-master-xxx.vercel.app`

### 3. Déployer le Backend sur Railway (3 min)

1. **Allez sur [railway.app](https://railway.app)**
2. **Connectez-vous avec GitHub**
3. **Cliquez "New Project"**
4. **Sélectionnez "Deploy from GitHub repo"**
5. **Choisissez votre repository "quiz-master"**
6. **Railway déploie automatiquement**

✅ **Backend déployé !** Notez l'URL : `https://quiz-master-production.up.railway.app`

### 4. Connecter Frontend et Backend (2 min)

1. **Retournez sur Vercel**
2. **Allez dans Settings > Environment Variables**
3. **Ajoutez :**
   ```
   NEXT_PUBLIC_SOCKET_URL = https://quiz-master-production.up.railway.app
   ```
4. **Cliquez "Save"**
5. **Allez dans Deployments > Redeploy**

✅ **Application complète déployée !**

## 🎯 URLs Finales

- **Frontend** : `https://quiz-master-xxx.vercel.app`
- **Backend** : `https://quiz-master-production.up.railway.app`

## 🧪 Test Rapide

1. Visitez votre URL Vercel
2. Créez un quiz
3. Rejoignez avec un autre onglet/appareil
4. Testez le jeu en temps réel

## 🔧 Si ça ne marche pas

### Problème : "Cannot connect to server"
```bash
# Vérifiez que le backend fonctionne
curl https://votre-backend-url.railway.app/health
```

### Problème : CORS Error
1. Allez dans votre projet Railway
2. Variables d'environnement
3. Ajoutez : `FRONTEND_URL = https://votre-app.vercel.app`

### Problème : Build Error
```bash
# Testez localement d'abord
npm run build
```

## 🎉 Félicitations !

Votre QuizMaster est maintenant en ligne et accessible au monde entier !

**Partagez votre création :**
- URL : `https://votre-app.vercel.app`
- Créez des quiz et invitez vos amis !

---

**Temps total : ~10 minutes** ⏱️
