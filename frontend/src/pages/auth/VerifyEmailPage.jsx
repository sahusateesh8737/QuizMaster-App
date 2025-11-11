import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Mail } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import getApiUrl from '../../utils/apiConfig'
import toast from 'react-hot-toast'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null) // 'success', 'error', 'invalid'
  const [message, setMessage] = useState('')

  useEffect(() => {
    verifyEmail()
  }, [])

  const verifyEmail = async () => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('invalid')
      setMessage('Invalid verification link')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${getApiUrl()}/users/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Your email has been verified successfully!')
        toast.success('Email verified!')
      } else {
        setStatus('error')
        setMessage(data.detail || data.error || 'Verification failed. The link may have expired.')
      }
    } catch (error) {
      console.error('Error verifying email:', error)
      setStatus('error')
      setMessage('An error occurred during verification. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <LoadingSpinner text="Verifying your email..." />
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
          <div className="text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-6"
            >
              {status === 'success' ? (
                <CheckCircle size={64} className="text-green-400" />
              ) : status === 'error' ? (
                <XCircle size={64} className="text-red-400" />
              ) : (
                <Mail size={64} className="text-yellow-400" />
              )}
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-3">
              {status === 'success' ? 'Email Verified!' : 
               status === 'error' ? 'Verification Failed' : 
               'Invalid Link'}
            </h1>

            {/* Message */}
            <p className="text-slate-400 mb-8">
              {message}
            </p>

            {/* Actions */}
            <div className="space-y-3">
              {status === 'success' && (
                <Button
                  onClick={() => navigate('/auth/login')}
                  variant="primary"
                  className="w-full"
                >
                  Go to Login
                </Button>
              )}
              
              {(status === 'error' || status === 'invalid') && (
                <>
                  <Button
                    onClick={() => navigate('/auth/resend-verification')}
                    variant="primary"
                    className="w-full"
                  >
                    Request New Link
                  </Button>
                  <Button
                    onClick={() => navigate('/')}
                    variant="secondary"
                    className="w-full"
                  >
                    Go to Home
                  </Button>
                </>
              )}
            </div>

            {/* Additional Info */}
            {status === 'error' && (
              <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-400">
                  Verification links expire after 24 hours. If your link has expired, 
                  request a new verification email.
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
