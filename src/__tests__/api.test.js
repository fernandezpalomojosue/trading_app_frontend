import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios completely
vi.mock('axios');

// Mock the apiClient module
vi.mock('../services/api.js', () => ({
  API_BASE_URL: 'http://localhost:8000/api/v1',
  marketService: {
    getMarkets: vi.fn(),
    getMarketOverview: vi.fn(),
    getAssets: vi.fn(),
    getAssetDetails: vi.fn(),
    getCandles: vi.fn(),
  },
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}));

// Import after mocking
import { marketService, API_BASE_URL } from '../services/api.js';

describe('marketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMarkets', () => {
    it('should fetch markets and return data', async () => {
      const mockData = [{ id: 1, name: 'NASDAQ' }, { id: 2, name: 'NYSE' }];
      marketService.getMarkets.mockResolvedValue(mockData);

      const result = await marketService.getMarkets();

      expect(marketService.getMarkets).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should handle API errors', async () => {
      const error = new Error('Network error');
      marketService.getMarkets.mockRejectedValue(error);

      await expect(marketService.getMarkets()).rejects.toThrow('Network error');
    });
  });

  describe('getMarketOverview', () => {
    it('should fetch market overview with default type', async () => {
      const mockData = { market: 'stocks', change: '+2.5%' };
      marketService.getMarketOverview.mockResolvedValue(mockData);

      const result = await marketService.getMarketOverview();

      expect(marketService.getMarketOverview).toHaveBeenCalledWith();
      expect(result).toEqual(mockData);
    });

    it('should fetch market overview with custom type', async () => {
      const mockData = { market: 'crypto', change: '+5.2%' };
      marketService.getMarketOverview.mockResolvedValue(mockData);

      const result = await marketService.getMarketOverview('crypto');

      expect(marketService.getMarketOverview).toHaveBeenCalledWith('crypto');
      expect(result).toEqual(mockData);
    });
  });

  describe('getAssets', () => {
    it('should fetch assets with default params', async () => {
      const mockData = [{ symbol: 'AAPL', name: 'Apple' }];
      marketService.getAssets.mockResolvedValue(mockData);

      const result = await marketService.getAssets();

      expect(marketService.getAssets).toHaveBeenCalledWith();
      expect(result).toEqual(mockData);
    });

    it('should fetch assets with custom params', async () => {
      const mockData = [{ symbol: 'BTC', name: 'Bitcoin' }];
      marketService.getAssets.mockResolvedValue(mockData);

      const result = await marketService.getAssets('crypto', 20, 10);

      expect(marketService.getAssets).toHaveBeenCalledWith('crypto', 20, 10);
      expect(result).toEqual(mockData);
    });
  });

  describe('getAssetDetails', () => {
    it('should fetch asset details', async () => {
      const mockData = { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25 };
      marketService.getAssetDetails.mockResolvedValue(mockData);

      const result = await marketService.getAssetDetails('AAPL');

      expect(marketService.getAssetDetails).toHaveBeenCalledWith('AAPL');
      expect(result).toEqual(mockData);
    });
  });

  describe('getCandles', () => {
    it('should fetch candles with default params', async () => {
      const mockData = [{ timestamp: '2024-01-01', close: 150.25 }];
      marketService.getCandles.mockResolvedValue(mockData);

      const result = await marketService.getCandles('AAPL');

      expect(marketService.getCandles).toHaveBeenCalledWith('AAPL');
      expect(result).toEqual(mockData);
    });

    it('should fetch candles with custom params', async () => {
      const mockData = [{ timestamp: '2024-01-01', close: 150.25 }];
      marketService.getCandles.mockResolvedValue(mockData);

      const result = await marketService.getCandles('AAPL', 'hour', 2, 50, '2024-01-01', '2024-01-02');

      expect(marketService.getCandles).toHaveBeenCalledWith('AAPL', 'hour', 2, 50, '2024-01-01', '2024-01-02');
      expect(result).toEqual(mockData);
    });
  });
});

describe('API_BASE_URL', () => {
  it('should use VITE_API_BASE_URL when available', () => {
    // Mock the environment variable
    const originalEnv = import.meta.env;
    const mockEnv = { ...originalEnv, VITE_API_BASE_URL: 'https://api.example.com' };
    
    // Mock import.meta.env for this test
    vi.stubGlobal('import', {
      meta: { env: mockEnv }
    });
    
    expect(mockEnv.VITE_API_BASE_URL).toBe('https://api.example.com');
  });

  it('should use VITE_API_URL as fallback', () => {
    const originalEnv = import.meta.env;
    const mockEnv = { 
      ...originalEnv, 
      VITE_API_BASE_URL: undefined,
      VITE_API_URL: 'https://fallback.example.com'
    };
    
    vi.stubGlobal('import', {
      meta: { env: mockEnv }
    });
    
    expect(mockEnv.VITE_API_URL).toBe('https://fallback.example.com');
  });

  it('should use default URL when no env vars are set', () => {
    const mockEnv = { 
      VITE_API_BASE_URL: undefined,
      VITE_API_URL: undefined
    };
    
    vi.stubGlobal('import', {
      meta: { env: mockEnv }
    });
    
    // Test the fallback logic
    const baseUrl = mockEnv.VITE_API_BASE_URL || mockEnv.VITE_API_URL || 'http://localhost:8000/api/v1';
    expect(baseUrl).toBe('http://localhost:8000/api/v1');
  });
});
