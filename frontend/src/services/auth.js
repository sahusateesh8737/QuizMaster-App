import apiClient from './api'

const authService = {
  // User Registration
  signup: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // User Login
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login/access-token', {
        username,
        password,
      })
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // User Logout
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  // Get Current User
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/users/me')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Change Password
  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await apiClient.post('/users/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Password Reset
  resetPassword: async (email) => {
    try {
      const response = await apiClient.post('/users/password-reset/', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Verify Email
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.post('/users/verify-email/', { token })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },
}

export default authService
