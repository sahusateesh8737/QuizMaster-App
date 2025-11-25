import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Github } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Alert from '../../components/ui/Alert'
import { useAuthStore } from '../../store/slices/authStore'

export default function SignupPage() {
  const navigate = useNavigate()
  const signup = useAuthStore((state) => state.signup)

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
    role: 'student',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!formData.username) newErrors.username = 'Username is required'
    if (!formData.first_name) newErrors.first_name = 'First name is required'
    if (!formData.last_name) newErrors.last_name = 'Last name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match'
    }
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms and conditions'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      // Send all data including password2 as backend expects it
      await signup(formData)
      setAlert({
        type: 'success',
        title: 'Account Created!',
        message: 'Please check your email to verify your account.',
      })
      setTimeout(() => navigate('/auth/login'), 2000)
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.'
      if (error.detail) {
        errorMessage = error.detail
      } else if (typeof error === 'object') {
        // Get the first error message from the object
        const firstError = Object.values(error)[0]
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
      }

      setAlert({
        type: 'error',
        title: 'Signup Failed',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-20">
      {/* Background Animation */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-3xl">Q</span>
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Join QuizMaster
          </h1>
          <p className="text-slate-400">Create your account and start learning</p>
        </div>

        {/* Alert */}
        {alert && (
          <div className="mb-6">
            <Alert
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            icon={User}
            disabled={loading}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              type="text"
              name="first_name"
              placeholder="First name"
              value={formData.first_name}
              onChange={handleChange}
              error={errors.first_name}
              disabled={loading}
            />
            <Input
              label="Last Name"
              type="text"
              name="last_name"
              placeholder="Last name"
              value={formData.last_name}
              onChange={handleChange}
              error={errors.last_name}
              disabled={loading}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            disabled={loading}
          />

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'student' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === 'student'
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <User size={24} className="mx-auto mb-2" />
                  <p className="font-semibold">Student</p>
                  <p className="text-xs mt-1">Join and take quizzes</p>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'teacher' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.role === 'teacher'
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <User size={24} className="mx-auto mb-2" />
                  <p className="font-semibold">Teacher</p>
                  <p className="text-xs mt-1">Create live quizzes</p>
                </div>
              </button>
            </div>
          </div>

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={Lock}
            disabled={loading}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="password2"
            placeholder="Confirm your password"
            value={formData.password2}
            onChange={handleChange}
            error={errors.password2}
            icon={Lock}
            disabled={loading}
          />

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500 mt-1"
            />
            <span className="text-slate-300">
              I agree to the{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Privacy Policy
              </a>
            </span>
          </label>

          {errors.terms && <p className="text-red-400 text-sm flex items-center gap-1">
            <span>⚠️</span> {errors.terms}
          </p>}

          <Button type="submit" size="lg" loading={loading} className="w-full mt-6">
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-slate-400 text-sm">Or sign up with</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        {/* Social Signup */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button variant="secondary" className="w-full justify-center">
            <Github size={18} />
            GitHub
          </Button>
          <Button variant="secondary" className="w-full justify-center">
            <Mail size={18} />
            Google
          </Button>
        </div>

        {/* Login Link */}
        <p className="text-center text-slate-400">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-purple-400 hover:text-purple-300 font-semibold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
