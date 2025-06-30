'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSocket } from '@/store/useSocket'
import { 
  Trophy, 
  Medal, 
  Star, 
  Users, 
  Target, 
  Clock, 
  Zap,
  Crown,
  Award,
  TrendingUp,
  RotateCcw,
  Home,
  Share2,
  Download,
  Eye
} from 'lucide-react'
import { PlayerAvatar } from '@/components/ui/player-avatar'
import { CorrectionSheet } from './CorrectionSheet'
import confetti from 'canvas-confetti'
import type { PlayerAnswer } from '@/shared/types'

export function ResultsScreen() {
  const { currentRoom, gameState, currentPlayer, playerAnswers, leaveRoom } = useSocket()
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCorrection, setShowCorrection] = useState(false)

  // Déclencher les confettis pour le top 3
  useEffect(() => {
    if (currentRoom && gameState && !showConfetti) {
      const sortedPlayers = [...currentRoom.players].sort(
        (a, b) => (gameState.scores[b.id] || 0) - (gameState.scores[a.id] || 0)
      )
      
      const currentPlayerPosition = sortedPlayers.findIndex(p => p.id === currentPlayer?.id)
      
      if (currentPlayerPosition < 3) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        }, 1000)
        setShowConfetti(true)
      }
    }
  }, [currentRoom, gameState, currentPlayer, showConfetti])

  const handleLeaveRoom = () => {
    leaveRoom()
  }

  const handleShare = async () => {
    if (navigator.share && currentRoom) {
      try {
        await navigator.share({
          title: 'QuizMaster - Résultats',
          text: `Je viens de terminer un quiz sur QuizMaster ! Salle: ${currentRoom.code}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Partage annulé')
      }
    } else {
      // Fallback: copier dans le presse-papiers
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (!currentRoom || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const sortedPlayers = [...currentRoom.players].sort(
    (a, b) => (gameState.scores[b.id] || 0) - (gameState.scores[a.id] || 0)
  )

  const winner = sortedPlayers[0]
  const currentPlayerPosition = sortedPlayers.findIndex(p => p.id === currentPlayer?.id) + 1
  const currentPlayerScore = gameState.scores[currentPlayer?.id || ''] || 0
  const maxScore = gameState.scores[winner.id] || 0
  const totalQuestions = currentRoom.settings.questionCount
  const averageScore = Object.values(gameState.scores).reduce((a, b) => a + b, 0) / sortedPlayers.length

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 0: return 'h-32' // 1er
      case 1: return 'h-24' // 2ème
      case 2: return 'h-20' // 3ème
      default: return 'h-16'
    }
  }

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 0: return 'bg-gradient-to-t from-yellow-400 to-yellow-300' // Or
      case 1: return 'bg-gradient-to-t from-gray-400 to-gray-300' // Argent
      case 2: return 'bg-gradient-to-t from-orange-400 to-orange-300' // Bronze
      default: return 'bg-gradient-to-t from-blue-400 to-blue-300'
    }
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0: return <Crown className="h-8 w-8 text-yellow-600" />
      case 1: return <Medal className="h-7 w-7 text-gray-600" />
      case 2: return <Award className="h-6 w-6 text-orange-600" />
      default: return <Star className="h-5 w-5 text-blue-600" />
    }
  }

  // Utiliser les vraies données de correction du store
  const getCorrectionData = (): { questions: any[], playerAnswers: PlayerAnswer[] } => {
    if (!currentRoom || !currentPlayer) return { questions: [], playerAnswers: [] }
    
    const questions = currentRoom.questions
    const correctionAnswers: PlayerAnswer[] = questions.map((question) => {
      const storedAnswer = playerAnswers[question.id]
      
      return {
        questionId: question.id,
        answer: storedAnswer?.answer || 'Pas de réponse',
        isCorrect: storedAnswer?.isCorrect || false,
        timeSpent: storedAnswer?.timeSpent || question.timeLimit
      }
    })
    
    return { questions, playerAnswers: correctionAnswers }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Quiz Terminé !
          </h1>
          <p className="text-xl text-gray-600">
            Voici les résultats finaux
          </p>
        </motion.div>

        {/* Podium */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white">
              <CardTitle className="text-center text-2xl flex items-center justify-center">
                <Trophy className="h-8 w-8 mr-3" />
                Podium des Champions
                <Trophy className="h-8 w-8 ml-3" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-end justify-center space-x-8 mb-8">
                {sortedPlayers.slice(0, 3).map((player, index) => {
                  const actualPosition = index === 0 ? 0 : index === 1 ? 1 : 2
                  const displayOrder = index === 1 ? 0 : index === 0 ? 1 : 2 // 2ème, 1er, 3ème
                  
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + displayOrder * 0.2 }}
                      className="flex flex-col items-center space-y-4"
                    >
                      <motion.div
                        animate={{ 
                          scale: actualPosition === 0 ? [1, 1.1, 1] : 1,
                          rotate: actualPosition === 0 ? [0, 5, -5, 0] : 0
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: actualPosition === 0 ? Infinity : 0 
                        }}
                        className="relative"
                      >
                        <PlayerAvatar 
                          name={player.name} 
                          size={actualPosition === 0 ? "xl" : "lg"}
                          isHost={player.isHost}
                        />
                        <div className="absolute -top-2 -right-2">
                          {getMedalIcon(actualPosition)}
                        </div>
                      </motion.div>
                      
                      <div className="text-center">
                        <h3 className="font-bold text-lg text-gray-900">
                          {player.name}
                        </h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {gameState.scores[player.id] || 0} pts
                        </p>
                        <p className="text-sm text-gray-600">
                          {actualPosition + 1}{actualPosition === 0 ? 'er' : 'ème'} place
                        </p>
                      </div>
                      
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        transition={{ delay: 0.8 + displayOrder * 0.2 }}
                        className={`w-24 ${getPodiumHeight(actualPosition)} ${getPodiumColor(actualPosition)} rounded-t-lg flex items-end justify-center pb-2`}
                      >
                        <span className="text-white font-bold text-lg">
                          {actualPosition + 1}
                        </span>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistiques personnelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Target className="h-6 w-6 mr-2 text-blue-600" />
                Vos Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
                >
                  <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {currentPlayerPosition}
                  </div>
                  <div className="text-sm text-gray-600">Position</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"
                >
                  <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {currentPlayerScore}
                  </div>
                  <div className="text-sm text-gray-600">Points</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
                >
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {(() => {
                      const correctAnswers = Object.values(playerAnswers).filter(answer => answer.isCorrect).length
                      return Math.round((correctAnswers / totalQuestions) * 100)
                    })()}%
                  </div>
                  <div className="text-sm text-gray-600">Précision</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl"
                >
                  <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">
                    {currentPlayerScore > averageScore ? '+' : ''}
                    {Math.round(currentPlayerScore - averageScore)}
                  </div>
                  <div className="text-sm text-gray-600">vs Moyenne</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Classement complet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Users className="h-6 w-6 mr-2 text-purple-600" />
                Classement Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                      player.id === currentPlayer?.id 
                        ? 'bg-blue-100 border-2 border-blue-300 shadow-lg' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 font-bold text-gray-700">
                        {index + 1}
                      </div>
                      <PlayerAvatar 
                        name={player.name} 
                        size="md"
                        isHost={player.isHost}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {player.name}
                          {player.id === currentPlayer?.id && (
                            <span className="ml-2 text-sm text-blue-600">(Vous)</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {/* Pour l'instant, on ne peut calculer la précision que pour le joueur actuel */}
                          {player.id === currentPlayer?.id 
                            ? `${(() => {
                                const correctAnswers = Object.values(playerAnswers).filter(answer => answer.isCorrect).length
                                return Math.round((correctAnswers / totalQuestions) * 100)
                              })()}% de précision`
                            : `${Math.round((gameState.scores[player.id] / (totalQuestions * 1500)) * 100)}% estimé`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {gameState.scores[player.id] || 0}
                      </div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowCorrection(true)}
              variant="outline"
              className="flex items-center space-x-2 h-12 px-6 border-green-300 text-green-700 hover:bg-green-50"
            >
              <Eye className="h-5 w-5" />
              <span>Voir la correction</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center space-x-2 h-12 px-6"
            >
              <Share2 className="h-5 w-5" />
              <span>Partager</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center space-x-2 h-12 px-6"
            >
              <RotateCcw className="h-5 w-5" />
              <span>Rejouer</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleLeaveRoom}
              className="flex items-center space-x-2 h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Home className="h-5 w-5" />
              <span>Retour à l'accueil</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Composant de correction */}
      {showCorrection && currentPlayer && (() => {
        const { questions, playerAnswers: correctionAnswers } = getCorrectionData()
        return (
          <CorrectionSheet
            open={showCorrection}
            onOpenChange={setShowCorrection}
            questions={questions}
            playerAnswers={correctionAnswers}
            playerName={currentPlayer.name}
            totalScore={currentPlayerScore}
          />
        )
      })()}
    </div>
  )
}
