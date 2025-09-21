import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';
import './ListaResidentes.css';

const ListaResidentes = () => {
  const { canAccess } = useAuth();
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingResidente, setEditingResidente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    usuario: null
  });

  useEffect(() => {
    if (canAccess('administrador')) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [residentesRes, unidadesRes] = await Promise.all([
        api.get('/usuarios/persona/'),
        api.get('/comunidad/unidad/')
      ]);
      setResidentes(residentesRes.data);
      setUnidades(unidadesRes.data);
    } catch (error) {
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResidente) {
        await api.put(`/usuarios/persona/${editingResidente.id}/`, formData);
      } else {
        await api.post('/usuarios/persona/', formData);
      }
      setShowForm(false);
      setEditingResidente(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        usuario: null
      });
      loadData();
    } catch (error) {
      setError('Error al guardar residente: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (residente) => {
    setEditingResidente(residente);
    setFormData({
      nombre: residente.nombre,
      email: residente.email || '',
      telefono: residente.telefono || '',
      usuario: residente.usuario || null
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este residente?')) {
      try {
        await api.delete(`/usuarios/persona/${id}/`);
        loadData();
      } catch (error) {
        setError('Error al eliminar residente: ' + (error.response?.data?.detail || error.message));
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
        <p>Cargando residentes...</p>
      </div>
    );
  }

  return (
    <div className="residentes-container">
      <div className="residentes-header">
        <h2>Gestión de Residentes e Inquilinos</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nuevo Residente
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
            <h3>{editingResidente ? 'Editar Residente' : 'Nuevo Residente'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre Completo:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  placeholder="Ingrese el nombre completo"
                />
              </div>
              
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ingrese el email"
                />
              </div>
              
              <div className="form-group">
                <label>Teléfono:</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ingrese el teléfono"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingResidente ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingResidente(null);
                    setFormData({
                      nombre: '',
                      email: '',
                      telefono: '',
                      usuario: null
                    });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="residentes-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Residentes</h3>
            <p className="stat-value">{residentes.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>Total Unidades</h3>
            <p className="stat-value">{unidades.length}</p>
          </div>
        </div>
      </div>

      <div className="residentes-table-container">
        <table className="residentes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Usuario Asociado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {residentes.map((residente) => (
              <tr key={residente.id}>
                <td>{residente.id}</td>
                <td>
                  <div className="residente-name">
                    <strong>{residente.nombre}</strong>
                  </div>
                </td>
                <td>{residente.email || '-'}</td>
                <td>{residente.telefono || '-'}</td>
                <td>
                  <span className={`status-badge ${residente.usuario ? 'has-user' : 'no-user'}`}>
                    {residente.usuario ? 'Sí' : 'No'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(residente)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(residente.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                    <button 
                      className="btn-view"
                      onClick={() => {/* TODO: Ver detalles del residente */}}
                      title="Ver Detalles"
                    >
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaResidentes;
