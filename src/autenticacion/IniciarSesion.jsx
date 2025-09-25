import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import './IniciarSesion.css';

const IniciarSesion = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    if (result.success) {
      // Redirigir según el rol del usuario
      const { rol } = result.user;
      if (rol?.toLowerCase() === 'administrador') {
        navigate('/dashboard');
      } else if (rol?.toLowerCase() === 'residente') {
        navigate('/residente');
      } else if (rol?.toLowerCase() === 'empleado') {
        navigate('/empleado');
      } else if (rol?.toLowerCase() === 'seguridad') {
        navigate('/seguridad');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Mensaje personalizado para error 400 o credenciales
      let msg = result.error;
      if (
        msg?.includes('400') ||
        msg?.toLowerCase().includes('solicitud falló') ||
        msg?.toLowerCase().includes('bad request') ||
        msg?.toLowerCase().includes('credenciales') ||
        msg?.toLowerCase().includes('no autorizado')
      ) {
        msg = 'Usuario o contraseña incorrectos. Por favor, verifica tus datos.';
      }
      setError(msg);
    }
    setLoading(false);
  };



  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
            </svg>
          </div>
          <h1>INICIAR SESIÓN</h1>
          <p>Sistema de Gestión de Condominios</p>
        </div>

        {error && (
          <div className="error-message">
            <svg className="error-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M21,9V7L15,1H5C3.89,1 3,1.89 3,3V21C3,22.11 3.89,23 5,23H19C20.11,23 21,22.11 21,21V9M19,9H14V4H19V9Z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-group">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ingrese su nombre de usuario"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-group">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Ingrese su contraseña"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-state">
                <svg className="spinner" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1A11,11 0 0,0 1,12A11,11 0 0,0 12,23A11,11 0 0,0 23,12A11,11 0 0,0 12,1M12,21A9,9 0 0,1 3,12A9,9 0 0,1 12,3A9,9 0 0,1 21,12A9,9 0 0,1 12,21Z"/>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>


      </div>
    </div>
  );
};

export default IniciarSesion;
