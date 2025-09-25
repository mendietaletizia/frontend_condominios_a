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
          { id: 'cu13', label: 'CU13 - Gestión de Empleados', path: '/empleados', implemented: true, roles: ['administrador'] }
        ]
      },
      {
        id: 'comunidad',
        label: 'Unidades y Comunidad',
        icon: '🏢',
        cases: [
          { id: 'cu6', label: 'CU6 - Gestión de Unidades', path: '/unidades', implemented: true, roles: ['administrador', 'residente'] },
          { id: 'cu11', label: 'CU11 - Gestión de Eventos', path: '/eventos', implemented: true, roles: ['administrador', 'residente'] },
          { id: 'cu12', label: 'CU12 - Gestión de Reclamos', path: '/reclamos', implemented: true, roles: ['administrador', 'residente'] },
          { id: 'cu17', label: 'CU17 - Gestión de Áreas Comunes', path: '/areas-comunes', implemented: true, roles: ['administrador', 'residente'] }
        ]
      },
      {
        id: 'finanzas',
        label: 'Pagos y Finanzas',
        icon: '💰',
        cases: [
          { id: 'cu18', label: 'CU18 - Reportes Financieros', path: '/reportes-financieros', implemented: true, roles: ['administrador', 'residente'] }
        ]
      },
      {
        id: 'economia',
        label: 'Gestión Económica Avanzada',
        icon: '📊',
        cases: [
          { id: 'cu8', label: 'CU8 - Gestión de Gastos', path: '/gastos', implemented: true, roles: ['administrador'] },
          { id: 'cu9', label: 'CU9 - Gestión de Multas', path: '/multas', implemented: true, roles: ['administrador', 'residente'] },
          { id: 'cu19', label: 'CU19 - Análisis de Costos', path: '/analisis-costos', implemented: true, roles: ['administrador'] },
          { id: 'cu20', label: 'CU20 - Proyecciones Financieras', path: '/proyecciones', implemented: true, roles: ['administrador'] }
        ]
      },
      {
        id: 'mantenimiento',
        label: 'Mantenimiento y Reservas',
        icon: '🔧',
        cases: [
          { id: 'cu10', label: 'CU10 - Gestión de Mantenimiento', path: '/mantenimiento', implemented: true, roles: ['administrador', 'empleado'] }
        ]
      }
    ];
    return packages;
  };

  // Filtrar paquetes según el rol del usuario
  const getAvailablePackages = () => {
    const allPackages = getPackageStructure();
    if (!user) return [];
    const userRole = user.rol?.toLowerCase();
    if (userRole === 'administrador') {
      // Administrador ve todo lo implementado
      return allPackages.map(pkg => ({
        ...pkg,
        cases: pkg.cases.filter(caso => caso.implemented)
      })).filter(pkg => pkg.cases.length > 0);
    }
    // Otros roles solo ven lo implementado y lo que les corresponde
    return allPackages.map(pkg => ({
      ...pkg,
      cases: pkg.cases.filter(caso => caso.implemented && caso.roles.includes(userRole))
    })).filter(pkg => pkg.cases.length > 0);
  };

  const packages = getAvailablePackages();

  const handleNavigation = (path) => {
    navigate(path);
    if (onToggle) {
      onToggle(); // Cerrar sidebar en móvil después de navegar
    }
  };

  const toggleMenu = (packageId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleBackdropClick = () => {
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="sidebar-backdrop show"
          onClick={handleBackdropClick}
        />
      )}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Sistema Condominio</h3>
          <div className="user-role-badge">
            {user?.rol}
          </div>
        </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {/* Dashboard siempre visible */}
          <li className="nav-item">
            <button
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => handleNavigation('/dashboard')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Dashboard</span>
            </button>
          </li>

          {/* Paquetes con menús desplegables */}
          {packages.map((pkg) => (
            <li key={pkg.id} className="nav-item package-item">
              <button
                className={`nav-link package-link ${expandedMenus[pkg.id] ? 'expanded' : ''}`}
                onClick={() => toggleMenu(pkg.id)}
              >
                <span className="nav-icon">{pkg.icon}</span>
                <span className="nav-label">{pkg.label}</span>
                <span className="nav-arrow">
                  {expandedMenus[pkg.id] ? '▼' : '▶'}
                </span>
              </button>
              
              {/* Submenú de casos de uso */}
              {expandedMenus[pkg.id] && (
                <ul className="submenu">
                  {pkg.cases.map((caso) => (
                    <li key={caso.id} className="submenu-item">
                      <button
                        className={`submenu-link ${isActive(caso.path) ? 'active' : ''} ${!caso.implemented ? 'not-implemented' : ''}`}
                        onClick={() => caso.implemented ? handleNavigation(caso.path) : null}
                        disabled={!caso.implemented}
                        title={!caso.implemented ? 'Caso de uso no implementado' : ''}
                      >
                        <span className="submenu-icon">
                          {caso.implemented ? '✅' : '⏳'}
                        </span>
                        <span className="submenu-label">{caso.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
    </>
  );
};

export default Sidebar;
