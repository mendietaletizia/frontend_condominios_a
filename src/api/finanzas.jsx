// API de Finanzas - CU22: Gestionar Cuotas y Expensas
import api from './config';

export const finanzasAPI = {
  // ===== CUOTAS MENSUALES =====
  async getCuotasMensuales() {
    try {
      const response = await api.get('/finanzas/cuotas-mensuales/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCuotaMensual(id) {
    try {
      const response = await api.get(`/finanzas/cuotas-mensuales/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createCuotaMensual(cuotaData) {
    try {
      const response = await api.post('/finanzas/cuotas-mensuales/', cuotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateCuotaMensual(id, cuotaData) {
    try {
      const response = await api.put(`/finanzas/cuotas-mensuales/${id}/`, cuotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteCuotaMensual(id) {
    try {
      const response = await api.delete(`/finanzas/cuotas-mensuales/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async generarCuotasUnidades(cuotaId) {
    try {
      const response = await api.post(`/finanzas/cuotas-mensuales/${cuotaId}/generar_cuotas_unidades/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getResumenCuotas() {
    try {
      const response = await api.get('/finanzas/cuotas-mensuales/resumen/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== CUOTAS POR UNIDAD =====
  async getCuotasUnidad() {
    try {
      const response = await api.get('/finanzas/cuotas-unidad/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCuotaUnidad(id) {
    try {
      const response = await api.get(`/finanzas/cuotas-unidad/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateCuotaUnidad(id, cuotaData) {
    try {
      const response = await api.put(`/finanzas/cuotas-unidad/${id}/`, cuotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteCuotaUnidad(id) {
    try {
      const response = await api.delete(`/finanzas/cuotas-unidad/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getMorosos() {
    try {
      const response = await api.get('/finanzas/cuotas-unidad/morosos/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCuotasPendientes() {
    try {
      const response = await api.get('/finanzas/cuotas-unidad/pendientes/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCuotasVencidas() {
    try {
      const response = await api.get('/finanzas/cuotas-unidad/vencidas/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== PAGOS DE CUOTAS (CU22) =====
  async getPagosCuotas() {
    try {
      const response = await api.get('/finanzas/pagos/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPagoCuota(id) {
    try {
      const response = await api.get(`/finanzas/pagos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createPagoCuota(pagoData) {
    try {
      const response = await api.post('/finanzas/pagos/', pagoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updatePagoCuota(id, pagoData) {
    try {
      const response = await api.put(`/finanzas/pagos/${id}/`, pagoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deletePagoCuota(id) {
    try {
      const response = await api.delete(`/finanzas/pagos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPagosCuotasPorMes(mesAño) {
    try {
      const response = await api.get(`/finanzas/pagos/por_mes/?mes_año=${mesAño}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPagosCuotasPorUnidad(unidadId) {
    try {
      const response = await api.get(`/finanzas/pagos/por_unidad/?unidad_id=${unidadId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== EXPENSAS MENSUALES =====
  async getExpensasMensuales() {
    try {
      const response = await api.get('/finanzas/expensas-mensuales/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getExpensaMensual(id) {
    try {
      const response = await api.get(`/finanzas/expensas-mensuales/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createExpensaMensual(expensaData) {
    try {
      const response = await api.post('/finanzas/expensas-mensuales/', expensaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateExpensaMensual(id, expensaData) {
    try {
      const response = await api.put(`/finanzas/expensas-mensuales/${id}/`, expensaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteExpensaMensual(id) {
    try {
      const response = await api.delete(`/finanzas/expensas-mensuales/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== EXPENSAS POR UNIDAD =====
  async getExpensasUnidad() {
    try {
      const response = await api.get('/finanzas/expensas-unidad/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getExpensaUnidad(id) {
    try {
      const response = await api.get(`/finanzas/expensas-unidad/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateExpensaUnidad(id, expensaData) {
    try {
      const response = await api.put(`/finanzas/expensas-unidad/${id}/`, expensaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteExpensaUnidad(id) {
    try {
      const response = await api.delete(`/finanzas/expensas-unidad/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== CUOTAS EXTRAORDINARIAS =====
  async getCuotasExtraordinarias() {
    try {
      const response = await api.get('/finanzas/cuotas-extraordinarias/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getCuotaExtraordinaria(id) {
    try {
      const response = await api.get(`/finanzas/cuotas-extraordinarias/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createCuotaExtraordinaria(cuotaData) {
    try {
      const response = await api.post('/finanzas/cuotas-extraordinarias/', cuotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateCuotaExtraordinaria(id, cuotaData) {
    try {
      const response = await api.put(`/finanzas/cuotas-extraordinarias/${id}/`, cuotaData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteCuotaExtraordinaria(id) {
    try {
      const response = await api.delete(`/finanzas/cuotas-extraordinarias/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== PAGOS (ALIAS PARA COMPATIBILIDAD) =====
  async getPagos() {
    try {
      const response = await api.get('/finanzas/pagos/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPago(id) {
    try {
      const response = await api.get(`/finanzas/pagos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createPago(pagoData) {
    try {
      const response = await api.post('/finanzas/pagos/', pagoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updatePago(id, pagoData) {
    try {
      const response = await api.put(`/finanzas/pagos/${id}/`, pagoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deletePago(id) {
    try {
      const response = await api.delete(`/finanzas/pagos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

};