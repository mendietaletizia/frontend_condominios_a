import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Table, Button, Space, Tag, Modal, message, Statistic, Row, Col, Alert, Spin } from 'antd';
import { 
  DollarOutlined, CalendarOutlined, HomeOutlined, 
  CheckCircleOutlined, AlertOutlined, ExclamationCircleOutlined,
  CreditCardOutlined, EyeOutlined
} from '@ant-design/icons';
import { finanzasAPI } from '../api/finanzas';
import api from '../api/config';
import './MisCuotas.css';

const MisCuotas = () => {
  const { canAccess, user } = useAuth();
  const [cuotasPendientes, setCuotasPendientes] = useState([]);
  const [cuotasPagadas, setCuotasPagadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagoLoading, setPagoLoading] = useState({});

  useEffect(() => {
    if (canAccess('residente')) {
      loadMisCuotas();
    }
  }, []);

  const loadMisCuotas = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [pendientesRes, pagadasRes] = await Promise.all([
        api.get('/finanzas/cuotas-residente/mis_cuotas_pendientes/'),
        api.get('/finanzas/cuotas-residente/mis_cuotas_pagadas/')
      ]);
      
      setCuotasPendientes(pendientesRes.data || []);
      setCuotasPagadas(pagadasRes.data || []);
    } catch (error) {
      console.error('Error cargando cuotas:', error);
      setError('Error al cargar las cuotas: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePagarOnline = async (cuota) => {
    try {
      setPagoLoading(prev => ({ ...prev, [cuota.id]: true }));
      
      const response = await api.post(`/finanzas/cuotas-residente/${cuota.id}/pagar_online/`);
      
      if (response.data.payment_url) {
        // Redirigir a la pasarela de pago
        window.open(response.data.payment_url, '_blank');
        message.success('Redirigiendo a la pasarela de pago...');
      } else {
        message.error('Error al generar el enlace de pago');
      }
    } catch (error) {
      message.error('Error al iniciar el pago: ' + (error.response?.data?.detail || error.message));
    } finally {
      setPagoLoading(prev => ({ ...prev, [cuota.id]: false }));
    }
  };

  const verDetallesPago = (cuota) => {
    Modal.info({
      title: `Detalles de la Cuota - ${cuota.cuota_mensual}`,
      width: 600,
      content: (
        <div>
          <Row gutter={16}>
            <Col span={12}>
              <p><strong>Unidad:</strong> {cuota.unidad_numero}</p>
              <p><strong>Mes/Año:</strong> {cuota.cuota_mensual}</p>
              <p><strong>Monto Total:</strong> Bs. {parseFloat(cuota.monto).toLocaleString()}</p>
            </Col>
            <Col span={12}>
              <p><strong>Estado:</strong> 
                <Tag color={getEstadoColor(cuota.estado)} style={{ marginLeft: 8 }}>
                  {cuota.estado.toUpperCase()}
                </Tag>
              </p>
              <p><strong>Fecha Límite:</strong> {new Date(cuota.fecha_limite).toLocaleDateString()}</p>
              <p><strong>Monto Pagado:</strong> Bs. {parseFloat(cuota.monto_pagado || 0).toLocaleString()}</p>
            </Col>
          </Row>
          
          {cuota.observaciones && (
            <div style={{ marginTop: 16 }}>
              <p><strong>Observaciones:</strong></p>
              <p style={{ background: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                {cuota.observaciones}
              </p>
            </div>
          )}
          
          {cuota.payment_id && (
            <div style={{ marginTop: 16 }}>
              <p><strong>Información de Pago:</strong></p>
              <p>ID de Pago: {cuota.payment_id}</p>
              {cuota.payment_url && (
                <Button 
                  type="link" 
                  onClick={() => window.open(cuota.payment_url, '_blank')}
                  icon={<CreditCardOutlined />}
                >
                  Ver enlace de pago
                </Button>
              )}
            </div>
          )}
        </div>
      ),
    });
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'pagada': 'green',
      'pendiente': 'blue',
      'vencida': 'red',
      'procesando': 'orange',
      'fallido': 'red'
    };
    return colors[estado] || 'default';
  };

  const getEstadoIcon = (estado) => {
    const icons = {
      'pagada': <CheckCircleOutlined />,
      'pendiente': <AlertOutlined />,
      'vencida': <ExclamationCircleOutlined />,
      'procesando': <AlertOutlined />,
      'fallido': <ExclamationCircleOutlined />
    };
    return icons[estado] || <AlertOutlined />;
  };

  const canPay = (cuota) => {
    return cuota.estado === 'pendiente' || cuota.estado === 'vencida';
  };

  // Estadísticas
  const estadisticas = {
    totalPendientes: cuotasPendientes.length,
    totalPagadas: cuotasPagadas.length,
    montoPendiente: cuotasPendientes.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0),
    montoPagado: cuotasPagadas.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0)
  };

  // Columnas para cuotas pendientes
  const columnasPendientes = [
    {
      title: 'Mes/Año',
      dataIndex: 'cuota_mensual',
      key: 'mes_año',
      width: 100,
      render: (mes) => (
        <Space>
          <CalendarOutlined />
          <span>{mes}</span>
        </Space>
      ),
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad_numero',
      key: 'unidad',
      width: 80,
      render: (unidad) => (
        <Space>
          <HomeOutlined />
          <span>{unidad}</span>
        </Space>
      ),
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      width: 120,
      render: (monto) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          Bs. {parseFloat(monto || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      render: (estado) => (
        <Tag color={getEstadoColor(estado)} icon={getEstadoIcon(estado)}>
          {estado.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Vencimiento',
      dataIndex: 'fecha_limite',
      key: 'fecha_limite',
      width: 120,
      render: (fecha) => {
        const fechaLimite = new Date(fecha);
        const hoy = new Date();
        const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
        
        return (
          <span style={{ 
            color: diasRestantes < 0 ? '#ff4d4f' : diasRestantes < 7 ? '#faad14' : '#52c41a' 
          }}>
            {fechaLimite.toLocaleDateString()}
            {diasRestantes < 0 && <div style={{ fontSize: '12px' }}>Vencida</div>}
            {diasRestantes >= 0 && diasRestantes < 7 && (
              <div style={{ fontSize: '12px' }}>{diasRestantes} días</div>
            )}
          </span>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={() => handlePagarOnline(record)}
            loading={pagoLoading[record.id]}
            disabled={!canPay(record)}
            size="small"
          >
            Pagar Online
          </Button>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => verDetallesPago(record)}
            size="small"
          >
            Ver Detalles
          </Button>
        </Space>
      ),
    },
  ];

  // Columnas para cuotas pagadas
  const columnasPagadas = [
    {
      title: 'Mes/Año',
      dataIndex: 'cuota_mensual',
      key: 'mes_año',
      width: 100,
      render: (mes) => (
        <Space>
          <CalendarOutlined />
          <span>{mes}</span>
        </Space>
      ),
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad_numero',
      key: 'unidad',
      width: 80,
      render: (unidad) => (
        <Space>
          <HomeOutlined />
          <span>{unidad}</span>
        </Space>
      ),
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      width: 120,
      render: (monto) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          Bs. {parseFloat(monto || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Fecha de Pago',
      dataIndex: 'fecha_pago',
      key: 'fecha_pago',
      width: 120,
      render: (fecha) => fecha ? new Date(fecha).toLocaleDateString() : '-',
    },
    {
      title: 'Método',
      dataIndex: 'payment_method',
      key: 'payment_method',
      width: 100,
      render: (metodo) => metodo || 'Manual',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => verDetallesPago(record)}
          size="small"
        >
          Ver Detalles
        </Button>
      ),
    },
  ];

  if (!canAccess('residente')) {
    return (
      <div className="access-denied">
        <h2>Acceso Denegado</h2>
        <p>No tiene permisos para acceder a esta sección.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
        <div>Cargando sus cuotas...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-mis-cuotas">
      <div className="dashboard-header">
        <h1>💰 Mis Cuotas del Condominio</h1>
        <p>Gestiona y paga tus cuotas mensuales de forma online</p>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Estadísticas */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card>
            <Statistic
              title="Cuotas Pendientes"
              value={estadisticas.totalPendientes}
              valueStyle={{ color: '#faad14' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cuotas Pagadas"
              value={estadisticas.totalPagadas}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Monto Pendiente"
              value={estadisticas.montoPendiente}
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Monto Pagado"
              value={estadisticas.montoPagado}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Cuotas Pendientes */}
      <Card 
        title="📋 Cuotas Pendientes de Pago" 
        style={{ marginBottom: 24 }}
        extra={
          <Tag color="orange" icon={<AlertOutlined />}>
            {cuotasPendientes.length} cuotas
          </Tag>
        }
      >
        {cuotasPendientes.length > 0 ? (
          <Table
            columns={columnasPendientes}
            dataSource={cuotasPendientes}
            rowKey="id"
            pagination={false}
            size="small"
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
            <p style={{ marginTop: 16, fontSize: '16px', color: '#666' }}>
              ¡Excelente! No tienes cuotas pendientes de pago.
            </p>
          </div>
        )}
      </Card>

      {/* Cuotas Pagadas */}
      <Card 
        title="✅ Historial de Cuotas Pagadas"
        extra={
          <Tag color="green" icon={<CheckCircleOutlined />}>
            {cuotasPagadas.length} cuotas
          </Tag>
        }
      >
        {cuotasPagadas.length > 0 ? (
          <Table
            columns={columnasPagadas}
            dataSource={cuotasPagadas}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} cuotas`,
            }}
            size="small"
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <AlertOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            <p style={{ marginTop: 16, fontSize: '16px', color: '#666' }}>
              Aún no tienes cuotas pagadas.
            </p>
          </div>
        )}
      </Card>

      {/* Información sobre pagos online */}
      <Card title="💳 Información sobre Pagos Online">
        <Alert
          message="Pagos Seguros y Rápidos"
          description={
            <div>
              <p>• <strong>Pago Online:</strong> Utiliza tu tarjeta de crédito o débito para pagar de forma segura</p>
              <p>• <strong>Confirmación Inmediata:</strong> Recibirás confirmación del pago al instante</p>
              <p>• <strong>Historial:</strong> Todos tus pagos quedan registrados en tu historial</p>
              <p>• <strong>Soporte:</strong> Si tienes problemas con el pago, contacta a la administración</p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default MisCuotas;
