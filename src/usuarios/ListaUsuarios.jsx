import React, { useState, useEffect } from 'react';
import { usuariosAPI } from '../api/usuarios';
import './ListaUsuarios.css';

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_active: true,
    rol_id: ''
  });

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await usuariosAPI.getUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const cargarRoles = async () => {
    try {
      const data = await usuariosAPI.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error cargando roles:', error);
    }
  };

  const abrirModal = (usuario = null) => {
    if (usuario) {
      setEditingUser(usuario);
      setFormData({
        username: usuario.username || '',
        email: usuario.email || '',
        first_name: usuario.first_name || '',
        last_name: usuario.last_name || '',
        password: '',
        is_active: usuario.is_active || true,
        rol_id: usuario.rol?.id || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        is_active: true,
        rol_id: ''
      });
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      is_active: true,
      rol_id: ''
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!editingUser && !formData.password) {
      setFormError('La contraseña es obligatoria para crear un usuario.');
      return;
    }
    try {
      if (editingUser) {
        await usuariosAPI.updateUsuario(editingUser.id, formData);
      } else {
        await usuariosAPI.createUsuario(formData);
      }
      cargarUsuarios();
      cerrarModal();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.password) {
        setFormError(error.response.data.password);
      } else {
        setFormError('Error al guardar usuario.');
      }
      console.error('Error al guardar usuario:', error);
    }
  };

  const eliminarUsuario = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await usuariosAPI.deleteUsuario(id);
        cargarUsuarios();
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h2>Gestión de Usuarios</h2>
        <button className="btn-primary" onClick={() => abrirModal()}>
          + Nuevo Usuario
        </button>
      </div>

      <table className="table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Email</th>
            <th>Nombre Completo</th>
            <th>Estado</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.username}</td>
              <td>{usuario.email}</td>
              <td>{`${usuario.first_name || ''} ${usuario.last_name || ''}`.trim() || '-'}</td>
              <td>
                <span className={`status-badge ${usuario.is_active ? 'activo' : 'inactivo'}`}>
                  {usuario.is_active ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </td>
              <td>
                <span className={`rol-badge ${usuario.rol?.nombre?.toLowerCase() || 'usuario'}`}>
                  {usuario.rol?.nombre || 'Usuario'}
                </span>
              </td>
              <td className="acciones">
                <button 
                  className="btn-accion editar" 
                  onClick={() => abrirModal(usuario)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button 
                  className="btn-accion eliminar" 
                  onClick={() => eliminarUsuario(usuario.id)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <form onSubmit={handleSubmit}>
              {formError && <div style={{color: 'red', marginBottom: 10}}>{formError}</div>}
              <div className="form-group">
                <label>Usuario:</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Correo electrónico:</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Nombre:</label>
                <input 
                  type="text" 
                  name="first_name" 
                  value={formData.first_name} 
                  onChange={handleChange} 
                />
              </div>

              <div className="form-group">
                <label>Apellido:</label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={formData.last_name} 
                  onChange={handleChange} 
                />
              </div>

              <div className="form-group">
                <label>Contraseña:</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder={editingUser ? "Dejar vacío para mantener la actual" : "Ingrese la contraseña"}
                  required={!editingUser}
                />
              </div>

              <div className="form-group">
                <label>Rol:</label>
                <select 
                  name="rol_id" 
                  value={formData.rol_id} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map(rol => (
                    <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    name="is_active" 
                    checked={formData.is_active} 
                    onChange={handleChange} 
                  />
                  Usuario activo
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
                <button type="button" onClick={cerrarModal} className="btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaUsuarios;