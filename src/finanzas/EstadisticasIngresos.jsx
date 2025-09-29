import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Select, DatePicker, Spin, message } from 'antd';
import { 
  DollarOutlined, TrendingUpOutlined, BarChartOutlined, 
  PieChartOutlined, LineChartOutlined, TrophyOutlined 
} from '@ant-design/icons';
import api from '../api/config';
import './EstadisticasIngresos.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const EstadisticasIngresos = () => {
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');

  useEffect(() => {
    cargarEstadisticas();
  }, [periodo]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ingresos/estadisticas/');
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      message.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const getTipoColor = (tipo) => {
    const colors = {
      'cuotas': '#1890ff',
      'multas': '#ff4d4f',
      'servicios': '#52c41a',
      'alquiler': '#faad14',
      'eventos': '#722ed1',
      'donaciones': '#13c2c2',
      'otros': '#8c8c8c'
    };
    return colors[tipo] || '#8c8c8c';
  };

  const getTipoDisplayName = (tipo) => {
    const names = {
      'cuotas': 'Cuotas Mensuales',
      'multas': 'Multas',
      'servicios': 'Servicios Adicionales',
      'alquiler': 'Alquiler de Áreas',
      'eventos': 'Eventos',
      'donaciones': 'Donaciones',
      'otros': 'Otros Ingresos'
    };
    return names[tipo] || tipo;
  };

  const columnsTendencia = [
    {
      title: 'Mes',
      dataIndex: 'mes',
      key: 'mes',
      render: (mes) => {
        const [año, mesNum] = mes.split('-');
        const meses = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `${meses[parseInt(mesNum) - 1]} ${año}`;
      }
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${parseFloat(total).toLocaleString()}`,
      sorter: (a, b) => parseFloat(a.total) - parseFloat(b.total),
    }
  ];

  const columnsTopUnidades = [
    {
      title: 'Posición',
      key: 'posicion',
      render: (_, __, index) => (
        <div style={{ textAlign: 'center' }}>
          {index === 0 && <TrophyOutlined style={{ color: '#faad14', fontSize: '20px' }} />}
          {index === 1 && <TrophyOutlined style={{ color: '#8c8c8c', fontSize: '20px' }} />}
          {index === 2 && <TrophyOutlined style={{ color: '#cd7f32', fontSize: '20px' }} />}
          {index > 2 && <span style={{ fontWeight: 'bold' }}>{index + 1}</span>}
        </div>
      )
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad',
      key: 'unidad',
    },
    {
      title: 'Total Ingresos',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${parseFloat(total).toLocaleString()}`,
      sorter: (a, b) => parseFloat(a.total) - parseFloat(b.total),
    }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="estadisticas-ingresos">
      <div className="page-header">
        <h1><BarChartOutlined /> Estadísticas de Ingresos</h1>
        <Select
          value={periodo}
          onChange={setPeriodo}
          style={{ width: 120 }}
        >
          <Option value="mes">Mes Actual</Option>
          <Option value="año">Año Actual</Option>
        </Select>
      </div>

      {/* Estadísticas Principales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Ingresos del Mes"
              value={estadisticas.total_ingresos_mes || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Ingresos del Año"
              value={estadisticas.total_ingresos_año || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Promedio Mensual"
              value={estadisticas.promedio_mensual || 0}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Crecimiento Mensual"
              value={estadisticas.crecimiento_mensual || 0}
              suffix="%"
              precision={2}
              prefix={<TrendingUpOutlined />}
              valueStyle={{ 
                color: (estadisticas.crecimiento_mensual || 0) >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Ingresos por Tipo */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Distribución por Tipo de Ingreso" className="chart-card">
            <div className="ingresos-por-tipo">
              {Object.entries(estadisticas.ingresos_por_tipo || {}).map(([tipo, monto]) => {
                const porcentaje = estadisticas.total_ingresos_año > 0 
                  ? (monto / estadisticas.total_ingresos_año) * 100 
                  : 0;
                
                return (
                  <div key={tipo} className="tipo-item">
                    <div className="tipo-header">
                      <span 
                        className="tipo-color" 
                        style={{ backgroundColor: getTipoColor(tipo) }}
                      />
                      <span className="tipo-nombre">{getTipoDisplayName(tipo)}</span>
                      <span className="tipo-monto">${parseFloat(monto).toLocaleString()}</span>
                    </div>
                    <Progress 
                      percent={porcentaje} 
                      strokeColor={getTipoColor(tipo)}
                      showInfo={false}
                      size="small"
                    />
                    <div className="tipo-porcentaje">{porcentaje.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Top Unidades por Ingresos" className="chart-card">
            <Table
              columns={columnsTopUnidades}
              dataSource={estadisticas.top_unidades_ingresos || []}
              pagination={false}
              size="small"
              rowKey="unidad"
            />
          </Card>
        </Col>
      </Row>

      {/* Tendencia Mensual */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Tendencia de Ingresos (Últimos 12 Meses)" className="chart-card">
            <Table
              columns={columnsTendencia}
              dataSource={estadisticas.tendencia_mensual || []}
              pagination={false}
              size="small"
              rowKey="mes"
            />
          </Card>
        </Col>
      </Row>

      {/* Resumen de Crecimiento */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12}>
          <Card title="Crecimiento Anual" className="growth-card">
            <div className="growth-content">
              <div className="growth-value">
                <TrendingUpOutlined style={{ 
                  color: (estadisticas.crecimiento_anual || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: '24px',
                  marginRight: '8px'
                }} />
                <span className="growth-number" style={{
                  color: (estadisticas.crecimiento_anual || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {(estadisticas.crecimiento_anual || 0).toFixed(2)}%
                </span>
              </div>
              <div className="growth-description">
                Comparado con el año anterior
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12}>
          <Card title="Crecimiento Mensual" className="growth-card">
            <div className="growth-content">
              <div className="growth-value">
                <LineChartOutlined style={{ 
                  color: (estadisticas.crecimiento_mensual || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: '24px',
                  marginRight: '8px'
                }} />
                <span className="growth-number" style={{
                  color: (estadisticas.crecimiento_mensual || 0) >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {(estadisticas.crecimiento_mensual || 0).toFixed(2)}%
                </span>
              </div>
              <div className="growth-description">
                Comparado con el mes anterior
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EstadisticasIngresos;
