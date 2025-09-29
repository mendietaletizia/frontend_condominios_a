import api from './config';

// API para el sistema de gestión de invitados
export const invitadosAPI = {
  // Placas de invitados
  getPlacasInvitado: async (params = {}) => {
    try {
      const response = await api.get('/placas-invitados/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPlacaInvitado: async (data) => {
    try {
      const response = await api.post('/placas-invitados/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePlacaInvitado: async (id, data) => {
    try {
      const response = await api.put(`/placas-invitados/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletePlacaInvitado: async (id) => {
    try {
      const response = await api.delete(`/placas-invitados/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Placas de invitados activas (para seguridad)
  getPlacasInvitadoActivas: async () => {
    try {
      const response = await api.get('/placas-invitados/activas/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Placas de invitados por residente
  getPlacasInvitadoPorResidente: async (residenteId) => {
    try {
      const response = await api.get('/placas-invitados/', {
        params: { residente_id: residenteId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar placas de invitados por placa
  buscarPlacaInvitado: async (placa) => {
    try {
      const response = await api.get('/placas-invitados/', {
        params: { placa }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar si una placa está autorizada
  verificarPlacaAutorizada: async (placa) => {
    try {
      const response = await api.get('/placas-invitados/', {
        params: { placa, activo: true }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default invitadosAPI;
