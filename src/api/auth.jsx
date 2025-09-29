// API de Autenticación
import api from './config';

export const authAPI = {
  // Iniciar sesión
  async login(username, password) {
    try {
      const response = await api.post('/login/', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  async logout() {
    try {
      const response = await api.post('/logout/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener información del usuario actual
  async getCurrentUser() {
    try {
      const response = await api.get('/user/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar token
  async verifyToken() {
    try {
      const response = await api.get('/verify/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
