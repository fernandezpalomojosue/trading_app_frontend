import React from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff, Clock } from 'lucide-react';

/**
 * Componente mejorado para mostrar errores con sugerencias accionables
 * Props:
 * - error: Objeto de error procesado por errorHandler
 * - onRetry: Función para reintentar la acción
 * - onDismiss: Función para cerrar el error
 * - showSuggestions: Boolean para mostrar/ocultar sugerencias
 */
const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onDismiss, 
  showSuggestions = true,
  className = '' 
}) => {
  if (!error) return null;

  console.log('ErrorDisplay received error:', error);
  console.log('Error message:', error.message);
  console.log('Error type:', error.type);
  console.log('Error suggestions:', error.suggestions);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <WifiOff className="h-5 w-5 text-red-400" />;
      case 'timeout':
        return <Clock className="h-5 w-5 text-orange-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-400" />;
    }
  };

  const getErrorTypeLabel = () => {
    switch (error.type) {
      case 'network':
        return 'Error de conexión';
      case 'timeout':
        return 'Tiempo de espera agotado';
      case 'validation':
        return 'Error de validación';
      default:
        return 'Error';
    }
  };

  return (
    <div className={`rounded-md bg-red-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {getErrorTypeLabel()}
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {error.message}
              </p>
              
              {showSuggestions && error.suggestions && error.suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-800 mb-2">
                    ¿Qué puedes hacer?
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {error.suggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-red-700">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Botones de acción */}
              <div className="mt-4 flex flex-wrap gap-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reintentar
                  </button>
                )}
                
                {error.type === 'network' && (
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Recargar página
                  </button>
                )}
                
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente simplificado para notificaciones de error (toast-style)
 */
export const ErrorToast = ({ error, onDismiss, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <div className="rounded-md bg-red-50 p-4 shadow-lg border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-red-800">
              {error.message}
            </p>
          </div>
          {onDismiss && (
            <div className="ml-auto pl-3">
              <button
                onClick={onDismiss}
                className="inline-flex text-red-400 hover:text-red-600 focus:outline-none"
              >
                <span className="sr-only">Cerrar</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Hook personalizado para manejar errores con estado
 */
export const useError = () => {
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleError = (error) => {
    setError(error);
    setIsLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  const executeWithErrorHandling = async (asyncFunction, ...args) => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await asyncFunction(...args);
      setIsLoading(false);
      return result;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  return {
    error,
    isLoading,
    setError,
    clearError,
    handleError,
    executeWithErrorHandling
  };
};

export default ErrorDisplay;
