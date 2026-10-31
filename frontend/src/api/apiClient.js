import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add JWT Bearer token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const shouldClearSession = (error) => {
  const response = error?.response ?? error;
  if (response?.status === 401) return true;
  if (response?.status !== 403) return false;

  const data = response?.data;
  const message = typeof data === 'string' ? data : (data?.message || data?.error || '');
  return Number(data?.code) === 2009
    || message.toLocaleLowerCase().includes('khóa')
    || message.toLocaleLowerCase().includes('locked');
};

// Keep valid sessions when a user receives an ordinary role/resource 403.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Expired/invalid JWTs and explicitly locked accounts require re-authentication.
      if (shouldClearSession(error)) {
        const errorMsg = typeof data === 'string' ? data : (data?.error || data?.message || '');
        const isLockError = status === 403 && (Number(data?.code) === 2009
          || errorMsg.toLocaleLowerCase().includes('khóa')
          || errorMsg.toLocaleLowerCase().includes('locked'));

        // Clear credentials
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');

        // Redirect immediately to login
        if (window.location.pathname !== '/login') {
          window.location.href = isLockError ? '/login?locked=true' : '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
