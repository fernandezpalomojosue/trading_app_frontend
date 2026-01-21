import apiClient from './api';

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
      let message = 'Error al iniciar sesión';
      
      if (error.response?.status === 401) {
        message = 'Credenciales incorrectas';
      } else if (error.response?.status === 422) {
        const errorData = error.response.data;
        if (errorData && typeof errorData === 'object' && errorData.errors) {
          const errors = errorData.errors;
          const errorMessages = Object.values(errors).flat();
          message = errorMessages.join(', ') || 'Datos inválidos';
        } else {
          message = errorData?.message || 'Datos inválidos';
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      throw new Error(message);
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
      let message = 'Error al crear cuenta';
      
      if (error.response?.status === 422) {
        const errorData = error.response.data;
        if (errorData && typeof errorData === 'object' && errorData.errors) {
          const errors = errorData.errors;
          const errorMessages = Object.values(errors).flat();
          message = errorMessages.join(', ') || 'Datos inválidos';
        } else {
          message = errorData?.message || 'Datos inválidos';
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      throw new Error(message);
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      throw new Error('Token inválido');
    }
  },

  };

export default authService;
