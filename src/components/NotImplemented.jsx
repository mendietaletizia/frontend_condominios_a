import React from 'react';
import './NotImplemented.css';

const NotImplemented = ({ title, description }) => {
  return (
    <div className="not-implemented-container">
      <div className="not-implemented-content">
        <div className="not-implemented-icon">🚧</div>
        <h2>{title || 'Funcionalidad en Desarrollo'}</h2>
        <p>{description || 'Esta funcionalidad está siendo desarrollada y estará disponible próximamente.'}</p>
        <div className="not-implemented-features">
          <h3>Próximamente incluirá:</h3>
          <ul>
            <li>✅ Interfaz completa de gestión</li>
            <li>✅ Integración con el backend</li>
            <li>✅ Validaciones y seguridad</li>
            <li>✅ Reportes y estadísticas</li>
          </ul>
        </div>
        <div className="not-implemented-actions">
          <button 
            className="btn-primary"
            onClick={() => window.history.back()}
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotImplemented;

