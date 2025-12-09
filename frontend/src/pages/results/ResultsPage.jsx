import { useEffect, useState } from 'react'
import getApiUrl from '../../utils/apiConfig'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Trophy,
  Share2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Target,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useResultsStore } from '../../store/slices/resultsStore'

export default function ResultsPage() {
  const { id } = useParams()
  const { loading } = useResultsStore()
  const [result, setResult] = useState(null)
  const [shared, setShared] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    const fetchAttemptResult = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/quizzes/attempts/${id}/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        })
        
        if (!response.ok) throw new Error('Failed to fetch result')
        
        const attemptData = await response.json()
        
        // Calculate time taken in minutes
        let timeTaken = 0
        if (attemptData.time_spent) {
          // time_spent is now in seconds (integer)
          timeTaken = Math.round(attemptData.time_spent / 60)
        }
        
        // Transform backend data to frontend format
        setResult({
          id: attemptData.id,
          quiz_title: attemptData.quiz_title,
          score: Math.round(attemptData.percentage || 0),
          total_questions: attemptData.total_questions || 0,
          correct_answers: Math.round(attemptData.score || 0),
          time_taken: timeTaken,
          pass: attemptData.is_passed,
          pass_percentage: attemptData.pass_percentage || 70,
          category: 'Quiz',
          date: new Date(attemptData.end_time || attemptData.start_time).toLocaleDateString(),
          answers: attemptData.answers?.map(ans => ({
            id: ans.id,
            question: ans.question_text,
            correct: ans.is_correct,
            selected: ans.selected_option_text,
            correctAnswer: ans.correct_option_text,
          })) || [],
        })
      } catch (error) {
        console.error('Error fetching result:', error)
        setFetchError(error.message)
      }
    }
    
    fetchAttemptResult()
  }, [id])

  const handleShare = () => {
    const text = `I scored ${result?.score}% on "${result?.quiz_title}"! Can you beat my score on QuizMaster? 🏆`
    const url = window.location.href

    if (navigator.share) {
      navigator.share({
        title: 'My Quiz Score',
        text,
        url,
      })
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-2xl mb-4">Failed to load results</div>
          <p className="text-gray-400">{fetchError}</p>
        </div>
      </div>
    )
  }

  if (loading || !result)
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading results..." />
      </div>
    )

  const percentage = result.score
  const isPass = percentage >= result.pass_percentage

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-12">
      {/* Background Animation */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </motion.div>

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Score Display */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-50" />
                <div className="relative bg-slate-900 rounded-full w-40 h-40 flex flex-col items-center justify-center border-4 border-purple-500">
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {percentage}%
                  </span>
                  <span className="text-sm text-slate-400">Score</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              {isPass ? (
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <h1 className="text-4xl font-bold text-green-400">Quiz Passed! 🎉</h1>
                </div>
              ) : (
                <h1 className="text-4xl font-bold text-red-400 mb-4">Quiz Failed</h1>
              )}

              <p className="text-xl text-slate-300">{result.quiz_title}</p>
              <Badge variant={isPass ? 'success' : 'danger'} size="lg" className="mt-4">
                {isPass ? 'PASSED' : 'FAILED'}
              </Badge>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-8">
            <Card>
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400 text-sm">Correct Answers</p>
                  <p className="text-2xl font-bold text-white">
                    {result.correct_answers}/{result.total_questions}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-slate-400 text-sm">Time Taken</p>
                  <p className="text-2xl font-bold text-white">{result.time_taken} min</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-400 text-sm">Date</p>
                  <p className="text-lg font-bold text-white">{result.date}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div>
                <p className="text-slate-400 text-sm">Pass Score</p>
                <p className="text-2xl font-bold text-white">{result.pass_percentage}%</p>
              </div>
            </Card>
          </motion.div>

          {/* Answers Review */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-4">Answer Review</h2>
            <div className="space-y-3 mb-8">
              {result.answers?.map((answer, idx) => (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  {answer.correct ? (
                    <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  )}
                  <span className={answer.correct ? 'text-white' : 'text-slate-400'}>
                    {answer.question}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex gap-4 justify-center">
            <Button onClick={handleShare} variant="secondary" className="gap-2">
              <Share2 size={18} />
              {shared ? 'Copied!' : 'Share Score'}
            </Button>

            <Link to="/quizzes">
              <Button variant="secondary" className="gap-2">
                <ArrowLeft size={18} />
                More Quizzes
              </Button>
            </Link>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            variants={itemVariants}
            className="mt-12 p-6 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30"
          >
            <h3 className="text-lg font-bold text-white mb-3">What&apos;s Next?</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Review your answers to understand better</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Try another quiz to improve your skills</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Check the leaderboard to see how you rank</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
