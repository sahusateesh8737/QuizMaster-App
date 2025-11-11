// API configuration utility
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || ${getApiUrl()}
}

const getApiBase = () => {
  const url = getApiUrl()
  // Remove /api suffix if present to get base URL
  return url.replace(/\/api$/, '')
}

export { getApiUrl, getApiBase }
export default getApiUrl
