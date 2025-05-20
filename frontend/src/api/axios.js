import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending/receiving cookies
});

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;

    // Handle authentication errors
    if (response && response.status === 401) {
      // You could redirect to login or dispatch an action
      console.error('Authentication error:', error);
    }

    // Handle server errors
    if (response && response.status >= 500) {
      console.error('Server error:', error);
    }

    return Promise.reject(error);
  }
);

export default api;
