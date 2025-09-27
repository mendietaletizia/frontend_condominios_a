// API de Usuarios
import api from './config';

export const usuariosAPI = {
  // Obtener todos los usuarios
  async getUsuarios() {
    try {
      const response = await api.get('/usuarios/usuario/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Obtener un usuario por ID
  async getUsuario(id) {
    try {
      const response = await api.get(`/usuarios/usuario/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo usuario
  async createUsuario(usuarioData) {
    try {
      const response = await api.post('/usuarios/usuario/', usuarioData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un usuario
  async updateUsuario(id, usuarioData) {
    try {
      const response = await api.put(`/usuarios/usuario/${id}/`, usuarioData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un usuario
  async deleteUsuario(id) {
    try {
      const response = await api.delete(`/usuarios/usuario/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los residentes (usando la nueva API mejorada)
  async getResidentes() {
    try {
      const response = await api.get('/usuarios/residentes/');
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

      const response = await api.post('/usuarios/residentes/', residenteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un residente
  async updateResidente(id, residenteData) {
    try {
      const response = await api.put(`/usuarios/residentes/${id}/`, residenteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un residente
  async deleteResidente(id) {
    try {
      const response = await api.delete(`/usuarios/residentes/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los roles
  async getRoles() {
    try {
      const response = await api.get('/usuarios/roles/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Crear un nuevo rol
  async createRol(rolData) {
    try {
      const response = await api.post('/usuarios/roles/', rolData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar un rol
  async updateRol(id, rolData) {
    try {
      const response = await api.put(`/usuarios/roles/${id}/`, rolData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar un rol
  async deleteRol(id) {
    try {
      const response = await api.delete(`/usuarios/roles/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener todos los permisos
  async getPermisos() {
    try {
      const response = await api.get('/usuarios/permiso/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Obtener rol-permisos
  async getRolPermisos() {
    try {
      const response = await api.get('/usuarios/rol-permiso/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuarios con rol de residente (para selección de propietarios)
  async getUsuariosResidentes() {
    try {
      const response = await api.get('/usuarios/usuarios-residentes/');
      // Handle Django REST Framework response format
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      throw error;
    }
  }
};
