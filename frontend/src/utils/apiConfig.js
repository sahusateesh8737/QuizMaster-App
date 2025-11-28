// API configuration utility
const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  if (url.includes('railway.app') && url.startsWith('http://')) {
    url = url.replace('http://', 'https://')
  }
  return url
}

const getApiBase = () => {
  const url = getApiUrl()
  // Remove /api suffix if present to get base URL
  return url.replace(/\/api$/, '')
}

export { getApiUrl, getApiBase }
export default getApiUrl
