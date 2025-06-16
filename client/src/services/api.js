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

// Meals API
export const mealsAPI = {
  getAll: () => api.get('/meals'),
  getById: (id) => api.get(`/meals/${id}`),
  create: (data) => api.post('/meals', data),
  update: (id, data) => api.put(`/meals/${id}`, data),
  delete: (id) => api.delete(`/meals/${id}`),
  getByCategory: (category) => api.get(`/meals/category/${category}`),
  getByTag: (tag) => api.get(`/meals/tag/${tag}`),
  getRandomMeal: () => api.get('/meals/random')
};

// Meal Plans API
export const mealPlansAPI = {
  getAll: () => api.get('/meal-plans'),
  getById: (id) => api.get(`/meal-plans/${id}`),
  create: (data) => api.post('/meal-plans', data),
  update: (id, data) => api.put(`/meal-plans/${id}`, data),
  delete: (id) => api.delete(`/meal-plans/${id}`),
  generate: (preferences) => api.post('/meal-plans/generate', preferences)
};

// Analytics API
export const analyticsAPI = {
  getNutritionStats: () => api.get('/analytics/nutrition'),
  getMealHistory: () => api.get('/analytics/meal-history'),
  getProgress: () => api.get('/analytics/progress')
};

// Consultations API
export const consultationsAPI = {
  getAll: () => api.get('/consultations'),
  getById: (id) => api.get(`/consultations/${id}`),
  create: (data) => api.post('/consultations', data),
  update: (id, data) => api.put(`/consultations/${id}`, data),
  cancel: (id) => api.delete(`/consultations/${id}`),
  getAvailableSlots: () => api.get('/consultations/slots/available')
};

// User endpoints
export const users = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  updatePassword: (passwords) => api.put('/users/password', passwords),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

// Shopping List endpoints
export const shoppingList = {
  getCurrent: () => api.get('/shopping-list'),
  addItem: (item) => api.post('/shopping-list', item),
  updateItem: (id, item) => api.put(`/shopping-list/${id}`, item),
  deleteItem: (id) => api.delete(`/shopping-list/${id}`),
  clearList: () => api.delete('/shopping-list')
};

// Community endpoints
export const community = {
  getPosts: (params) => api.get('/community/posts', { params }),
  createPost: (postData) => api.post('/community/posts', postData),
  likePost: (id) => api.post(`/community/posts/${id}/like`),
  comment: (id, comment) => api.post(`/community/posts/${id}/comments`, { comment }),
  getComments: (id) => api.get(`/community/posts/${id}/comments`)
};

export default api;