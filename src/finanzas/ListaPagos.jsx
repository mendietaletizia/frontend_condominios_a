import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';
import './ListaPagos.css';

const ListaPagos = () => {
  const { user, canAccess } = useAuth();
  const [pagos, setPagos] = useState([]);
  const [expensas, setExpensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPago, setEditingPago] = useState(null);
  const [formData, setFormData] = useState({
    monto: '',
    metodo_pago: 'transferencia',
    fecha_vencimiento: '',
    referencia: '',
    expensa: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pagosRes, expensasRes] = await Promise.all([
        api.get('/finanzas/pago/'),
        api.get('/finanzas/expensa/')
      ]);
      setPagos(pagosRes.data);
      setExpensas(expensasRes.data);
    } catch (error) {
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPago) {
        await api.put(`/finanzas/pago/${editingPago.id}/`, formData);
      } else {
        await api.post('/finanzas/pago/', formData);
      }
      setShowForm(false);
      setEditingPago(null);
      setFormData({
        monto: '',
        metodo_pago: 'transferencia',
        fecha_vencimiento: '',
        referencia: '',
        expensa: ''
      });
      loadData();
    } catch (error) {
      setError('Error al guardar pago: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (pago) => {
    setEditingPago(pago);
    setFormData({
      monto: pago.monto,
      metodo_pago: pago.metodo_pago,
      fecha_vencimiento: pago.fecha_vencimiento,
      referencia: pago.referencia || '',
      expensa: pago.expensa || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este pago?')) {
      try {
        await api.delete(`/finanzas/pago/${id}/`);
        loadData();
      } catch (error) {
        setError('Error al eliminar pago: ' + (error.response?.data?.detail || error.message));
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

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'pagado':
        return 'estado-pagado';
      case 'pendiente':
        return 'estado-pendiente';
      case 'vencido':
        return 'estado-vencido';
      case 'cancelado':
        return 'estado-cancelado';
      default:
        return 'estado-pendiente';
    }
  };

  const getExpensaDescripcion = (expensaId) => {
    const expensa = expensas.find(e => e.id === expensaId);
    return expensa ? expensa.descripcion : 'Sin expensa asociada';
  };

  const totalPagos = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
  const pagosPagados = pagos.filter(p => p.estado_pago === 'pagado').length;
  const pagosPendientes = pagos.filter(p => p.estado_pago === 'pendiente').length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando pagos...</p>
      </div>
    );
  }

  return (
    <div className="page pagos-container">
      <div className="section">
        <div className="pagos-header">
        <h2>
          {canAccess('administrador') ? 'Gestión de Pagos' : 'Mis Pagos'}
        </h2>
        {canAccess('administrador') && (
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Nuevo Pago
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && canAccess('administrador') && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editingPago ? 'Editar Pago' : 'Nuevo Pago'}</h3>
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
                  placeholder="Ingrese el monto del pago"
                />
              </div>
              
              <div className="form-group">
                <label>Método de Pago:</label>
                <select
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleChange}
                  required
                >
                  <option value="transferencia">Transferencia</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Fecha de Vencimiento:</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  value={formData.fecha_vencimiento}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Referencia:</label>
                <input
                  type="text"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleChange}
                  placeholder="Número de referencia del pago"
                />
              </div>
              
              <div className="form-group">
                <label>Expensa Asociada:</label>
                <select
                  name="expensa"
                  value={formData.expensa}
                  onChange={handleChange}
                >
                  <option value="">Sin expensa asociada</option>
                  {expensas.map((expensa) => (
                    <option key={expensa.id} value={expensa.id}>
                      {expensa.descripcion} - {formatCurrency(expensa.monto)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingPago ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPago(null);
                    setFormData({
                      monto: '',
                      metodo_pago: 'transferencia',
                      fecha_vencimiento: '',
                      referencia: '',
                      expensa: ''
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

      <div className="pagos-stats">
        <div className="stat-card total">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Pagos</h3>
            <p className="stat-value">{formatCurrency(totalPagos)}</p>
          </div>
        </div>
        
        <div className="stat-card pagados">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Pagos Realizados</h3>
            <p className="stat-value">{pagosPagados}</p>
          </div>
        </div>
        
        <div className="stat-card pendientes">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Pagos Pendientes</h3>
            <p className="stat-value">{pagosPendientes}</p>
          </div>
        </div>
      </div>

      <div className="pagos-table-container">
        <table className="pagos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Monto</th>
              <th>Método de Pago</th>
              <th>Estado</th>
              <th>Fecha de Vencimiento</th>
              <th>Fecha de Pago</th>
              <th>Referencia</th>
              <th>Expensa</th>
              {canAccess('administrador') && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id}>
                <td>{pago.id}</td>
                <td>
                  <span className="monto-value">
                    {formatCurrency(pago.monto)}
                  </span>
                </td>
                <td>
                  <span className="metodo-pago">
                    {pago.metodo_pago}
                  </span>
                </td>
                <td>
                  <span className={`estado-badge ${getEstadoBadgeClass(pago.estado_pago)}`}>
                    {pago.estado_pago}
                  </span>
                </td>
                <td>
                  <span className="fecha-value">
                    {formatDate(pago.fecha_vencimiento)}
                  </span>
                </td>
                <td>
                  <span className="fecha-value">
                    {pago.fecha_pago ? formatDate(pago.fecha_pago) : '-'}
                  </span>
                </td>
                <td>
                  <span className="referencia-value">
                    {pago.referencia || '-'}
                  </span>
                </td>
                <td>
                  <div className="expensa-cell">
                    {getExpensaDescripcion(pago.expensa)}
                  </div>
                </td>
                {canAccess('administrador') && (
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(pago)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(pago.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default ListaPagos;
