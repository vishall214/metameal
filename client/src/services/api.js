import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and user data on unauthorized response
      localStorage.removeItem('token');
      // Redirect to login page if unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  updatePreferences: (data) => api.put('/profile/preferences', data),
  getNutritionGoals: () => api.get('/profile/nutrition')
};

// Meals API
export const mealsAPI = {
  getAll: () => api.get('/meals'),
  getById: (id) => api.get(`/meals/${id}`),
  create: (data) => api.post('/meals', data),
  update: (id, data) => api.put(`/meals/${id}`, data),
  delete: (id) => api.delete(`/meals/${id}`),
  search: (params) => api.get('/meals/search', { params }),
  getRecommended: () => api.get('/meals/recommendations'),
  getRandom: () => api.get('/meals/random')
};

// Meal Plans API
export const mealPlansAPI = {
  getAll: () => api.get('/meal-plans'),
  getById: (id) => api.get(`/meal-plans/${id}`),
  create: (data) => api.post('/meal-plans', data),
  update: (id, data) => api.put(`/meal-plans/${id}`, data),
  delete: (id) => api.delete(`/meal-plans/${id}`),
  generate: (preferences) => api.post('/meal-plans/generate', preferences),
  getActive: () => api.get('/meal-plans/active'),
  getWeekly: () => api.get('/meal-plans/weekly'),
  getToday: () => api.get('/meal-plans/today')
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
  updateMealStatus: (mealId, data) => api.put(`/dashboard/meals/${mealId}`, data),
  updateGoalStatus: (goalId, data) => api.put(`/dashboard/goals/${goalId}`, data),
  addMeal: (data) => api.post('/dashboard/meals', data),
  addGoal: (data) => api.post('/dashboard/goals', data)
};

export default api;