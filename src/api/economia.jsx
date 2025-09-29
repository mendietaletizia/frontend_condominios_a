// API de Economía
import api from './config';

export const economiaAPI = {
  // Obtener resumen financiero
  async getResumenFinanciero() {
    try {
      const response = await api.get('/reportes/resumen_financiero/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener predicción de morosidad
  async getPredecirMorosidad() {
    try {
      const response = await api.get('/morosidad/predecir_morosidad/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  // Obtener todos los gastos
  async getGastos() {
    try {
      const response = await api.get('/gastos/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un gasto por ID
  async getGasto(id) {
    try {
      const response = await api.get(`/gastos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo gasto
  async createGasto(gastoData) {
    try {
      const response = await api.post('/gastos/', gastoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un gasto
  async updateGasto(id, gastoData) {
    try {
      const response = await api.put(`/gastos/${id}/`, gastoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un gasto
  async deleteGasto(id) {
    try {
      const response = await api.delete(`/gastos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las multas
  async getMultas() {
    try {
      const response = await api.get('/multas/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una multa por ID
  async getMulta(id) {
    try {
      const response = await api.get(`/multas/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva multa
  async createMulta(multaData) {
    try {
      const response = await api.post('/multas/', multaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una multa
  async updateMulta(id, multaData) {
    try {
      const response = await api.put(`/multas/${id}/`, multaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una multa
  async deleteMulta(id) {
    try {
      const response = await api.delete(`/multas/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
