#!/bin/bash

echo "🏥 Vérification de santé QuizMaster"
echo "📍 Serveur: 164.90.225.146"
echo "=================================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonctions d'affichage
print_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_ok() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Variables
FRONTEND_URL="http://164.90.225.146"
BACKEND_URL="http://164.90.225.146:3001"
HEALTH_URL="$BACKEND_URL/health"

# Compteurs
CHECKS_PASSED=0
CHECKS_TOTAL=0

# Fonction de test
run_check() {
    local description="$1"
    local command="$2"
    local expected="$3"
    
    print_check "$description"
    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    
    if eval "$command" > /dev/null 2>&1; then
        print_ok "$description"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        print_error "$description"
        return 1
    fi
}

echo ""
echo "🔍 Tests de connectivité..."

# Test 1: Ping du serveur
run_check "Ping du serveur" "ping -c 1 164.90.225.146"

# Test 2: Port 80 (Nginx)
run_check "Port 80 accessible" "nc -z 164.90.225.146 80"

# Test 3: Port 3000 (Frontend local)
run_check "Port 3000 accessible localement" "nc -z localhost 3000"

# Test 4: Port 3001 (Backend local)
run_check "Port 3001 accessible localement" "nc -z localhost 3001"

echo ""
echo "🌐 Tests HTTP..."

# Test 5: Frontend HTTP
run_check "Frontend accessible via HTTP" "curl -s -o /dev/null -w '%{http_code}' $FRONTEND_URL | grep -q '200'"

# Test 6: Backend Health Check
run_check "Backend Health Check" "curl -s $HEALTH_URL | grep -q 'ok'"

# Test 7: Backend API accessible
run_check "Backend API accessible" "curl -s -o /dev/null -w '%{http_code}' $BACKEND_URL | grep -q '200'"

echo ""
echo "⚙️  Tests des services..."

# Test 8: PM2 status
run_check "PM2 en fonctionnement" "pm2 list | grep -q 'online'"

# Test 9: Nginx status
run_check "Nginx en fonctionnement" "systemctl is-active nginx | grep -q 'active'"

# Test 10: Applications PM2
run_check "Frontend PM2 en ligne" "pm2 list | grep 'quizmaster-frontend' | grep -q 'online'"
run_check "Backend PM2 en ligne" "pm2 list | grep 'quizmaster-backend' | grep -q 'online'"

echo ""
echo "📊 Tests de performance..."

# Test 11: Temps de réponse frontend
FRONTEND_TIME=$(curl -s -o /dev/null -w '%{time_total}' $FRONTEND_URL)
if (( $(echo "$FRONTEND_TIME < 2.0" | bc -l) )); then
    print_ok "Temps de réponse frontend: ${FRONTEND_TIME}s"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    print_warning "Temps de réponse frontend lent: ${FRONTEND_TIME}s"
fi
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

# Test 12: Temps de réponse backend
BACKEND_TIME=$(curl -s -o /dev/null -w '%{time_total}' $HEALTH_URL)
if (( $(echo "$BACKEND_TIME < 1.0" | bc -l) )); then
    print_ok "Temps de réponse backend: ${BACKEND_TIME}s"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    print_warning "Temps de réponse backend lent: ${BACKEND_TIME}s"
fi
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

echo ""
echo "💾 Tests des ressources..."

# Test 13: Utilisation mémoire
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
if (( $(echo "$MEMORY_USAGE < 80.0" | bc -l) )); then
    print_ok "Utilisation mémoire: ${MEMORY_USAGE}%"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    print_warning "Utilisation mémoire élevée: ${MEMORY_USAGE}%"
fi
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

# Test 14: Espace disque
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    print_ok "Utilisation disque: ${DISK_USAGE}%"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
else
    print_warning "Utilisation disque élevée: ${DISK_USAGE}%"
fi
CHECKS_TOTAL=$((CHECKS_TOTAL + 1))

echo ""
echo "=================================="
echo "📈 RÉSUMÉ DES TESTS"
echo "=================================="

# Calcul du pourcentage
PERCENTAGE=$(echo "scale=1; $CHECKS_PASSED * 100 / $CHECKS_TOTAL" | bc)

echo "Tests réussis: $CHECKS_PASSED/$CHECKS_TOTAL ($PERCENTAGE%)"

if [ "$CHECKS_PASSED" -eq "$CHECKS_TOTAL" ]; then
    echo -e "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS !${NC}"
    echo "✅ Votre QuizMaster fonctionne parfaitement !"
elif [ "$CHECKS_PASSED" -gt $((CHECKS_TOTAL * 70 / 100)) ]; then
    echo -e "${YELLOW}⚠️  LA PLUPART DES TESTS SONT PASSÉS${NC}"
    echo "🔧 Quelques optimisations peuvent être nécessaires"
else
    echo -e "${RED}❌ PLUSIEURS TESTS ONT ÉCHOUÉ${NC}"
    echo "🚨 Vérification et dépannage nécessaires"
fi

echo ""
echo "🔗 URLs de votre application:"
echo "   • Frontend: $FRONTEND_URL"
echo "   • Backend:  $BACKEND_URL"
echo "   • Health:   $HEALTH_URL"

echo ""
echo "📋 Commandes de dépannage:"
echo "   • Logs PM2:     pm2 logs"
echo "   • Status PM2:   pm2 status"
echo "   • Logs Nginx:   tail -f /var/log/nginx/quizmaster_error.log"
echo "   • Redémarrer:   ./deploy.sh"

echo ""
if [ "$CHECKS_PASSED" -eq "$CHECKS_TOTAL" ]; then
    echo -e "${GREEN}🚀 Votre QuizMaster est prêt à accueillir des joueurs !${NC}"
else
    echo -e "${YELLOW}🔧 Consultez les logs pour résoudre les problèmes détectés${NC}"
fi
