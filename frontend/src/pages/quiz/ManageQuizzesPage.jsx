import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Eye, EyeOff, Copy, BarChart } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthStore } from '../../store/slices/authStore'
import getApiUrl from '../../utils/apiConfig'
import toast from 'react-hot-toast'

export default function ManageQuizzesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState([])
  const [filter, setFilter] = useState('all') // all, published, draft
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => {
    if (user?.role !== 'teacher') {
      toast.error('Only teachers can manage quizzes')
      navigate('/quizzes')
      return
    }
    
    fetchQuizzes()
  }, [user, filter])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      let url = `${getApiUrl()}/quizzes/?creator=${user.id}`
      if (filter === 'published') {
        url += '&is_published=true'
      } else if (filter === 'draft') {
        url += '&is_published=false'
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data.results || data)
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast.error('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (quizId, currentStatus) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${getApiUrl()}/quizzes/${quizId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_published: !currentStatus }),
      })
      
      if (response.ok) {
        toast.success(currentStatus ? 'Quiz unpublished' : 'Quiz published')
        fetchQuizzes()
      } else {
        throw new Error('Failed to update quiz')
      }
    } catch (error) {
      console.error('Error updating quiz:', error)
      toast.error('Failed to update quiz')
    }
  }

  const duplicateQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem('access_token')
      
      // Fetch original quiz
      const quizResponse = await fetch(`${getApiUrl()}/quizzes/${quizId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!quizResponse.ok) {
        throw new Error('Failed to fetch quiz')
      }
      
      const quiz = await quizResponse.json()
      
      // Create duplicate
      const newQuiz = {
        ...quiz,
        title: `${quiz.title} (Copy)`,
        is_published: false,
      }
      delete newQuiz.id
      delete newQuiz.creator
      delete newQuiz.created_at
      delete newQuiz.updated_at
      
      const createResponse = await fetch(`${getApiUrl()}/quizzes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newQuiz),
      })
      
      if (createResponse.ok) {
        const created = await createResponse.json()
        
        // Fetch and duplicate questions
        const questionsResponse = await fetch(`${getApiUrl()}/quizzes/${quizId}/questions/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json()
          const questions = questionsData.results || questionsData
          
          for (const question of questions) {
            const newQuestion = {
              ...question,
              quiz: created.id,
            }
            delete newQuestion.id
            delete newQuestion.created_at
            delete newQuestion.updated_at
            
            await fetch(`${getApiUrl()}/quizzes/${created.id}/questions/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(newQuestion),
            })
          }
        }
        
        toast.success('Quiz duplicated successfully')
        fetchQuizzes()
      }
    } catch (error) {
      console.error('Error duplicating quiz:', error)
      toast.error('Failed to duplicate quiz')
    }
  }

  const deleteQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${getApiUrl()}/quizzes/${quizId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        toast.success('Quiz deleted successfully')
        fetchQuizzes()
        setDeleteModal(null)
      } else {
        throw new Error('Failed to delete quiz')
      }
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast.error('Failed to delete quiz')
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-400/10'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10'
      case 'hard': return 'text-red-400 bg-red-400/10'
      default: return 'text-slate-400 bg-slate-400/10'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading quizzes..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Manage Quizzes
              </h1>
              <p className="text-slate-400">
                Create, edit, and manage your quiz collection
              </p>
            </div>
            <Button
              onClick={() => navigate('/quizzes/create')}
              variant="primary"
              className="gap-2"
            >
              <Plus size={20} />
              Create Quiz
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              All ({quizzes.length})
            </button>
            <button
              onClick={() => setFilter('published')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'published'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setFilter('draft')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'draft'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Drafts
            </button>
          </div>
        </motion.div>

        {/* Quizzes List */}
        {quizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No quizzes yet
              </h3>
              <p className="text-slate-400 mb-6">
                {filter === 'all'
                  ? 'Create your first quiz to get started'
                  : `No ${filter} quizzes found`}
              </p>
              {filter === 'all' && (
                <Button
                  onClick={() => navigate('/quizzes/create')}
                  variant="primary"
                  className="gap-2"
                >
                  <Plus size={20} />
                  Create Your First Quiz
                </Button>
              )}
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {quiz.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                        {quiz.is_published ? (
                          <span className="px-3 py-1 rounded-full text-xs font-medium text-green-400 bg-green-400/10">
                            Published
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium text-yellow-400 bg-yellow-400/10">
                            Draft
                          </span>
                        )}
                      </div>
                      
                      {quiz.description && (
                        <p className="text-slate-400 mb-3 line-clamp-2">
                          {quiz.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>📚 {quiz.category?.name}</span>
                        <span>❓ {quiz.questions_count || 0} questions</span>
                        <span>⏱️ {quiz.time_limit} min</span>
                        <span>🎯 {quiz.passing_score}% to pass</span>
                        <span>👥 {quiz.attempts_count || 0} attempts</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/quizzes/${quiz.id}`)}
                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="View Quiz"
                      >
                        <Eye size={18} />
                      </button>
                      
                      <button
                        onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Quiz"
                      >
                        <Edit size={18} />
                      </button>
                      
                      <button
                        onClick={() => togglePublish(quiz.id, quiz.is_published)}
                        className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title={quiz.is_published ? 'Unpublish' : 'Publish'}
                      >
                        {quiz.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      
                      <button
                        onClick={() => duplicateQuiz(quiz.id)}
                        className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Duplicate Quiz"
                      >
                        <Copy size={18} />
                      </button>
                      
                      <button
                        onClick={() => navigate(`/quizzes/${quiz.id}/stats`)}
                        className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="View Statistics"
                      >
                        <BarChart size={18} />
                      </button>
                      
                      <button
                        onClick={() => setDeleteModal(quiz)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-white mb-2">
              Delete Quiz?
            </h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete &quot;{deleteModal.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setDeleteModal(null)}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteQuiz(deleteModal.id)}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
