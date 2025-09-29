import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, canAccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  // Definir la estructura de paquetes según el backend
  const getPackageStructure = () => {
    // Definir a qué roles pertenece cada CU
    const packages = [
      {
        id: 'autenticacion',
        label: 'Autenticación y Accesos',
        icon: '🔐',
        cases: [
          { id: 'cu14', label: 'CU14 - Gestión de Accesos', path: '/accesos', implemented: true, roles: ['administrador', 'seguridad'] },
          { id: 'cu15', label: 'CU15 - Gestión de Invitados', path: '/invitados', implemented: true, roles: ['administrador', 'seguridad', 'residente'] }
        ]
      },
      {
        id: 'usuarios',
        label: 'Usuarios y Roles',
        icon: '👥',
        cases: [
          { id: 'cu3', label: 'CU3 - Gestión de Usuarios', path: '/usuarios', implemented: true, roles: ['administrador'] },
          { id: 'cu4', label: 'CU4 - Gestión de Roles', path: '/roles', implemented: true, roles: ['administrador'] },
          { id: 'cu5', label: 'CU5 - Gestión de Residentes', path: '/residentes', implemented: true, roles: ['administrador'] },
          { id: 'cu13', label: 'CU13 - Gestión de Empleados', path: '/empleados', implemented: true, roles: ['administrador', 'empleado', 'seguridad'] }
        ]
      },
      {
        id: 'comunidad',
        label: 'Comunidad',
        icon: '🏘️',
        cases: [
          { id: 'cu6', label: 'CU6 - Gestión de Unidades', path: '/unidades', implemented: true, roles: ['administrador'] },
          { id: 'cu7', label: 'CU7 - Gestión de Vehículos', path: '/vehiculos', implemented: true, roles: ['administrador'] },
          { id: 'cu11', label: 'CU11 - Eventos', path: '/eventos', implemented: true, roles: ['administrador'] },
          { id: 'cu12', label: 'CU12 - Comunicados', path: '/reclamos', implemented: true, roles: ['administrador'] }
        ]
      },
      {
        id: 'economia',
        label: 'Economía y Finanzas',
        icon: '💰',
        cases: [
          { id: 'cu18', label: 'CU18 - Gestión de Ingresos', path: '/gestion-ingresos', implemented: true, roles: ['administrador'] },
        ]
      }
    ];

    return packages;
  };

  const packages = getPackageStructure();


  const handleNavigate = (path) => {
    navigate(path);
    if (onToggle) onToggle(false);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const toggleMenu = (id) => {
    setExpandedMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        {packages.map((pkg) => (
          <div key={pkg.id} className="sidebar-section">
            <div className="sidebar-section-header" onClick={() => toggleMenu(pkg.id)}>
              <span className="icon">{pkg.icon}</span>
              <span className="label">{pkg.label}</span>
              <span className="chevron">{expandedMenus[pkg.id] ? '▼' : '▶'}</span>
            </div>
            {expandedMenus[pkg.id] && (
              <ul className="sidebar-menu">
                {pkg.cases.map((cu) => (
                  canAccess(cu.roles) && (
                    <li key={cu.id} className={`sidebar-item ${isActive(cu.path) ? 'active' : ''}`} onClick={() => handleNavigate(cu.path)}>
                      <span>{cu.label}</span>
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
