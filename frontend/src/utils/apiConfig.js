// API configuration utility
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
}

const getApiBase = () => {
  const url = getApiUrl()
  // Remove /api suffix if present to get base URL
  return url.replace(/\/api$/, '')
}

export { getApiUrl, getApiBase }
export default getApiUrl
