import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Users, Zap, TrendingUp } from 'lucide-react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import quizService from '../services/quiz'
import getApiUrl from '../utils/apiConfig'

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

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState({
    total_quizzes: 0,
    total_users: 0,
    total_attempts: 0,
    avg_rating: 4.8
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch quizzes
      const quizData = await quizService.getQuizzes()
      const quizList = Array.isArray(quizData) ? quizData : quizData.results || []
      setFeatured(quizList.slice(0, 6))
      
      // Fetch categories
      try {
        const token = localStorage.getItem('access_token')
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
        const catResponse = await fetch(`${getApiUrl()}/quizzes/categories/`, { headers })
        if (catResponse.ok) {
          const catData = await catResponse.json()
          setCategories((catData.results || catData).slice(0, 8))
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }

      // Fetch stats
      try {
        const token = localStorage.getItem('access_token')
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
        const statsResponse = await fetch(`${getApiUrl()}/users/platform-stats/`, { headers })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
      
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { icon: Users, label: 'Active Users', value: stats.total_users || '50K+' },
    { icon: TrendingUp, label: 'Quizzes Created', value: stats.total_quizzes || '1000+' },
    { icon: Zap, label: 'Daily Attempts', value: stats.total_attempts || '100K+' },
    { icon: Star, label: 'Avg Rating', value: `${stats.avg_rating || 4.8}★` },
  ]

  const features = [
    {
      icon: '📚',
      title: 'Diverse Content',
      description: 'Explore quizzes across technology, science, history, and more',
    },
    {
      icon: '⏱️',
      title: 'Timed Challenges',
      description: 'Test your knowledge against the clock with exciting time limits',
    },
    {
      icon: '🏆',
      title: 'Leaderboards',
      description: 'Compete with others and climb the global rankings',
    },
    {
      icon: '🎖️',
      title: 'Earn Badges',
      description: 'Unlock achievements and show off your expertise',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              Master Knowledge
              <br />
              Through Interactive Quizzes
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
            >
              Challenge yourself with our diverse quiz collection, compete on leaderboards, and
              unlock exclusive badges. Learn faster, score higher!
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/quizzes">
                <Button size="lg">
                  Explore Quizzes
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button variant="secondary" size="lg">
                  Get Started Free
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {statCards.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors"
                >
                  <Icon className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                  <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-center mb-12 text-white"
          >
            Why Choose QuizMaster?
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full flex flex-col">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="px-4 py-16 sm:px-6 lg:px-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-bold text-center mb-12 text-white"
            >
              Browse by Category
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {categories.map((category) => (
                <motion.div key={category.id} variants={itemVariants}>
                  <Link to={`/quizzes?category=${category.id}`}>
                    <Card className="text-center hover:shadow-2xl hover:border-purple-500/50 transition-all cursor-pointer">
                      <div className="text-4xl mb-3">{category.icon || '📚'}</div>
                      <h3 className="text-white font-semibold mb-1">{category.name}</h3>
                      {category.quiz_count !== undefined && (
                        <p className="text-sm text-slate-400">{category.quiz_count} quizzes</p>
                      )}
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Popular Quizzes Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Popular Quizzes</h2>
            <Link to="/quizzes">
              <Button variant="ghost">
                View All <ArrowRight size={18} />
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner text="Loading quizzes..." />
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featured.map((quiz) => (
                <motion.div key={quiz.id} variants={itemVariants}>
                  <Link to={`/quizzes/${quiz.id}`}>
                    <Card>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-white flex-1 pr-2">{quiz.title}</h3>
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                      </div>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {quiz.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {quiz.category && (
                          <Badge variant="primary" size="sm">
                            {quiz.category}
                          </Badge>
                        )}
                        <Badge variant="blue" size="sm">
                          {quiz.questions_count || 0} Q&apos;s
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm text-slate-400">
                        <span>⏱️ {quiz.time_limit || 'N/A'} min</span>
                        <span className="text-purple-400 font-semibold">→</span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-12 text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Challenge Yourself?</h2>
            <p className="text-slate-300 mb-8">
              Join thousands of learners who are mastering new skills with QuizMaster
            </p>
            <Link to="/auth/signup">
              <Button size="lg">
                Start Your Journey Now
                <ArrowRight size={20} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
