// API configuration utility
const getApiUrl = () => {
  // Get URL from environment variable
  let apiUrl = import.meta.env.VITE_API_URL || 'https://quiz-master-app-backend.vercel.app/api/v1';

  // Force HTTPS if the API URL uses railway.app or vercel.app domain but has http://
  if ((apiUrl.includes('railway.app') || apiUrl.includes('vercel.app')) && apiUrl.startsWith('http://')) {
    apiUrl = apiUrl.replace('http://', 'https://');
  }

  return apiUrl;
}

const getApiBase = () => {
  const url = getApiUrl()
  // Remove /api suffix if present to get base URL
  return url.replace(/\/api$/, '')
}

export { getApiUrl, getApiBase }
export default getApiUrl
