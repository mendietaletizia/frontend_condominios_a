// API de Finanzas
import api from './config';

export const finanzasAPI = {
  // Obtener todos los pagos
  async getPagos() {
    try {
      const response = await api.get('/finanzas/pago/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un pago por ID
  async getPago(id) {
    try {
      const response = await api.get(`/finanzas/pago/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo pago
  async createPago(pagoData) {
    try {
      const response = await api.post('/finanzas/pago/', pagoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un pago
  async updatePago(id, pagoData) {
    try {
      const response = await api.put(`/finanzas/pago/${id}/`, pagoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un pago
  async deletePago(id) {
    try {
      const response = await api.delete(`/finanzas/pago/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las expensas
  async getExpensas() {
    try {
      const response = await api.get('/finanzas/expensa/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una expensa por ID
  async getExpensa(id) {
    try {
      const response = await api.get(`/finanzas/expensa/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva expensa
  async createExpensa(expensaData) {
    try {
      const response = await api.post('/finanzas/expensa/', expensaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una expensa
  async updateExpensa(id, expensaData) {
    try {
      const response = await api.put(`/finanzas/expensa/${id}/`, expensaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una expensa
  async deleteExpensa(id) {
    try {
      const response = await api.delete(`/finanzas/expensa/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
