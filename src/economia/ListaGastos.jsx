import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';
import './ListaGastos.css';

const ListaGastos = () => {
  const { canAccess } = useAuth();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingGasto, setEditingGasto] = useState(null);
  const [formData, setFormData] = useState({
    monto: '',
    descripcion: '',
    fecha_hora: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    if (canAccess('administrador')) {
      loadGastos();
    }
  }, []);

  const loadGastos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/gastos/');
      setGastos(response.data);
    } catch (error) {
      setError('Error al cargar gastos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGasto) {
        await api.put(`/gastos/${editingGasto.id}/`, formData);
      } else {
        await api.post('/gastos/', formData);
      }
      setShowForm(false);
      setEditingGasto(null);
      setFormData({
        monto: '',
        descripcion: '',
        fecha_hora: new Date().toISOString().slice(0, 16)
      });
      loadGastos();
    } catch (error) {
      setError('Error al guardar gasto: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (gasto) => {
    setEditingGasto(gasto);
    setFormData({
      monto: gasto.monto,
      descripcion: gasto.descripcion,
      fecha_hora: new Date(gasto.fecha_hora).toISOString().slice(0, 16)
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este gasto?')) {
      try {
        await api.delete(`/gastos/${id}/`);
        loadGastos();
      } catch (error) {
        setError('Error al eliminar gasto: ' + (error.response?.data?.detail || error.message));
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalGastos = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto || 0), 0);

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
        <p>Cargando gastos...</p>
      </div>
    );
  }

  return (
    <div className="page gastos-container">
      <div className="section">
        <div className="gastos-header">
        <h2>Gestión de Gastos del Condominio</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nuevo Gasto
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
            <h3>{editingGasto ? 'Editar Gasto' : 'Nuevo Gasto'}</h3>
            <form onSubmit={handleSubmit}>
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
                  placeholder="Ingrese el monto del gasto"
                />
              </div>
              
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describa el gasto realizado"
                />
              </div>
              
              <div className="form-group">
                <label>Fecha y Hora:</label>
                <input
                  type="datetime-local"
                  name="fecha_hora"
                  value={formData.fecha_hora}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingGasto ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGasto(null);
                    setFormData({
                      monto: '',
                      descripcion: '',
                      fecha_hora: new Date().toISOString().slice(0, 16)
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

      <div className="gastos-stats">
        <div className="stat-card total">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>Total de Gastos</h3>
            <p className="stat-value">{formatCurrency(totalGastos)}</p>
          </div>
        </div>
        
        <div className="stat-card count">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Número de Gastos</h3>
            <p className="stat-value">{gastos.length}</p>
          </div>
        </div>
        
        <div className="stat-card average">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>Promedio por Gasto</h3>
            <p className="stat-value">
              {gastos.length > 0 ? formatCurrency(totalGastos / gastos.length) : formatCurrency(0)}
            </p>
          </div>
        </div>
      </div>

      <div className="gastos-table-container">
        <table className="gastos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Monto</th>
              <th>Descripción</th>
              <th>Fecha y Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map((gasto) => (
              <tr key={gasto.id}>
                <td>{gasto.id}</td>
                <td>
                  <span className="monto-value">
                    {formatCurrency(gasto.monto)}
                  </span>
                </td>
                <td>
                  <div className="descripcion-cell">
                    {gasto.descripcion}
                  </div>
                </td>
                <td>
                  <span className="fecha-value">
                    {formatDate(gasto.fecha_hora)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(gasto)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(gasto.id)}
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
    </div>
  );
};

export default ListaGastos;
