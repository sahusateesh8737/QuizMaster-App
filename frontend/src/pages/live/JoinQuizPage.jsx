import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Hash, Users, ArrowRight, Loader2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { useLiveQuizStore } from '../../store/slices/liveQuizStore'
import { useAuthStore } from '../../store/slices/authStore'

export default function JoinQuizPage() {
  const navigate = useNavigate()
  const { verifyJoinCode, joinSession, loading, error } = useLiveQuizStore()
  const { user } = useAuthStore()

  const [joinCode, setJoinCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [quizInfo, setQuizInfo] = useState(null)
  const [step, setStep] = useState('code') // 'code' or 'nickname'

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    
    if (joinCode.length < 6) {
      return
    }

    const result = await verifyJoinCode(joinCode)
    
    if (result.valid) {
      setQuizInfo(result)
      // If user is logged in, join directly, else ask for nickname
      if (user) {
        handleJoin()
      } else {
        setStep('nickname')
      }
    }
  }

  const handleJoin = async (e) => {
    if (e) e.preventDefault()
    
    try {
      const data = await joinSession(joinCode, nickname)
      // Navigate to waiting room or quiz play page
      navigate(`/live/waiting/${data.session.id}`, {
        state: { participantId: data.participant.id }
      })
    } catch (err) {
      console.error('Join error:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {step === 'code' ? (
          <Card className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mx-auto mb-4"
              >
                <Hash size={32} className="text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Join Live Quiz
              </h1>
              <p className="text-slate-400">
                Enter the code provided by your teacher
              </p>
            </div>

            {/* Join Code Input */}
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <Input
                  label="Join Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={10}
                  className="text-center text-2xl font-bold tracking-widest"
                  autoFocus
                />
                <p className="text-sm text-slate-400 mt-2 text-center">
                  Usually 6 characters
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {quizInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-green-500/10 border border-green-500/50 rounded-lg p-4"
                >
                  <h3 className="text-green-400 font-semibold mb-2">
                    ✓ Quiz Found!
                  </h3>
                  <p className="text-white font-medium">{quizInfo.quiz_title}</p>
                  <p className="text-slate-400 text-sm">
                    Host: {quizInfo.host_name}
                  </p>
                  <p className="text-slate-400 text-sm flex items-center gap-1">
                    <Users size={14} />
                    {quizInfo.participant_count} participants
                  </p>
                </motion.div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || joinCode.length < 6}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={20} />
                  </>
                )}
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-8">
            {/* Nickname Input */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                What's your name?
              </h2>
              <p className="text-slate-400">
                This is how you'll appear to others
              </p>
            </div>

            <form onSubmit={handleJoin} className="space-y-6">
              <Input
                label="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your nickname"
                maxLength={50}
                autoFocus
              />

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep('code')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading || !nickname.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Quiz
                      <ArrowRight size={20} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Info */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Don't have a code?{' '}
          <button
            onClick={() => navigate('/quizzes')}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Browse quizzes
          </button>
        </p>
      </motion.div>
    </div>
  )
}
