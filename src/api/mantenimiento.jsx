// API de Mantenimiento
import api from './config';

export const mantenimientoAPI = {
  // Obtener todas las áreas comunes
  async getAreasComunes() {
    try {
      const response = await api.get('/areas-comunes/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un área común por ID
  async getAreaComun(id) {
    try {
      const response = await api.get(`/areas-comunes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nueva área común
  async createAreaComun(areaData) {
    try {
      const response = await api.post('/areas-comunes/', areaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un área común
  async updateAreaComun(id, areaData) {
    try {
      const response = await api.put(`/areas-comunes/${id}/`, areaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un área común
  async deleteAreaComun(id) {
    try {
      const response = await api.delete(`/areas-comunes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las reservas
  async getReservas() {
    try {
      const response = await api.get('/reservas/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una reserva por ID
  async getReserva(id) {
    try {
      const response = await api.get(`/reservas/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva reserva
  async createReserva(reservaData) {
    try {
      const response = await api.post('/reservas/', reservaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una reserva
  async updateReserva(id, reservaData) {
    try {
      const response = await api.put(`/reservas/${id}/`, reservaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una reserva
  async deleteReserva(id) {
    try {
      const response = await api.delete(`/reservas/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Confirmar una reserva
  async confirmarReserva(id) {
    try {
      const response = await api.post(`/reservas/${id}/confirmar/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancelar una reserva
  async cancelarReserva(id) {
    try {
      const response = await api.post(`/reservas/${id}/cancelar/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar disponibilidad
  async verificarDisponibilidad(areaId, fecha, horaInicio, horaFin) {
    try {
      const response = await api.get(`/reservas/disponibilidad/?area_id=${areaId}&fecha=${fecha}&hora_inicio=${horaInicio}&hora_fin=${horaFin}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las bitácoras de mantenimiento
  async getBitacorasMantenimiento() {
    try {
      const response = await api.get('/bitacoras-mantenimiento/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva bitácora de mantenimiento
  async createBitacoraMantenimiento(bitacoraData) {
    try {
      const response = await api.post('/bitacoras-mantenimiento/', bitacoraData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una bitácora de mantenimiento
  async updateBitacoraMantenimiento(id, bitacoraData) {
    try {
      const response = await api.put(`/bitacoras-mantenimiento/${id}/`, bitacoraData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una bitácora de mantenimiento
  async deleteBitacoraMantenimiento(id) {
    try {
      const response = await api.delete(`/bitacoras-mantenimiento/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};