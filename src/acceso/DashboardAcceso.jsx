import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space, Tag, Progress, Alert } from 'antd';
import { CarOutlined, UserOutlined, SettingOutlined, BarChartOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import accesoAPI from '../api/acceso';
import './DashboardAcceso.css';

const DashboardAcceso = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDashboard();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const data = await accesoAPI.getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos del dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'autorizado': return 'success';
      case 'denegado': return 'error';
      case 'pendiente': return 'warning';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'autorizado': return <CheckCircleOutlined />;
      case 'denegado': return <CloseCircleOutlined />;
      case 'pendiente': return <ClockCircleOutlined />;
      default: return null;
    }
  };

  const columns = [
    {
      title: 'Placa',
      dataIndex: 'placa_detectada',
      key: 'placa_detectada',
      render: (placa) => <Tag color="blue">{placa}</Tag>,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_acceso',
      key: 'tipo_acceso',
      render: (tipo) => tipo === 'entrada' ? 'Entrada' : 'Salida',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_acceso',
      key: 'estado_acceso',
      render: (estado) => (
        <Tag color={getEstadoColor(estado)} icon={getEstadoIcon(estado)}>
          {estado.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Confianza IA',
      dataIndex: 'ia_confidence',
      key: 'ia_confidence',
      render: (confidence) => (
        <Progress
          percent={confidence}
          size="small"
          status={confidence >= 80 ? 'success' : confidence >= 60 ? 'normal' : 'exception'}
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: 'Fecha/Hora',
      dataIndex: 'fecha_hora',
      key: 'fecha_hora',
      render: (fecha) => new Date(fecha).toLocaleString(),
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Cargando dashboard de acceso...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={cargarDashboard}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <div className="dashboard-acceso">
      <div className="dashboard-header">
        <h1>
          <CarOutlined /> Control de Acceso Vehicular
        </h1>
        <Button type="primary" onClick={cargarDashboard}>
          Actualizar
        </Button>
      </div>

      {dashboardData && (
        <>
          {/* Estadísticas Principales */}
          <Row gutter={[16, 16]} className="stats-row">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Registros"
                  value={dashboardData.estadisticas.total_registros}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Hoy"
                  value={dashboardData.estadisticas.registros_hoy}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tasa de Éxito"
                  value={dashboardData.estadisticas.tasa_exito}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Pendientes"
                  value={dashboardData.estadisticas.pendientes}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Métricas Detalladas */}
          <Row gutter={[16, 16]} className="metrics-row">
            <Col xs={24} md={12}>
              <Card title="Estado de Accesos" className="metrics-card">
                <div className="metrics-content">
                  <div className="metric-item">
                    <div className="metric-label">Autorizados</div>
                    <div className="metric-value success">
                      {dashboardData.estadisticas.autorizados}
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Denegados</div>
                    <div className="metric-value error">
                      {dashboardData.estadisticas.denegados}
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Pendientes</div>
                    <div className="metric-value warning">
                      {dashboardData.estadisticas.pendientes}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Placas Activas" className="metrics-card">
                <div className="metrics-content">
                  <div className="metric-item">
                    <div className="metric-label">
                      <UserOutlined /> Residentes
                    </div>
                    <div className="metric-value">
                      {dashboardData.placas.residentes_activas}
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">
                      <CarOutlined /> Invitados
                    </div>
                    <div className="metric-value">
                      {dashboardData.placas.invitados_activos}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Últimos Registros */}
          <Card
            title="Últimos Registros de Acceso"
            className="recent-records"
            extra={
              <Button type="link" size="small">
                Ver Todos
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={dashboardData.ultimos_registros}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
            />
          </Card>

          {/* Acciones Rápidas */}
          <Card title="Acciones Rápidas" className="quick-actions">
            <Space wrap>
              <Button type="primary" icon={<SettingOutlined />}>
                Configuración
              </Button>
              <Button icon={<UserOutlined />}>
                Gestionar Residentes
              </Button>
              <Button icon={<CarOutlined />}>
                Gestionar Invitados
              </Button>
              <Button icon={<BarChartOutlined />}>
                Reportes
              </Button>
            </Space>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardAcceso;
