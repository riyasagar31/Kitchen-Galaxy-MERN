import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000/api'
});

// REQUEST Interceptor: Attach token to every request
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE Interceptor: Handle global errors (like 401 Unauthorized)
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Get the URL that failed
    const originalRequest = error.config;

    // Only auto-logout if it's NOT the login route
    if (error.response?.status === 401 && !originalRequest.url.includes('/auth/login')) {
      console.warn("Unauthorized request - logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;