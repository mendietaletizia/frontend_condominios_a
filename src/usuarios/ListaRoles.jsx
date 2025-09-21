import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';
import './ListaRoles.css';

const ListaRoles = () => {
  const { canAccess } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [rolPermisos, setRolPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [formData, setFormData] = useState({
    nombre: ''
  });

  useEffect(() => {
    if (canAccess('administrador')) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permisosRes, rolPermisosRes] = await Promise.all([
        api.get('/usuarios/roles/'),
        api.get('/usuarios/permiso/'),
        api.get('/usuarios/rol-permiso/')
      ]);
      setRoles(rolesRes.data);
      setPermisos(permisosRes.data);
      setRolPermisos(rolPermisosRes.data);
    } catch (error) {
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRol) {
        await api.put(`/usuarios/roles/${editingRol.id}/`, formData);
      } else {
        await api.post('/usuarios/roles/', formData);
      }
      setShowForm(false);
      setEditingRol(null);
      setFormData({ nombre: '' });
      loadData();
    } catch (error) {
      setError('Error al guardar rol: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (rol) => {
    setEditingRol(rol);
    setFormData({ nombre: rol.nombre });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este rol?')) {
      try {
        await api.delete(`/usuarios/roles/${id}/`);
        loadData();
      } catch (error) {
        setError('Error al eliminar rol: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const getPermisosForRol = (rolId) => {
    return rolPermisos.filter(rp => rp.rol === rolId);
  };

  const getPermisoDescripcion = (permisoId) => {
    const permiso = permisos.find(p => p.id === permisoId);
    return permiso ? permiso.descripcion : 'Permiso no encontrado';
  };

  if (!canAccess('administrador')) {
    return (
      <div className="access-denied">
        <h2>Acceso Denegado</h2>
        <p>No tiene permisos para acceder a esta sección.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando roles y permisos...</p>
      </div>
    );
  }

  return (
    <div className="roles-container">
      <div className="roles-header">
        <h2>Gestión de Roles y Permisos</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nuevo Rol
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editingRol ? 'Editar Rol' : 'Nuevo Rol'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Rol:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el nombre del rol"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingRol ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRol(null);
                    setFormData({ nombre: '' });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="roles-stats">
        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-content">
            <h3>Total Roles</h3>
            <p className="stat-value">{roles.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-content">
            <h3>Total Permisos</h3>
            <p className="stat-value">{permisos.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <h3>Asignaciones</h3>
            <p className="stat-value">{rolPermisos.length}</p>
          </div>
        </div>
      </div>

      <div className="roles-sections">
        <div className="roles-section">
          <h3>Roles del Sistema</h3>
          <div className="roles-table-container">
            <table className="roles-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del Rol</th>
                  <th>Permisos Asignados</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((rol) => {
                  const permisosAsignados = getPermisosForRol(rol.id);
                  return (
                    <tr key={rol.id}>
                      <td>{rol.id}</td>
                      <td>
                        <div className="rol-name">
                          <strong>{rol.nombre}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="permisos-list">
                          {permisosAsignados.length > 0 ? (
                            permisosAsignados.map((rp, index) => (
                              <span key={index} className="permiso-badge">
                                {getPermisoDescripcion(rp.permiso)}
                              </span>
                            ))
                          ) : (
                            <span className="no-permisos">Sin permisos asignados</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-edit"
                            onClick={() => handleEdit(rol)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDelete(rol.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="permisos-section">
          <h3>Permisos Disponibles</h3>
          <div className="permisos-grid">
            {permisos.map((permiso) => (
              <div key={permiso.id} className="permiso-card">
                <div className="permiso-id">#{permiso.id}</div>
                <div className="permiso-descripcion">{permiso.descripcion}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListaRoles;
