import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { economiaAPI, finanzasAPI, comunidadAPI } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const { user, canAccess } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (canAccess('administrador')) {
        // Cargar estadísticas para administrador
        const [financieroRes, morosidadRes] = await Promise.all([
          economiaAPI.getResumenFinanciero(),
          economiaAPI.getPredecirMorosidad()
        ]);
        
        setStats({
          financiero: financieroRes,
          morosidad: morosidadRes
        });
      } else if (canAccess('residente')) {
        // Cargar datos específicos del residente
        const [pagosRes, notificacionesRes] = await Promise.all([
          finanzasAPI.getPagos(),
          comunidadAPI.getNotificaciones()
        ]);
        
        setStats({
          pagos: pagosRes,
          notificaciones: notificacionesRes
        });
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAdminDashboard = () => (
    <div className="dashboard-admin">
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>Estadísticas Financieras</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h4>Total Pagos</h4>
                <p className="stat-value">${stats.financiero?.total_pagos || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h4>Total Expensas</h4>
                <p className="stat-value">${stats.financiero?.total_expensas || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💸</div>
              <div className="stat-content">
                <h4>Total Gastos</h4>
                <p className="stat-value">${stats.financiero?.total_gastos || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h4>Total Multas</h4>
                <p className="stat-value">${stats.financiero?.total_multas || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Análisis de Morosidad</h3>
          <div className="morosidad-info">
            <div className="morosidad-card">
              <div className="morosidad-icon">📈</div>
              <div className="morosidad-content">
                <p><strong>Total en Morosidad:</strong></p>
                <p className="morosidad-value">${stats.morosidad?.estadisticas?.total_morosidad || 0}</p>
              </div>
            </div>
            <div className="morosidad-card">
              <div className="morosidad-icon">👥</div>
              <div className="morosidad-content">
                <p><strong>Residentes Morosos:</strong></p>
                <p className="morosidad-value">{stats.morosidad?.estadisticas?.cantidad_morosos || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResidentDashboard = () => (
    <div className="dashboard-resident">
      <h2>Mi Dashboard</h2>
      
      <div className="resident-info">
        <div className="info-card">
          <h3>Mis Pagos</h3>
          <p>Total de pagos: {stats.pagos?.length || 0}</p>
          <p>Pagos pendientes: {stats.pagos?.filter(p => p.estado_pago === 'pendiente').length || 0}</p>
        </div>
        
        <div className="info-card">
          <h3>Notificaciones</h3>
          <p>Total: {stats.notificaciones?.length || 0}</p>
          <p>No leídas: {stats.notificaciones?.filter(n => !n.leido).length || 0}</p>
        </div>
      </div>
    </div>
  );

  const renderEmployeeDashboard = () => (
    <div className="dashboard-employee">
      <h2>Dashboard de Empleado</h2>
      <p>Bienvenido al sistema de gestión de condominio.</p>
      <p>Su cargo: <strong>{user?.rol}</strong></p>
    </div>
  );

  const renderSecurityDashboard = () => (
    <div className="dashboard-security">
      <h2>Dashboard de Seguridad</h2>
      <p>Panel de control de acceso y seguridad.</p>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        {canAccess('administrador') && renderAdminDashboard()}
        {canAccess('residente') && renderResidentDashboard()}
        {canAccess('empleado') && renderEmployeeDashboard()}
        {canAccess('seguridad') && renderSecurityDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
