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
};

export default apiClient;
