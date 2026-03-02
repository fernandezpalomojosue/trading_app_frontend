/**
 * Utilidad centralizada para manejo de errores con mensajes claros para el usuario
 */

class ErrorHandler {
  constructor() {
    this.errorMessages = {
      // Errores de autenticación
      401: {
        default: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        login: 'Correo electrónico o contraseña incorrectos. Verifica tus datos e intenta de nuevo.',
        register: 'No se pudo crear tu cuenta. Por favor, intenta más tarde.',
        token: 'Tu sesión no es válida. Inicia sesión nuevamente para continuar.'
      },
      
      // Errores de validación
      422: {
        default: 'Los datos proporcionados no son válidos. Revisa la información e intenta de nuevo.',
        email: 'El correo electrónico ya está registrado o no es válido.',
        password: 'La contraseña debe cumplir con los requisitos de seguridad.',
        credentials: 'Las credenciales proporcionadas son incorrectas.'
      },
      
      // Errores del servidor
      500: {
        default: 'El servidor está experimentando problemas. Intenta de nuevo en unos minutos.',
        database: 'No se pudieron guardar tus cambios. Intenta de nuevo más tarde.'
      },
      
      // Errores de red
      network: {
        default: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        timeout: 'La conexión tardó demasiado. Intenta de nuevo.',
        offline: 'Parece que no tienes conexión a internet.'
      },
      
      // Errores generales
      default: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
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

    // Errores de red
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      processedError.message = this.errorMessages.network.default;
      processedError.type = 'network';
      processedError.suggestions = [
        'Verifica tu conexión a internet',
        'Intenta recargar la página',
        'Si el problema persiste, contacta soporte técnico'
      ];
      return processedError;
    }

    // Timeout
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      processedError.message = this.errorMessages.network.timeout;
      processedError.type = 'timeout';
      processedError.suggestions = [
        'Verifica tu conexión a internet',
        'Intenta de nuevo',
        'Si el problema continúa, intenta más tarde'
      ];
      return processedError;
    }

    // Errores de respuesta HTTP
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      // Mensajes específicos del backend
      if (errorData?.message) {
        processedError.message = this.formatBackendMessage(errorData.message);
      } else {
        processedError.message = this.getHttpErrorMessage(status, context);
      }

      // Errores de validación con detalles
      if (status === 422 && errorData?.errors) {
        processedError.suggestions = this.extractValidationSuggestions(errorData.errors);
      } else {
        processedError.suggestions = this.getGeneralSuggestions(status, context);
      }
    } else {
      // Errores sin respuesta del servidor
      processedError.message = this.errorMessages.default;
      processedError.suggestions = [
        'Intenta recargar la página',
        'Verifica tu conexión a internet',
        'Si el problema persiste, contacta soporte técnico'
      ];
    }

    return processedError;
  }

  /**
   * Formatea mensajes del backend para que sean más amigables
   */
  formatBackendMessage(message) {
    // Convertir mensajes técnicos a amigables
    const messageMap = {
      'Invalid credentials': 'Las credenciales proporcionadas son incorrectas.',
      'User already exists': 'Ya existe una cuenta con este correo electrónico.',
      'Email already registered': 'Este correo electrónico ya está registrado.',
      'Invalid email format': 'El formato del correo electrónico no es válido.',
      'Password too weak': 'La contraseña es muy débil. Debe contener mayúsculas, minúsculas y números.',
      'Token expired': 'Tu sesión ha expirado. Inicia sesión nuevamente.',
      'Invalid token': 'Tu sesión no es válida. Inicia sesión nuevamente.'
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
    
    return suggestions.length > 0 ? suggestions : ['Revisa todos los campos e intenta de nuevo.'];
  }

  /**
   * Formatea mensajes de validación específicos
   */
  formatValidationMessage(field, message) {
    const fieldNames = {
      email: 'correo electrónico',
      password: 'contraseña',
      name: 'nombre',
      username: 'nombre de usuario'
    };

    const fieldName = fieldNames[field] || field;
    
    // Mensajes comunes de validación
    if (message.includes('required')) {
      return `El campo "${fieldName}" es obligatorio.`;
    }
    
    if (message.includes('email')) {
      return `El ${fieldName} no tiene un formato válido.`;
    }
    
    if (message.includes('password') && message.includes('weak')) {
      return `La contraseña debe contener mayúsculas, minúsculas y números.`;
    }
    
    if (message.includes('min') && message.includes('length')) {
      return `El ${fieldName} es demasiado corto.`;
    }
    
    return message;
  }

  /**
   * Obtiene sugerencias generales según el tipo de error
   */
  getGeneralSuggestions(status, context) {
    const suggestions = [];
    
    if (status === 401) {
      if (context === 'login') {
        suggestions.push('Verifica que tu correo y contraseña sean correctos');
        suggestions.push('Asegúrate de no tener bloqueada la cuenta');
      } else {
        suggestions.push('Inicia sesión nuevamente para continuar');
      }
    } else if (status === 422) {
      suggestions.push('Revisa que todos los campos estén completos');
      suggestions.push('Verifica el formato de los datos ingresados');
    } else if (status >= 500) {
      suggestions.push('Espera unos minutos e intenta de nuevo');
      suggestions.push('Si el problema persiste, contacta soporte técnico');
    } else {
      suggestions.push('Intenta recargar la página');
      suggestions.push('Verifica tu conexión a internet');
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
