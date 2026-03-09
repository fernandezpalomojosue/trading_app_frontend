/**
 * Utilidad centralizada para manejo de errores con mensajes claros para el usuario
 */

class ErrorHandler {
  constructor() {
    this.errorMessages = {
      // Authentication errors
      401: {
        default: 'Your session has expired. Please log in again.',
        login: 'Incorrect email or password. Please verify your credentials and try again.',
        register: 'Could not create your account. Please try again later.',
        token: 'Your session is invalid. Please log in again to continue.'
      },
      
      // Resource not found errors
      404: {
        default: 'The requested resource does not exist. Please check the URL or contact support.',
        login: 'Login service is unavailable. Please try again later.',
        register: 'Registration service is unavailable. Please try again later.',
        token: 'Verification service is unavailable. Please try again later.',
        markets: 'Market data is not available at this time.',
        assets: 'No assets found with the specified criteria.',
        assetDetails: 'The requested asset does not exist or is not available.',
        candles: 'No candle data available for this asset in the selected period.'
      },
      
      // Permission errors
      403: {
        default: 'You do not have permission to perform this action.',
        login: 'Access denied. Please verify your credentials.',
        register: 'Registration is not allowed at this time.',
        markets: 'You do not have access to this market data.',
        assets: 'You do not have permission to view these assets.'
      },
      
      // Validation errors
      422: {
        default: 'The provided data is invalid. Please review the information and try again.',
        email: 'The email is already registered or is invalid.',
        password: 'The password must meet security requirements.',
        credentials: 'The provided credentials are incorrect.'
      },
      
      // Rate limit errors
      429: {
        default: 'You have made too many requests. Please wait a few minutes before trying again.',
        login: 'Too many login attempts. Please wait a few minutes before trying again.',
        register: 'Too many registration attempts. Please wait a few minutes before trying again.'
      },
      
      // Server errors
      500: {
        default: 'The server is experiencing problems. Please try again in a few minutes.',
        database: 'Your changes could not be saved. Please try again later.'
      },
      
      // Service unavailable
      503: {
        default: 'The service is temporarily unavailable. Please try again in a few minutes.',
        login: 'Authentication service is unavailable. Please try again later.',
        register: 'Registration service is unavailable. Please try again later.',
        markets: 'Market data is temporarily unavailable.'
      },
      
      // Network errors
      network: {
        default: 'Could not connect to the server. Please check your internet connection.',
        timeout: 'The connection took too long. Please try again.',
        offline: 'It seems you have no internet connection.'
      },
      
      // General errors
      default: 'An unexpected error occurred. Please try again.'
    };
  }

  /**
   * Procesa un error y devuelve un mensaje amigable para el usuario
   * @param {Error} error - El error original
   * @param {string} context - Contexto donde ocurrió el error (login, register, etc.)
   * @returns {Object} Objeto con mensaje, tipo y sugerencias
   */
  processError(error, context = 'default') {
    const processedError = {
      message: '',
      type: 'error',
      suggestions: [],
      technical: error.message || 'Error desconocido'
    };

    // Network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      processedError.message = this.errorMessages.network.default;
      processedError.type = 'network';
      processedError.suggestions = [
        'Check your internet connection',
        'Try reloading the page',
        'If the problem persists, contact technical support'
      ];
      return processedError;
    }

    // Timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      processedError.message = this.errorMessages.network.timeout;
      processedError.type = 'timeout';
      processedError.suggestions = [
        'Check your internet connection',
        'Try again',
        'If the problem continues, try again later'
      ];
      return processedError;
    }

    // Errores de respuesta HTTP
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      // For FastAPI validation errors with detail array, use the first error message directly
      if (status === 422 && Array.isArray(errorData?.detail) && errorData.detail.length > 0) {
        const firstError = errorData.detail[0];
        processedError.message = firstError.msg || 'Validation error';
        processedError.suggestions = [];
      } else if (errorData?.message) {
        // Use backend message directly
        processedError.message = errorData.message;
        processedError.suggestions = [];
      } else {
        // Default message
        processedError.message = 'An error occurred. Please try again.';
        processedError.suggestions = [];
      }
    } else {
      // Errores sin respuesta del servidor
      processedError.message = 'Could not connect to the server. Please check your internet connection.';
      processedError.suggestions = [];
    }

    return processedError;
  }

  /**
   * Formatea mensajes del backend para que sean más amigables
   */
  formatBackendMessage(message) {
    // Technical messages that need formatting (keep in English)
    const messageMap = {
      'Invalid credentials': 'Incorrect email or password. Please verify your credentials and try again.',
      'User already exists': 'User already exists.',
      'Email already exists': 'Email already exists.',
      'Email already registered': 'Email already registered.',
      'Invalid email format': 'Invalid email format.',
      'Password too weak': 'Password too weak. Must contain uppercase, lowercase and numbers.',
      'Password must be at least 8 characters': 'Password must be at least 8 characters.',
      'Field is required': 'This field is required.',
      'Not Found': 'Resource not found.',
      'Access denied': 'Access denied.',
      'Unauthorized': 'Unauthorized.',
      'Token expired': 'Your session has expired.',
      'Invalid token': 'Invalid token.',
      'Too many requests': 'Too many requests.',
      'Server error': 'Server error.',
      'Database error': 'Database error.',
      'Network error': 'Network error.',
      'Connection timeout': 'Connection timeout.'
    };
    
    return messageMap[message] || message;
  }

  /**
   * Obtiene mensaje de error según el código HTTP y contexto
   */
  getHttpErrorMessage(status, context) {
    const statusErrors = this.errorMessages[status];
    if (statusErrors) {
      return statusErrors[context] || statusErrors.default;
    }
    
    // Mensajes por rango de estado
    if (status >= 400 && status < 500) {
      return 'La solicitud no es válida. Revisa los datos e intenta de nuevo.';
    } else if (status >= 500) {
      return 'El servidor está experimentando problemas. Intenta de nuevo en unos minutos.';
    }
    
    return this.errorMessages.default;
  }

  /**
   * Generate specific suggestions for FastAPI validation errors
   */
  generateFastAPISuggestions(error, fieldName) {
    const suggestions = [];
    
    if (error.type === 'value_error') {
      if (error.msg.includes('email')) {
        suggestions.push('Please enter a valid email address');
        if (error.ctx?.reason) {
          suggestions.push(`Email validation: ${error.ctx.reason}`);
        }
      } else if (error.msg.includes('password')) {
        suggestions.push('Please enter a valid password');
      } else if (error.msg.includes('required')) {
        suggestions.push(`The ${fieldName} field is required`);
      } else {
        // Use the original message for other validation errors
        suggestions.push(error.msg);
      }
    }
    
    return suggestions.length > 0 ? suggestions : ['Please check your input and try again'];
  }

  /**
   * Extrae sugerencias de errores de validación de FastAPI
   */
  extractFastAPIValidationSuggestions(detail) {
    const suggestions = [];
    
    detail.forEach(error => {
      if (error.type === 'value_error') {
        if (error.msg.includes('email')) {
          suggestions.push('Please enter a valid email address');
          if (error.ctx?.reason) {
            suggestions.push(`Email validation: ${error.ctx.reason}`);
          }
        } else if (error.msg.includes('password')) {
          suggestions.push('Please enter a valid password');
        } else if (error.msg.includes('required')) {
          const fieldName = error.loc?.[1] || 'field';
          suggestions.push(`The ${fieldName} field is required`);
        } else {
          // Use the original message for other validation errors
          suggestions.push(error.msg);
        }
      }
    });
    
    return suggestions.length > 0 ? suggestions : ['Please check your input and try again'];
  }

  /**
   * Extrae sugerencias de errores de validación
   */
  extractValidationSuggestions(errors) {
    const suggestions = [];
    
    Object.entries(errors).forEach(([field, messages]) => {
      const fieldMessages = Array.isArray(messages) ? messages : [messages];
      fieldMessages.forEach(msg => {
        suggestions.push(this.formatValidationMessage(field, msg));
      });
    });
    
    return suggestions.length > 0 ? suggestions : ['Review all fields and try again.'];
  }

  /**
   * Formatea mensajes de validación específicos
   */
  formatValidationMessage(field, message) {
    const fieldNames = {
      email: 'email',
      password: 'password',
      name: 'name',
      username: 'username'
    };

    const fieldName = fieldNames[field] || field;
    
    // Common validation messages
    if (message.includes('required')) {
      return `The "${fieldName}" field is required.`;
    }
    
    if (message.includes('email')) {
      return `The ${fieldName} is not in a valid format.`;
    }
    
    if (message.includes('password') && message.includes('weak')) {
      return `The password must contain uppercase, lowercase and numbers.`;
    }
    
    if (message.includes('password') && message.includes('length')) {
      return `The password must be at least 8 characters long.`;
    }
    
    // Return original message if no specific format is found
    return message;
  }

  /**
   * Obtiene sugerencias generales según el tipo de error
   */
  getGeneralSuggestions(status, context) {
    const suggestions = [];
    
    if (status === 401) {
      if (context === 'login') {
        suggestions.push('Verify that your email and password are correct');
        suggestions.push('Make sure your account is not locked');
      } else {
        suggestions.push('Please log in again to continue');
      }
    } else if (status === 403) {
      suggestions.push('Verify that you have the necessary permissions');
      suggestions.push('Contact the administrator if you believe this is an error');
    } else if (status === 404) {
      if (context === 'login' || context === 'register' || context === 'token') {
        suggestions.push('Authentication service is not available');
        suggestions.push('Try again in a few minutes');
        suggestions.push('If the problem persists, contact technical support');
      } else if (context === 'markets' || context === 'assets' || context === 'assetDetails' || context === 'candles') {
        suggestions.push('Check that the search criteria are correct');
        suggestions.push('Try with other search parameters');
      } else {
        suggestions.push('Check the URL or request parameters');
        suggestions.push('The requested resource may not exist');
      }
    } else if (status === 422) {
      suggestions.push('Make sure all fields are complete');
      suggestions.push('Check the format of the entered data');
    } else if (status === 429) {
      suggestions.push('Please wait a few minutes before trying again');
      suggestions.push('You have exceeded the allowed request limit');
    } else if (status === 500) {
      suggestions.push('Please wait a few minutes and try again');
      suggestions.push('If the problem persists, contact technical support');
    } else if (status === 503) {
      suggestions.push('The service is temporarily under maintenance');
      suggestions.push('Please try again in a few minutes');
      suggestions.push('Check service status on the status page');
    } else {
      suggestions.push('Try reloading the page');
      suggestions.push('Check your internet connection');
    }
    
    return suggestions;
  }

  /**
   * Crea un objeto Error con información procesada
   */
  createError(originalError, context = 'default') {
    const processed = this.processError(originalError, context);
    const error = new Error(processed.message);
    error.type = processed.type;
    error.suggestions = processed.suggestions;
    error.technical = processed.technical;
    error.context = context;
    return error;
  }
}

// Instancia singleton
export const errorHandler = new ErrorHandler();

// Función de conveniencia para usar en componentes y servicios
export const handleError = (error, context = 'default') => {
  return errorHandler.createError(error, context);
};

export default errorHandler;
