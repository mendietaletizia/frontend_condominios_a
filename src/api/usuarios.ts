// API de Usuarios
import api from './config';

export const usuariosAPI = {
  // Obtener todos los usuarios
  async getUsuarios() {
    try {
      const response = await api.get('/usuario/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Obtener un usuario por ID
  async getUsuario(id) {
    try {
      const response = await api.get(`/usuario/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo usuario
  async createUsuario(usuarioData) {
    try {
      const response = await api.post('/usuario/', usuarioData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un usuario
  async updateUsuario(id, usuarioData) {
    try {
      const response = await api.put(`/usuario/${id}/`, usuarioData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un usuario
  async deleteUsuario(id) {
    try {
      const response = await api.delete(`/usuario/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los residentes (usando la nueva API mejorada)
  async getResidentes() {
    try {
      const response = await api.get('/residentes/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo residente
  async createResidente(residenteData) {
    try {
      // Validar datos antes de enviar
      if (!residenteData.nombre) {
        throw new Error('El campo nombre es obligatorio.');
      }

      if (residenteData.ci && residenteData.ci.length > 20) {
        throw new Error('El campo CI no puede exceder los 20 caracteres.');
      }

      // Primero crear la persona
      const personaData = {
        nombre: residenteData.nombre,
        ci: residenteData.ci || null,
        email: residenteData.email || null,
        telefono: residenteData.telefono || null
      };

      console.log('🔍 Creando persona con datos:', personaData);
      const personaResponse = await api.post('/persona/', personaData);
      const personaId = personaResponse.data.id;

      // Luego crear el residente con la persona creada
      const residentePayload = {
        persona: personaId,
        // Importante: NO enviar ambos campos. Solo usuario_asociado cuando corresponda
        usuario_asociado: residenteData.usuario_asociado || null
      };

      console.log('🔍 Creando residente con datos:', residentePayload);
      const response = await api.post('/residentes/', residentePayload);
      return response.data;
    } catch (error) {
      console.error('❌ Error en createResidente:', error);
      throw error;
    }
  },

  // Actualizar un residente
  async updateResidente(id, residenteData) {
    try {
      const response = await api.put(`/residentes/${id}/`, residenteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un residente
  async deleteResidente(id) {
    try {
      const response = await api.delete(`/residentes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los roles
  async getRoles() {
    try {
      const response = await api.get('/roles/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo rol
  async createRol(rolData) {
    try {
      const response = await api.post('/roles/', rolData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un rol
  async updateRol(id, rolData) {
    try {
      const response = await api.put(`/roles/${id}/`, rolData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un rol
  async deleteRol(id) {
    try {
      const response = await api.delete(`/roles/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los permisos
  async getPermisos() {
    try {
      const response = await api.get('/permiso/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Obtener rol-permisos
  async getRolPermisos() {
    try {
      const response = await api.get('/rol-permiso/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuarios con rol de residente (para selección de propietarios)
  async getUsuariosResidentes() {
    try {
      const response = await api.get('/usuarios-residentes/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // ===== INVITADOS =====
  // Obtener todos los invitados
  async getInvitados() {
    try {
      const response = await api.get('/invitados/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo invitado
  async createInvitado(invitadoData) {
    try {
      const response = await api.post('/invitados/', invitadoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un invitado
  async updateInvitado(id, invitadoData) {
    try {
      const response = await api.put(`/invitados/${id}/`, invitadoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un invitado
  async deleteInvitado(id) {
    try {
      const response = await api.delete(`/invitados/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener invitados activos
  async getInvitadosActivos() {
    try {
      const response = await api.get('/invitados/activos/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener invitados por evento
  async getInvitadosPorEvento(eventoId) {
    try {
      const response = await api.get(`/invitados/por_evento/?evento_id=${eventoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check-in de invitado
  async checkInInvitado(id) {
    try {
      const response = await api.post(`/invitados/${id}/check_in/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check-out de invitado
  async checkOutInvitado(id) {
    try {
      const response = await api.post(`/invitados/${id}/check_out/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener invitados en el condominio (con check-in sin check-out)
  async getInvitadosEnCondominio() {
    try {
      const response = await api.get('/invitados/en_condominio/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener resumen de seguridad para hoy
  async getSeguridadHoy() {
    try {
      const response = await api.get('/invitados/seguridad/hoy/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener resumen de seguridad
  async getSeguridadResumen() {
    try {
      const response = await api.get('/invitados/seguridad/resumen/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== RECLAMOS =====
  // Obtener todos los reclamos
  async getReclamos() {
    try {
      const response = await api.get('/reclamos/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo reclamo
  async createReclamo(reclamoData) {
    try {
      const response = await api.post('/reclamos/', reclamoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un reclamo
  async updateReclamo(id, reclamoData) {
    try {
      const response = await api.put(`/reclamos/${id}/`, reclamoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un reclamo
  async deleteReclamo(id) {
    try {
      const response = await api.delete(`/reclamos/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== EMPLEADOS =====
  // Obtener todos los empleados
  async getEmpleados() {
    try {
      const response = await api.get('/empleados/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo empleado
  async createEmpleado(empleadoData) {
    try {
      const response = await api.post('/empleados/', empleadoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un empleado
  async updateEmpleado(id, empleadoData) {
    try {
      const response = await api.put(`/empleados/${id}/`, empleadoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un empleado
  async deleteEmpleado(id) {
    try {
      const response = await api.delete(`/empleados/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
