import React, { useState } from 'react';
import ErrorDisplay from '../components/ErrorDisplay.jsx';
import { handleError } from '../utils/errorHandler.js';

const ErrorTestPage = () => {
  const [error, setError] = useState(null);

  const test404Error = () => {
    const mockError = {
      response: {
        status: 404,
        data: { message: 'Not Found' }
      }
    };
    
    const processedError = handleError(mockError, 'login');
    setError(processedError);
  };

  const test401Error = () => {
    const mockError = {
      response: {
        status: 401,
        data: { message: 'Invalid credentials' }
      }
    };
    
    const processedError = handleError(mockError, 'login');
    setError(processedError);
  };

  const testNetworkError = () => {
    const mockError = new Error('Network Error');
    mockError.code = 'NETWORK_ERROR';
    
    const processedError = handleError(mockError, 'login');
    setError(processedError);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Prueba de Manejo de Errores</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={test404Error}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Probar Error 404 (Login no disponible)
          </button>
          
          <button
            onClick={test401Error}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Probar Error 401 (Credenciales incorrectas)
          </button>
          
          <button
            onClick={testNetworkError}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Probar Error de Red
          </button>
          
          <button
            onClick={clearError}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Limpiar Error
          </button>
        </div>

        {error && (
          <ErrorDisplay 
            error={error} 
            onDismiss={clearError}
            onRetry={() => console.log('Retry clicked')}
          />
        )}
      </div>
    </div>
  );
};

export default ErrorTestPage;
