import { describe, it, expect } from 'vitest';
import { handleError } from '../utils/errorHandler.js';

describe('errorHandler - 404 errors', () => {
  it('should handle 404 error in login context with specific message', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Not Found' }
      }
    };
    
    const processedError = handleError(error, 'login');
    
    expect(processedError.message).toBe('Resource not found.');
    expect(processedError.suggestions).toContain('Authentication service is not available');
    expect(processedError.suggestions).toContain('Try again in a few minutes');
  });

  it('should handle 404 error in markets context with specific message', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Market not found' }
      }
    };
    
    const processedError = handleError(error, 'markets');
    
    expect(processedError.message).toBe('Market not found');
    expect(processedError.suggestions).toContain('Check that the search criteria are correct');
  });

  it('should handle 404 error in assets context with specific message', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Asset not found' }
      }
    };
    
    const processedError = handleError(error, 'assetDetails');
    
    expect(processedError.message).toBe('Asset not found');
    expect(processedError.suggestions).toContain('Check that the search criteria are correct');
  });

  it('should handle 404 error in default context with generic message', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Not Found' }
      }
    };
    
    const processedError = handleError(error, 'default');
    
    expect(processedError.message).toBe('Resource not found.');
    expect(processedError.suggestions).toContain('Check the URL or request parameters');
  });
});
