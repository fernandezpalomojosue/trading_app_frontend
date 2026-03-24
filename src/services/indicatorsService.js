import apiClient from './api';
import { handleError } from '../utils/errorHandler';

export const indicatorsService = {
  // Get all indicators (EMA, SMA, RSI, MACD) in a single call
  getAllIndicators: async (symbol, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        window: params.window || 14,
        fast: params.fast || 12,
        slow: params.slow || 26,
        signal: params.signal || 9,
        timespan: params.timespan || 'day',
        limit: params.limit || 100,
        ...(params.start_date && { start_date: params.start_date }),
        ...(params.end_date && { end_date: params.end_date }),
      });

      const response = await apiClient.get(`/indicators/${symbol}?${queryParams}`);
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'indicators');
      throw processedError;
    }
  },
};

export default indicatorsService;
