import axios from 'axios';
import getApiUrl from '../utils/apiConfig';

// Use the centralized API URL configuration
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Combined interceptor to set baseURL dynamically and add token
api.interceptors.request.use((config) => {
  // Set the baseURL at request time, not module load time
  config.baseURL = getApiUrl();
  
  // Add token to requests
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${getApiUrl()}/auth/refresh-token`, {
          refresh: refreshToken,
        });
        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
