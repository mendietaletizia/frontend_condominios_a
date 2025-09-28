// API de Mantenimiento
import api from './config';

export const mantenimientoAPI = {
  // Obtener todas las áreas comunes
  async getAreasComunes() {
    try {
      const response = await api.get('/mantenimiento/areas-comunes/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un área común por ID
  async getAreaComun(id) {
    try {
      const response = await api.get(`/mantenimiento/areas-comunes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nueva área común
  async createAreaComun(areaData) {
    try {
      const response = await api.post('/mantenimiento/areas-comunes/', areaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un área común
  async updateAreaComun(id, areaData) {
    try {
      const response = await api.put(`/mantenimiento/areas-comunes/${id}/`, areaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un área común
  async deleteAreaComun(id) {
    try {
      const response = await api.delete(`/mantenimiento/areas-comunes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las reservas
  async getReservas() {
    try {
      const response = await api.get('/mantenimiento/reservas/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una reserva por ID
  async getReserva(id) {
    try {
      const response = await api.get(`/mantenimiento/reservas/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva reserva
  async createReserva(reservaData) {
    try {
      const response = await api.post('/mantenimiento/reservas/', reservaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una reserva
  async updateReserva(id, reservaData) {
    try {
      const response = await api.put(`/mantenimiento/reservas/${id}/`, reservaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una reserva
  async deleteReserva(id) {
    try {
      const response = await api.delete(`/mantenimiento/reservas/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Confirmar una reserva
  async confirmarReserva(id) {
    try {
      const response = await api.post(`/mantenimiento/reservas/${id}/confirmar/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancelar una reserva
  async cancelarReserva(id) {
    try {
      const response = await api.post(`/mantenimiento/reservas/${id}/cancelar/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar disponibilidad
  async verificarDisponibilidad(areaId, fecha, horaInicio, horaFin) {
    try {
      const response = await api.get(`/mantenimiento/reservas/disponibilidad/?area_id=${areaId}&fecha=${fecha}&hora_inicio=${horaInicio}&hora_fin=${horaFin}`);
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