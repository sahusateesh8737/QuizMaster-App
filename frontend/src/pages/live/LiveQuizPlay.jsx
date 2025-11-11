import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Check, X, Zap, Loader2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LiveLeaderboard from '../../components/live/LiveLeaderboard'
import { useLiveQuizStore } from '../../store/slices/liveQuizStore'

export default function LiveQuizPlay() {
  const { sessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const participantId = location.state?.participantId

  const {
    currentSession,
    currentParticipant,
    leaderboard,
    fetchSession,
    fetchLeaderboard,
    submitAnswer,
  } = useLiveQuizStore()

  const [selectedOption, setSelectedOption] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [answered, setAnswered] = useState(false)
  const [answerResult, setAnswerResult] = useState(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const currentQuestion = currentSession?.current_question
  const startTime = currentSession?.current_question_start_time
  const currentQuestionIdRef = useRef(null)

  // Poll for session updates
  useEffect(() => {
    fetchSession(sessionId)
    fetchLeaderboard(sessionId)

    // Poll every 2 seconds
    const pollInterval = 2000

    const interval = setInterval(async () => {
      try {
        const session = await fetchSession(sessionId)
        await fetchLeaderboard(sessionId)

        console.log('LiveQuizPlay: Session status:', session?.status)

        // Check if session ended
        if (session && session.status === 'completed') {
          console.log('LiveQuizPlay: Session completed, navigating to results')
          clearInterval(interval)
          navigate(`/live/results/${sessionId}`, {
            state: { participantId }
          })
          return
        }

        // Check if question changed
        if (session && session.current_question?.id && 
            session.current_question.id !== currentQuestionIdRef.current) {
          console.log('LiveQuizPlay: Question changed from', currentQuestionIdRef.current, 'to', session.current_question.id)
          currentQuestionIdRef.current = session.current_question.id
          
          // New question, reset state
          setSelectedOption(null)
          setAnswered(false)
          setAnswerResult(null)
          setShowLeaderboard(false)
          setTimeLeft(session.time_per_question || 30)
        }
      } catch (error) {
        console.error('LiveQuizPlay: Error polling session:', error)
        // Don't stop polling on error, just log it
      }
    }, pollInterval)

    return () => clearInterval(interval)
  }, [sessionId, participantId, navigate, fetchSession, fetchLeaderboard])

  // Countdown timer
  useEffect(() => {
    if (!answered && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !answered) {
      // Time's up, auto submit
      handleSubmit(true)
    }
  }, [timeLeft, answered])

  // Calculate time taken
  const getTimeTaken = () => {
    if (!startTime) return 0
    const start = new Date(startTime)
    const now = new Date()
    return (now - start) / 1000 // seconds
  }

  const handleSubmit = async (timeout = false) => {
    if (answered || submitting) return

    if (!timeout && !selectedOption) return

    setSubmitting(true)
    setAnswered(true)

    try {
      const timeTaken = getTimeTaken()
      const result = await submitAnswer(
        participantId,
        currentQuestion.id,
        timeout ? null : selectedOption,
        timeTaken
      )

      setAnswerResult(result)

      // Show leaderboard after 2 seconds
      setTimeout(() => {
        setShowLeaderboard(true)
        fetchLeaderboard(sessionId)
      }, 2000)
    } catch (error) {
      console.error('Submit error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!currentSession || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Waiting for next question...</p>
        </div>
      </div>
    )
  }

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <LiveLeaderboard leaderboard={leaderboard} showPodium />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-slate-300 text-lg">
              Waiting for teacher to show next question...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">
                {currentParticipant?.display_name?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <p className="text-white font-semibold">
                {currentParticipant?.display_name}
              </p>
              <p className="text-purple-400 text-sm flex items-center gap-1">
                <Zap size={14} />
                {currentParticipant?.score || 0} points
              </p>
            </div>
          </div>

          {/* Timer */}
          <motion.div
            animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              timeLeft <= 5
                ? 'bg-red-500/20 border-2 border-red-500'
                : 'bg-blue-500/20 border-2 border-blue-500'
            }`}
          >
            <Clock size={20} className={timeLeft <= 5 ? 'text-red-400' : 'text-blue-400'} />
            <span className={`text-2xl font-bold ${
              timeLeft <= 5 ? 'text-red-400' : 'text-blue-400'
            }`}>
              {timeLeft}s
            </span>
          </motion.div>
        </div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 mb-6">
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm font-medium mb-4">
                Question {(currentSession.current_question_index || 0) + 1}
              </span>
              <h1 className="text-3xl font-bold text-white">
                {currentQuestion.text}
              </h1>
            </div>

            {/* Answer Result */}
            <AnimatePresence>
              {answerResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`mb-6 p-6 rounded-xl text-center ${
                    answerResult.is_correct
                      ? 'bg-green-500/20 border-2 border-green-500'
                      : 'bg-red-500/20 border-2 border-red-500'
                  }`}
                >
                  {answerResult.is_correct ? (
                    <>
                      <Check size={48} className="text-green-400 mx-auto mb-2" />
                      <h2 className="text-2xl font-bold text-green-400 mb-2">
                        Correct! 🎉
                      </h2>
                      <p className="text-white text-lg font-semibold">
                        +{answerResult.points_awarded} points
                      </p>
                      <p className="text-green-300 text-sm">
                        Total: {answerResult.total_score} points
                      </p>
                    </>
                  ) : (
                    <>
                      <X size={48} className="text-red-400 mx-auto mb-2" />
                      <h2 className="text-2xl font-bold text-red-400 mb-2">
                        Incorrect
                      </h2>
                      <p className="text-red-300">
                        Better luck next time!
                      </p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options?.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !answered && setSelectedOption(option.id)}
                  disabled={answered}
                  className={`p-6 rounded-xl text-left transition-all ${
                    selectedOption === option.id
                      ? 'bg-purple-600 border-2 border-purple-400 scale-105'
                      : answered
                      ? 'bg-slate-800/50 opacity-50'
                      : 'bg-slate-800/80 hover:bg-slate-700 border-2 border-transparent hover:border-purple-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      selectedOption === option.id
                        ? 'bg-white text-purple-600'
                        : 'bg-slate-700 text-white'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-white text-lg font-medium">
                      {option.text}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Submit Button */}
            {!answered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={!selectedOption || submitting}
                  variant="primary"
                  className="w-full text-lg py-4"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </Button>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
