// API configuration utility
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL

  // If we are in production (not localhost), force the known correct HTTPS URL
  if (!window.location.hostname.includes('localhost')) {
    return 'https://devops-production-b01b.up.railway.app/api/v1'
  }

  return envUrl || 'http://localhost:8000/api'
}

const getApiBase = () => {
  const url = getApiUrl()
  // Remove /api suffix if present to get base URL
  return url.replace(/\/api$/, '')
}

export { getApiUrl, getApiBase }
export default getApiUrl
