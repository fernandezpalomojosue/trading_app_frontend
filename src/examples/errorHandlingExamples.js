// Ejemplo de cómo el manejador de errores ahora maneja diferentes códigos de estado

import { handleError } from '../utils/errorHandler.js';

// Ejemplo 1: Error 404 en login
const login404Error = {
  response: {
    status: 404,
    data: { message: 'Not Found' }
  }
};

const processedLoginError = handleError(login404Error, 'login');
console.log('Error 404 en login:');
console.log('Mensaje:', processedLoginError.message);
console.log('Sugerencias:', processedLoginError.suggestions);
// Salida:
// Mensaje: "El servicio de inicio de sesión no está disponible. Intenta más tarde."
// Sugerencias: [
//   "El servicio de autenticación no está disponible",
//   "Intenta de nuevo en unos minutos",
//   "Si el problema persiste, contacta soporte técnico"
// ]

// Ejemplo 2: Error 404 en búsqueda de activos
const assets404Error = {
  response: {
    status: 404,
    data: { message: 'Asset not found' }
  }
};

const processedAssetsError = handleError(assets404Error, 'assetDetails');
console.log('\nError 404 en activos:');
console.log('Mensaje:', processedAssetsError.message);
console.log('Sugerencias:', processedAssetsError.suggestions);
// Salida:
// Mensaje: "El activo solicitado no existe o no está disponible."
// Sugerencias: [
//   "Verifica que los criterios de búsqueda sean correctos",
//   "Intenta con otros parámetros de búsqueda"
// ]

// Ejemplo 3: Error 403 en mercados
const markets403Error = {
  response: {
    status: 403,
    data: { message: 'Access denied' }
  }
};

const processedMarketsError = handleError(markets403Error, 'markets');
console.log('\nError 403 en mercados:');
console.log('Mensaje:', processedMarketsError.message);
console.log('Sugerencias:', processedMarketsError.suggestions);
// Salida:
// Mensaje: "No tienes acceso a estos datos de mercado."
// Sugerencias: [
//   "Verifica que tienes los permisos necesarios",
//   "Contacta al administrador si crees que es un error"
// ]

export { processedLoginError, processedAssetsError, processedMarketsError };
