import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Copy, Check, Clock, Users, Shuffle, Eye, ArrowRight, QrCode } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useLiveQuizStore } from '../../store/slices/liveQuizStore'
import { useQuizStore } from '../../store/slices/quizStore'

export default function CreateLiveSession() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const quizIdFromUrl = searchParams.get('quiz')
  
  const { createSession, currentSession, loading } = useLiveQuizStore()
  const { quizzes, getQuizzes } = useQuizStore()
  
  const [selectedQuizId, setSelectedQuizId] = useState(quizIdFromUrl || '')
  const [settings, setSettings] = useState({
    time_per_question: 30,
    allow_late_join: true,
    show_leaderboard: true,
    randomize_questions: false,
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (quizzes.length === 0) {
      getQuizzes()
    }
  }, [])

  const selectedQuiz = quizzes.find(q => q.id === parseInt(selectedQuizId))

  const handleCreate = async () => {
    if (!selectedQuizId) return

    const success = await createSession(parseInt(selectedQuizId), settings)
    if (success) {
      // Session created, show join code
    }
  }

  const handleCopyCode = () => {
    if (currentSession?.join_code) {
      navigator.clipboard.writeText(currentSession.join_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleStartSession = () => {
    if (currentSession?.id) {
      navigate(`/teacher/live/${currentSession.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Creating session..." />
      </div>
    )
  }

  // Show join code if session created
  if (currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={40} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Session Created!
                </h1>
                <p className="text-slate-400">
                  Share this code with your students to join
                </p>
              </div>

              {/* Join Code Display */}
              <div className="mb-8">
                <div className="bg-slate-800 rounded-xl p-8 mb-4">
                  <p className="text-slate-400 text-sm mb-2">Join Code</p>
                  <p className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-wider mb-4">
                    {currentSession.join_code}
                  </p>
                  <Button
                    onClick={handleCopyCode}
                    variant="secondary"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check size={20} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={20} />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    {currentSession.participant_count || 0} joined
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {currentSession.time_per_question}s per question
                  </span>
                </div>
              </div>

              {/* Session Details */}
              <div className="bg-slate-800 rounded-xl p-6 mb-8 text-left">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Session Settings
                </h3>
                <div className="space-y-2 text-slate-400">
                  <div className="flex justify-between">
                    <span>Quiz:</span>
                    <span className="text-white font-medium">
                      {currentSession.quiz_title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="text-white font-medium">
                      {currentSession.question_count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Late Join:</span>
                    <span className="text-white font-medium">
                      {currentSession.allow_late_join ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Show Leaderboard:</span>
                    <span className="text-white font-medium">
                      {currentSession.show_leaderboard ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate('/teacher/dashboard')}
                  variant="secondary"
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={handleStartSession}
                  variant="primary"
                  className="flex-1 gap-2"
                >
                  Go to Control Panel
                  <ArrowRight size={20} />
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  // Configuration Form
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Create Live Session
          </h1>
          <p className="text-slate-400">
            Configure your live quiz session settings
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8">
            {/* Quiz Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Quiz
              </label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose a quiz...</option>
                {quizzes.map(quiz => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title} ({quiz.questions_count} questions)
                  </option>
                ))}
              </select>
            </div>

            {selectedQuiz && (
              <div className="mb-8 p-4 bg-slate-800 rounded-lg">
                <h3 className="text-white font-semibold mb-2">
                  {selectedQuiz.title}
                </h3>
                <p className="text-slate-400 text-sm mb-2">
                  {selectedQuiz.description}
                </p>
                <div className="flex gap-4 text-slate-400 text-sm">
                  <span>{selectedQuiz.questions_count} questions</span>
                  <span>•</span>
                  <span>{selectedQuiz.time_limit} min</span>
                </div>
              </div>
            )}

            {/* Time Per Question */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Clock size={16} className="inline mr-2" />
                Time Per Question: {settings.time_per_question} seconds
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={settings.time_per_question}
                onChange={(e) => setSettings({
                  ...settings,
                  time_per_question: parseInt(e.target.value)
                })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>10s</span>
                <span>30s</span>
                <span>60s</span>
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-4">
              {/* Allow Late Join */}
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Allow Late Join</p>
                    <p className="text-slate-400 text-sm">
                      Students can join after quiz starts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    allow_late_join: !settings.allow_late_join
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.allow_late_join ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.allow_late_join ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Show Leaderboard */}
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye size={20} className="text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Show Leaderboard</p>
                    <p className="text-slate-400 text-sm">
                      Display rankings after each question
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    show_leaderboard: !settings.show_leaderboard
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.show_leaderboard ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.show_leaderboard ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Randomize Questions */}
              <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shuffle size={20} className="text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Randomize Questions</p>
                    <p className="text-slate-400 text-sm">
                      Shuffle question order for each student
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    randomize_questions: !settings.randomize_questions
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.randomize_questions ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.randomize_questions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Create Button */}
            <div className="mt-8 flex gap-4">
              <Button
                onClick={() => navigate('/teacher/dashboard')}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                variant="primary"
                className="flex-1"
                disabled={!selectedQuizId}
              >
                Create Session
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
