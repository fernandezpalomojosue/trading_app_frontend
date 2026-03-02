import apiClient from './api';
import { handleError } from '../utils/errorHandler';

const api = apiClient;

export const authService = {
  // Login de usuario
  login: async (credentials) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'login');
      throw processedError;
    }
  },

  // Registro de usuario
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'register');
      throw processedError;
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      const processedError = handleError(error, 'token');
      throw processedError;
    }
  },

  };

export default authService;
