import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, ArrowLeft, Mail } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import getApiUrl from '../../utils/apiConfig'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${getApiUrl()}/users/forgot-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSent(true)
        toast.success('Password reset email sent!')
      } else {
        toast.error(data.detail || data.error || 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Error sending reset email:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="inline-block mb-6"
              >
                <Mail size={64} className="text-green-400" />
              </motion.div>

              <h1 className="text-3xl font-bold text-white mb-3">
                Check Your Email
              </h1>
              
              <p className="text-slate-400 mb-8">
                We've sent a password reset link to <strong className="text-white">{email}</strong>.
                Please check your inbox and click the link to reset your password.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/auth/login')}
                  variant="primary"
                  className="w-full"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => setSent(false)}
                  variant="secondary"
                  className="w-full"
                >
                  Resend Email
                </Button>
              </div>

              <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-400">
                  Didn't receive the email? Check your spam folder or try resending. 
                  The reset link is valid for 1 hour.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/auth/login')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Login
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-purple-500/10 rounded-full mb-4">
              <KeyRound size={32} className="text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Forgot Password?
            </h1>
            <p className="text-slate-400">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/auth/login')}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
