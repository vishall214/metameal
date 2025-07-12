import axios from 'axios';

// Set base URL for all API requests
axios.defaults.baseURL = 'http://localhost:5002';

// Add request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login for 401 errors that aren't for public routes
    if (error.response?.status === 401 && 
        !error.config.url.includes('/api/meals') && 
        !error.config.url.includes('/library')) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios; 