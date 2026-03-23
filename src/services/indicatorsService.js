import apiClient from './api';
import { handleError } from '../utils/errorHandler';

export const indicatorsService = {
  // Get EMA (Exponential Moving Average)
  getEMA: async (symbol, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        window: params.window || 14,
        timespan: params.timespan || 'day',
        limit: params.limit || 100,
        ...(params.start_date && { start_date: params.start_date }),
        ...(params.end_date && { end_date: params.end_date }),
      });

      const response = await apiClient.get(`/indicators/${symbol}/ema?${queryParams}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'indicators');
      throw processedError;
    }
  },

  // Get SMA (Simple Moving Average)
  getSMA: async (symbol, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        window: params.window || 14,
        timespan: params.timespan || 'day',
        limit: params.limit || 100,
        ...(params.start_date && { start_date: params.start_date }),
        ...(params.end_date && { end_date: params.end_date }),
      });

      const response = await apiClient.get(`/indicators/${symbol}/sma?${queryParams}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'indicators');
      throw processedError;
    }
  },

  // Get RSI (Relative Strength Index)
  getRSI: async (symbol, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        window: params.window || 14,
        timespan: params.timespan || 'day',
        limit: params.limit || 100,
        ...(params.start_date && { start_date: params.start_date }),
        ...(params.end_date && { end_date: params.end_date }),
      });

      const response = await apiClient.get(`/indicators/${symbol}/rsi?${queryParams}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'indicators');
      throw processedError;
    }
  },

  // Get MACD
  getMACD: async (symbol, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        fast: params.fast || 12,
        slow: params.slow || 26,
        signal: params.signal || 9,
        timespan: params.timespan || 'day',
        limit: params.limit || 100,
        ...(params.start_date && { start_date: params.start_date }),
        ...(params.end_date && { end_date: params.end_date }),
      });

      const response = await apiClient.get(`/indicators/${symbol}/macd?${queryParams}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'indicators');
      throw processedError;
    }
  },
};

export default indicatorsService;
