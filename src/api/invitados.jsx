import api from './config';

// API para el sistema de gestión de invitados (modelo Invitado)
export const invitadosAPI = {
  // Invitados CRUD
  list: async (params = {}) => {
    const response = await api.get('/invitados/', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/invitados/', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/invitados/${id}/`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await api.delete(`/invitados/${id}/`);
    return response.data;
  },

  // Scopes y filtros
  activos: async (params = {}) => {
    const response = await api.get('/invitados/activos/', { params });
    return response.data;
  },

  porEvento: async (eventoId) => {
    const response = await api.get('/invitados/por_evento/', { params: { evento_id: eventoId } });
    return response.data;
  },

  enCondominio: async () => {
    const response = await api.get('/invitados/en_condominio/');
    return response.data; // { conteo, invitados }
  },

  seguridadHoy: async () => {
    const response = await api.get('/invitados/seguridad/hoy/');
    return response.data;
  },

  seguridadResumen: async () => {
    const response = await api.get('/invitados/seguridad/resumen/');
    return response.data; // { fecha, totales, proximos }
  },

  // Acciones de portería/seguridad
  checkIn: async (id) => {
    const response = await api.post(`/invitados/${id}/check_in/`);
    return response.data;
  },

  checkOut: async (id) => {
    const response = await api.post(`/invitados/${id}/check_out/`);
    return response.data;
  },
};

export default invitadosAPI;
