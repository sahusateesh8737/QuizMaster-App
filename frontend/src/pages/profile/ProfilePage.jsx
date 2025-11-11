import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Award,
  TrendingUp,
  LogOut,
  Edit2,
  Calendar,
  Target,
  Zap,
  Upload,
  Save,
  X,
  Trophy,
  History,
  BarChart3,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthStore } from '../../store/slices/authStore'
import { useResultsStore } from '../../store/slices/resultsStore'
import getApiUrl from '../../utils/apiConfig'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const { statistics, badges, loading, getUserStatistics, getUserBadges } = useResultsStore()
  const [editMode, setEditMode] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    avatar: null,
  })
  const [quizHistory, setQuizHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // overview, history, achievements

  useEffect(() => {
    if (user?.id) {
      getUserStatistics(user.id)
      getUserBadges(user.id)
      fetchQuizHistory()
      
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        avatar: null,
      })
    }
  }, [user])

  const fetchQuizHistory = async () => {
    setHistoryLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:8000/api/results/user-attempts/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuizHistory(data.results || data || [])
      }
    } catch (error) {
      console.error('Error fetching quiz history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/auth/login'
  }

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const formData = new FormData()
      
      formData.append('first_name', profileData.first_name)
      formData.append('last_name', profileData.last_name)
      formData.append('bio', profileData.bio)
      
      if (profileData.avatar) {
        formData.append('avatar', profileData.avatar)
      }

      const response = await fetch(`${getApiUrl()}/users/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        toast.success('Profile updated successfully!')
        setEditMode(false)
        // Refresh user data
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.detail || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }
      setProfileData({ ...profileData, avatar: file })
    }
  }

  const calculateLevel = (points) => {
    return Math.floor(points / 100) + 1
  }

  const calculateLevelProgress = (points) => {
    return (points % 100)
  }

  if (!user)
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading profile..." />
      </div>
    )

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Profile Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <Card>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-purple-600"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-4xl font-bold text-white flex-shrink-0">
                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                      </div>
                    )}
                    {editMode && (
                      <label className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-2 cursor-pointer hover:bg-purple-700 transition-colors">
                        <Upload size={16} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center sm:text-left">
                    {editMode ? (
                      <div className="space-y-3 mb-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={profileData.first_name}
                            onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                            placeholder="First Name"
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <input
                            type="text"
                            value={profileData.last_name}
                            onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                            placeholder="Last Name"
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                          placeholder="Write a short bio..."
                          rows={2}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-white mb-2">
                          {user.first_name} {user.last_name}
                        </h1>
                        {user.bio && (
                          <p className="text-slate-400 text-sm mb-3">{user.bio}</p>
                        )}
                      </>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-4 text-slate-400 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{user.email}</span>
                      </div>
                      {user.date_joined && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>Joined {new Date(user.date_joined).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Level & Points */}
                    <div className="flex items-center gap-4">
                      <Badge variant="primary">
                        {user.role === 'teacher' ? '👨‍🏫 Teacher' : 
                         user.role === 'admin' ? '⚙️ Admin' : '👤 Student'}
                      </Badge>
                      <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg">
                        <Trophy size={16} className="text-yellow-400" />
                        <span className="text-white font-semibold">
                          Level {calculateLevel(statistics?.total_points || 0)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-lg">
                        <Zap size={16} className="text-green-400" />
                        <span className="text-white font-semibold">
                          {statistics?.total_points || 0} pts
                        </span>
                      </div>
                    </div>

                    {/* Level Progress */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Level {calculateLevel(statistics?.total_points || 0)}</span>
                        <span>{calculateLevelProgress(statistics?.total_points || 0)}/100 XP</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateLevelProgress(statistics?.total_points || 0)}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    {editMode ? (
                      <>
                        <Button
                          variant="primary"
                          className="flex-1 sm:flex-none gap-2"
                          onClick={handleProfileUpdate}
                        >
                          <Save size={18} />
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1 sm:flex-none gap-2"
                          onClick={() => setEditMode(false)}
                        >
                          <X size={18} />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          className="flex-1 sm:flex-none gap-2"
                          onClick={() => setEditMode(true)}
                        >
                          <Edit2 size={18} />
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          className="flex-1 sm:flex-none gap-2"
                          onClick={handleLogout}
                        >
                          <LogOut size={18} />
                          Logout
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex gap-2 border-b border-slate-700">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 size={18} className="inline mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-3 font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <History size={18} className="inline mr-2" />
                  History
                </button>
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`px-4 py-3 font-medium transition-colors ${
                    activeTab === 'achievements'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award size={18} className="inline mr-2" />
                  Achievements
                </button>
              </div>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Statistics Grid */}
                  <motion.div variants={itemVariants} className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Statistics</h2>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Total Quizzes */}
                        <Card>
                          <div className="text-center">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                            <p className="text-slate-400 text-sm mb-1">Quizzes Taken</p>
                            <p className="text-3xl font-bold text-white">
                              {statistics?.quizzes_attempted || 0}
                            </p>
                          </div>
                        </Card>

                        {/* Average Score */}
                        <Card>
                          <div className="text-center">
                            <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                            <p className="text-slate-400 text-sm mb-1">Avg Score</p>
                            <p className="text-3xl font-bold text-white">
                              {statistics?.average_score?.toFixed(1) || 0}%
                            </p>
                          </div>
                        </Card>

                        {/* Badges */}
                        <Card>
                          <div className="text-center">
                            <Award className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                            <p className="text-slate-400 text-sm mb-1">Badges Earned</p>
                            <p className="text-3xl font-bold text-white">{badges?.length || 0}</p>
                          </div>
                        </Card>

                        {/* Points */}
                        <Card>
                          <div className="text-center">
                            <Zap className="w-8 h-8 mx-auto mb-2 text-green-400" />
                            <p className="text-slate-400 text-sm mb-1">Total Points</p>
                            <p className="text-3xl font-bold text-white">
                              {statistics?.total_points || 0}
                            </p>
                          </div>
                        </Card>
                      </div>
                    )}
                  </motion.div>

                  {/* Additional Stats - Kept from original */}
                  <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-bold text-white mb-4">Performance Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <h3 className="font-semibold text-white mb-4">Category Performance</h3>
                        <div className="space-y-3">
                          {statistics?.category_performance && Object.keys(statistics.category_performance).length > 0 ? (
                            Object.entries(statistics.category_performance).map(([category, score], idx) => (
                              <div key={category}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-400">{category}</span>
                                  <span className="text-white font-semibold">{score}%</span>
                                </div>
                                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-sm text-center py-4">
                              No category data available yet. Complete some quizzes to see your performance!
                            </p>
                          )}
                        </div>
                      </Card>

                      <Card>
                        <h3 className="font-semibold text-white mb-4">Quiz Insights</h3>
                        <ul className="space-y-3 text-sm">
                          <li className="flex justify-between">
                            <span className="text-slate-400">Best Score</span>
                            <span className="text-green-400 font-semibold">
                              {statistics?.best_score || 0}%
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-400">Lowest Score</span>
                            <span className="text-red-400 font-semibold">
                              {statistics?.lowest_score || 0}%
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-400">Pass Rate</span>
                            <span className="text-blue-400 font-semibold">
                              {statistics?.pass_rate || 0}%
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span className="text-slate-400">Current Streak</span>
                            <span className="text-yellow-400 font-semibold">
                              {statistics?.current_streak || 0} days
                            </span>
                          </li>
                        </ul>
                      </Card>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4">Quiz History</h2>
                  {historyLoading ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : quizHistory.length === 0 ? (
                    <Card className="p-12 text-center">
                      <History size={48} className="mx-auto mb-4 text-slate-600" />
                      <h3 className="text-xl font-semibold text-slate-300 mb-2">
                        No quiz history yet
                      </h3>
                      <p className="text-slate-400">
                        Start taking quizzes to see your history here
                      </p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {quizHistory.map((attempt, idx) => (
                        <motion.div
                          key={attempt.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-white mb-1">
                                  {attempt.quiz?.title || 'Unknown Quiz'}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  <span>
                                    Score: <span className={`font-semibold ${
                                      attempt.score >= (attempt.quiz?.passing_score || 70)
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                    }`}>
                                      {attempt.score}%
                                    </span>
                                  </span>
                                  <span>
                                    {attempt.correct_answers}/{attempt.total_questions} correct
                                  </span>
                                  <span>
                                    {new Date(attempt.completed_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Badge variant={
                                attempt.passed ? 'success' : 'danger'
                              }>
                                {attempt.passed ? '✓ Passed' : '✗ Failed'}
                              </Badge>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-white mb-4">Badges & Achievements</h2>
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : badges && badges.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {badges.map((badge, idx) => (
                        <motion.div
                          key={badge.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Card className="flex flex-col items-center justify-center p-6 text-center hover:shadow-2xl transition-shadow">
                            <div className="text-5xl mb-3">{badge.icon || '🏆'}</div>
                            <h3 className="font-semibold text-white text-sm mb-1">
                              {badge.name}
                            </h3>
                            <p className="text-xs text-slate-400 mb-2">
                              {badge.description}
                            </p>
                            {badge.earned_at && (
                              <p className="text-xs text-slate-500">
                                Earned {new Date(badge.earned_at).toLocaleDateString()}
                              </p>
                            )}
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-12 text-center">
                      <Award size={48} className="mx-auto mb-4 text-slate-600" />
                      <h3 className="text-xl font-semibold text-slate-300 mb-2">
                        No badges yet
                      </h3>
                      <p className="text-slate-400">
                        Complete quizzes and achieve milestones to earn badges
                      </p>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
