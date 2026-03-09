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

describe('errorHandler - FastAPI validation errors', () => {
  it('should handle FastAPI email validation error with detail array', () => {
    const error = {
      response: {
        status: 422,
        data: {
          detail: [
            {
              type: "value_error",
              loc: ["body", "email"],
              msg: "value is not a valid email address: The part after the @-sign is not valid. It should have a period.",
              input: "Asdfghjkl0@sdfsd",
              ctx: {
                reason: "The part after the @-sign is not valid. It should have a period."
              }
            }
          ]
        }
      }
    };
    
    const processedError = handleError(error, 'register');
    
    expect(processedError.message).toBe("value is not a valid email address: The part after the @-sign is not valid. It should have a period.");
    expect(processedError.suggestions).toContain('Please enter a valid email address');
    expect(processedError.suggestions).toContain('Email validation: The part after the @-sign is not valid. It should have a period.');
  });

  it('should handle FastAPI required field validation error', () => {
    const error = {
      response: {
        status: 422,
        data: {
          detail: [
            {
              type: "value_error",
              loc: ["body", "email"],
              msg: "field required",
              ctx: {
                reason: "This field cannot be empty"
              }
            }
          ]
        }
      }
    };
    
    const processedError = handleError(error, 'register');
    
    expect(processedError.message).toBe("field required");
    expect(processedError.suggestions).toContain('The email field is required');
  });
});
