import api from './config';

export const comunidadAPI = {
  // Obtener todas las unidades
  async getUnidades() {
    try {
      const response = await api.get('/unidades/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener una unidad por ID
  async getUnidad(id) {
    try {
      const response = await api.get(`/unidades/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva unidad
  async createUnidad(unidadData) {
    try {
      const response = await api.post('/unidades/', unidadData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una unidad
  async updateUnidad(id, unidadData) {
    try {
      const response = await api.put(`/unidades/${id}/`, unidadData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una unidad
  async deleteUnidad(id) {
    try {
      const response = await api.delete(`/unidades/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener residentes por unidad
  async getResidentesUnidad() {
    try {
      const response = await api.get('/residentes-unidad/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los eventos
  async getEventos() {
    try {
      const response = await api.get('/eventos/');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.results || []);
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo evento
  async createEvento(eventoData) {
    try {
      const response = await api.post('/eventos/', eventoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un evento
  async updateEvento(id, eventoData) {
    try {
      const response = await api.put(`/eventos/${id}/`, eventoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un evento
  async deleteEvento(id) {
    try {
      const response = await api.delete(`/eventos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todas las notificaciones
  async getNotificaciones() {
    try {
      const response = await api.get('/notificaciones/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear una nueva notificación
  async createNotificacion(notificacionData) {
    try {
      const response = await api.post('/notificaciones/', notificacionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar una notificación
  async updateNotificacion(id, notificacionData) {
    try {
      const response = await api.put(`/notificaciones/${id}/`, notificacionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar una notificación
  async deleteNotificacion(id) {
    try {
      const response = await api.delete(`/notificaciones/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Enviar comunicado (broadcast a todos los residentes)
  async broadcastComunicado(data) {
    try {
      const res = await api.post('/notificaciones/broadcast/', data);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar comunicado existente
  async updateComunicado(id, data) {
    try {
      const res = await api.put(`/notificaciones/${id}/`, data);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar comunicado
  async deleteComunicado(id) {
    try {
      const res = await api.delete(`/notificaciones/${id}/`);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
};
