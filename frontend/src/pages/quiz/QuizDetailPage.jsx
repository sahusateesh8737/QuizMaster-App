import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, BookOpen, TrendingUp, Play, Info } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Alert from '../../components/ui/Alert'
import { useQuizStore } from '../../store/slices/quizStore'

export default function QuizDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentQuiz, loading, getQuizDetail, startAttempt } = useQuizStore()
  const [error, setError] = useState(null)
  const [startingQuiz, setStartingQuiz] = useState(false)

  useEffect(() => {
    getQuizDetail(id)
  }, [id])

  const handleStartQuiz = async () => {
    setStartingQuiz(true)
    try {
      const attempt = await startAttempt(id)
      navigate(`/quizzes/${id}/attempt`, { state: { attemptId: attempt.id } })
    } catch (err) {
      setError('Failed to start quiz. Please try again.')
      setStartingQuiz(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading quiz..." />
      </div>
    )

  if (!currentQuiz)
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Alert type="error" title="Quiz Not Found" message="The quiz you're looking for doesn't exist." />
      </div>
    )

  const getDifficultyColor = (level) => {
    const colors = { easy: 'success', medium: 'warning', hard: 'danger' }
    return colors[level] || 'default'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Header with Back Button */}
      <section className="px-4 py-6 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <Link to="/quizzes" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition-colors">
            <ArrowLeft size={20} />
            Back to Quizzes
          </Link>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6">
              <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          {/* Quiz Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl font-bold text-white">{currentQuiz.title}</h1>
              {currentQuiz.difficulty && (
                <Badge variant={getDifficultyColor(currentQuiz.difficulty)}>
                  {currentQuiz.difficulty.toUpperCase()}
                </Badge>
              )}
            </div>
            <p className="text-lg text-slate-300 mb-4">{currentQuiz.description}</p>

            <div className="flex flex-wrap gap-4">
              {currentQuiz.category && (
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-purple-400" />
                  <span className="text-slate-300">{currentQuiz.category}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Clock size={18} className="text-purple-400" />
                <span className="text-slate-300">{currentQuiz.time_limit} minutes</span>
              </div>

              {currentQuiz.questions_count && (
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-purple-400" />
                  <span className="text-slate-300">{currentQuiz.questions_count} questions</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quiz Details Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {/* Info Card */}
            <Card>
              <div className="flex items-start gap-4">
                <Info className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Quiz Information</h3>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex justify-between">
                      <span>Questions:</span>
                      <span className="text-white font-semibold">{currentQuiz.questions_count || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Time Limit:</span>
                      <span className="text-white font-semibold">{currentQuiz.time_limit} mins</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Pass Score:</span>
                      <span className="text-white font-semibold">{currentQuiz.pass_percentage}%</span>
                    </li>
                    {currentQuiz.attempts_count && (
                      <li className="flex justify-between">
                        <span>Attempts:</span>
                        <span className="text-white font-semibold">{currentQuiz.attempts_count}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card>
              <div className="flex items-start gap-4">
                <TrendingUp className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Statistics</h3>
                  <ul className="space-y-2 text-slate-400">
                    {currentQuiz.avg_score && (
                      <li className="flex justify-between">
                        <span>Average Score:</span>
                        <span className="text-white font-semibold">{currentQuiz.avg_score.toFixed(1)}%</span>
                      </li>
                    )}
                    {currentQuiz.pass_rate && (
                      <li className="flex justify-between">
                        <span>Pass Rate:</span>
                        <span className="text-green-400 font-semibold">{currentQuiz.pass_rate}%</span>
                      </li>
                    )}
                    <li className="flex justify-between">
                      <span>Difficulty:</span>
                      <span className="text-white font-semibold capitalize">
                        {currentQuiz.difficulty || 'Medium'}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-lg font-bold text-white mb-4">What to Expect</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="flex items-start gap-3">
                <div className="text-2xl">⏱️</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Timed Challenge</h4>
                  <p className="text-sm text-slate-400">
                    Complete all questions within {currentQuiz.time_limit} minutes
                  </p>
                </div>
              </Card>

              <Card className="flex items-start gap-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Instant Results</h4>
                  <p className="text-sm text-slate-400">
                    Get your score and see correct answers immediately
                  </p>
                </div>
              </Card>

              <Card className="flex items-start gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Leaderboard</h4>
                  <p className="text-sm text-slate-400">
                    Compare your score with others on the global leaderboard
                  </p>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-4 justify-center md:justify-start"
          >
            <Button
              onClick={handleStartQuiz}
              loading={startingQuiz}
              size="lg"
              className="gap-2 min-w-max"
            >
              <Play size={20} />
              Start Quiz Now
            </Button>

            <Button variant="secondary" size="lg" onClick={() => navigate('/quizzes')} className="gap-2">
              <ArrowLeft size={20} />
              Choose Another
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
