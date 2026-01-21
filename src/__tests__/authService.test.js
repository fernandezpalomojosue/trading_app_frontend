import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock the apiClient module
vi.mock('../services/api.js', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

// Import after mocking
import { authService } from '../services/authService.js';
import apiClient from '../services/api.js';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock-token-123',
          user: { id: 1, email: 'test@example.com' }
        }
      };
      apiClient.post.mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'password123' };
      const result = await authService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/auth/login',
        expect.any(URLSearchParams),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      expect(localStorage.getItem('token')).toBe('mock-token-123');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle 401 error with correct message', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      };
      apiClient.post.mockRejectedValue(error);

      const credentials = { email: 'test@example.com', password: 'wrong' };
      
      await expect(authService.login(credentials)).rejects.toThrow('Credenciales incorrectas');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle 422 error with validation details', async () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ['Email is required'],
              password: ['Password must be at least 8 characters']
            }
          }
        }
      };
      apiClient.post.mockRejectedValue(error);

      const credentials = { email: '', password: '123' };
      
      await expect(authService.login(credentials)).rejects.toThrow('Email is required, Password must be at least 8 characters');
    });

    it('should handle generic error message', async () => {
      const error = {
        response: {
          data: { message: 'Server error' }
        }
      };
      apiClient.post.mockRejectedValue(error);

      await expect(authService.login({ email: 'test@example.com', password: 'password' }))
        .rejects.toThrow('Server error');
    });

    it('should handle network error', async () => {
      const error = new Error('Network error');
      apiClient.post.mockRejectedValue(error);

      await expect(authService.login({ email: 'test@example.com', password: 'password' }))
        .rejects.toThrow('Error al iniciar sesión');
    });
  });

  describe('register', () => {
    it('should register successfully and store token', async () => {
      const mockResponse = {
        data: {
          access_token: 'mock-token-456',
          user: { id: 2, email: 'new@example.com' }
        }
      };
      apiClient.post.mockResolvedValue(mockResponse);

      const userData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      };
      const result = await authService.register(userData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(localStorage.getItem('token')).toBe('mock-token-456');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle 422 error with validation details', async () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ['Email already exists'],
              password: ['Password too weak']
            }
          }
        }
      };
      apiClient.post.mockRejectedValue(error);

      const userData = { email: 'existing@example.com', password: 'weak' };
      
      await expect(authService.register(userData)).rejects.toThrow('Email already exists, Password too weak');
    });

    it('should handle generic registration error', async () => {
      const error = {
        response: {
          data: { message: 'Registration failed' }
        }
      };
      apiClient.post.mockRejectedValue(error);

      await expect(authService.register({ email: 'test@example.com', password: 'password' }))
        .rejects.toThrow('Registration failed');
    });

    it('should handle network error during registration', async () => {
      const error = new Error('Network error');
      apiClient.post.mockRejectedValue(error);

      await expect(authService.register({ email: 'test@example.com', password: 'password' }))
        .rejects.toThrow('Error al crear cuenta');
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const mockResponse = {
        data: { id: 1, email: 'test@example.com', verified: true }
      };
      apiClient.get.mockResolvedValue(mockResponse);
      
      localStorage.setItem('token', 'valid-token');

      const result = await authService.verifyToken();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle invalid token and remove it', async () => {
      const error = {
        response: { status: 401 }
      };
      apiClient.get.mockRejectedValue(error);
      
      localStorage.setItem('token', 'invalid-token');

      await expect(authService.verifyToken()).rejects.toThrow('Token inválido');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle network error during token verification', async () => {
      const error = new Error('Network error');
      apiClient.get.mockRejectedValue(error);
      
      localStorage.setItem('token', 'some-token');

      await expect(authService.verifyToken()).rejects.toThrow('Token inválido');
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
