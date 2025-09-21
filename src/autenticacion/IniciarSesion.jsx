import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { testConnection, testLogin } from '../api/testConnection';
import './IniciarSesion.css';

const IniciarSesion = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
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
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleTestConnection = async () => {
    setConnectionStatus('Probando...');
    const isConnected = await testConnection();
    setConnectionStatus(isConnected ? '✅ Conectado' : '❌ Sin conexión');
  };

  const handleTestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await testLogin('jael', 'password123');
      if (result) {
        setError('✅ Login de prueba exitoso');
      } else {
        setError('❌ Login de prueba falló');
      }
    } catch (error) {
      setError('❌ Error en login de prueba');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Sistema de Gestión de Condominio</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario:</label>
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

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
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

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-info">
          <p><strong>Usuarios de prueba:</strong></p>
          <ul>
            <li><strong>Administrador:</strong> jael / password123</li>
            <li><strong>Residente:</strong> residente1 / password123</li>
            <li><strong>Residente:</strong> residente2 / password123</li>
            <li><strong>Residente:</strong> residente3 / password123</li>
          </ul>
          
          <div className="test-buttons">
            <button 
              type="button"
              className="test-button"
              onClick={() => {
                setFormData({ username: 'jael', password: 'password123' });
              }}
            >
              Cargar Admin
            </button>
            <button 
              type="button"
              className="test-button"
              onClick={() => {
                setFormData({ username: 'residente1', password: 'password123' });
              }}
            >
              Cargar Residente
            </button>
          </div>
          
          <div className="connection-test">
            <button 
              type="button"
              className="test-button connection-button"
              onClick={handleTestConnection}
            >
              Probar Conexión
            </button>
            <button 
              type="button"
              className="test-button connection-button"
              onClick={handleTestLogin}
            >
              Probar Login
            </button>
            {connectionStatus && (
              <div className="connection-status">
                {connectionStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IniciarSesion;
