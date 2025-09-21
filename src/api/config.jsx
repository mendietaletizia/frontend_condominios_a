// Configuración de la API
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => {
    // Log de respuestas exitosas en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.config.url, response.status, response.data);
    }
    return response;
  },
  (error) => {
    // Log de errores en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.config?.url, error.response?.status, error.response?.data);
    }

    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Sin permisos
      console.error('Acceso denegado');
    } else if (error.response?.status >= 500) {
      // Error del servidor
      console.error('Error del servidor');
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      console.error('Timeout de la petición');
    } else if (!error.response) {
      // Sin conexión
      console.error('Sin conexión al servidor');
    }
    
    return Promise.reject(error);
  }
);

// Funciones de utilidad para la API
export const apiUtils = {
  // Verificar si el servidor está disponible
  async checkServerStatus() {
    try {
      const response = await api.get('/');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },

  // Obtener información del usuario actual
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/user/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Manejar errores de forma consistente
  handleError(error) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    } else if (error.response?.data?.error) {
      return error.response.data.error;
    } else if (error.message) {
      return error.message;
    } else {
      return 'Error desconocido';
    }
  }
};

export default api;
