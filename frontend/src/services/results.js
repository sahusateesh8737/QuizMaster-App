import apiClient from './api'

const resultsService = {
  // Get user results (quiz attempts)
  getUserResults: async () => {
    try {
      const response = await apiClient.get('/quizzes/attempts/')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get result detail
  getResultDetail: async (id) => {
    try {
      const response = await apiClient.get(`/results/${id}/`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get leaderboard
  getLeaderboard: async (quizId = null, limit = 10) => {
    try {
      const params = { limit }
      if (quizId) {
        params.quiz = quizId
      }
      const response = await apiClient.get('/results/leaderboard/', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get user statistics (current user only)
  getUserStatistics: async () => {
    try {
      const response = await apiClient.get('/results/statistics/my_statistics/')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get user badges (for current user, will be filtered by backend)
  getUserBadges: async () => {
    try {
      const response = await apiClient.get('/results/badges/')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get quiz analytics (admin)
  getQuizAnalytics: async (quizId) => {
    try {
      const response = await apiClient.get(`/quizzes/${quizId}/analytics/`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default resultsService
