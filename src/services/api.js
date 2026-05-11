import axios from 'axios';
import { handleError } from '../utils/errorHandler';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      localStorage.removeItem('token');
      if (token) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    // Let individual services handle error processing
    return Promise.reject(error);
  }
);

export const marketService = {
  getMarkets: async () => {
    try {
      const response = await apiClient.get('/markets');
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'markets');
      throw processedError;
    }
  },

  getMarketOverview: async (marketType = 'stocks') => {
    try {
      const response = await apiClient.get(`/markets/${marketType}/overview`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'marketOverview');
      throw processedError;
    }
  },

  getAssets: async (marketType = 'stocks', limit = 50, offset = 0) => {
    try {
      const response = await apiClient.get(`/markets/${marketType}/assets`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'assets');
      throw processedError;
    }
  },

  getAssetDetails: async (symbol) => {
    try {
      const response = await apiClient.get(`/markets/assets/${symbol}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'assetDetails');
      throw processedError;
    }
  },

  getCandles: async (symbol, timespan = 'day', multiplier = 1, limit = 100, startDate = null, endDate = null) => {
    try {
      const params = { timespan, multiplier, limit };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await apiClient.get(`/markets/${symbol}/candles`, {
        params
      });
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'candles');
      throw processedError;
    }
  },

  getSignal: async (symbol) => {
    try {
      const response = await apiClient.get(`/signals/${symbol}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'signal');
      throw processedError;
    }
  },
};

export const favoritesService = {
  getFavorites: async () => {
    try {
      const response = await apiClient.get('/markets/favorites');
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'favorites');
      throw processedError;
    }
  },

  addFavorite: async (symbol) => {
    try {
      const response = await apiClient.post(`/markets/favorites/${symbol}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'addFavorite');
      throw processedError;
    }
  },

  removeFavorite: async (symbol) => {
    try {
      const response = await apiClient.delete(`/markets/favorites/${symbol}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'removeFavorite');
      throw processedError;
    }
  },
};

export const aiStrategiesService = {
  generateStrategy: async (prompt) => {
    try {
      const response = await apiClient.post('/ai-strategies/generate', { prompt });
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'generateStrategy');
      throw processedError;
    }
  },
};

export const strategyService = {
  getUserStrategies: async (params = {}) => {
    try {
      const { skip = 0, limit = 50, active_only } = params;
      const queryParams = new URLSearchParams();
      if (skip) queryParams.append('skip', skip);
      if (limit) queryParams.append('limit', limit);
      if (active_only !== undefined) queryParams.append('active_only', active_only);

      const queryString = queryParams.toString();
      const url = queryString ? `/strategies/user_list?${queryString}` : '/strategies/user_list';

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'getUserStrategies');
      throw processedError;
    }
  },

  getStrategyById: async (id) => {
    try {
      const response = await apiClient.get(`/strategies/${id}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'getStrategyById');
      throw processedError;
    }
  },

  updateStrategy: async (id, data) => {
    try {
      const response = await apiClient.put(`/strategies/${id}`, data);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'updateStrategy');
      throw processedError;
    }
  },
};

export const executionPlansService = {
  getAllPlans: async () => {
    try {
      const response = await apiClient.get('/execution-plans');
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'getAllPlans');
      throw processedError;
    }
  },

  getPlanById: async (id) => {
    try {
      const response = await apiClient.get(`/execution-plans/${id}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'getPlanById');
      throw processedError;
    }
  },

  createPlan: async (data) => {
    try {
      const response = await apiClient.post('/execution-plans', data);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'createPlan');
      throw processedError;
    }
  },

  updatePlan: async (id, data) => {
    try {
      const response = await apiClient.patch(`/execution-plans/${id}`, data);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'updatePlan');
      throw processedError;
    }
  },

  deletePlan: async (id) => {
    try {
      await apiClient.delete(`/execution-plans/${id}`);
      return true;
    } catch (error) {
      const processedError = handleError(error, 'deletePlan');
      throw processedError;
    }
  },
};

export default apiClient;
