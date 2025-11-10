import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, TrendingUp, Crown } from 'lucide-react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useResultsStore } from '../store/slices/resultsStore'

export default function LeaderboardPage() {
  const { leaderboard, loading, getLeaderboard } = useResultsStore()
  const [timeframe, setTimeframe] = useState('all')
  const [topEntries, setTopEntries] = useState([])

  useEffect(() => {
    getLeaderboard(null, 50)
  }, [])

  useEffect(() => {
    setTopEntries(leaderboard.slice(0, 20))
  }, [leaderboard])

  const getMedalIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />
      default:
        return <span className="text-slate-400 font-bold">{position}</span>
    }
  }

  const getMedalColor = (position) => {
    switch (position) {
      case 1:
        return 'from-yellow-600/20 to-yellow-600/5 border-yellow-500/30'
      case 2:
        return 'from-gray-600/20 to-gray-600/5 border-gray-500/30'
      case 3:
        return 'from-orange-600/20 to-orange-600/5 border-orange-500/30'
      default:
        return 'from-slate-800/50 to-slate-800/25 border-slate-700'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
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
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Trophy size={40} className="text-yellow-400" />
              Global Leaderboard
            </h1>
            <p className="text-slate-400">
              Compete with millions of learners worldwide. Can you reach the top?
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeframe Selector */}
      <section className="px-4 py-6 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 flex-wrap">
            {['all', 'month', 'week', 'day'].map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTimeframe(tf)}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Content */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner text="Loading leaderboard..." />
            </div>
          ) : topEntries.length === 0 ? (
            <Card className="text-center py-12">
              <TrendingUp size={48} className="mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                No entries yet
              </h3>
              <p className="text-slate-400">
                Be the first to complete a quiz and join the leaderboard!
              </p>
            </Card>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {/* Top 3 Special Section */}
              {topEntries.slice(0, 3).length > 0 && (
                <motion.div variants={itemVariants} className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Top Performers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topEntries.slice(0, 3).map((entry, idx) => {
                      const position = idx + 1
                      return (
                        <motion.div
                          key={entry.id}
                          whileHover={{ y: -4 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div
                            className={`relative overflow-hidden rounded-xl p-6 border bg-gradient-to-br ${getMedalColor(
                              position
                            )}`}
                          >
                            {/* Shine effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />

                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-4">
                                <div className="text-4xl font-bold">
                                  {getMedalIcon(position)}
                                </div>
                                <span className="text-3xl font-bold text-white">
                                  {position}
                                </span>
                              </div>

                              <h3 className="text-lg font-bold text-white mb-1">
                                {entry.user_name}
                              </h3>
                              <p className="text-slate-400 text-sm mb-4">
                                {entry.country || 'Worldwide'}
                              </p>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">Score:</span>
                                  <span className="text-white font-semibold">
                                    {entry.total_score}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">Quizzes:</span>
                                  <span className="text-white font-semibold">
                                    {entry.quizzes_completed}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Rest of Leaderboard */}
              <h2 className="text-2xl font-bold text-white mb-4">Ranking</h2>
              <div className="space-y-2">
                {topEntries.map((entry, idx) => {
                  const position = idx + 1
                  return (
                    <motion.div key={entry.id} variants={itemVariants}>
                      <Card
                        className={`flex items-center justify-between p-4 ${
                          position <= 3 ? 'ring-2 ring-purple-500/30' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white">
                            {position <= 3 ? getMedalIcon(position) : position}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">
                              {entry.user_name}
                            </h3>
                            <p className="text-sm text-slate-400">
                              {entry.quizzes_completed} quizzes
                            </p>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            {entry.total_score}
                          </p>
                          <p className="text-xs text-slate-400">points</p>
                        </div>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Your Rank Section */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Challenge Yourself</h2>
            <p className="text-slate-300 mb-6">
              Complete more quizzes and climb the leaderboard to become a QuizMaster Champion!
            </p>
            <Button size="lg">
              Explore Quizzes and Earn Points
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
