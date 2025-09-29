import api from './config';

// API para el sistema de gestión de accesos
export const accesoAPI = {
  // Dashboard de accesos
  getDashboardData: async () => {
    try {
      const response = await api.get('/dashboard/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registros de acceso
  getRegistrosAcceso: async (params = {}) => {
    try {
      const response = await api.get('/registros-acceso/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  registrarAcceso: async (placa, tipo = 'entrada') => {
    try {
      const response = await api.post('/registros-acceso/registrar/', {
        placa: placa,
        tipo: tipo
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Placas de vehículos (residentes)
  getPlacasVehiculo: async (params = {}) => {
    try {
      const response = await api.get('/placas-vehiculo/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPlacaVehiculo: async (data) => {
    try {
      const response = await api.post('/placas-vehiculo/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePlacaVehiculo: async (id, data) => {
    try {
      const response = await api.put(`/placas-vehiculo/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletePlacaVehiculo: async (id) => {
    try {
      const response = await api.delete(`/placas-vehiculo/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Placas de invitados
  getPlacasInvitado: async (params = {}) => {
    try {
      const response = await api.get('/placas-invitado/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPlacaInvitado: async (data) => {
    try {
      const response = await api.post('/placas-invitado/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePlacaInvitado: async (id, data) => {
    try {
      const response = await api.put(`/placas-invitado/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletePlacaInvitado: async (id) => {
    try {
      const response = await api.delete(`/placas-invitado/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Configuración del sistema
  getConfiguracion: async () => {
    try {
      const response = await api.get('/configuracion/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateConfiguracion: async (data) => {
    try {
      const response = await api.put('/configuracion/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reportes y estadísticas
  getEstadisticasAcceso: async (fechaInicio, fechaFin) => {
    try {
      const params = {};
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;

      const response = await api.get('/estadisticas/', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Simulación de reconocimiento de placas (para testing)
  simularReconocimiento: async (imagenBase64) => {
    try {
      const response = await api.post('/simular-reconocimiento/', {
        imagen: imagenBase64
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default accesoAPI;
