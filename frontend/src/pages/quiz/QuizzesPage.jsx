import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Clock, BookOpen, TrendingUp, SortAsc, Plus, Grid, List } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useQuizStore } from '../../store/slices/quizStore'
import { useAuthStore } from '../../store/slices/authStore'

export default function QuizzesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { quizzes, categories, loading, getQuizzes, getCategories, searchQuizzes } =
    useQuizStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [difficulty, setDifficulty] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('list')
  const [filteredQuizzes, setFilteredQuizzes] = useState([])

  useEffect(() => {
    getCategories()
    getQuizzes()
  }, [])

  useEffect(() => {
    let filtered = quizzes

    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((quiz) => {
        return quiz.category?.id === selectedCategory || quiz.category === selectedCategory
      })
    }

    if (difficulty !== 'all') {
      filtered = filtered.filter((quiz) => quiz.difficulty === difficulty)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'popular':
          return (b.attempts_count || 0) - (a.attempts_count || 0)
        case 'questions':
          return (b.questions_count || 0) - (a.questions_count || 0)
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredQuizzes(filtered)
  }, [quizzes, searchTerm, selectedCategory, difficulty, sortBy])

  const handleSearch = async (e) => {
    const term = e.target.value
    setSearchTerm(term)
    if (term) {
      await searchQuizzes(term, selectedCategory !== 'all' ? selectedCategory : null)
    }
  }

  const getDifficultyColor = (level) => {
    const colors = {
      easy: 'success',
      medium: 'warning',
      hard: 'danger',
    }
    return colors[level] || 'default'
  }

  const getDifficultyIcon = (level) => {
    const icons = { easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐' }
    return icons[level] || '○'
  }

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
      {/* Header */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <BookOpen size={32} className="text-purple-400" />
                  Browse Quizzes
                </h1>
                <p className="text-slate-400">
                  Challenge yourself with {quizzes.length} quizzes across multiple categories
                </p>
              </div>
              {user?.role === 'teacher' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate('/quizzes/manage')}
                    variant="secondary"
                  >
                    Manage Quizzes
                  </Button>
                  <Button
                    onClick={() => navigate('/quizzes/create')}
                    variant="primary"
                    className="gap-2"
                  >
                    <Plus size={20} />
                    Create Quiz
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <Filter size={20} />
                  Filters
                </h3>

                {/* Search */}
                <div className="mb-6">
                  <Input
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={handleSearch}
                    icon={Search}
                  />
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    <SortAsc size={16} className="inline mr-1" />
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="questions">Most Questions</option>
                    <option value="alphabetical">A-Z</option>
                  </select>
                </div>

                {/* Reset Filters Button */}
                {(searchTerm || selectedCategory !== 'all' || difficulty !== 'all' || sortBy !== 'newest') && (
                  <div className="mt-6">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        setSearchTerm('')
                        setSelectedCategory('all')
                        setDifficulty('all')
                        setSortBy('newest')
                      }}
                    >
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </div>

              {/* Categories Quick Access */}
              {categories.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <h3 className="font-bold text-white mb-4">Popular Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30">
                <h3 className="font-bold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Quizzes:</span>
                    <span className="text-white font-semibold">{quizzes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available:</span>
                    <span className="text-white font-semibold">{filteredQuizzes.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content - Quizzes */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-3"
            >
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {filteredQuizzes.length} {filteredQuizzes.length === 1 ? 'Quiz' : 'Quizzes'}
                  </h2>
                  {(searchTerm || selectedCategory !== 'all' || difficulty !== 'all') && (
                    <p className="text-sm text-slate-400 mt-1">
                      {searchTerm && `Searching for "${searchTerm}"`}
                      {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                      {difficulty !== 'all' && ` • ${difficulty} difficulty`}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="List View"
                  >
                    <List size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <Grid size={20} />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <LoadingSpinner text="Loading quizzes..." />
                </div>
              ) : filteredQuizzes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <BookOpen size={48} className="mx-auto mb-4 text-slate-600" />
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">No quizzes found</h3>
                  <p className="text-slate-400 mb-4">Try adjusting your filters or search term</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('all')
                      setDifficulty('all')
                    }}
                  >
                    Reset Filters
                  </Button>
                </motion.div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                  {filteredQuizzes.map((quiz) => (
                    <motion.div key={quiz.id} variants={itemVariants}>
                      <Link to={`/quizzes/${quiz.id}`}>
                        <Card className="h-full hover:shadow-2xl hover:border-purple-500/50 transition-all">
                          <div className={viewMode === 'list' ? 'flex flex-col sm:flex-row justify-between gap-4' : 'flex flex-col h-full'}>
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-2">
                                <h3 className="text-lg font-bold text-white flex-1 hover:text-purple-400 transition-colors">
                                  {quiz.title}
                                </h3>
                                {quiz.difficulty && (
                                  <Badge variant={getDifficultyColor(quiz.difficulty)}>
                                    {getDifficultyIcon(quiz.difficulty)}
                                  </Badge>
                                )}
                              </div>

                              <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                {quiz.description || 'No description available'}
                              </p>

                              <div className="flex flex-wrap gap-3 mb-3">
                                {quiz.category && (
                                  <Badge variant="primary" size="sm">
                                    {typeof quiz.category === 'object' ? quiz.category.name : quiz.category}
                                  </Badge>
                                )}

                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                  <BookOpen size={16} />
                                  <span>{quiz.questions_count || 0} Questions</span>
                                </div>

                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                  <Clock size={16} />
                                  <span>{quiz.time_limit || 'N/A'} mins</span>
                                </div>

                                {quiz.attempts_count > 0 && (
                                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <TrendingUp size={16} />
                                    <span>{quiz.attempts_count} attempts</span>
                                  </div>
                                )}
                              </div>

                              {quiz.creator && (
                                <div className="text-xs text-slate-500">
                                  Created by {quiz.creator.username || quiz.creator.email}
                                </div>
                              )}
                            </div>

                            <div className={`flex ${viewMode === 'list' ? 'flex-col justify-between items-end' : 'flex-row justify-between items-center mt-auto pt-4 border-t border-slate-700'}`}>
                              <div className={viewMode === 'list' ? 'text-right mb-4' : ''}>
                                {quiz.pass_percentage !== undefined && (
                                  <div className="text-sm text-slate-400">
                                    Pass Rate: <span className="text-green-400 font-semibold">
                                      {quiz.pass_percentage}%
                                    </span>
                                  </div>
                                )}
                                {quiz.passing_score && (
                                  <div className="text-xs text-slate-500">
                                    {quiz.passing_score}% to pass
                                  </div>
                                )}
                              </div>
                              <Button size="sm" className="group">
                                Take Quiz 
                                <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
