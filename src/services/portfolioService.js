import apiClient from './api';
import { handleError } from '../utils/errorHandler';

export const portfolioService = {
  // Get portfolio summary (total value, cash balance, P&L)
  getPortfolioSummary: async () => {
    try {
      console.log('DEBUG: portfolioService.getPortfolioSummary - calling API...');
      const response = await apiClient.get('/portfolio/summary');
      console.log('DEBUG: portfolioService.getPortfolioSummary - response:', response.data);
      return response.data;
    } catch (error) {
      console.log('DEBUG: portfolioService.getPortfolioSummary - error:', error);
      const processedError = handleError(error, 'portfolio');
      throw processedError;
    }
  },

  // Get current holdings
  getHoldings: async () => {
    try {
      console.log('DEBUG: portfolioService.getHoldings - calling API...');
      const response = await apiClient.get('/portfolio/holdings');
      console.log('DEBUG: portfolioService.getHoldings - response:', response.data);
      return response.data;
    } catch (error) {
      console.log('DEBUG: portfolioService.getHoldings - error:', error);
      const processedError = handleError(error, 'portfolio');
      throw processedError;
    }
  },

  // Get transaction history
  getTransactions: async () => {
    try {
      console.log('DEBUG: portfolioService.getTransactions - calling API...');
      const response = await apiClient.get('/portfolio/transactions');
      console.log('DEBUG: portfolioService.getTransactions - response:', response.data);
      return response.data;
    } catch (error) {
      console.log('DEBUG: portfolioService.getTransactions - error:', error);
      const processedError = handleError(error, 'portfolio');
      throw processedError;
    }
  }
};
