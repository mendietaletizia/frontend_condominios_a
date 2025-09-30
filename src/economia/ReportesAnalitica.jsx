import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space,
  message, Row, Col, Statistic
} from 'antd';
import { 
  BarChartOutlined, LineChartOutlined, RiseOutlined, WarningOutlined
} from '@ant-design/icons';
import api from '../api/config';
import './ReportesAnalitica.css';

const ReportesAnalitica = () => {
  const [resumenFinanciero, setResumenFinanciero] = useState({});
  const [analisisMorosidad, setAnalisisMorosidad] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Construir dashboard mínimo desde endpoints existentes
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');

      // 1) Ingresos confirmados
      const ingresosRes = await api.get('/ingresos/', { params: { estado: 'confirmado' } });
      const ingresos = ingresosRes.data.results || ingresosRes.data || [];
      const totalMes = ingresos
        .filter(i => (i.fecha_ingreso || '').startsWith(`${year}-${month}`))
        .reduce((s, i) => s + parseFloat(i.monto || 0), 0);
      const totalAño = ingresos
        .filter(i => (i.fecha_ingreso || '').startsWith(`${year}-`))
        .reduce((s, i) => s + parseFloat(i.monto || 0), 0);

      // 2) Morosidad desde cuotas por unidad
      const cuotasRes = await api.get('/cuotas-unidad/');
      const cuotas = cuotasRes.data.results || cuotasRes.data || [];
      const totalMorosidad = cuotas
        .filter(c => ['pendiente', 'vencida', 'parcial'].includes(c.estado))
        .reduce((s, c) => s + parseFloat(c.saldo_pendiente || (c.monto - (c.monto_pagado || 0)) || 0), 0);
      const vencidas = cuotas.filter(c => c.estado === 'vencida').length;

      // 3) Top morosos (simple por residente)
      const deudaPorResidente = {};
      cuotas.forEach(c => {
        if (['pendiente', 'vencida', 'parcial'].includes(c.estado)) {
          const key = c.residente_nombre || 'Sin nombre';
          const deuda = parseFloat(c.saldo_pendiente || (c.monto - (c.monto_pagado || 0)) || 0);
          deudaPorResidente[key] = (deudaPorResidente[key] || 0) + deuda;
        }
      });
      const top = Object.entries(deudaPorResidente)
        .map(([residente, total_deuda]) => ({ residente, total_deuda }))
        .sort((a, b) => b.total_deuda - a.total_deuda)
        .slice(0, 5);

      setResumenFinanciero({
        total_ingresos: totalMes,
        total_ingresos_anio: totalAño,
        saldo_neto: totalMes, // mínimo: sin egresos
        margen_utilidad: 0
      });
      setAnalisisMorosidad({
        total_morosidad: totalMorosidad,
        residentes_morosos: top.length,
        porcentaje_morosidad: 0,
        top_morosos: top
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
      message.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (modalType === 'reporte') {
        const dataToSend = {
          ...values,
          fecha_inicio: values.fecha_inicio.format('YYYY-MM-DD'),
          fecha_fin: values.fecha_fin.format('YYYY-MM-DD')
        };

        if (editingItem) {
          await api.put(`/reportes-financieros/${editingItem.id}/`, dataToSend);
          message.success('Reporte actualizado exitosamente');
        } else {
          await api.post('/reportes-financieros/generar_reporte/', dataToSend);
          message.success('Reporte generado exitosamente');
        }
      } else if (modalType === 'analisis') {
        const dataToSend = {
          ...values,
          periodo_inicio: values.periodo_inicio.format('YYYY-MM-DD'),
          periodo_fin: values.periodo_fin.format('YYYY-MM-DD')
        };

        if (editingItem) {
          await api.put(`/analisis-financieros/${editingItem.id}/`, dataToSend);
          message.success('Análisis actualizado exitosamente');
        } else {
          await api.post('/analisis-financieros/analizar_tendencia/', dataToSend);
          message.success('Análisis generado exitosamente');
        }
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingItem(null);
      cargarDatos();
    } catch (error) {
      console.error('Error guardando:', error);
      message.error('Error al guardar: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      fecha_inicio: item.fecha_inicio ? moment(item.fecha_inicio) : null,
      fecha_fin: item.fecha_fin ? moment(item.fecha_fin) : null,
      periodo_inicio: item.periodo_inicio ? moment(item.periodo_inicio) : null,
      periodo_fin: item.periodo_fin ? moment(item.periodo_fin) : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id, type) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este elemento?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const endpoint = type === 'reporte' ? 'reportes-financieros' : 'analisis-financieros';
          await api.delete(`/${endpoint}/${id}/`);
          message.success('Elemento eliminado exitosamente');
          cargarDatos();
        } catch (error) {
          console.error('Error eliminando:', error);
          message.error('Error al eliminar elemento');
        }
      }
    });
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'generando': 'orange',
      'completado': 'green',
      'error': 'red'
    };
    return colors[estado] || 'default';
  };

  const getEstadoIcon = (estado) => {
    const icons = {
      'generando': <ClockCircleOutlined />,
      'completado': <CheckCircleOutlined />,
      'error': <ExclamationCircleOutlined />
    };
    return icons[estado] || <ClockCircleOutlined />;
  };

  const getTipoIndicadorColor = (tipo) => {
    const colors = {
      'liquidez': '#1890ff',
      'solvencia': '#52c41a',
      'rentabilidad': '#722ed1',
      'eficiencia': '#faad14',
      'morosidad': '#ff4d4f'
    };
    return colors[tipo] || '#8c8c8c';
  };

  const columnsReportes = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      ellipsis: true,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_reporte_display',
      key: 'tipo_reporte',
      render: (text, record) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Período',
      key: 'periodo',
      render: (_, record) => (
        <div>
          <div>{record.fecha_inicio}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>a {record.fecha_fin}</div>
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado_display',
      key: 'estado',
      render: (text, record) => (
        <Tag color={getEstadoColor(record.estado)} icon={getEstadoIcon(record.estado)}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Saldo Neto',
      dataIndex: 'saldo_neto',
      key: 'saldo_neto',
      render: (monto) => (
        <span style={{ 
          color: parseFloat(monto) >= 0 ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          Bs. {parseFloat(monto).toLocaleString()}
        </span>
      ),
      sorter: (a, b) => parseFloat(a.saldo_neto) - parseFloat(b.saldo_neto),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleEdit(record)}
          >
            Ver
          </Button>
          {record.estado === 'completado' && (
            <Button 
              size="small" 
              icon={<DownloadOutlined />}
              onClick={() => message.info('Descarga de archivo en desarrollo')}
            >
              PDF
            </Button>
          )}
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, 'reporte')}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  const columnsAnalisis = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      ellipsis: true,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_analisis_display',
      key: 'tipo_analisis',
      render: (text, record) => (
        <Tag color="purple">{text}</Tag>
      ),
    },
    {
      title: 'Período',
      key: 'periodo',
      render: (_, record) => (
        <div>
          <div>{record.periodo_inicio}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>a {record.periodo_fin}</div>
        </div>
      ),
    },
    {
      title: 'Fecha Creación',
      dataIndex: 'fecha_creacion',
      key: 'fecha_creacion',
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleEdit(record)}
          >
            Ver
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, 'analisis')}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  const renderDashboard = () => (
    <div>
      <div className="page-header">
        <h2><LineChartOutlined /> Dashboard Financiero</h2>
        <Button 
          type="primary" 
          icon={<RiseOutlined />}
          onClick={cargarDatos}
        >
          Actualizar Datos
        </Button>
      </div>

      {/* Resumen Financiero */}
      <Card title="Resumen Financiero" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={6}>
            <Statistic
              title="Total Ingresos"
              value={resumenFinanciero.total_ingresos || 0}
              formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Total Gastos"
              value={resumenFinanciero.total_gastos || 0}
              formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)}
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Saldo Neto"
              value={resumenFinanciero.saldo_neto || 0}
              formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)}
              precision={2}
              valueStyle={{ 
                color: (resumenFinanciero.saldo_neto || 0) >= 0 ? '#52c41a' : '#ff4d4f' 
              }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Statistic
              title="Margen de Utilidad"
              value={resumenFinanciero.margen_utilidad || 0}
              suffix="%"
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Análisis de Morosidad */}
      <Card title="Análisis de Morosidad" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total en Morosidad"
              value={analisisMorosidad.total_morosidad || 0}
              formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)}
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Residentes Morosos"
              value={analisisMorosidad.residentes_morosos || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="% Morosidad"
              value={analisisMorosidad.porcentaje_morosidad || 0}
              suffix="%"
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>

        {analisisMorosidad.top_morosos && analisisMorosidad.top_morosos.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>Top Morosos</h4>
            <Table
              dataSource={analisisMorosidad.top_morosos}
              columns={[
                { title: 'Residente', dataIndex: 'residente', key: 'residente' },
                { 
                  title: 'Deuda Total', 
                  dataIndex: 'total_deuda', 
                  key: 'total_deuda',
                  render: (monto) => `Bs. ${parseFloat(monto).toLocaleString()}`
                }
              ]}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="reportes-analitica">
      <div className="page-header">
        <h1><BarChartOutlined /> Reportes y Analítica</h1>
      </div>
      {renderDashboard()}
    </div>
  );
};

export default ReportesAnalitica;
