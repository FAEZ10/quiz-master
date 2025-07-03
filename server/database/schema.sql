-- Script de création de la base de données QuizMaster
-- Exécuter ce script pour initialiser la base de données

-- Créer la base de données (à exécuter en tant que superuser)
-- CREATE DATABASE quizmaster;

-- Se connecter à la base quizmaster puis exécuter le reste

-- Table principale pour stocker les résultats des parties
CREATE TABLE IF NOT EXISTS game_results (
  id SERIAL PRIMARY KEY,
  room_code VARCHAR(6) NOT NULL,
  game_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_game_results_room_code ON game_results(room_code);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at DESC);

-- Index sur les données JSON pour les requêtes sur le gagnant
CREATE INDEX IF NOT EXISTS idx_game_results_winner ON game_results USING GIN ((game_data->'winner'));

-- Commentaires sur la table
COMMENT ON TABLE game_results IS 'Stockage des résultats des parties de quiz terminées';
COMMENT ON COLUMN game_results.room_code IS 'Code unique de la salle (6 caractères)';
COMMENT ON COLUMN game_results.game_data IS 'Données complètes de la partie au format JSON';
COMMENT ON COLUMN game_results.created_at IS 'Date et heure de fin de partie';

-- Exemples de requêtes utiles :

-- Voir les 10 dernières parties
-- SELECT room_code, game_data->'winner'->>'name' as winner, created_at 
-- FROM game_results 
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- Statistiques globales
-- SELECT 
--   COUNT(*) as total_games,
--   AVG((game_data->'winner'->>'score')::int) as avg_winner_score,
--   AVG((game_data->>'duration')::int) as avg_duration_minutes
-- FROM game_results;

-- Parties d'un joueur spécifique
-- SELECT room_code, created_at, game_data->'winner'->>'name' as winner
-- FROM game_results 
-- WHERE game_data->'finalScores' @> '[{"playerName": "Alice"}]'
-- ORDER BY created_at DESC;

-- Top 10 des meilleurs scores
-- SELECT 
--   room_code,
--   game_data->'winner'->>'name' as winner,
--   (game_data->'winner'->>'score')::int as score,
--   created_at
-- FROM game_results 
-- ORDER BY (game_data->'winner'->>'score')::int DESC 
-- LIMIT 10;
