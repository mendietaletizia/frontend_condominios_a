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
    const packages = [
      {
        id: 'autenticacion',
        label: 'Autenticación y Accesos',
        icon: '🔐',
        cases: [
          { id: 'cu1', label: 'CU1 - Iniciar Sesión', path: '/login', implemented: true },
          { id: 'cu2', label: 'CU2 - Cerrar Sesión', path: '/logout', implemented: true },
          { id: 'cu14', label: 'CU14 - Gestión de Accesos', path: '/accesos', implemented: false },
          { id: 'cu15', label: 'CU15 - Control de Visitas', path: '/visitas', implemented: false }
        ]
      },
      {
        id: 'usuarios',
        label: 'Usuarios y Roles',
        icon: '👥',
        cases: [
          { id: 'cu3', label: 'CU3 - Gestión de Usuarios', path: '/usuarios', implemented: true },
          { id: 'cu4', label: 'CU4 - Gestión de Roles', path: '/roles', implemented: true },
          { id: 'cu5', label: 'CU5 - Gestión de Residentes', path: '/residentes', implemented: true },
          { id: 'cu13', label: 'CU13 - Gestión de Empleados', path: '/empleados', implemented: false }
        ]
      },
      {
        id: 'comunidad',
        label: 'Unidades y Comunidad',
        icon: '🏢',
        cases: [
          { id: 'cu6', label: 'CU6 - Gestión de Unidades', path: '/unidades', implemented: true },
          { id: 'cu11', label: 'CU11 - Gestión de Eventos', path: '/eventos', implemented: false },
          { id: 'cu12', label: 'CU12 - Gestión de Reclamos', path: '/reclamos', implemented: false },
          { id: 'cu17', label: 'CU17 - Gestión de Áreas Comunes', path: '/areas-comunes', implemented: false }
        ]
      },
      {
        id: 'finanzas',
        label: 'Pagos y Finanzas',
        icon: '💰',
        cases: [
          { id: 'cu7', label: 'CU7 - Gestión de Pagos', path: '/pagos', implemented: true },
          { id: 'cu18', label: 'CU18 - Reportes Financieros', path: '/reportes-financieros', implemented: false },
          { id: 'cu21', label: 'CU21 - Gestión de Presupuestos', path: '/presupuestos', implemented: false },
          { id: 'cu22', label: 'CU22 - Conciliación Bancaria', path: '/conciliacion', implemented: false }
        ]
      },
      {
        id: 'economia',
        label: 'Gestión Económica Avanzada',
        icon: '📊',
        cases: [
          { id: 'cu8', label: 'CU8 - Gestión de Gastos', path: '/gastos', implemented: true },
          { id: 'cu9', label: 'CU9 - Gestión de Multas', path: '/multas', implemented: true },
          { id: 'cu19', label: 'CU19 - Análisis de Costos', path: '/analisis-costos', implemented: false },
          { id: 'cu20', label: 'CU20 - Proyecciones Financieras', path: '/proyecciones', implemented: false }
        ]
      },
      {
        id: 'mantenimiento',
        label: 'Mantenimiento y Reservas',
        icon: '🔧',
        cases: [
          { id: 'cu10', label: 'CU10 - Gestión de Mantenimiento', path: '/mantenimiento', implemented: true },
          { id: 'cu16', label: 'CU16 - Reservas de Áreas', path: '/reservas', implemented: false },
          { id: 'cu23', label: 'CU23 - Control de Inventario', path: '/inventario', implemented: false },
          { id: 'cu24', label: 'CU24 - Programación de Mantenimiento', path: '/programacion-mantenimiento', implemented: false }
        ]
      }
    ];

    return packages;
  };

  // Filtrar paquetes según el rol del usuario
  const getAvailablePackages = () => {
    const allPackages = getPackageStructure();
    
    if (canAccess('administrador')) {
      // Administrador ve todo
      return allPackages;
    } else if (canAccess('residente')) {
      // Residente solo ve lo que le corresponde
      return allPackages.map(pkg => ({
        ...pkg,
        cases: pkg.cases.filter(caso => 
          ['cu1', 'cu2', 'cu7'].includes(caso.id) // Solo login, logout y pagos
        )
      })).filter(pkg => pkg.cases.length > 0);
    } else if (canAccess('empleado')) {
      // Empleado ve según su cargo
      return allPackages.map(pkg => ({
        ...pkg,
        cases: pkg.cases.filter(caso => 
          ['cu1', 'cu2', 'cu6', 'cu7', 'cu8', 'cu9', 'cu10'].includes(caso.id)
        )
      })).filter(pkg => pkg.cases.length > 0);
    } else if (canAccess('seguridad')) {
      // Seguridad ve accesos y visitas
      return allPackages.map(pkg => ({
        ...pkg,
        cases: pkg.cases.filter(caso => 
          ['cu1', 'cu2', 'cu14', 'cu15'].includes(caso.id)
        )
      })).filter(pkg => pkg.cases.length > 0);
    }
    
    return [];
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

  return (
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
  );
};

export default Sidebar;
