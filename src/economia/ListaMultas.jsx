import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';
import './ListaMultas.css';

const ListaMultas = () => {
  const { canAccess } = useAuth();
  const [multas, setMultas] = useState([]);
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMulta, setEditingMulta] = useState(null);
  const [formData, setFormData] = useState({
    motivo: '',
    monto: '',
    fecha: new Date().toISOString().slice(0, 10),
    residente: ''
  });

  useEffect(() => {
    if (canAccess('administrador')) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [multasRes, residentesRes] = await Promise.all([
        api.get('/economia/multa/'),
        api.get('/usuarios/persona/')
      ]);
      setMultas(multasRes.data);
      setResidentes(residentesRes.data);
    } catch (error) {
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMulta) {
        await api.put(`/economia/multa/${editingMulta.id}/`, formData);
      } else {
        await api.post('/economia/multa/', formData);
      }
      setShowForm(false);
      setEditingMulta(null);
      setFormData({
        motivo: '',
        monto: '',
        fecha: new Date().toISOString().slice(0, 10),
        residente: ''
      });
      loadData();
    } catch (error) {
      setError('Error al guardar multa: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (multa) => {
    setEditingMulta(multa);
    setFormData({
      motivo: multa.motivo,
      monto: multa.monto,
      fecha: multa.fecha,
      residente: multa.residente
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar esta multa?')) {
      try {
        await api.delete(`/economia/multa/${id}/`);
        loadData();
      } catch (error) {
        setError('Error al eliminar multa: ' + (error.response?.data?.detail || error.message));
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getResidenteNombre = (residenteId) => {
    const residente = residentes.find(r => r.id === residenteId);
    return residente ? residente.nombre : 'Residente no encontrado';
  };

  const totalMultas = multas.reduce((sum, multa) => sum + parseFloat(multa.monto || 0), 0);

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
        <p>Cargando multas...</p>
      </div>
    );
  }

  return (
    <div className="multas-container">
      <div className="multas-header">
        <h2>Gestión de Multas y Sanciones</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nueva Multa
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
            <h3>{editingMulta ? 'Editar Multa' : 'Nueva Multa'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Residente:</label>
                <select
                  name="residente"
                  value={formData.residente}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un residente</option>
                  {residentes.map((residente) => (
                    <option key={residente.id} value={residente.id}>
                      {residente.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Motivo:</label>
                <textarea
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describa el motivo de la multa"
                />
              </div>
              
              <div className="form-group">
                <label>Monto:</label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Ingrese el monto de la multa"
                />
              </div>
              
              <div className="form-group">
                <label>Fecha:</label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingMulta ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMulta(null);
                    setFormData({
                      motivo: '',
                      monto: '',
                      fecha: new Date().toISOString().slice(0, 10),
                      residente: ''
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

      <div className="multas-stats">
        <div className="stat-card total">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>Total en Multas</h3>
            <p className="stat-value">{formatCurrency(totalMultas)}</p>
          </div>
        </div>
        
        <div className="stat-card count">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Número de Multas</h3>
            <p className="stat-value">{multas.length}</p>
          </div>
        </div>
        
        <div className="stat-card average">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Promedio por Multa</h3>
            <p className="stat-value">
              {multas.length > 0 ? formatCurrency(totalMultas / multas.length) : formatCurrency(0)}
            </p>
          </div>
        </div>
      </div>

      <div className="multas-table-container">
        <table className="multas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Residente</th>
              <th>Motivo</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {multas.map((multa) => (
              <tr key={multa.id}>
                <td>{multa.id}</td>
                <td>
                  <div className="residente-cell">
                    <strong>{getResidenteNombre(multa.residente)}</strong>
                  </div>
                </td>
                <td>
                  <div className="motivo-cell">
                    {multa.motivo}
                  </div>
                </td>
                <td>
                  <span className="monto-value">
                    {formatCurrency(multa.monto)}
                  </span>
                </td>
                <td>
                  <span className="fecha-value">
                    {formatDate(multa.fecha)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(multa)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(multa.id)}
                      title="Eliminar"
                    >
                      🗑️
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

export default ListaMultas;
