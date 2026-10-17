import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and hasn't already been retried
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem('access_token', newAccessToken);
        if (res.data.refresh) {
          localStorage.setItem('refresh_token', res.data.refresh);
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login?session_expired=1';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export const extractErrorMessage = (error, fallback = 'An unexpected error occurred.') => {
  if (!error) return fallback;
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (typeof errors === 'object' && errors !== null) {
      const firstKey = Object.keys(errors)[0];
      if (firstKey) {
        const val = errors[firstKey];
        const msg = Array.isArray(val) ? val[0] : val;
        const formattedKey = firstKey.replace(/_/g, ' ');
        return `${formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1)}: ${msg}`;
      }
    }
  }
  if (error.response?.data?.message && error.response.data.message !== 'An error occurred while processing your request.') {
    return error.response.data.message;
  }
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.message) return error.message;
  return fallback;
};

export default api;
