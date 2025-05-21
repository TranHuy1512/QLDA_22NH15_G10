import axios from 'axios';

// Create axios instance with base URL
const instance = axios.create({
  baseURL: 'http://localhost:5000', // Your backend server URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('site');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('site');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 