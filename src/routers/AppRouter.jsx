import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import IniciarSesion from '../autenticacion/IniciarSesion';
import Dashboard from '../components/Dashboard';
import NotImplemented from '../components/NotImplemented';
import ListaAreasComunes from '../mantenimiento/ListaAreasComunes';
// Eliminados de la vista: ListaReservasResidente, ListaAreasDisponibles
import TareasMantenimiento from '../mantenimiento/TareasMantenimiento';
import ListaEventos from '../comunidad/ListaEventos';
import ListaComunicados from '../comunidad/ListaComunicados';

// Componentes implementados
import ListaUsuarios from '../usuarios/ListaUsuarios';
import ListaResidentes from '../usuarios/ListaResidentes';
import ListaRoles from '../usuarios/ListaRoles';
import ListaEmpleados from '../usuarios/ListaEmpleados';
import ListaUnidades from '../comunidad/ListaUnidades';
import ListaMascotas from '../comunidad/ListaMascotas';
import ListaVehiculos from '../comunidad/ListaVehiculos';
// Eliminado de la vista: ListaGastos, ListaMultas
import ReportesAnalitica from '../economia/ReportesAnalitica';
import GestionCuotasFixed from '../finanzas/GestionCuotasFixed';
// Eliminado de la vista: MisCuotas
import GestionIngresos from '../finanzas/GestionIngresos';
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
            path="vehiculos" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <ListaVehiculos />
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
          {/* Rutas eliminadas de la vista: mis-reservas, areas-disponibles */}
          <Route 
            path="tareas-mantenimiento" 
            element={
              <ProtectedRoute requiredRoles={['administrador','empleado']}>
                <TareasMantenimiento />
              </ProtectedRoute>
            } 
          />
          {/* Eliminadas rutas residuales que causaban error de referencia */}

          {/* ===== PAGOS Y FINANZAS ===== */}
          <Route 
            path="gestion-ingresos" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <GestionIngresos />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas eliminadas de la vista: reportes-financieros, presupuestos */}
          <Route 
            path="cuotas" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <GestionCuotasFixed />
              </ProtectedRoute>
            } 
          />
          {/* Ruta eliminada de la vista: mis-cuotas */}

          {/* ===== GESTIÓN ECONÓMICA AVANZADA ===== */}
          {/* Rutas eliminadas de la vista: gastos, multas */}
          <Route 
            path="reportes-analitica" 
            element={
              <ProtectedRoute requiredRoles={['administrador']}>
                <ReportesAnalitica />
              </ProtectedRoute>
            } 
          />
          {/* Rutas eliminadas de la vista: análisis-costos, proyecciones */}

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
