import axios from 'axios';

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
    const response = await apiClient.get('/markets');
    return response.data;
  },

  getMarketOverview: async (marketType = 'stocks') => {
    const response = await apiClient.get(`/markets/${marketType}/overview`);
    return response.data;
  },

  getAssets: async (marketType = 'stocks', limit = 50, offset = 0) => {
    const response = await apiClient.get(`/markets/${marketType}/assets`, {
      params: { limit, offset }
    });
    return response.data;
  },

  getAssetDetails: async (symbol) => {
    const response = await apiClient.get(`/markets/assets/${symbol}`);
    return response.data;
  },

  getCandles: async (symbol, timespan = 'day', multiplier = 1, limit = 100, startDate = null, endDate = null) => {
    const params = { timespan, multiplier, limit };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await apiClient.get(`/markets/${symbol}/candles`, {
      params
    });
    return response.data;
  },
};

export default apiClient;
