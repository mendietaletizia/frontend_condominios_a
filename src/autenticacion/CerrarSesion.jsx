import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CerrarSesion.css';

const CerrarSesion = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className="logout-container">
      <div className="user-info">
        <span className="user-name">Bienvenido, {user?.username}</span>
        <span className="user-role">({user?.rol})</span>
      </div>
      <button 
        onClick={handleLogout}
        className="logout-button"
        title="Cerrar sesión"
      >
        <span className="logout-icon">🚪</span>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default CerrarSesion;
