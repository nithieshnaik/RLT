// src/services/api.js
import axios from 'axios';

// Create an axios instance with the base URL pointing to your backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust port if your backend runs on a different port
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User authentication services
export const userService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Server error');
    }
  },
  
  register: async (name, email, password) => {
    try {
      const response = await api.post('/users', { name, email, password });
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Server error');
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Server error');
    }
  },
  
  logout: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  }
};

export default api;