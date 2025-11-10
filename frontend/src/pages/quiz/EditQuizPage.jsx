import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Trash2, Save, X, GripVertical, ArrowLeft } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthStore } from '../../store/slices/authStore'
import toast from 'react-hot-toast'

export default function EditQuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    time_limit: 30,
    passing_score: 70,
    difficulty: 'medium',
    is_published: false,
  })

  const [questions, setQuestions] = useState([])

  useEffect(() => {
    if (user?.role !== 'teacher') {
      toast.error('Only teachers can edit quizzes')
      navigate('/quizzes')
      return
    }
    
    fetchQuizData()
    fetchCategories()
  }, [id, user])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/quizzes/categories/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data.results || data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchQuizData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      
      // Fetch quiz details
      const quizResponse = await fetch(`http://localhost:8000/api/quizzes/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!quizResponse.ok) {
        throw new Error('Failed to fetch quiz')
      }
      
      const quiz = await quizResponse.json()
      
      // Check if user is the creator
      if (quiz.creator?.id !== user?.id) {
        toast.error('You can only edit your own quizzes')
        navigate('/quizzes')
        return
      }
      
      setQuizData({
        title: quiz.title,
        description: quiz.description || '',
        category: quiz.category?.id || '',
        time_limit: quiz.time_limit,
        passing_score: quiz.passing_score,
        difficulty: quiz.difficulty,
        is_published: quiz.is_published,
      })
      
      // Fetch questions
      const questionsResponse = await fetch(`http://localhost:8000/api/quizzes/${id}/questions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData.results || questionsData || [])
      }
      
    } catch (error) {
      console.error('Error fetching quiz:', error)
      toast.error('Failed to load quiz')
      navigate('/quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions]
    newQuestions[index][field] = value
    setQuestions(newQuestions)
  }

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex][field] = value
    setQuestions(newQuestions)
  }

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.forEach((opt, idx) => {
      opt.is_correct = idx === optionIndex
    })
    setQuestions(newQuestions)
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        points: 10,
        explanation: '',
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ],
      },
    ])
  }

  const removeQuestion = async (index) => {
    if (questions.length === 1) {
      toast.error('Quiz must have at least one question')
      return
    }
    
    const question = questions[index]
    
    // If question has an ID, delete it from backend
    if (question.id) {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`http://localhost:8000/api/quizzes/${id}/questions/${question.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete question')
        }
        
        toast.success('Question deleted')
      } catch (error) {
        console.error('Error deleting question:', error)
        toast.error('Failed to delete question')
        return
      }
    }
    
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const addOption = (questionIndex) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push({ option_text: '', is_correct: false })
    setQuestions(newQuestions)
  }

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...questions]
    if (newQuestions[questionIndex].options.length <= 2) {
      toast.error('Question must have at least 2 options')
      return
    }
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex)
    setQuestions(newQuestions)
  }

  const validateQuiz = () => {
    if (!quizData.title.trim()) {
      toast.error('Quiz title is required')
      return false
    }
    if (!quizData.category) {
      toast.error('Please select a category')
      return false
    }
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question_text.trim()) {
        toast.error(`Question ${i + 1} text is required`)
        return false
      }
      
      const hasCorrectAnswer = q.options.some(opt => opt.is_correct)
      if (!hasCorrectAnswer) {
        toast.error(`Question ${i + 1} must have a correct answer`)
        return false
      }
      
      const filledOptions = q.options.filter(opt => opt.option_text.trim())
      if (filledOptions.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options with text`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateQuiz()) return
    
    setSaving(true)
    try {
      const token = localStorage.getItem('access_token')
      
      // Update quiz
      const quizResponse = await fetch(`http://localhost:8000/api/quizzes/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(quizData),
      })
      
      if (!quizResponse.ok) {
        const error = await quizResponse.json()
        throw new Error(error.detail || 'Failed to update quiz')
      }
      
      // Update or create questions
      for (let i = 0; i < questions.length; i++) {
        const questionData = {
          ...questions[i],
          quiz: id,
          order: i + 1,
        }
        
        if (questions[i].id) {
          // Update existing question
          const response = await fetch(`http://localhost:8000/api/quizzes/${id}/questions/${questions[i].id}/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(questionData),
          })
          
          if (!response.ok) {
            throw new Error('Failed to update question')
          }
        } else {
          // Create new question
          const response = await fetch(`http://localhost:8000/api/quizzes/${id}/questions/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(questionData),
          })
          
          if (!response.ok) {
            throw new Error('Failed to create question')
          }
        }
      }
      
      toast.success('Quiz updated successfully!')
      navigate(`/quizzes/${id}`)
    } catch (error) {
      console.error('Error updating quiz:', error)
      toast.error(error.message || 'Failed to update quiz')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading quiz..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 px-4 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(`/quizzes/${id}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Back to Quiz
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">
            Edit Quiz
          </h1>
          <p className="text-slate-400">
            Update your quiz content and settings
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Quiz Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Quiz Details
              </h2>
              
              <div className="space-y-4">
                <Input
                  label="Quiz Title"
                  type="text"
                  name="title"
                  value={quizData.title}
                  onChange={handleQuizChange}
                  placeholder="Enter quiz title"
                  required
                />
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={quizData.description}
                    onChange={handleQuizChange}
                    rows={3}
                    placeholder="Enter quiz description"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={quizData.category}
                      onChange={handleQuizChange}
                      required
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={quizData.difficulty}
                      onChange={handleQuizChange}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Time Limit (minutes)"
                    type="number"
                    name="time_limit"
                    value={quizData.time_limit}
                    onChange={handleQuizChange}
                    min="1"
                    max="180"
                  />
                  
                  <Input
                    label="Passing Score (%)"
                    type="number"
                    name="passing_score"
                    value={quizData.passing_score}
                    onChange={handleQuizChange}
                    min="0"
                    max="100"
                  />
                </div>
                
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={quizData.is_published}
                    onChange={handleQuizChange}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Published</span>
                </label>
              </div>
            </Card>
          </motion.div>

          {/* Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">
                Questions ({questions.length})
              </h2>
              <Button
                type="button"
                onClick={addQuestion}
                variant="secondary"
                className="gap-2"
              >
                <Plus size={20} />
                Add Question
              </Button>
            </div>

            <div className="space-y-6">
              {questions.map((question, qIndex) => (
                <Card key={qIndex} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="text-slate-500" size={20} />
                      <h3 className="text-xl font-bold text-white">
                        Question {qIndex + 1}
                      </h3>
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Question Text
                      </label>
                      <textarea
                        value={question.question_text}
                        onChange={(e) => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                        rows={2}
                        placeholder="Enter your question"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Question Type
                        </label>
                        <select
                          value={question.question_type}
                          onChange={(e) => handleQuestionChange(qIndex, 'question_type', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="true_false">True/False</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Points
                        </label>
                        <input
                          type="number"
                          value={question.points}
                          onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))}
                          min="1"
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Answer Options
                        </label>
                        {question.question_type === 'multiple_choice' && (
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="text-purple-400 hover:text-purple-300 text-sm"
                          >
                            + Add Option
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        {question.options?.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={option.is_correct}
                              onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                              className="w-4 h-4 text-green-600"
                            />
                            <input
                              type="text"
                              value={option.option_text}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, 'option_text', e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            {question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="text-red-400 hover:text-red-300 p-2"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Select the radio button for the correct answer
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Explanation (optional)
                      </label>
                      <textarea
                        value={question.explanation || ''}
                        onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                        rows={2}
                        placeholder="Explain the correct answer"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex gap-4"
          >
            <Button
              type="button"
              onClick={() => navigate(`/quizzes/${id}`)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 gap-2"
              disabled={saving}
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
