import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Alert from '../../components/ui/Alert'
import { useQuizStore } from '../../store/slices/quizStore'

export default function QuizAttemptPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentAttempt, loading, submitAnswer, finishAttempt } = useQuizStore()

  const [timeLeft, setTimeLeft] = useState(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (currentAttempt?.time_limit) {
      setTimeLeft(currentAttempt.time_limit * 60)
    }
  }, [currentAttempt])

  // Timer
  useEffect(() => {
    if (timeLeft === null) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinishQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAnswerChange = (questionId, answer) => {
    // Convert to number if it's a string number
    const answerValue = typeof answer === 'string' && !isNaN(answer) ? parseInt(answer, 10) : answer
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerValue,
    }))
  }

  const handleSubmitAnswer = async () => {
    if (!currentAttempt || !currentAttempt.questions)
      return

    const question = currentAttempt.questions[currentQuestionIdx]
    const selectedAnswer = answers[question.id]
    
    if (!selectedAnswer && selectedAnswer !== 0) {
      setError('Please select an answer before proceeding')
      return
    }

    try {
      setSubmitting(true)
      // For MCQ, pass the selectedOptionId; for text answers, pass as answerText
      if (question.type === 'mcq') {
        await submitAnswer(currentAttempt.id, question.id, selectedAnswer, '')
      } else {
        await submitAnswer(currentAttempt.id, question.id, null, selectedAnswer)
      }

      if (currentQuestionIdx < currentAttempt.questions.length - 1) {
        setCurrentQuestionIdx((prev) => prev + 1)
        setError(null)
      } else {
        await handleFinishQuiz()
      }
    } catch (err) {
      setError(err.detail || err.message || 'Failed to submit answer. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinishQuiz = async () => {
    try {
      const result = await finishAttempt(currentAttempt.id)
      navigate(`/results/${result.id}`)
    } catch (err) {
      setError('Failed to finish quiz. Please try again.')
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading quiz..." />
      </div>
    )

  if (!currentAttempt || !currentAttempt.questions || currentAttempt.questions.length === 0)
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Alert type="error" title="Quiz Error" message="Failed to load quiz questions." />
      </div>
    )

  const question = currentAttempt.questions[currentQuestionIdx]
  const progress = ((currentQuestionIdx + 1) / currentAttempt.questions.length) * 100
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Quiz in Progress</h1>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft < 60
                  ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <Clock size={20} />
              <span className="font-mono font-bold">{formatTime(timeLeft || 0)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Question {currentQuestionIdx + 1} of {currentAttempt.questions.length}
          </p>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-8">
            {/* Question Text */}
            <h2 className="text-2xl font-bold text-white mb-6">{question.text}</h2>

            {/* Question Image if exists */}
            {question.image && (
              <div className="mb-6 rounded-lg overflow-hidden border border-slate-700">
                <img
                  src={question.image}
                  alt="Question"
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              {question.type === 'mcq' && question.options && (
                <>
                  {question.options.map((option) => (
                    <motion.label
                      key={option.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200"
                      style={{
                        borderColor:
                          answers[question.id] === option.id
                            ? '#a78bfa'
                            : '#334155',
                        backgroundColor:
                          answers[question.id] === option.id
                            ? '#7c3aed20'
                            : '#1e293b50',
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value)
                        }
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span className="text-white flex-1">{option.text}</span>
                    </motion.label>
                  ))}
                </>
              )}

              {question.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'true', label: 'True' },
                    { id: 'false', label: 'False' },
                  ].map((option) => (
                    <motion.label
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200"
                      style={{
                        borderColor:
                          answers[question.id] === option.id
                            ? '#a78bfa'
                            : '#334155',
                        backgroundColor:
                          answers[question.id] === option.id
                            ? '#7c3aed20'
                            : '#1e293b50',
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value)
                        }
                        className="w-4 h-4 accent-purple-600"
                      />
                      <span className="text-white font-semibold text-lg">
                        {option.label}
                      </span>
                    </motion.label>
                  ))}
                </div>
              )}

              {question.type === 'fill_blank' && (
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={answers[question.id] || ''}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              )}
            </div>
          </Card>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 justify-between"
        >
          <Button
            variant="secondary"
            onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIdx === 0 || submitting}
          >
            Previous
          </Button>

          <div className="flex gap-4">
            {currentQuestionIdx === currentAttempt.questions.length - 1 ? (
              <Button
                onClick={handleFinishQuiz}
                loading={submitting}
                className="gap-2"
              >
                <CheckCircle size={20} />
                Finish Quiz
              </Button>
            ) : (
              <Button
                onClick={handleSubmitAnswer}
                loading={submitting}
                disabled={!answers[question.id]}
              >
                Next Question
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
