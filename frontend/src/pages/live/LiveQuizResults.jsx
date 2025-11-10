import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { 
  Trophy, Users, Target, Clock, BarChart, Home, RefreshCw 
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import LiveLeaderboard from '../../components/live/LiveLeaderboard'
import { useLiveQuizStore } from '../../store/slices/liveQuizStore'
import { useAuthStore } from '../../store/slices/authStore'

export default function LiveQuizResults() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { fetchLeaderboard, leaderboard, loading } = useLiveQuizStore()
  
  const [sessionData, setSessionData] = useState(null)
  const [stats, setStats] = useState(null)
  const [confettiShown, setConfettiShown] = useState(false)

  useEffect(() => {
    fetchSessionData()
    fetchLeaderboard(parseInt(sessionId))
  }, [sessionId])

  useEffect(() => {
    // Fire confetti when leaderboard loads
    if (leaderboard.length > 0 && !confettiShown) {
      fireConfetti()
      setConfettiShown(true)
    }
  }, [leaderboard])

  const fetchSessionData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `http://localhost:8000/api/live/sessions/${sessionId}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setSessionData(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error fetching session:', error)
    }
  }

  const calculateStats = (session) => {
    const totalParticipants = session.participant_count || 0
    const totalQuestions = session.question_count || 0
    const avgScore = leaderboard.length > 0
      ? Math.round(leaderboard.reduce((sum, p) => sum + p.score, 0) / leaderboard.length)
      : 0
    const avgCorrect = leaderboard.length > 0
      ? Math.round(leaderboard.reduce((sum, p) => sum + p.correct_answers, 0) / leaderboard.length)
      : 0

    setStats({
      totalParticipants,
      totalQuestions,
      avgScore,
      avgCorrect,
    })
  }

  const fireConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  const handlePlayAgain = () => {
    if (sessionData?.quiz_id) {
      navigate(`/teacher/create-session?quiz=${sessionData.quiz_id}`)
    }
  }

  const handleBackToDashboard = () => {
    if (user?.role === 'teacher') {
      navigate('/teacher/dashboard')
    } else {
      navigate('/dashboard')
    }
  }

  if (loading || !sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading results..." />
      </div>
    )
  }

  const winner = leaderboard[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Winner Announcement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 text-center"
        >
          <div className="mb-6">
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1.1, 1.1, 1]
              }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Trophy size={48} className="text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Quiz Complete!
            </h1>
            {winner && (
              <p className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                🎉 {winner.username || winner.nickname} wins! 🎉
              </p>
            )}
          </div>

          <p className="text-slate-400 text-lg">
            {sessionData.quiz_title}
          </p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users size={24} className="text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {stats.totalParticipants}
              </p>
              <p className="text-slate-400 text-sm">Total Players</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart size={24} className="text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {stats.totalQuestions}
              </p>
              <p className="text-slate-400 text-sm">Questions</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target size={24} className="text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {stats.avgScore}
              </p>
              <p className="text-slate-400 text-sm">Avg Score</p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy size={24} className="text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">
                {stats.avgCorrect}/{stats.totalQuestions}
              </p>
              <p className="text-slate-400 text-sm">Avg Correct</p>
            </Card>
          </motion.div>
        )}

        {/* Leaderboard with Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Final Rankings
            </h2>
            <LiveLeaderboard leaderboard={leaderboard} showPodium={true} />
          </Card>
        </motion.div>

        {/* Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Session Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Session Code</span>
                <span className="text-white font-mono font-bold text-lg">
                  {sessionData.join_code}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Host</span>
                <span className="text-white font-medium">
                  {sessionData.host_name}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Time per Question</span>
                <span className="text-white font-medium flex items-center gap-2">
                  <Clock size={16} />
                  {sessionData.time_per_question} seconds
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Total Questions</span>
                <span className="text-white font-medium">
                  {sessionData.question_count}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Participants</span>
                <span className="text-white font-medium">
                  {sessionData.participant_count}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4"
        >
          <Button
            onClick={handleBackToDashboard}
            variant="secondary"
            className="gap-2"
          >
            <Home size={20} />
            Back to Dashboard
          </Button>
          
          {user?.role === 'teacher' && (
            <Button
              onClick={handlePlayAgain}
              variant="primary"
              className="gap-2"
            >
              <RefreshCw size={20} />
              Play Again
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
