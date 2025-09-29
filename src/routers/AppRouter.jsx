import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import IniciarSesion from '../autenticacion/IniciarSesion';
import Dashboard from '../components/Dashboard';
import NotImplemented from '../components/NotImplemented';
import ListaAreasComunes from '../mantenimiento/ListaAreasComunes';
import ListaReservasResidente from '../mantenimiento/ListaReservasResidente';
import ListaAreasDisponibles from '../mantenimiento/ListaAreasDisponibles';
import ListaEventos from '../comunidad/ListaEventos';
import ListaComunicados from '../comunidad/ListaComunicados';

// Componentes implementados
import ListaUsuarios from '../usuarios/ListaUsuarios';
import ListaResidentes from '../usuarios/ListaResidentes';
import ListaRoles from '../usuarios/ListaRoles';
import ListaEmpleados from '../usuarios/ListaEmpleados';
import ListaUnidades from '../comunidad/ListaUnidades';
import ListaMascotas from '../comunidad/ListaMascotas';
import ListaGastos from '../economia/ListaGastos';
import ListaMultas from '../economia/ListaMultas';
import ReportesAnalitica from '../economia/ReportesAnalitica';
import GestionCuotasFixed from '../finanzas/GestionCuotasFixed';
import MisCuotas from '../finanzas/MisCuotas';
import GestionIngresos from '../finanzas/GestionIngresos';
import EstadisticasIngresos from '../finanzas/EstadisticasIngresos';
import DashboardAcceso from '../acceso/DashboardAcceso';
import DashboardInvitados from '../invitados/DashboardInvitados';
import Layout from '../components/Layout';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, canAccess } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles requeridos, verificar permisos
  if (requiredRoles.length > 0) {
    const hasPermission = requiredRoles.some(role => canAccess(role));
    if (!hasPermission) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Componente para rutas públicas (solo accesibles sin autenticación)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <IniciarSesion />
            </PublicRoute>
          } 
        />

        {/* Rutas protegidas con layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard - accesible para todos los usuarios autenticados */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* ===== AUTENTICACIÓN Y ACCESOS ===== */}
          <Route
            path="accesos"
            element={
              <ProtectedRoute requiredRoles={['administrador', 'seguridad']}>
                <DashboardAcceso />
              </ProtectedRoute>
            }
          />
          <Route
            path="invitados"
            element={
              <ProtectedRoute requiredRoles={['administrador', 'seguridad', 'residente']}>
                <DashboardInvitados />
              </ProtectedRoute>
            }
          />

          {/* ===== USUARIOS Y ROLES ===== */}
          <Route 
            path="usuarios" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <ListaUsuarios />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="roles" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <ListaRoles />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="residentes" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <ListaResidentes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="empleados" 
            element={
              <ProtectedRoute requiredRoles={['administrador', 'empleado', 'seguridad']}>
                <ListaEmpleados />
              </ProtectedRoute>
            } 
          />

          {/* ===== UNIDADES Y COMUNIDAD ===== */}
          <Route 
            path="unidades" 
            element={
              <ProtectedRoute requiredRoles={['administrador', 'empleado']}>
                <ListaUnidades />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="mascotas" 
            element={
              <ProtectedRoute requiredRoles={['administrador', 'residente']}>
                <ListaMascotas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="eventos" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <ListaEventos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="reclamos" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <ListaComunicados />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="areas-comunes" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <ListaAreasComunes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="mis-reservas" 
            element={
              <ProtectedRoute requiredRoles={['residente']}>
                <ListaReservasResidente />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="areas-disponibles" 
            element={
              <ProtectedRoute requiredRoles={['residente']}>
                <ListaAreasDisponibles />
              </ProtectedRoute>
            } 
          />

          {/* ===== PAGOS Y FINANZAS ===== */}
          <Route 
            path="gestion-ingresos" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <GestionIngresos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="estadisticas-ingresos" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <EstadisticasIngresos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="reportes-financieros" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <NotImplemented 
                  title="CU18 - Reportes Financieros"
                  description="Sistema de generación de reportes financieros y análisis de ingresos y gastos."
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="presupuestos" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <NotImplemented 
                  title="CU21 - Gestión de Presupuestos"
                  description="Sistema de gestión y control de presupuestos anuales del condominio."
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="cuotas" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <GestionCuotasFixed />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="mis-cuotas" 
            element={
              <ProtectedRoute requiredRoles={['residente']}>
                <MisCuotas />
              </ProtectedRoute>
            } 
          />

          {/* ===== GESTIÓN ECONÓMICA AVANZADA ===== */}
          <Route 
            path="gastos" 
            element={
              <ProtectedRoute requiredRoles={['administrador', 'empleado']}>
                <ListaGastos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="multas" 
            element={
              <ProtectedRoute requiredRoles={['administrador', 'empleado']}>
                <ListaMultas />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="reportes-analitica" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <ReportesAnalitica />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="analisis-costos" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <NotImplemented 
                  title="CU19 - Análisis de Costos"
                  description="Sistema de análisis de costos operativos y optimización de gastos del condominio."
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="proyecciones" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <NotImplemented 
                  title="CU20 - Proyecciones Financieras"
                  description="Sistema de proyecciones financieras y planificación económica a largo plazo."
                />
              </ProtectedRoute>
            } 
          />

          {/* ===== MANTENIMIENTO Y RESERVAS ===== */}
          <Route 
            path="mantenimiento" 
            element={
              <ProtectedRoute requiredRoles={['administrador', 'empleado']}>
                <NotImplemented 
                  title="CU10 - Gestión de Mantenimiento"
                  description="Sistema de gestión de mantenimiento preventivo y correctivo del condominio."
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="reservas" 
            element={
              <ProtectedRoute requiredRoles={['administrador', 'residente']}>
                <NotImplemented 
                  title="CU16 - Reservas de Áreas"
                  description="Sistema de reservas de áreas comunes y espacios del condominio."
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="inventario" 
            element={
              <ProtectedRoute requiredRoles={['administrador', 'empleado']}>
                <NotImplemented 
                  title="CU23 - Control de Inventario"
                  description="Sistema de control de inventario de equipos y materiales del condominio."
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="programacion-mantenimiento" 
            element={
              <ProtectedRoute requiredRoles={['administrador', 'empleado']}>
                <NotImplemented 
                  title="CU24 - Programación de Mantenimiento"
                  description="Sistema de programación y seguimiento de tareas de mantenimiento."
                />
              </ProtectedRoute>
            } 
          />

          {/* Rutas para residentes */}
          <Route 
            path="residente" 
            element={
              <ProtectedRoute requiredRoles={['residente']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Rutas para empleados */}
          <Route 
            path="empleado" 
            element={
              <ProtectedRoute requiredRoles={['empleado']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Rutas para seguridad */}
          <Route 
            path="seguridad" 
            element={
              <ProtectedRoute requiredRoles={['seguridad']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Ruta por defecto - redirigir a dashboard si está autenticado, sino a login */}
        <Route 
          path="*" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
