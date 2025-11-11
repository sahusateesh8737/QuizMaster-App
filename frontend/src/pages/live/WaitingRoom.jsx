import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Clock, Loader2, Play } from 'lucide-react'
import Card from '../../components/ui/Card'
import { useLiveQuizStore } from '../../store/slices/liveQuizStore'

export default function WaitingRoom() {
  const { sessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const participantId = location.state?.participantId

  const { currentSession, participants, fetchSession, fetchParticipants, error } = useLiveQuizStore()
  const [dots, setDots] = useState('.')
  const [sessionNotFound, setSessionNotFound] = useState(false)

  // Poll for session updates
  useEffect(() => {
    const loadSession = async () => {
      try {
        await fetchSession(sessionId)
        await fetchParticipants(sessionId)
      } catch (err) {
        console.error('Failed to load session:', err)
        setSessionNotFound(true)
      }
    }

    loadSession()

    const interval = setInterval(async () => {
      if (sessionNotFound) {
        clearInterval(interval)
        return
      }

      try {
        const session = await fetchSession(sessionId)
        await fetchParticipants(sessionId)

        // If session started, navigate to play page
        if (session && session.status === 'in_progress') {
          navigate(`/live/play/${sessionId}`, {
            state: { participantId }
          })
        }
      } catch (err) {
        console.error('Error polling session:', err)
        setSessionNotFound(true)
        clearInterval(interval)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [sessionId, participantId])

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Show error if session not found
  if (sessionNotFound || error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Session Not Found</h2>
          <p className="text-slate-400 mb-6">
            This quiz session doesn't exist or has been ended. Please check your join code and try again.
          </p>
          <button
            onClick={() => navigate('/join')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
          >
            Try Another Code
          </button>
        </Card>
      </div>
    )
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 size={48} className="text-purple-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-6"
          >
            <Clock size={40} className="text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            {currentSession.quiz_title}
          </h1>
          
          <p className="text-2xl text-slate-300 mb-2">
            Waiting for teacher to start{dots}
          </p>
          
          <p className="text-slate-400">
            Hosted by {currentSession.host_name}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{participants.length}</p>
            <p className="text-slate-400 text-sm">Participants</p>
          </Card>

          <Card className="p-6 text-center">
            <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{currentSession.time_per_question}s</p>
            <p className="text-slate-400 text-sm">Per Question</p>
          </Card>

          <Card className="p-6 text-center">
            <Play className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-white">{currentSession.quiz?.questions_count || '?'}</p>
            <p className="text-slate-400 text-sm">Questions</p>
          </Card>
        </div>

        {/* Participants List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users size={24} />
            Participants ({participants.length})
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {participants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-800/50 rounded-lg p-3 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-lg">
                      {participant.display_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium truncate">
                    {participant.display_name}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {participants.length === 0 && (
            <p className="text-center text-slate-400 py-8">
              No participants yet...
            </p>
          )}
        </Card>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Card className="p-6 bg-blue-500/10 border-blue-500/50">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              Get Ready!
            </h3>
            <p className="text-slate-300">
              The quiz will start automatically when your teacher begins.
              Stay on this page and get ready to answer!
            </p>
          </Card>
        </motion.div>

        {/* Pulsing indicator */}
        <div className="flex justify-center mt-8">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 text-purple-400"
          >
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Waiting for teacher</span>
            <div className="w-2 h-2 rounded-full bg-purple-400" />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
