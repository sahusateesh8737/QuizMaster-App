import apiClient from './api'

const authService = {
  // User Registration
  signup: async (userData) => {
    try {
      const response = await apiClient.post('/users/register/', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // User Login
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/token/', {
        username,
        password,
      })
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access)
        localStorage.setItem('refresh_token', response.data.refresh)
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
      const response = await apiClient.get('/users/me/')
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
