import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Play, Users, Clock, BarChart } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthStore } from '../../store/slices/authStore'
import { useQuizStore } from '../../store/slices/quizStore'
import getApiUrl from '../../utils/apiConfig'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { quizzes, loading, getQuizzes } = useQuizStore()
  const [activeSessions, setActiveSessions] = useState([])

  useEffect(() => {
    let mounted = true

    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${getApiUrl()}/live/sessions/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.ok && mounted) {
          const data = await response.json()
          setActiveSessions(data.results || data)
        }
      } catch (error) {
        console.error('Error fetching sessions:', error)
      }
    }

    getQuizzes()
    fetchSessions()

    return () => { mounted = false }
  }, [getQuizzes])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Teacher Dashboard
          </h1>
          <p className="text-slate-400">
            Welcome back, {user?.first_name}! Create and manage live quiz sessions.
          </p>
        </motion.div>

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Play className="text-green-400" />
              Active Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 border-2 border-green-500/30">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {session.quiz_title}
                        </h3>
                        <p className="text-green-400 font-mono text-2xl font-bold">
                          {session.join_code}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        session.status === 'waiting'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {session.status === 'waiting' ? 'Waiting' : 'Live'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-slate-400 text-sm mb-4">
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        {session.participant_count} joined
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {session.time_per_question}s/Q
                      </span>
                    </div>

                    <Button
                      onClick={() => navigate(`/teacher/live/${session.id}`)}
                      variant="primary"
                      className="w-full"
                    >
                      Control Session
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Your Quizzes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart className="text-purple-400" />
              Your Quizzes
            </h2>
            <Button
              onClick={() => navigate('/quizzes/create')}
              variant="primary"
              className="gap-2"
            >
              <Plus size={20} />
              Create Quiz
            </Button>
          </div>

          {quizzes.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-slate-400 mb-4">
                You haven&apos;t created any quizzes yet.
              </p>
              <Button
                onClick={() => navigate('/quizzes/create')}
                variant="secondary"
              >
                Create Your First Quiz
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {quiz.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {quiz.description}
                    </p>

                    <div className="flex items-center gap-4 text-slate-400 text-sm mb-4">
                      <span>{quiz.questions_count} questions</span>
                      <span>•</span>
                      <span>{quiz.time_limit} min</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/teacher/create-session?quiz=${quiz.id}`)}
                        variant="primary"
                        className="flex-1 gap-2"
                      >
                        <Play size={16} />
                        Go Live
                      </Button>
                      <Button
                        onClick={() => navigate(`/quizzes/${quiz.id}`)}
                        variant="secondary"
                        className="px-3"
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
