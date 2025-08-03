import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
};

// Topics API
export const topicAPI = {
  createTopic: (topicData) => api.post('/api/topics', topicData),
  getUserTopics: () => api.get('/api/topics'),
  getTopic: (topicId) => api.get(`/api/topics/${topicId}`),
};

// Quiz API
export const quizAPI = {
  submitQuiz: (quizData) => api.post('/api/quiz/submit', quizData),
};

// Progress API
export const progressAPI = {
  getUserProgress: (userId) => api.get(`/api/progress/${userId}`),
  updateProgress: (progressData) => api.post('/api/progress/update', progressData),
  getRecommendations: (userId) => api.get(`/api/recommendations/${userId}`),
};

// Session API
export const sessionAPI = {
  startSession: (sessionData) => api.post('/api/session/start', sessionData),
  endSession: (sessionData) => api.post('/api/session/end', sessionData),
};

// Health check
export const healthAPI = {
  checkHealth: () => api.get('/api/health'),
};

export default api; 