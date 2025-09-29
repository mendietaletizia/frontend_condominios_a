// Archivo para probar la conexión con el backend
import api, { apiUtils } from './config';

export const testConnection = async () => {
  
  try {
    // Probar conexión básica
    const isServerUp = await apiUtils.checkServerStatus();
    
    if (isServerUp) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

// Función para probar endpoints específicos
export const testEndpoints = async () => {
  
  const endpoints = [
    '/login/',
    '/usuario/',
    '/persona/',
  '/unidades/',
    '/gastos/',
    '/pagos/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
    } catch (error) {
    }
  }
};

// Función para probar login
export const testLogin = async (username = 'jael', password = 'password123') => {
  
  try {
    const response = await api.post('/auth/login/', { username, password });
    return response.data;
  } catch (error) {
    return null;
  }
};
