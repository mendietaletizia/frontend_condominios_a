// API de Economía
import api from './config';

export const economiaAPI = {
  // Obtener todos los gastos
  async getGastos() {
    try {
      const response = await api.get('/economia/gastos/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un gasto por ID
  async getGasto(id) {
    try {
      const response = await api.get(`/economia/gastos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo gasto
  async createGasto(gastoData) {
    try {
      const response = await api.post('/economia/gastos/', gastoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un gasto
  async updateGasto(id, gastoData) {
    try {
      const response = await api.put(`/economia/gastos/${id}/`, gastoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un gasto
  async deleteGasto(id) {
    try {
      const response = await api.delete(`/economia/gastos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las multas
  async getMultas() {
    try {
      const response = await api.get('/economia/multa/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una multa por ID
  async getMulta(id) {
    try {
      const response = await api.get(`/economia/multa/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva multa
  async createMulta(multaData) {
    try {
      const response = await api.post('/economia/multa/', multaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una multa
  async updateMulta(id, multaData) {
    try {
      const response = await api.put(`/economia/multa/${id}/`, multaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una multa
  async deleteMulta(id) {
    try {
      const response = await api.delete(`/economia/multa/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
