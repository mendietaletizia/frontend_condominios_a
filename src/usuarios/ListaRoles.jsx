import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';
import './ListaRoles.css';

const ListaRoles = () => {
  const { canAccess } = useAuth();
  const [roles, setRoles] = useState([]);
  const [rolesFront, setRolesFront] = useState([]); // para roles agregados en frontend
  const [toast, setToast] = useState(null); // feedback visual
  const [editingFrontIndex, setEditingFrontIndex] = useState(null); // índice del rolFront en edición
  const [permisos, setPermisos] = useState([]);
  const [rolPermisos, setRolPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
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
      const rolesList = Array.isArray(rolesRes.data) ? rolesRes.data : (Array.isArray(rolesRes.data?.results) ? rolesRes.data.results : []);
      const permisosList = Array.isArray(permisosRes.data) ? permisosRes.data : (Array.isArray(permisosRes.data?.results) ? permisosRes.data.results : []);
      const rpList = Array.isArray(rolPermisosRes.data) ? rolPermisosRes.data : (Array.isArray(rolPermisosRes.data?.results) ? rolPermisosRes.data.results : []);
      setRoles(rolesList);
      setPermisos(permisosList);
      setRolPermisos(rpList);
    } catch (error) {
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nombre.trim()) {
      if (editingFrontIndex !== null) {
        // Editar rol existente en rolesFront
        setRolesFront(prev => prev.map((r, i) => i === editingFrontIndex ? {
          ...r,
          nombre: formData.nombre,
          permisos: formData.permisos
        } : r));
        setToast({ type: 'success', msg: 'Rol editado correctamente.' });
      } else {
        // Agregar nuevo rol
        setRolesFront(prev => [
          ...prev,
          {
            id: roles.length + prev.length + 1,
            nombre: formData.nombre,
            permisos: formData.permisos
          }
        ]);
        setToast({ type: 'success', msg: 'Rol creado correctamente.' });
      }
    }
    setShowForm(false);
    setFormData({ nombre: '', permisos: [] });
    setEditingFrontIndex(null);
    setTimeout(() => setToast(null), 2000);
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
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>Nuevo Rol</h3>
            <form onSubmit={e => {e.preventDefault(); setShowForm(false); setFormData({ nombre: '', permisos: [] });}}>
              <div className="form-group">
                <label>Nombre del Rol:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={e => setFormData(f => ({...f, nombre: e.target.value}))}
                  required
                  placeholder="Ingrese el nombre del rol"
                />
              </div>
              <div className="form-group">
                <label>Permisos:</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'6px'}}>
                  {[
                    'Ver usuarios',
                    'Crear usuarios',
                    'Editar usuarios',
                    'Eliminar usuarios',
                    'Ver roles',
                    'Editar roles',
                    'Gestionar accesos',
                    'Controlar visitas',
                    'Ver pagos',
                    'Registrar pagos',
                    'Ver unidades',
                    'Gestionar comunidad',
                    'Ver economía',
                    'Gestionar mantenimiento',
                    'Reservar áreas',
                  ].map((permiso, idx) => (
                    <label key={idx} style={{background:'#f5f6fa',border:'1px solid #e0e0e0',borderRadius:'12px',padding:'4px 10px',cursor:'pointer',fontSize:'13px'}}>
                      <input
                        type="checkbox"
                        checked={formData.permisos?.includes(permiso)}
                        onChange={e => {
                          setFormData(f => {
                            if (e.target.checked) return {...f, permisos: [...(f.permisos||[]), permiso]};
                            return {...f, permisos: (f.permisos||[]).filter(p => p !== permiso)};
                          });
                        }}
                        style={{marginRight:'4px'}}
                      />
                      {permiso}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-actions" style={{marginTop:'18px'}}>
                <button type="submit" className="btn-primary">
                  Crear
                </button>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ nombre: '', permisos: [] });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      <div className="roles-sections">
        <div className="roles-section">
          <h3>Roles del Sistema</h3>
          <div className="roles-table-container">
            <table className="roles-table" style={{tableLayout:'auto'}}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del Rol</th>
                  <th>Permisos Asignados</th>
                </tr>
              </thead>
              <tbody>
                {[...roles, ...rolesFront].map((rol, idx) => {
                  // Permisos simulados por rol
                  let permisosSimulados = [];
                  if (rol.permisos && rol.permisos.length > 0) {
                    permisosSimulados = rol.permisos;
                  } else if (rol.nombre?.toLowerCase() === 'administrador') {
                    permisosSimulados = ['Todos los permisos'];
                  } else if (rol.nombre?.toLowerCase() === 'residente') {
                    permisosSimulados = ['Ver pagos', 'Ver unidades', 'Reservar áreas', 'Ver economía'];
                  } else if (rol.nombre?.toLowerCase() === 'empleado') {
                    permisosSimulados = ['Gestionar comunidad', 'Gestionar mantenimiento', 'Controlar visitas'];
                  } else if (rol.nombre?.toLowerCase() === 'seguridad') {
                    permisosSimulados = ['Gestionar accesos', 'Controlar visitas'];
                  }
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
                          {permisosSimulados.length > 0 ? (
                            permisosSimulados.map((permiso, index) => (
                              <span key={index} className="permiso-badge" style={{background:'#e0e7ff',color:'#333',padding:'4px 10px',borderRadius:'12px',marginRight:'6px',fontSize:'13px'}}>
                                {permiso}
                              </span>
                            ))
                          ) : (
                            <span className="no-permisos">Sin permisos asignados</span>
                          )}
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
          <div className="permisos-grid" style={{display:'flex',flexWrap:'wrap',gap:'12px',justifyContent:'center'}}>
            {/* Lista simulada de permisos */}
            {[
              'Ver usuarios',
              'Crear usuarios',
              'Editar usuarios',
              'Eliminar usuarios',
              'Ver roles',
              'Editar roles',
              'Gestionar accesos',
              'Controlar visitas',
              'Ver pagos',
              'Registrar pagos',
              'Ver unidades',
              'Gestionar comunidad',
              'Ver economía',
              'Gestionar mantenimiento',
              'Reservar áreas',
            ].map((permiso, idx) => (
              <div key={idx} className="permiso-card" style={{background:'#fff',border:'1px solid #e0e0e0',borderRadius:'6px',padding:'10px 18px',minWidth:'180px',boxShadow:'0 1px 4px #eee'}}>
                <div className="permiso-id">P{idx+1}</div>
                <div className="permiso-descripcion">{permiso}</div>
              </div>
            ))}
          </div>
  </div>
      </div>
    </div>
  );
};

export default ListaRoles;
