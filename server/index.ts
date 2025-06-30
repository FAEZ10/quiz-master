import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { GameManager } from './services/GameManager'
import { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  InterServerEvents, 
  SocketData 
} from '../shared/types'

const app = express()
const httpServer = createServer(app)

// Configuration CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}))

app.use(express.json())

// Routes de base
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 'any', name: 'Toutes catégories' },
    { id: '9', name: 'Culture générale' },
    { id: '17', name: 'Science & Nature' },
    { id: '21', name: 'Sports' },
    { id: '22', name: 'Géographie' },
    { id: '23', name: 'Histoire' },
    { id: '24', name: 'Politique' },
    { id: '25', name: 'Art' },
    { id: '26', name: 'Célébrités' },
    { id: '27', name: 'Animaux' },
  ]
  res.json(categories)
})

// Configuration Socket.IO
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Gestionnaire de jeu
const gameManager = new GameManager(io)

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log(`Client connecté: ${socket.id}`)

  // Création d'une salle
  socket.on('room:create', async (playerName, settings) => {
    try {
      console.log(`${socket.id} crée une salle: ${playerName}`)
      await gameManager.createRoom(socket, playerName, settings)
    } catch (error) {
      console.error('Erreur création salle:', error)
      socket.emit('room:error', 'Erreur lors de la création de la salle')
    }
  })

  // Rejoindre une salle
  socket.on('room:join', async (code, playerName) => {
    try {
      console.log(`${socket.id} rejoint la salle ${code}: ${playerName}`)
      await gameManager.joinRoom(socket, code, playerName)
    } catch (error) {
      console.error('Erreur rejoindre salle:', error)
      socket.emit('room:error', 'Impossible de rejoindre la salle')
    }
  })

  // Quitter une salle
  socket.on('room:leave', () => {
    try {
      console.log(`${socket.id} quitte sa salle`)
      gameManager.leaveRoom(socket)
    } catch (error) {
      console.error('Erreur quitter salle:', error)
    }
  })

  // Démarrer le jeu
  socket.on('game:start', async () => {
    try {
      console.log(`${socket.id} démarre le jeu`)
      await gameManager.startGame(socket)
    } catch (error) {
      console.error('Erreur démarrage jeu:', error)
      socket.emit('room:error', 'Erreur lors du démarrage du jeu')
    }
  })

  // Répondre à une question
  socket.on('game:answer', (answer) => {
    try {
      console.log(`${socket.id} répond: ${answer}`)
      gameManager.submitAnswer(socket, answer)
    } catch (error) {
      console.error('Erreur réponse:', error)
    }
  })

  // Marquer comme prêt
  socket.on('player:ready', () => {
    try {
      console.log(`${socket.id} est prêt`)
      gameManager.setPlayerReady(socket)
    } catch (error) {
      console.error('Erreur player ready:', error)
    }
  })

  // Déconnexion
  socket.on('disconnect', (reason) => {
    console.log(`Client déconnecté: ${socket.id}, raison: ${reason}`)
    try {
      gameManager.handleDisconnection(socket)
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  })

  // Gestion des erreurs
  socket.on('error', (error) => {
    console.error(`Erreur socket ${socket.id}:`, error)
  })
})

// Gestion des erreurs du serveur
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Démarrage du serveur
const PORT = process.env.PORT || 8003

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`)
  console.log(`📡 Socket.IO prêt pour les connexions`)
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt du serveur...')
  httpServer.close(() => {
    console.log('Serveur arrêté')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT reçu, arrêt du serveur...')
  httpServer.close(() => {
    console.log('Serveur arrêté')
    process.exit(0)
  })
})
