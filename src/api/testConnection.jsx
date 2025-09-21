// Archivo para probar la conexión con el backend
import api, { apiUtils } from './config';

export const testConnection = async () => {
  console.log('🔍 Probando conexión con el backend...');
  
  try {
    // Probar conexión básica
    const isServerUp = await apiUtils.checkServerStatus();
    console.log('✅ Servidor disponible:', isServerUp);
    
    if (isServerUp) {
      console.log('🎉 ¡Conexión exitosa con el backend!');
      return true;
    } else {
      console.log('❌ Servidor no disponible');
      return false;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
};

// Función para probar endpoints específicos
export const testEndpoints = async () => {
  console.log('🔍 Probando endpoints específicos...');
  
  const endpoints = [
    '/auth/login/',
    '/usuarios/usuario/',
    '/usuarios/persona/',
    '/comunidad/unidad/',
    '/economia/gastos/',
    '/finanzas/pago/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      console.log(`✅ ${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || 'Error'}`);
    }
  }
};

// Función para probar login
export const testLogin = async (username = 'jael', password = 'password123') => {
  console.log('🔍 Probando login...');
  
  try {
    const response = await api.post('/auth/login/', { username, password });
    console.log('✅ Login exitoso:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return null;
  }
};
