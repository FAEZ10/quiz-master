# ⚡ Démarrage Rapide - Digital Ocean

Guide express pour déployer QuizMaster sur votre droplet Digital Ocean en 15 minutes !

**IP du serveur :** `164.90.225.146`

---

## 🚀 ÉTAPES RAPIDES

### 1. Connexion SSH (1 min)
```bash
ssh root@164.90.225.146
```

### 2. Installation des prérequis (5 min)
```bash
# Mise à jour du système
apt update && apt upgrade -y

# Installation Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Installation PM2 et Nginx
npm install -g pm2
apt install -y nginx git

# Configuration PM2 pour démarrage automatique
pm2 startup
```

### 3. Déploiement du code (5 min)
```bash
# Cloner le projet
cd ~
git clone https://github.com/VOTRE_USERNAME/quiz-master.git
cd quiz-master

# Installation et build
npm install
npm run build

# Créer dossier logs
mkdir logs
```

### 4. Configuration Nginx (2 min)
```bash
# Copier la configuration
cp nginx.conf /etc/nginx/sites-available/quizmaster

# Activer le site
ln -s /etc/nginx/sites-available/quizmaster /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Tester et redémarrer
nginx -t
systemctl restart nginx
```

### 5. Démarrage des applications (2 min)
```bash
# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save

# Vérifier le statut
pm2 status
```

---

## 🎯 VÉRIFICATION RAPIDE

1. **Backend** : `curl http://164.90.225.146:3001/health`
2. **Frontend** : Ouvrir `http://164.90.225.146` dans le navigateur
3. **Test complet** : Créer un quiz et rejoindre avec un autre onglet

---

## 📋 COMMANDES UTILES

```bash
# Voir les logs
pm2 logs

# Redémarrer les apps
pm2 restart ecosystem.config.js

# Monitoring
pm2 monit

# Logs Nginx
tail -f /var/log/nginx/quizmaster_error.log
```

---

## 🔧 REDÉPLOIEMENT RAPIDE

```bash
# Utiliser le script automatique
chmod +x deploy.sh
./deploy.sh
```

---

## ✅ RÉSULTAT

**Votre QuizMaster est accessible sur :** `http://164.90.225.146`

🎉 **Félicitations ! Votre application est en ligne !**
