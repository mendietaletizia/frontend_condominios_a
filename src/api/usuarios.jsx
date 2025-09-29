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
        usuario: residenteData.usuario_asociado || null,
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
  }
};
