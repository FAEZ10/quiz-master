import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10, // Maximum de connexions dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export const initDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect()
    console.log('✅ Connexion PostgreSQL établie')
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_results (
        id SERIAL PRIMARY KEY,
        room_code VARCHAR(6) NOT NULL,
        game_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)
    
    console.log('✅ Table game_results vérifiée/créée')
    client.release()
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL:', error)
    // Ne pas arrêter le serveur si la DB n'est pas disponible
    console.log('⚠️  Le serveur continuera sans base de données')
  }
}

export const query = async (text: string, params?: any[]): Promise<any> => {
  try {
    const start = Date.now()
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('📊 Requête exécutée', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('❌ Erreur de requête:', error)
    throw error
  }
}

export const getClient = async () => {
  return await pool.connect()
}

export const closePool = async (): Promise<void> => {
  await pool.end()
  console.log('🔒 Pool PostgreSQL fermé')
}

export default pool
