import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
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

// Response interceptor: handle 401 (Unauthorized) & 403 (Forbidden / Locked Account)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Handle 401 (Unauthorized) or 403 (Forbidden / Locked Account)
      if (status === 401 || status === 403) {
        const errorMsg = typeof data === 'string' ? data : (data?.error || data?.message || '');
        const isLockError = errorMsg.toLowerCase().includes('khóa') || errorMsg.toLowerCase().includes('locked');

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
