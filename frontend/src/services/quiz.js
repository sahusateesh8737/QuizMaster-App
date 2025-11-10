import apiClient from './api'

const quizService = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await apiClient.get('/quizzes/categories/')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get all quizzes
  getQuizzes: async (params = {}) => {
    try {
      const response = await apiClient.get('/quizzes/', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get quiz detail
  getQuizDetail: async (id) => {
    try {
      const response = await apiClient.get(`/quizzes/${id}/`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Start quiz attempt
  startAttempt: async (quizId) => {
    try {
      const response = await apiClient.post(`/quizzes/${quizId}/attempts/`, {})
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get quiz attempt
  getAttempt: async (attemptId) => {
    try {
      const response = await apiClient.get(`/quizzes/attempts/${attemptId}/`)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Submit answer
  submitAnswer: async (attemptId, questionId, selectedOptionId, answerText = '') => {
    try {
      const response = await apiClient.post(`/quizzes/attempts/${attemptId}/submit_answer/`, {
        question_id: questionId,
        selected_option_id: selectedOptionId,
        answer_text: answerText,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Finish attempt
  finishAttempt: async (attemptId) => {
    try {
      const response = await apiClient.post(`/quizzes/attempts/${attemptId}/complete/`, {})
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get user quizzes (for filtering)
  searchQuizzes: async (searchTerm, category = null) => {
    try {
      const params = { search: searchTerm }
      if (category) {
        params.category = category
      }
      const response = await apiClient.get('/quizzes/', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default quizService
