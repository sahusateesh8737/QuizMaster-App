import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Trash2, Save, X, GripVertical } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthStore } from '../../store/slices/authStore'
import toast from 'react-hot-toast'

export default function CreateQuizPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: null,
    time_limit: 30,
    pass_percentage: 70,
    status: 'draft',
    shuffle_questions: false,
    shuffle_answers: false,
    show_correct_answer: true,
  })

  const [questions, setQuestions] = useState([
    {
      text: '',
      type: 'mcq',
      difficulty: 'medium',
      explanation: '',
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
    },
  ])

  useEffect(() => {
    // Check if user is teacher
    if (user?.role !== 'teacher') {
      toast.error('Only teachers can create quizzes')
      navigate('/quizzes')
      return
    }
    
    fetchCategories()
  }, [user])

  const fetchCategories = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || ${getApiUrl()}
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/quizzes/categories/`, {
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
      toast.error('Failed to load categories')
    }
  }

  const handleQuizChange = (e) => {
    const { name, value, type, checked } = e.target
    let processedValue = value
    
    // Convert category to integer or null
    if (name === 'category') {
      processedValue = value === '' ? null : parseInt(value, 10)
    }
    // Convert numeric fields to integers
    else if (name === 'time_limit' || name === 'pass_percentage') {
      processedValue = parseInt(value, 10)
    }
    
    setQuizData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
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
    // Set all options to false first
    newQuestions[questionIndex].options.forEach((opt, idx) => {
      opt.is_correct = idx === optionIndex
    })
    setQuestions(newQuestions)
  }

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: 'mcq',
        difficulty: 'medium',
        explanation: '',
        options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
        ],
      },
    ])
  }

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      toast.error('Quiz must have at least one question')
      return
    }
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const addOption = (questionIndex) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push({ text: '', is_correct: false })
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
      if (!q.text.trim()) {
        toast.error(`Question ${i + 1} text is required`)
        return false
      }
      
      const hasCorrectAnswer = q.options.some(opt => opt.is_correct)
      if (!hasCorrectAnswer) {
        toast.error(`Question ${i + 1} must have a correct answer`)
        return false
      }
      
      const filledOptions = q.options.filter(opt => opt.text.trim())
      if (filledOptions.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateQuiz()) return
    
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || ${getApiUrl()}
      const token = localStorage.getItem('access_token')
      
      // Debug: Log the quiz data being sent
      console.log('Creating quiz with data:', JSON.stringify(quizData, null, 2))
      
      // Create quiz
      const quizResponse = await fetch(`${API_URL}/quizzes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(quizData),
      })
      
      if (!quizResponse.ok) {
        const contentType = quizResponse.headers.get('content-type')
        let errorMessage = 'Failed to create quiz'
        
        if (contentType && contentType.includes('application/json')) {
          const error = await quizResponse.json()
          errorMessage = error.detail || error.message || JSON.stringify(error)
          console.error('Backend error response:', error)
        } else {
          const errorText = await quizResponse.text()
          console.error('Backend error (non-JSON):', errorText)
          errorMessage = 'Server error - check console for details'
        }
        
        throw new Error(errorMessage)
      }
      
      const quiz = await quizResponse.json()
      
      // Create questions
      for (let i = 0; i < questions.length; i++) {
        const questionData = {
          ...questions[i],
          quiz: quiz.id,
          order: i + 1,
        }
        
        const questionResponse = await fetch(`${API_URL}/quizzes/${quiz.id}/questions/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(questionData),
        })
        
        if (!questionResponse.ok) {
          throw new Error('Failed to create question')
        }
      }
      
      toast.success('Quiz created successfully!')
      navigate(`/quizzes/${quiz.id}`)
    } catch (error) {
      console.error('Error creating quiz:', error)
      toast.error(error.message || 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Creating quiz..." />
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
          <h1 className="text-4xl font-bold text-white mb-2">
            Create New Quiz
          </h1>
          <p className="text-slate-400">
            Design an engaging quiz for your students
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
                      value={quizData.category === null ? '' : quizData.category}
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
                      Status
                    </label>
                    <select
                      name="status"
                      value={quizData.status}
                      onChange={handleQuizChange}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
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
                    label="Pass Percentage (%)"
                    type="number"
                    name="pass_percentage"
                    value={quizData.pass_percentage}
                    onChange={handleQuizChange}
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="flex items-center gap-6 text-slate-300">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="shuffle_questions"
                      checked={quizData.shuffle_questions || false}
                      onChange={handleQuizChange}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Shuffle Questions</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="shuffle_answers"
                      checked={quizData.shuffle_answers || false}
                      onChange={handleQuizChange}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Shuffle Answers</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="show_correct_answer"
                      checked={quizData.show_correct_answer !== false}
                      onChange={handleQuizChange}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Show Correct Answers</span>
                  </label>
                </div>
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
                        value={question.text}
                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
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
                          value={question.type}
                          onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="tf">True/False</option>
                          <option value="fill">Fill in the Blank</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Difficulty
                        </label>
                        <select
                          value={question.difficulty}
                          onChange={(e) => handleQuestionChange(qIndex, 'difficulty', e.target.value)}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    {/* Options */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Answer Options
                        </label>
                        {question.type === 'mcq' && (
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
                        {question.options.map((option, oIndex) => (
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
                              value={option.text}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
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
                        value={question.explanation}
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
              onClick={() => navigate('/quizzes')}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 gap-2"
              disabled={loading}
            >
              <Save size={20} />
              Create Quiz
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
