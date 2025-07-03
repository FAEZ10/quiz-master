# Configuration PostgreSQL pour QuizMaster

## 🚀 Installation et Configuration

### 1. Installation PostgreSQL

**Sur macOS (avec Homebrew) :**
```bash
brew install postgresql
brew services start postgresql
```

**Sur Ubuntu/Debian :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Sur Windows :**
- Télécharger depuis https://www.postgresql.org/download/windows/
- Suivre l'assistant d'installation

### 2. Création de la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE quizmaster;

# Créer un utilisateur (optionnel)
CREATE USER quizuser WITH PASSWORD 'motdepasse';
GRANT ALL PRIVILEGES ON DATABASE quizmaster TO quizuser;

# Quitter
\q
```

### 3. Configuration des variables d'environnement

**Fichier `.env.local` (développement) :**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/quizmaster
```

**Fichier `.env.production` (production) :**
```env
DATABASE_URL=postgresql://username:password@your-host:5432/quizmaster
```

### 4. Exemples de configuration

**Configuration locale simple :**
```env
DATABASE_URL=postgresql://postgres:@localhost:5432/quizmaster
```

**Configuration avec authentification :**
```env
DATABASE_URL=postgresql://quizuser:motdepasse@localhost:5432/quizmaster
```

**Configuration cloud (exemple Heroku) :**
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
```

## 📊 Structure de la base de données

La table `game_results` est créée automatiquement au démarrage du serveur :

```sql
CREATE TABLE IF NOT EXISTS game_results (
  id SERIAL PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL,
  game_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Exemple de données sauvegardées :

```json
{
  "players": [...],
  "settings": {...},
  "questions": [...],
  "startedAt": "2025-01-01T10:00:00Z",
  "finishedAt": "2025-01-01T10:15:00Z",
  "duration": 15,
  "winner": {
    "name": "Alice",
    "score": 8500
  },
  "finalScores": [
    {
      "playerId": "abc123",
      "playerName": "Alice",
      "score": 8500,
      "rank": 1
    }
  ]
}
```

## 🔧 Commandes utiles

**Vérifier la connexion :**
```bash
psql $DATABASE_URL -c "SELECT NOW();"
```

**Voir les parties sauvegardées :**
```sql
SELECT room_code, game_data->'winner'->>'name' as winner, created_at 
FROM game_results 
ORDER BY created_at DESC 
LIMIT 10;
```

**Statistiques globales :**
```sql
SELECT 
  COUNT(*) as total_games,
  AVG((game_data->'winner'->>'score')::int) as avg_winner_score
FROM game_results;
```

## 🐛 Dépannage

**Erreur de connexion :**
- Vérifier que PostgreSQL est démarré
- Vérifier l'URL de connexion
- Vérifier les permissions utilisateur

**Le serveur démarre sans base de données :**
- C'est normal ! Le serveur continue de fonctionner
- Les parties ne seront simplement pas sauvegardées
- Vérifier les logs pour voir les erreurs de connexion

**Erreurs SSL en production :**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

## 📈 Fonctionnalités disponibles

Avec PostgreSQL configuré, vous bénéficiez de :

✅ **Sauvegarde automatique** de toutes les parties terminées
✅ **Historique persistant** des résultats
✅ **Statistiques** globales
✅ **Recherche** par code de salle
✅ **Base solide** pour futures fonctionnalités

## 🚀 Prochaines étapes possibles

- API REST pour consulter l'historique
- Dashboard d'administration
- Statistiques utilisateur avancées
- Système de classements
- Export des données
