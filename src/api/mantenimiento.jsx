// API de Mantenimiento
import api from './config';

export const mantenimientoAPI = {
  // Obtener todas las áreas comunes
  async getAreasComunes() {
    try {
      const response = await api.get('/mantenimiento/area-comun/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un área común por ID
  async getAreaComun(id) {
    try {
      const response = await api.get(`/mantenimiento/area-comun/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nueva área común
  async createAreaComun(areaData) {
    try {
      const response = await api.post('/mantenimiento/area-comun/', areaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un área común
  async updateAreaComun(id, areaData) {
    try {
      const response = await api.put(`/mantenimiento/area-comun/${id}/`, areaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un área común
  async deleteAreaComun(id) {
    try {
      const response = await api.delete(`/mantenimiento/area-comun/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las reservas
  async getReservas() {
    try {
      const response = await api.get('/mantenimiento/reserva/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una reserva por ID
  async getReserva(id) {
    try {
      const response = await api.get(`/mantenimiento/reserva/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva reserva
  async createReserva(reservaData) {
    try {
      const response = await api.post('/mantenimiento/reserva/', reservaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una reserva
  async updateReserva(id, reservaData) {
    try {
      const response = await api.put(`/mantenimiento/reserva/${id}/`, reservaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una reserva
  async deleteReserva(id) {
    try {
      const response = await api.delete(`/mantenimiento/reserva/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las bitácoras de mantenimiento
  async getBitacorasMantenimiento() {
    try {
      const response = await api.get('/mantenimiento/bitacoramantenimiento/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva bitácora de mantenimiento
  async createBitacoraMantenimiento(bitacoraData) {
    try {
      const response = await api.post('/mantenimiento/bitacoramantenimiento/', bitacoraData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una bitácora de mantenimiento
  async updateBitacoraMantenimiento(id, bitacoraData) {
    try {
      const response = await api.put(`/mantenimiento/bitacoramantenimiento/${id}/`, bitacoraData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una bitácora de mantenimiento
  async deleteBitacoraMantenimiento(id) {
    try {
      const response = await api.delete(`/mantenimiento/bitacoramantenimiento/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
