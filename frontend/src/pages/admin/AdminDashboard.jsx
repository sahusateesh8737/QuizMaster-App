import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  BookOpen,
  TrendingUp,
  Search,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import getApiUrl from '../../utils/apiConfig'
import { useAuthStore } from '../../store/slices/authStore'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'admin' && !user.is_staff) {
      toast.error('Access denied. Admin privileges required.')
      navigate('/')
    }
  }, [user, navigate])

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const headers = { 'Authorization': `Bearer ${token}` }

      if (activeTab === 'overview') {
        const response = await fetch(`${getApiUrl()}/users/platform-stats/`, { headers })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } else if (activeTab === 'users') {
        const response = await fetch(`${getApiUrl()}/users/`, { headers })
        if (response.ok) {
          const data = await response.json()
          setUsers(Array.isArray(data) ? data : data.results || [])
        }
      } else if (activeTab === 'quizzes') {
        // Fetch all quizzes (admin view usually requires a specific endpoint or filter, 
        // but for now we'll fetch what's available. 
        // Ideally backend should support ?all=true for admins)
        const response = await fetch(`${getApiUrl()}/quizzes/`, { headers })
        if (response.ok) {
          const data = await response.json()
          setQuizzes(Array.isArray(data) ? data : data.results || [])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${getApiUrl()}/users/${userId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId))
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Delete failed:', response.status, errorData)
        throw new Error(errorData.detail || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Error deleting user')
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${getApiUrl()}/quizzes/${quizId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        toast.success('Quiz deleted successfully')
        setQuizzes(quizzes.filter(q => q.id !== quizId))
      } else {
        throw new Error('Failed to delete quiz')
      }
    } catch (error) {
      toast.error('Error deleting quiz')
    }
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading && !stats && users.length === 0 && quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading admin dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Manage users, quizzes, and view platform stats</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'overview' ? 'primary' : 'ghost'} 
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Button>
            <Button 
              variant={activeTab === 'users' ? 'primary' : 'ghost'} 
              onClick={() => setActiveTab('users')}
            >
              Users
            </Button>
            <Button 
              variant={activeTab === 'quizzes' ? 'primary' : 'ghost'} 
              onClick={() => setActiveTab('quizzes')}
            >
              Quizzes
            </Button>
          </div>
        </div>

        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400">Total Users</p>
                  <h3 className="text-3xl font-bold">{stats.total_users}</h3>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400">Total Quizzes</p>
                  <h3 className="text-3xl font-bold">{stats.total_quizzes}</h3>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400">Total Attempts</p>
                  <h3 className="text-3xl font-bold">{stats.total_attempts}</h3>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              <table className="w-full text-left">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="p-4 text-slate-400 font-medium">User</th>
                    <th className="p-4 text-slate-400 font-medium">Role</th>
                    <th className="p-4 text-slate-400 font-medium">Status</th>
                    <th className="p-4 text-slate-400 font-medium">Joined</th>
                    <th className="p-4 text-slate-400 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-700/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.role === 'admin' ? 'purple' : user.role === 'teacher' ? 'blue' : 'gray'}>
                          {user.role || 'Student'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.is_email_verified ? (
                          <span className="flex items-center gap-1 text-green-400 text-sm">
                            <CheckCircle size={14} /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400 text-sm">
                            <AlertTriangle size={14} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Quiz Management</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map(quiz => (
                <Card key={quiz.id} className="relative group">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="font-bold text-lg mb-2 pr-8">{quiz.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <Badge variant={quiz.status === 'published' ? 'success' : 'warning'}>
                      {quiz.status}
                    </Badge>
                    <span className="text-slate-500">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
