import { useEffect, useState } from 'react'
import getApiUrl from '../../utils/apiConfig'

import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Copy, Check, Users, Play, SkipForward, StopCircle, 
  Clock, BarChart, AlertCircle 
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import LiveLeaderboard from '../../components/live/LiveLeaderboard'
import { useLiveQuizStore } from '../../store/slices/liveQuizStore'

export default function LiveQuizControl() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  const {
    currentSession,
    participants,
    leaderboard,
    startSession,
    nextQuestion,
    endSession,
    fetchParticipants,
    fetchLeaderboard,
    loading
  } = useLiveQuizStore()

  const [copied, setCopied] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionStats, setQuestionStats] = useState(null)
  const [sessionNotFound, setSessionNotFound] = useState(false)

  // Poll session data
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSessionData()
        await fetchParticipants(parseInt(sessionId))
        await fetchLeaderboard(parseInt(sessionId))
      } catch (err) {
        console.error('Failed to load session:', err)
        setSessionNotFound(true)
      }
    }

    loadData()

    const interval = setInterval(async () => {
      if (sessionNotFound) {
        clearInterval(interval)
        return
      }
      try {
        await fetchSessionData()
        await fetchParticipants(parseInt(sessionId))
        await fetchLeaderboard(parseInt(sessionId))
      } catch (err) {
        console.error('Error polling session:', err)
        setSessionNotFound(true)
        clearInterval(interval)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [sessionId])

  const fetchSessionData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${getApiUrl()}/live/sessions/${sessionId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        useLiveQuizStore.setState({ currentSession: data })
        
        // Fetch current question details if in progress
        if (data.status === 'in_progress' && data.current_question) {
          setCurrentQuestion(data.current_question)
          fetchQuestionStats(data.current_question.id)
        }

        // Redirect to results if completed
        if (data.status === 'completed') {
          navigate(`/live/results/${sessionId}`)
        }
      } else if (response.status === 404) {
        setSessionNotFound(true)
        throw new Error('Session not found')
      }
    } catch (error) {
      console.error('Error fetching session:', error)
      setSessionNotFound(true)
      throw error
    }
  }

  const fetchQuestionStats = async (questionId) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${getApiUrl()}/live/sessions/${sessionId}/question_stats/?question_id=${questionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setQuestionStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleCopyCode = () => {
    if (currentSession?.join_code) {
      navigator.clipboard.writeText(currentSession.join_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStart = async () => {
    const success = await startSession(parseInt(sessionId))
    if (success) {
      fetchSessionData()
    }
  }

  const handleNext = async () => {
    const success = await nextQuestion(parseInt(sessionId))
    if (success) {
      setQuestionStats(null)
      fetchSessionData()
    }
  }

  const handleEnd = async () => {
    if (confirm('Are you sure you want to end this session?')) {
      const success = await endSession(parseInt(sessionId))
      if (success) {
        navigate(`/live/results/${sessionId}`)
      }
    }
  }

  // Show error if session not found
  if (sessionNotFound) {
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
            This live quiz session doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </Card>
      </div>
    )
  }

  if (loading || !currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading control panel..." />
      </div>
    )
  }

  const isWaiting = currentSession.status === 'waiting'
  const isInProgress = currentSession.status === 'in_progress'
  const isLastQuestion = currentSession.current_question_index >= currentSession.question_count - 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header with Join Code */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {currentSession.quiz_title}
                </h1>
                <p className="text-slate-400">
                  Control your live quiz session
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-1">Join Code</p>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-wider">
                    {currentSession.join_code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check size={20} className="text-green-400" />
                    ) : (
                      <Copy size={20} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Users size={16} />
                    <span className="text-sm">Participants</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {currentSession.participant_count || 0}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Control & Question */}
          <div className="lg:col-span-2 space-y-6">
            {/* Control Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart className="text-purple-400" />
                  Quiz Control
                </h2>
                
                <div className="flex gap-4">
                  {isWaiting && (
                    <Button
                      onClick={handleStart}
                      variant="primary"
                      className="flex-1 gap-2 py-4 text-lg"
                      disabled={currentSession.participant_count === 0}
                    >
                      <Play size={24} />
                      Start Quiz
                    </Button>
                  )}
                  
                  {isInProgress && (
                    <Button
                      onClick={handleNext}
                      variant="primary"
                      className="flex-1 gap-2 py-4 text-lg"
                    >
                      <SkipForward size={24} />
                      {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleEnd}
                    variant="danger"
                    className="flex-1 gap-2 py-4 text-lg"
                  >
                    <StopCircle size={24} />
                    End Session
                  </Button>
                </div>

                {isWaiting && currentSession.participant_count === 0 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-yellow-400 text-sm">
                    <AlertCircle size={16} />
                    Waiting for participants to join...
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Current Question */}
            {isInProgress && currentQuestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={currentQuestion.id}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Question {currentSession.current_question_index + 1} of {currentSession.question_count}
                    </h2>
                    <span className="flex items-center gap-2 text-slate-400">
                      <Clock size={16} />
                      {currentSession.time_per_question}s
                    </span>
                  </div>

                  <p className="text-white text-lg mb-6">
                    {currentQuestion.question_text}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {currentQuestion.options?.map((option, index) => {
                      const optionLabel = String.fromCharCode(65 + index)
                      const isCorrect = option.is_correct
                      const answerCount = questionStats?.answer_distribution?.[option.id] || 0
                      const totalAnswers = questionStats?.total_answers || 1
                      const percentage = Math.round((answerCount / totalAnswers) * 100)

                      return (
                        <div
                          key={option.id}
                          className={`p-4 rounded-lg border-2 ${
                            isCorrect
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-slate-700 bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white">
                              {optionLabel}. {option.option_text}
                            </span>
                            {isCorrect && (
                              <Check size={20} className="text-green-400" />
                            )}
                          </div>
                          
                          {questionStats && (
                            <div>
                              <div className="flex justify-between text-sm text-slate-400 mb-1">
                                <span>{answerCount} answers</span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  className={`h-full ${
                                    isCorrect ? 'bg-green-500' : 'bg-purple-500'
                                  }`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {questionStats && (
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">Total Answers</p>
                        <p className="text-2xl font-bold text-white">
                          {questionStats.total_answers}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">Correct</p>
                        <p className="text-2xl font-bold text-green-400">
                          {questionStats.correct_count}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-sm">Avg Time</p>
                        <p className="text-2xl font-bold text-purple-400">
                          {questionStats.average_time?.toFixed(1)}s
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Waiting State */}
            {isWaiting && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-12 text-center">
                  <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Users size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Waiting for Quiz to Start
                  </h2>
                  <p className="text-slate-400">
                    {currentSession.participant_count} participants ready
                  </p>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Participants & Leaderboard */}
          <div className="space-y-6">
            {/* Participants List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="text-purple-400" />
                  Participants ({participants.length})
                </h2>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {(participant.username || participant.nickname)?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {participant.username || participant.nickname}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Score: {participant.score}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Live Leaderboard */}
            {isInProgress && leaderboard.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Live Leaderboard
                  </h2>
                  <LiveLeaderboard leaderboard={leaderboard} showPodium={false} />
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
