// API de Finanzas - CU22: Gestionar Cuotas y Expensas
import api from './config';

export const finanzasAPI = {
  // ===== CUOTAS MENSUALES =====
  async getCuotasMensuales() {
    try {
      const response = await api.get('/cuotas-mensuales/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCuotaMensual(id) {
    try {
      const response = await api.get(`/cuotas-mensuales/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createCuotaMensual(cuotaData) {
    try {
      const response = await api.post('/cuotas-mensuales/', cuotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateCuotaMensual(id, cuotaData) {
    try {
      const response = await api.put(`/cuotas-mensuales/${id}/`, cuotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteCuotaMensual(id) {
    try {
      const response = await api.delete(`/cuotas-mensuales/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async generarCuotasUnidades(cuotaId) {
    try {
      const response = await api.post(`/cuotas-mensuales/${cuotaId}/generar_cuotas_unidades/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getResumenCuotas() {
    try {
      const response = await api.get('/cuotas-mensuales/resumen/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== CUOTAS POR UNIDAD =====
  async getCuotasUnidad() {
    try {
      const response = await api.get('/cuotas-unidad/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCuotaUnidad(id) {
    try {
      const response = await api.get(`/cuotas-unidad/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateCuotaUnidad(id, cuotaData) {
    try {
      const response = await api.put(`/cuotas-unidad/${id}/`, cuotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteCuotaUnidad(id) {
    try {
      const response = await api.delete(`/cuotas-unidad/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getMorosos() {
    try {
      const response = await api.get('/cuotas-unidad/morosos/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCuotasPendientes() {
    try {
      const response = await api.get('/cuotas-unidad/pendientes/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCuotasVencidas() {
    try {
      const response = await api.get('/cuotas-unidad/vencidas/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== PAGOS DE CUOTAS (CU22) =====
  async getPagosCuotas() {
    try {
      const response = await api.get('/pagos/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPagoCuota(id) {
    try {
      const response = await api.get(`/pagos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createPagoCuota(pagoData) {
    try {
      const response = await api.post('/pagos/', pagoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updatePagoCuota(id, pagoData) {
    try {
      const response = await api.put(`/pagos/${id}/`, pagoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deletePagoCuota(id) {
    try {
      const response = await api.delete(`/pagos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPagosCuotasPorMes(mesAño) {
    try {
      const response = await api.get(`/pagos/por_mes/?mes_año=${mesAño}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPagosCuotasPorUnidad(unidadId) {
    try {
      const response = await api.get(`/pagos/por_unidad/?unidad_id=${unidadId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== EXPENSAS MENSUALES =====
  async getExpensasMensuales() {
    try {
      const response = await api.get('/expensas-mensuales/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getExpensaMensual(id) {
    try {
      const response = await api.get(`/expensas-mensuales/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createExpensaMensual(expensaData) {
    try {
      const response = await api.post('/expensas-mensuales/', expensaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateExpensaMensual(id, expensaData) {
    try {
      const response = await api.put(`/expensas-mensuales/${id}/`, expensaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteExpensaMensual(id) {
    try {
      const response = await api.delete(`/expensas-mensuales/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== EXPENSAS POR UNIDAD =====
  async getExpensasUnidad() {
    try {
      const response = await api.get('/expensas-unidad/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getExpensaUnidad(id) {
    try {
      const response = await api.get(`/expensas-unidad/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateExpensaUnidad(id, expensaData) {
    try {
      const response = await api.put(`/expensas-unidad/${id}/`, expensaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteExpensaUnidad(id) {
    try {
      const response = await api.delete(`/expensas-unidad/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== CUOTAS EXTRAORDINARIAS =====
  async getCuotasExtraordinarias() {
    try {
      const response = await api.get('/cuotas-extraordinarias/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCuotaExtraordinaria(id) {
    try {
      const response = await api.get(`/cuotas-extraordinarias/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createCuotaExtraordinaria(cuotaData) {
    try {
      const response = await api.post('/cuotas-extraordinarias/', cuotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateCuotaExtraordinaria(id, cuotaData) {
    try {
      const response = await api.put(`/cuotas-extraordinarias/${id}/`, cuotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteCuotaExtraordinaria(id) {
    try {
      const response = await api.delete(`/cuotas-extraordinarias/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== PAGOS (ALIAS PARA COMPATIBILIDAD) =====
  async getPagos() {
    try {
      const response = await api.get('/pagos/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPago(id) {
    try {
      const response = await api.get(`/pagos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createPago(pagoData) {
    try {
      const response = await api.post('/pagos/', pagoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updatePago(id, pagoData) {
    try {
      const response = await api.put(`/pagos/${id}/`, pagoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deletePago(id) {
    try {
      const response = await api.delete(`/pagos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

};