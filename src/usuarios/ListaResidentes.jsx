import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';
import { usuariosAPI } from '../api/usuarios';
import './ListaResidentes.css';

const ListaResidentes = () => {
  const { canAccess } = useAuth();
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
    const [usuariosResidentes, setUsuariosResidentes] = useState([]); // Initialize usuariosResidentes
  const [personas, setPersonas] = useState([]);
  const [relaciones, setRelaciones] = useState([]);
  const [residentesRaw, setResidentesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingResidente, setEditingResidente] = useState(null);
  const [formData, setFormData] = useState({
    ci: '',
    nombre: '',
    email: '',
    telefono: '',
    tipo: 'residente',
    unidad: '',
    usuario_asociado: '',
  });


  useEffect(() => {
    if (canAccess('administrador')) {
      loadData();
      loadUsuariosResidentes(); // Load residents' users
    }
  }, []);

  const loadUsuariosResidentes = async () => {
    try {
      const usuarios = await usuariosAPI.getUsuarios();
      
      // Filtrar usuarios con rol residente (tanto por string como por objeto)
      const usuariosResidentes = usuarios.filter(u => {
        if (typeof u.rol === 'string') {
          return u.rol.toLowerCase() === 'residente';
        } else if (u.rol && u.rol.nombre) {
          return u.rol.nombre.toLowerCase() === 'residente';
        }
        return false;
      });
      
      setUsuariosResidentes(usuariosResidentes);
    } catch (error) {
      setUsuariosResidentes([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Traer datos básicos
      const [personasRes, residentesRes, relacionesRes, unidadesRes] = await Promise.all([
        api.get('/usuarios/persona/'),
        api.get('/usuarios/residentes/'),
        api.get('/comunidad/residentes-unidad/'),
        api.get('/comunidad/unidades/')
      ]);


      setPersonas(personasRes.data);
      setResidentesRaw(residentesRes.data);
      setRelaciones(relacionesRes.data);
      setUnidades(unidadesRes.data);

      // Procesar residentes para la tabla
      const residentesTabla = residentesRes.data.map(residente => {
        const persona = personasRes.data.find(p => p.id === residente.persona);
        const relacion = relacionesRes.data.find(r => r.id_residente === residente.id);
        const unidad = relacion ? unidadesRes.data.find(u => u.id === relacion.id_unidad) : null;
        const usuarioAsociado = usuariosResidentes.find(u => u.id === residente.usuario_asociado);

        return {
          id: residente.id,
          persona_id: persona ? persona.id : null,
          ci: persona ? persona.ci : '-',
          nombre: persona ? persona.nombre : '-',
          email: persona ? persona.email : '-',
          telefono: persona ? persona.telefono : '-',
          tipo: relacion ? relacion.rol_en_unidad : 'Sin unidad asignada',
          unidad_nombre: unidad ? unidad.numero_casa : 'Sin asignar',
          usuario: residente.usuario,
          usuario_asociado: usuarioAsociado ? usuarioAsociado.username : null,
          rel_id: relacion ? relacion.id : null,
          tiene_relacion_unidad: !!relacion
        };
      });

      setResidentes(residentesTabla);
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
        // Modo edición
        await handleUpdate(e);
        return;
      }

      // 1. Crear persona
      const personaRes = await api.post('/usuarios/persona/', {
        ci: formData.ci,
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono
      });
      const personaId = personaRes.data.id;

      // 2. Crear residente (con usuario_asociado si aplica)
      const residenteData = {
        persona: personaId,
        usuario: null, // Por defecto no tiene usuario propio
        usuario_asociado: formData.usuario_asociado || null
      };
      
      const residenteRes = await api.post('/usuarios/residentes/', residenteData);
      const residenteId = residenteRes.data.id;

      // 3. Crear relación ResidentesUnidad SOLO si se seleccionó una unidad
      if (formData.unidad) {
        const relacionData = {
          id_residente: residenteId,
          id_unidad: parseInt(formData.unidad),
          rol_en_unidad: formData.tipo,
          fecha_inicio: new Date().toISOString().slice(0, 10),
          estado: true
        };
        
        await api.post('/comunidad/residentes-unidad/', relacionData);
      }

      setShowForm(false);
      setEditingResidente(null);
      setFormData({
        ci: '',
        nombre: '',
        email: '',
        telefono: '',
        tipo: 'residente',
        unidad: '',
        usuario_asociado: ''
      });
      
      // Recargar datos y usuarios
      await loadUsuariosResidentes();
      await loadData();
      
    } catch (error) {
      setError('Error al guardar residente: ' + (error.response?.data?.detail || error.response?.data?.error || error.message));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      
      // Validar datos antes de enviar
      if (!formData.nombre || !formData.ci) {
        setError('El nombre y el CI son obligatorios.');
        return;
      }

      if (formData.ci.length > 20) {
        setError('El CI no puede exceder los 20 caracteres.');
        return;
      }

      // Validar que el residente y la persona asociada existan
      if (!editingResidente || !editingResidente.persona_id) {
        setError('No se puede actualizar porque no se encontró el residente o la persona asociada.');
        return;
      }

      
      
      // 1. Actualizar persona
      if (editingResidente.persona_id) {
        await api.put(`/usuarios/persona/${editingResidente.persona_id}/`, {
          ci: formData.ci,
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono
        });
      }
      
      // 2. Actualizar residente
      await api.put(`/usuarios/residentes/${editingResidente.id}/`, {
        persona: editingResidente.persona_id,
        usuario: editingResidente.usuario,
        usuario_asociado: formData.usuario_asociado || null
      });

      // 3. Actualizar o crear relación ResidentesUnidad
      if (formData.unidad) {
        const relacionData = {
          id_residente: editingResidente.id,
          id_unidad: parseInt(formData.unidad),
          rol_en_unidad: formData.tipo,
          fecha_inicio: new Date().toISOString().slice(0, 10),
          estado: true
        };
        
        if (editingResidente.rel_id) {
          // Actualizar relación existente
          await api.put(`/comunidad/residentes-unidad/${editingResidente.rel_id}/`, relacionData);
        } else {
          // Crear nueva relación
          await api.post('/comunidad/residentes-unidad/', relacionData);
        }
      } else if (editingResidente.rel_id) {
        // Eliminar relación si ya no tiene unidad
        await api.delete(`/comunidad/residentes-unidad/${editingResidente.rel_id}/`);
      }

      setShowForm(false);
      setEditingResidente(null);
      setFormData({
        ci: '',
        nombre: '',
        email: '',
        telefono: '',
        tipo: 'residente',
        unidad: '',
        usuario_asociado: ''
      });
      
      await loadUsuariosResidentes();
      await loadData();
      
    } catch (error) {
      setError('Error al actualizar residente: ' + (error.response?.data?.detail || error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (residente) => {
    setEditingResidente(residente);
    setFormData({
      ci: residente.ci !== '-' ? residente.ci : '',
      nombre: residente.nombre !== '-' ? residente.nombre : '',
      email: residente.email !== '-' ? residente.email : '',
      telefono: residente.telefono !== '-' ? residente.telefono : '',
      tipo: residente.tipo && residente.tipo !== 'Sin unidad asignada' ? residente.tipo : 'residente',
      unidad: unidades.find(u => u.numero_casa === residente.unidad_nombre)?.id || '',
      usuario_asociado: usuariosResidentes.find(u => u.username === residente.usuario_asociado)?.id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro que desea eliminar este residente? Esta acción no se puede deshacer.')) {
      try {
        
        // Buscar el residente y su información
        const residente = residentesRaw.find(r => r.id === id);
        if (!residente) {
          throw new Error('Residente no encontrado');
        }
        
        const personaId = residente.persona;
        
        // 1. Eliminar relación ResidentesUnidad si existe
        const rel = relaciones.find(r => r.id_residente === id);
        if (rel) {
          await api.delete(`/comunidad/residentes-unidad/${rel.id}/`);
        }
        
        // 2. Eliminar residente
        await api.delete(`/usuarios/residentes/${id}/`);
        
        // 3. Eliminar persona
        // Verificar que la persona asociada exista antes de eliminar
        if (!editingResidente.persona_id) {
          setError('No se puede eliminar porque no se encontró una persona asociada.');
          return;
        }

        await api.delete(`/usuarios/persona/${personaId}/`);
        
        // Recargar datos
        await loadUsuariosResidentes();
        await loadData();
        
      } catch (error) {
        setError('Error al eliminar residente: ' + (error.response?.data?.detail || error.response?.data?.error || error.message));
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
                <label>CI:</label>
                <input
                  type="text"
                  name="ci"
                  value={formData.ci}
                  onChange={handleChange}
                  placeholder="Ingrese el CI (opcional)"
                />
              </div>
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
              <div className="form-group">
                <label>Tipo:</label>
                <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                  <option value="residente">Residente</option>
                  <option value="inquilino">Inquilino</option>
                </select>
              </div>
              <div className="form-group">
                <label>Unidad (opcional):</label>
                <select name="unidad" value={formData.unidad} onChange={handleChange}>
                  <option value="">Sin unidad asignada</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.numero_casa}</option>
                  ))}
                </select>
                <small>Puede asignar la unidad después si no está disponible ahora</small>
              </div>
              <div className="form-group">
                <label>Usuario Asociado (para dependientes):</label>
                <select name="usuario_asociado" value={formData.usuario_asociado || ''} onChange={handleChange}>
                  <option value="">Residente independiente (sin usuario asociado)</option>
                  {usuariosResidentes.map(u => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                  ))}
                </select>
                <small>Selecciona un usuario si este residente es dependiente (ej: hijo de familia)</small>
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
                      ci: '',
                      nombre: '',
                      email: '',
                      telefono: '',
                      tipo: 'residente',
                      unidad: '',
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
              <th>CI</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Unidad</th>
              <th>Usuario Asociado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {residentes.map((residente) => (
              <tr key={residente.id}>
                <td>{residente.ci || '-'}</td>
                <td>
                  <div className="residente-name">
                    <strong>{residente.nombre}</strong>
                  </div>
                </td>
                <td>{residente.email || '-'}</td>
                <td>{residente.telefono || '-'}</td>
                <td>{residente.tipo || '-'}</td>
                <td>{residente.unidad_nombre || '-'}</td>
                <td>
                  {residente.usuario_asociado ? (
                    <span className="status-badge associated" title="Dependiente de usuario">
                      👨‍👩‍👧‍👦 {residente.usuario_asociado}
                    </span>
                  ) : residente.usuario ? (
                    <span className="status-badge has-user" title="Residente principal con usuario">
                      👤 Usuario propio
                    </span>
                  ) : (
                    <span className="status-badge no-user" title="Residente independiente sin usuario">
                      ➖ Independiente
                    </span>
                  )}
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
