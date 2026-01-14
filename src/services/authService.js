import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token a las peticiones
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

// Interceptor para manejar errores de autenticación
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
        const errors = error.response.data.errors || {};
        const errorMessages = Object.values(errors).flat();
        message = errorMessages.join(', ') || 'Datos inválidos';
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
        const errors = error.response.data.errors || {};
        const errorMessages = Object.values(errors).flat();
        message = errorMessages.join(', ') || 'Datos inválidos';
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

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Silenciar error de logout
    } finally {
      localStorage.removeItem('token');
    }
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al obtener perfil';
      throw new Error(message);
    }
  },

  // Actualizar perfil
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar perfil';
      throw new Error(message);
    }
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/password', passwordData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cambiar contraseña';
      throw new Error(message);
    }
  }
};

export default api;
