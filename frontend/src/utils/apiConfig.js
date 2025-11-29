// API configuration utility - Updated for Railway HTTPS
const getApiUrl = () => {
  // Production: Always use HTTPS for Railway backend
  if (window.location.protocol === 'https:' || !window.location.hostname.includes('localhost')) {
    console.log('[API Config] Using HTTPS Railway backend');
    return 'https://devops-production-b01b.up.railway.app/api/v1';
  }

  // Local development
  const localUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  console.log('[API Config] Using local backend:', localUrl);
  return localUrl;
}

const getApiBase = () => {
  const url = getApiUrl()
  // Remove /api suffix if present to get base URL
  return url.replace(/\/api$/, '')
}

export { getApiUrl, getApiBase }
export default getApiUrl
