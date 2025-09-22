import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';
import './ListaUnidades.css';

const ListaUnidades = () => {
  const { canAccess } = useAuth();
  const [unidades, setUnidades] = useState([]);
  const [residentesUnidades, setResidentesUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState(null);
  const [formData, setFormData] = useState({
    numero_casa: '',
    metros_cuadrados: '',
    cantidad_residentes: '',
    cantidad_mascotas: '',
    cantidad_vehiculos: ''
  });

  useEffect(() => {
    if (canAccess('administrador')) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unidadesRes, residentesUnidadesRes] = await Promise.all([
  api.get('/comunidad/unidades/'),
        api.get('/comunidad/residentes-unidad/')
      ]);
      setUnidades(unidadesRes.data);
      setResidentesUnidades(residentesUnidadesRes.data);
    } catch (error) {
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUnidad) {
  await api.put(`/comunidad/unidades/${editingUnidad.id}/`, formData);
      } else {
  await api.post('/comunidad/unidades/', formData);
      }
      setShowForm(false);
      setEditingUnidad(null);
      setFormData({
        numero_casa: '',
        metros_cuadrados: '',
        cantidad_residentes: '',
        cantidad_mascotas: '',
        cantidad_vehiculos: ''
      });
      loadData();
    } catch (error) {
      setError('Error al guardar unidad: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (unidad) => {
    setEditingUnidad(unidad);
    setFormData({
      numero_casa: unidad.numero_casa,
      metros_cuadrados: unidad.metros_cuadrados,
      cantidad_residentes: unidad.cantidad_residentes,
      cantidad_mascotas: unidad.cantidad_mascotas,
      cantidad_vehiculos: unidad.cantidad_vehiculos
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta unidad?')) {
      try {
  await api.delete(`/comunidad/unidades/${id}/`);
        loadData();
      } catch (error) {
        setError('Error al eliminar unidad: ' + (error.response?.data?.detail || error.message));
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

  const getResidentesForUnidad = (unidadId) => {
    return residentesUnidades.filter(ru => ru.id_unidad === unidadId);
  };

  const formatArea = (metros) => {
    return `${metros} m²`;
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
        <p>Cargando unidades...</p>
      </div>
    );
  }

  return (
    <div className="unidades-container">
      <div className="unidades-header">
        <h2>Gestión de Unidades Habitacionales</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nueva Unidad
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
            <h3>{editingUnidad ? 'Editar Unidad' : 'Nueva Unidad'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Número de Casa:</label>
                <input
                  type="text"
                  name="numero_casa"
                  value={formData.numero_casa}
                  onChange={handleChange}
                  required
                  placeholder="Ej: A-101, B-205"
                />
              </div>
              
              <div className="form-group">
                <label>Metros Cuadrados:</label>
                <input
                  type="number"
                  name="metros_cuadrados"
                  value={formData.metros_cuadrados}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Área en metros cuadrados"
                />
              </div>
              
              <div className="form-group">
                <label>Cantidad de Residentes:</label>
                <input
                  type="number"
                  name="cantidad_residentes"
                  value={formData.cantidad_residentes}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="Número de residentes"
                />
              </div>
              
              <div className="form-group">
                <label>Cantidad de Mascotas:</label>
                <input
                  type="number"
                  name="cantidad_mascotas"
                  value={formData.cantidad_mascotas}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="Número de mascotas"
                />
              </div>
              
              <div className="form-group">
                <label>Cantidad de Vehículos:</label>
                <input
                  type="number"
                  name="cantidad_vehiculos"
                  value={formData.cantidad_vehiculos}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="Número de vehículos"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingUnidad ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUnidad(null);
                    setFormData({
                      numero_casa: '',
                      metros_cuadrados: '',
                      cantidad_residentes: '',
                      cantidad_mascotas: '',
                      cantidad_vehiculos: ''
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

      <div className="unidades-stats">
        <div className="stat-card total">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>Total Unidades</h3>
            <p className="stat-value">{unidades.length}</p>
          </div>
        </div>
        
        <div className="stat-card area">
          <div className="stat-icon">📐</div>
          <div className="stat-content">
            <h3>Área Total</h3>
            <p className="stat-value">
              {formatArea(unidades.reduce((sum, u) => sum + parseFloat(u.metros_cuadrados || 0), 0))}
            </p>
          </div>
        </div>
        
        <div className="stat-card residents">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Residentes</h3>
            <p className="stat-value">
              {unidades.reduce((sum, u) => sum + parseInt(u.cantidad_residentes || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="unidades-grid">
        {unidades.map((unidad) => {
          const residentes = getResidentesForUnidad(unidad.id);
          return (
            <div key={unidad.id} className="unidad-card">
              <div className="unidad-header">
                <h3>Unidad {unidad.numero_casa}</h3>
                <div className="unidad-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(unidad)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(unidad.id)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="unidad-details">
                <div className="detail-item">
                  <span className="detail-label">Área:</span>
                  <span className="detail-value">{formatArea(unidad.metros_cuadrados)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Residentes:</span>
                  <span className="detail-value">{unidad.cantidad_residentes}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Mascotas:</span>
                  <span className="detail-value">{unidad.cantidad_mascotas}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Vehículos:</span>
                  <span className="detail-value">{unidad.cantidad_vehiculos}</span>
                </div>
              </div>
              
              {residentes.length > 0 && (
                <div className="residentes-section">
                  <h4>Residentes Asociados:</h4>
                  <div className="residentes-list">
                    {residentes.map((ru, index) => (
                      <div key={index} className="residente-item">
                        <span className="residente-rol">{ru.rol_en_unidad}</span>
                        <span className="residente-fecha">
                          {new Date(ru.fecha_inicio).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListaUnidades;
