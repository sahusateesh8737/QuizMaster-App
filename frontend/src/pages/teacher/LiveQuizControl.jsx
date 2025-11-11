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
import { useQuizSocket } from '../../hooks/useQuizSocket'

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
  const [lastPollTime, setLastPollTime] = useState(new Date())
  const [wsConnected, setWsConnected] = useState(false)

  // WebSocket connection with fallback to polling
  const { isConnected } = useQuizSocket(sessionId, {
    onQuizCompleted: (data) => {
      console.log('LiveQuizControl: WebSocket - Quiz completed, redirecting')
      navigate(`/live/results/${sessionId}`)
    },
    onQuestionChanged: (data) => {
      console.log('LiveQuizControl: WebSocket - Question changed, refreshing data')
      fetchSessionData()
      setQuestionStats(null)
    },
    onParticipantJoined: (data) => {
      console.log('LiveQuizControl: WebSocket - Participant joined, updating list')
      fetchParticipants(parseInt(sessionId))
    },
    onConnected: () => {
      console.log('LiveQuizControl: WebSocket connected')
      setWsConnected(true)
    },
    onDisconnected: () => {
      console.log('LiveQuizControl: WebSocket disconnected, falling back to polling')
      setWsConnected(false)
    },
    onConnectionError: (error) => {
      console.log('LiveQuizControl: WebSocket error, using polling fallback')
      setWsConnected(false)
    }
  }, true)

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

    // Poll with different intervals: 5s if WebSocket connected, 2s as fallback
    const pollInterval = wsConnected ? 5000 : 2000
    
    const interval = setInterval(async () => {
      if (sessionNotFound) {
        clearInterval(interval)
        return
      }
      try {
        await fetchSessionData()
        await fetchParticipants(parseInt(sessionId))
        await fetchLeaderboard(parseInt(sessionId))
        setLastPollTime(new Date())
      } catch (err) {
        console.error('Error polling session:', err)
        setSessionNotFound(true)
        clearInterval(interval)
      }
    }, pollInterval)

    return () => clearInterval(interval)
  }, [sessionId, wsConnected])

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
        console.log('LiveQuizControl: Fetched session data, status:', data.status)
        useLiveQuizStore.setState({ currentSession: data })
        
        // Fetch current question details if in progress
        if (data.status === 'in_progress' && data.current_question) {
          setCurrentQuestion(data.current_question)
          fetchQuestionStats(data.current_question.id)
        }

        // Redirect to results if completed
        if (data.status === 'completed') {
          console.log('LiveQuizControl: Session completed, redirecting to results')
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
    try {
      const result = await nextQuestion(parseInt(sessionId))
      console.log('Next question result:', result)
      
      // Check if quiz completed (no more questions)
      if (result && result.session && result.session.status === 'completed') {
        console.log('Quiz completed, navigating to results')
        navigate(`/live/results/${sessionId}`)
        return
      }
      
      // If there are more questions, reset stats and fetch data
      if (result) {
        setQuestionStats(null)
        fetchSessionData()
      }
    } catch (error) {
      console.error('Error moving to next question:', error)
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
      <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md text-center">
          <div className="mb-4 text-red-500">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Session Not Found</h2>
          <p className="mb-6 text-slate-400">
            This live quiz session doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="px-6 py-3 font-semibold text-white transition rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Back to Dashboard
          </button>
        </Card>
      </div>
    )
  }

  if (loading || !currentSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        <LoadingSpinner text="Loading control panel..." />
      </div>
    )
  }

  const isWaiting = currentSession.status === 'waiting'
  const isInProgress = currentSession.status === 'in_progress'
  const isLastQuestion = currentSession.current_question_index >= currentSession.question_count - 1

  return (
    <div className="min-h-screen px-4 py-20 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Header with Join Code */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-1 text-3xl font-bold text-white">
                  {currentSession.quiz_title}
                </h1>
                <p className="text-slate-400">
                  Control your live quiz session
                </p>
              </div>
              
              <div className="text-center">
                <p className="mb-1 text-sm text-slate-400">Join Code</p>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {currentSession.join_code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 transition-colors rounded-lg hover:bg-slate-700"
                  >
                    {copied ? (
                      <Check size={20} className="text-green-400" />
                    ) : (
                      <Copy size={20} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1 text-slate-400">
                    <Users size={16} />
                    <span className="text-sm">Participants</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {currentSession.participant_count || 0}
                  </p>
                </div>
                
                {/* Connection Status Indicator */}
                <div className="text-center">
                  <div className="flex items-center gap-2 mb-1 text-slate-400">
                    <div className={`w-2 h-2 rounded-full ${
                      wsConnected 
                        ? 'bg-green-500 animate-pulse' 
                        : new Date() - lastPollTime < 3000 
                          ? 'bg-yellow-500 animate-pulse' 
                          : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm">Status</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {wsConnected 
                      ? 'WebSocket' 
                      : new Date() - lastPollTime < 3000 
                        ? 'Polling' 
                        : 'Checking...'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Control & Question */}
          <div className="space-y-6 lg:col-span-2">
            {/* Control Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
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
                  <div className="flex items-center gap-2 p-3 mt-4 text-sm text-yellow-400 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
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

                  <p className="mb-6 text-lg text-white">
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
                              <div className="flex justify-between mb-1 text-sm text-slate-400">
                                <span>{answerCount} answers</span>
                                <span>{percentage}%</span>
                              </div>
                              <div className="w-full h-2 overflow-hidden rounded-full bg-slate-700">
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
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <p className="text-sm text-slate-400">Total Answers</p>
                        <p className="text-2xl font-bold text-white">
                          {questionStats.total_answers}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-400">Correct</p>
                        <p className="text-2xl font-bold text-green-400">
                          {questionStats.correct_count}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-400">Avg Time</p>
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
                  <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-purple-500 rounded-full animate-pulse">
                    <Users size={40} className="text-white" />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-white">
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
                <h2 className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
                  <Users className="text-purple-400" />
                  Participants ({participants.length})
                </h2>
                
                <div className="space-y-2 overflow-y-auto max-h-96">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800"
                    >
                      <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                        {(participant.username || participant.nickname)?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">
                          {participant.username || participant.nickname}
                        </p>
                        <p className="text-sm text-slate-400">
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
                  <h2 className="mb-4 text-xl font-bold text-white">
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
