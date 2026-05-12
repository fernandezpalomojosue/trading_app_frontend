/**
 * Simple error handler that shows backend messages directly
 */

class ErrorHandler {
  constructor() {
  
  }

  /**
   * Process errors and return backend messages directly
   */
  processError(error, context = 'default') {
    const processedError = {
      message: '',
      type: 'error',
      suggestions: []
    };

    // HTTP response errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      // For FastAPI validation errors with detail array, use first error message directly
      if (status === 422 && Array.isArray(errorData?.detail) && errorData.detail.length > 0) {
        const firstError = errorData.detail[0];
        processedError.message = firstError.msg || 'Validation error';
        processedError.suggestions = [];
      } else if (errorData?.message) {
        // Use backend message directly
        processedError.message = errorData.message;
        processedError.suggestions = [];
      } else if (errorData?.detail) {
        // Use backend detail directly if no message
        if (typeof errorData.detail === 'string') {
          processedError.message = errorData.detail;
        } else if (errorData.detail?.message) {
          // Extract message from detail object
          processedError.message = errorData.detail.message;
          processedError.details = errorData.detail; // Keep full object for UI
        } else {
          processedError.message = JSON.stringify(errorData.detail);
        }
        processedError.suggestions = [];
      } else {
        // Default message - only when backend provides nothing
        processedError.message = 'An error occurred. Please try again.';
        processedError.suggestions = [];
      }
    } else {
      // Network/connection errors
      processedError.message = 'Could not connect to server. Please check your internet connection.';
      processedError.suggestions = [];
    }

    return processedError;
  }
}

// Singleton instance
const errorHandler = new ErrorHandler();

/**
 * Process error through errorHandler
 */
export const handleError = (error, context = 'default') => {
  return errorHandler.processError(error, context);
};

export default errorHandler;
