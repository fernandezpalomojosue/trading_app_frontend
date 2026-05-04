import apiClient from './api';
import { handleError } from '../utils/errorHandler';

export const portfolioService = {
  // Get portfolio summary (total value, cash balance, P&L)
  getPortfolioSummary: async () => {
    try {
      const response = await apiClient.get('/portfolio/summary');
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'portfolio');
      throw processedError;
    }
  },

  // Get current holdings
  getHoldings: async () => {
    try {
      const response = await apiClient.get('/portfolio/holdings');
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'portfolio');
      throw processedError;
    }
  },

  // Get transaction history
  getTransactions: async () => {
    try {
      const response = await apiClient.get('/portfolio/transactions');
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'portfolio');
      throw processedError;
    }
  },

  // Buy stocks (market order)
  buyStock: async (symbol, quantity, price) => {
    try {
      const response = await apiClient.post('/portfolio/buy', {
        symbol: symbol,
        quantity: quantity,
        price: price
      });
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'portfolio');
      throw processedError;
    }
  },

  // Sell stocks (market order)
  sellStock: async (symbol, quantity, price) => {
    try {
      const response = await apiClient.post('/portfolio/sell', {
        symbol: symbol,
        quantity: quantity,
        price: price
      });
      return response.data;
    } catch (error) {
      const processedError = handleError(error, 'portfolio');
      throw processedError;
    }
  }
};