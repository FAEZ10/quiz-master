#!/bin/bash

echo "🚀 Déploiement QuizMaster sur Digital Ocean..."
echo "📍 Serveur: 164.90.225.146"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    print_error "Ce script doit être exécuté depuis le répertoire racine du projet QuizMaster"
    exit 1
fi

print_status "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

# Vérifier PM2
if ! command -v pm2 &> /dev/null; then
    print_error "PM2 n'est pas installé. Installez-le avec: npm install -g pm2"
    exit 1
fi

print_success "Tous les prérequis sont installés"

# Sauvegarder les changements locaux
print_status "Sauvegarde des changements locaux..."
git stash push -m "Auto-stash before deployment $(date)"

# Récupérer les dernières modifications
print_status "Récupération des dernières modifications..."
if git pull origin main; then
    print_success "Code mis à jour"
else
    print_warning "Impossible de récupérer les modifications (peut-être pas de repository Git)"
fi

# Installer les dépendances
print_status "Installation des dépendances..."
if npm install; then
    print_success "Dépendances installées"
else
    print_error "Erreur lors de l'installation des dépendances"
    exit 1
fi

# Build du frontend
print_status "Build du frontend Next.js..."
if npm run build; then
    print_success "Build terminé"
else
    print_error "Erreur lors du build"
    exit 1
fi

# Créer le dossier de logs s'il n'existe pas
if [ ! -d "logs" ]; then
    print_status "Création du dossier logs..."
    mkdir logs
    print_success "Dossier logs créé"
fi

# Arrêter les applications existantes
print_status "Arrêt des applications existantes..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

# Démarrer les applications
print_status "Démarrage des applications avec PM2..."
if pm2 start ecosystem.config.js; then
    print_success "Applications démarrées"
else
    print_error "Erreur lors du démarrage des applications"
    exit 1
fi

# Sauvegarder la configuration PM2
print_status "Sauvegarde de la configuration PM2..."
pm2 save

# Redémarrer Nginx si disponible
if command -v nginx &> /dev/null; then
    print_status "Redémarrage de Nginx..."
    if sudo systemctl restart nginx; then
        print_success "Nginx redémarré"
    else
        print_warning "Impossible de redémarrer Nginx"
    fi
else
    print_warning "Nginx n'est pas installé"
fi

# Attendre que les services démarrent
print_status "Attente du démarrage des services..."
sleep 5

# Vérifier le statut des applications
print_status "Vérification du statut des applications..."
pm2 status

# Tests de connectivité
print_status "Tests de connectivité..."

# Test du backend
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "Backend accessible sur le port 3001"
else
    print_warning "Backend non accessible sur le port 3001"
fi

# Test du frontend
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Frontend accessible sur le port 3000"
else
    print_warning "Frontend non accessible sur le port 3000"
fi

echo ""
echo "🎉 Déploiement terminé !"
echo ""
echo "📊 Informations de déploiement:"
echo "   • Application: http://164.90.225.146"
echo "   • Backend API: http://164.90.225.146:3001"
echo "   • Health Check: http://164.90.225.146:3001/health"
echo ""
echo "📋 Commandes utiles:"
echo "   • Voir les logs: pm2 logs"
echo "   • Statut des apps: pm2 status"
echo "   • Monitoring: pm2 monit"
echo "   • Redémarrer: pm2 restart ecosystem.config.js"
echo ""
echo "🔍 Pour vérifier que tout fonctionne:"
echo "   1. Ouvrez http://164.90.225.146 dans votre navigateur"
echo "   2. Créez un quiz"
echo "   3. Rejoignez avec un autre onglet/appareil"
echo "   4. Testez le jeu complet"
echo ""
print_success "Déploiement réussi ! 🚀"
