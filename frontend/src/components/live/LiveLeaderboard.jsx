import { motion } from 'framer-motion'
import { Trophy, Crown, Medal } from 'lucide-react'
import Card from '../ui/Card'

export default function LiveLeaderboard({ leaderboard = [], showPodium = false }) {
  const top3 = leaderboard.slice(0, 3)
  const others = leaderboard.slice(3)

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-400" size={24} />
      case 2:
        return <Medal className="text-gray-300" size={20} />
      case 3:
        return <Medal className="text-amber-600" size={20} />
      default:
        return null
    }
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-600 to-yellow-400'
      case 2:
        return 'from-gray-400 to-gray-300'
      case 3:
        return 'from-amber-600 to-amber-400'
      default:
        return 'from-purple-600 to-blue-600'
    }
  }

  if (showPodium && top3.length > 0) {
    return (
      <div className="space-y-6">
        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          {top3[1] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-400 to-gray-300 flex items-center justify-center mb-2">
                <span className="text-white font-bold text-2xl">
                  {top3[1].username?.charAt(0) || '?'}
                </span>
              </div>
              <p className="text-white font-semibold truncate max-w-[100px]">
                {top3[1].username}
              </p>
              <p className="text-slate-400 text-sm">{top3[1].score} pts</p>
              <div className="w-24 h-32 bg-gradient-to-t from-gray-400/20 to-transparent rounded-t-lg mt-2 flex items-center justify-center">
                <span className="text-4xl font-bold text-gray-400">2</span>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Crown className="text-yellow-400 mb-2" size={32} />
              </motion.div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 flex items-center justify-center mb-2 ring-4 ring-yellow-400/50">
                <span className="text-white font-bold text-3xl">
                  {top3[0].username?.charAt(0) || '?'}
                </span>
              </div>
              <p className="text-white font-bold text-lg truncate max-w-[120px]">
                {top3[0].username}
              </p>
              <p className="text-yellow-400 font-bold">{top3[0].score} pts</p>
              <div className="w-28 h-40 bg-gradient-to-t from-yellow-600/20 to-transparent rounded-t-lg mt-2 flex items-center justify-center">
                <span className="text-5xl font-bold text-yellow-400">1</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-600 to-amber-400 flex items-center justify-center mb-2">
                <span className="text-white font-bold text-2xl">
                  {top3[2].username?.charAt(0) || '?'}
                </span>
              </div>
              <p className="text-white font-semibold truncate max-w-[100px]">
                {top3[2].username}
              </p>
              <p className="text-slate-400 text-sm">{top3[2].score} pts</p>
              <div className="w-24 h-24 bg-gradient-to-t from-amber-600/20 to-transparent rounded-t-lg mt-2 flex items-center justify-center">
                <span className="text-3xl font-bold text-amber-400">3</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Rest of leaderboard */}
        {others.length > 0 && (
          <Card className="p-4">
            <div className="space-y-2">
              {others.map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3"
                >
                  <div className="text-2xl font-bold text-slate-500 w-8">
                    {entry.rank}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {entry.username?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {entry.username}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {entry.correct_answers} correct
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-400">
                      {entry.score}
                    </p>
                    <p className="text-slate-500 text-xs">points</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}
      </div>
    )
  }

  // List view (for teacher control panel)
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="text-yellow-400" size={24} />
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-center text-slate-400 py-8">
          No scores yet. Students will appear here after answering questions.
        </p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 rounded-lg p-4 ${
                entry.rank <= 3
                  ? 'bg-gradient-to-r ' + getRankColor(entry.rank) + '/10 border border-' + (entry.rank === 1 ? 'yellow' : entry.rank === 2 ? 'gray' : 'amber') + '-400/30'
                  : 'bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2 w-12">
                {getMedalIcon(entry.rank)}
                <span className={`text-2xl font-bold ${
                  entry.rank <= 3 ? 'text-white' : 'text-slate-500'
                }`}>
                  {entry.rank}
                </span>
              </div>

              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(entry.rank)} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold text-lg">
                  {entry.username?.charAt(0) || '?'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-lg truncate">
                  {entry.username}
                </p>
                <p className="text-slate-400 text-sm">
                  {entry.correct_answers} correct answers
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-purple-400">
                  {entry.score}
                </p>
                <p className="text-slate-500 text-sm">points</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}
