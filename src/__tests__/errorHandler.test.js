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
    
    expect(processedError.message).toBe('El servicio de inicio de sesión no está disponible. Intenta más tarde.');
    expect(processedError.suggestions).toContain('El servicio de autenticación no está disponible');
    expect(processedError.suggestions).toContain('Intenta de nuevo en unos minutos');
  });

  it('should handle 404 error in markets context with specific message', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Market not found' }
      }
    };
    
    const processedError = handleError(error, 'markets');
    
    expect(processedError.message).toBe('Los datos de mercado no están disponibles en este momento.');
    expect(processedError.suggestions).toContain('Verifica que los criterios de búsqueda sean correctos');
  });

  it('should handle 404 error in assets context with specific message', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Asset not found' }
      }
    };
    
    const processedError = handleError(error, 'assetDetails');
    
    expect(processedError.message).toBe('El activo solicitado no existe o no está disponible.');
    expect(processedError.suggestions).toContain('Verifica que los criterios de búsqueda sean correctos');
  });

  it('should handle 404 error in default context with generic message', () => {
    const error = {
      response: {
        status: 404,
        data: { message: 'Not Found' }
      }
    };
    
    const processedError = handleError(error, 'default');
    
    expect(processedError.message).toBe('El recurso solicitado no existe. Verifica la URL o contacta soporte.');
    expect(processedError.suggestions).toContain('Verifica la URL o los parámetros de la solicitud');
  });
});
