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
    
    expect(processedError.message).toBe('Not Found');
    expect(processedError.suggestions).toEqual([]);
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
    expect(processedError.suggestions).toEqual([]);
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
    expect(processedError.suggestions).toEqual([]);
  });

  it('should handle 404 error in default context with generic message', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Not Found' }
      }
    };
    
    const processedError = handleError(error, 'default');
    
    expect(processedError.message).toBe('Not Found');
    expect(processedError.suggestions).toEqual([]);
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
    expect(processedError.suggestions).toEqual([]);
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
    expect(processedError.suggestions).toEqual([]);
  });
});
