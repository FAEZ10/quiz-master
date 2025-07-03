import { query } from '../database/db'
import { Room, Player } from '../../shared/types'

export interface GameResult {
  id?: number
  roomCode: string
  gameData: {
    players: Player[]
    settings: any
    questions: any[]
    startedAt: Date
    finishedAt: Date
    duration: number
    winner: {
      name: string
      score: number
    }
    finalScores: Array<{
      playerId: string
      playerName: string
      score: number
      rank: number
    }>
  }
  createdAt?: Date
}

export class DatabaseService {
  
  /**
   * Sauvegarde les résultats d'une partie terminée
   */
  async saveGameResult(room: Room, finalScores: Array<{playerId: string, playerName: string, score: number}>): Promise<void> {
    try {
      // Calculer la durée de la partie
      const now = new Date()
      const duration = Math.round((now.getTime() - room.createdAt.getTime()) / 1000 / 60) // en minutes
      
      // Trier les scores pour déterminer le gagnant et les rangs
      const sortedScores = finalScores
        .sort((a, b) => b.score - a.score)
        .map((score, index) => ({
          ...score,
          rank: index + 1
        }))
      
      const winner = sortedScores[0]
      
      // Préparer les données à sauvegarder
      const gameData: GameResult['gameData'] = {
        players: room.players,
        settings: room.settings,
        questions: room.questions,
        startedAt: room.createdAt,
        finishedAt: now,
        duration,
        winner: {
          name: winner.playerName,
          score: winner.score
        },
        finalScores: sortedScores
      }
      
      // Insérer en base de données
      const result = await query(
        'INSERT INTO game_results (room_code, game_data) VALUES ($1, $2) RETURNING id',
        [room.code, JSON.stringify(gameData)]
      )
      
      console.log(`💾 Partie sauvegardée: ${room.code} (ID: ${result.rows[0].id})`)
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la partie:', error)
      // Ne pas faire planter le serveur si la sauvegarde échoue
    }
  }
  
  /**
   * Récupère l'historique des parties
   */
  async getGameHistory(limit: number = 50): Promise<GameResult[]> {
    try {
      const result = await query(
        'SELECT * FROM game_results ORDER BY created_at DESC LIMIT $1',
        [limit]
      )
      
      return result.rows.map((row: any) => ({
        id: row.id,
        roomCode: row.room_code,
        gameData: row.game_data,
        createdAt: row.created_at
      }))
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error)
      return []
    }
  }
  
  /**
   * Récupère une partie par son code
   */
  async getGameByCode(roomCode: string): Promise<GameResult | null> {
    try {
      const result = await query(
        'SELECT * FROM game_results WHERE room_code = $1 ORDER BY created_at DESC LIMIT 1',
        [roomCode]
      )
      
      if (result.rows.length === 0) {
        return null
      }
      
      const row = result.rows[0]
      return {
        id: row.id,
        roomCode: row.room_code,
        gameData: row.game_data,
        createdAt: row.created_at
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la partie:', error)
      return null
    }
  }
  
  /**
   * Récupère les statistiques globales
   */
  async getGlobalStats(): Promise<{
    totalGames: number
    totalPlayers: number
    averageScore: number
    averageDuration: number
  }> {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_games,
          AVG(jsonb_array_length(game_data->'finalScores')) as avg_players,
          AVG((game_data->'winner'->>'score')::int) as avg_winner_score,
          AVG((game_data->>'duration')::int) as avg_duration
        FROM game_results
      `)
      
      const stats = result.rows[0]
      
      return {
        totalGames: parseInt(stats.total_games) || 0,
        totalPlayers: Math.round(parseFloat(stats.avg_players)) || 0,
        averageScore: Math.round(parseFloat(stats.avg_winner_score)) || 0,
        averageDuration: Math.round(parseFloat(stats.avg_duration)) || 0
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error)
      return {
        totalGames: 0,
        totalPlayers: 0,
        averageScore: 0,
        averageDuration: 0
      }
    }
  }
}
