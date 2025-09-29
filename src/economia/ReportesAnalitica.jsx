import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Tag, Modal, Form, Input, Select, 
  message, DatePicker, Row, Col, Statistic, Progress, Divider,
  Tabs, Spin, Alert, Tooltip, Badge
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, 
  BarChartOutlined, LineChartOutlined, PieChartOutlined,
  DownloadOutlined, FileTextOutlined, CalculatorOutlined,
  RiseOutlined, MoneyCollectOutlined, WarningOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import api from '../api/config';
import './ReportesAnalitica.css';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ReportesAnalitica = () => {
  const [activeTab, setActiveTab] = useState('reportes');
  const [reportes, setReportes] = useState([]);
  const [analisis, setAnalisis] = useState([]);
  const [indicadores, setIndicadores] = useState([]);
  const [resumenFinanciero, setResumenFinanciero] = useState({});
  const [analisisMorosidad, setAnalisisMorosidad] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('reporte');
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'reportes') {
        const response = await api.get('/reportes-financieros/');
        setReportes(response.data.results || response.data);
      } else if (activeTab === 'analisis') {
        const response = await api.get('/analisis-financieros/');
        setAnalisis(response.data.results || response.data);
      } else if (activeTab === 'indicadores') {
        const response = await api.get('/indicadores-financieros/calcular_indicadores/');
        setIndicadores(response.data.indicadores || []);
      } else if (activeTab === 'dashboard') {
        const [resumenRes, morosidadRes] = await Promise.all([
          api.get('/dashboards-financieros/resumen_financiero/'),
          api.get('/dashboards-financieros/analisis_morosidad/')
        ]);
        setResumenFinanciero(resumenRes.data);
        setAnalisisMorosidad(morosidadRes.data);
      }
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

  const renderReportesTab = () => (
    <div>
      <div className="page-header">
        <h2><FileTextOutlined /> Reportes Financieros</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setModalType('reporte');
            setIsModalVisible(true);
          }}
        >
          Generar Reporte
        </Button>
      </div>

      <Table
        columns={columnsReportes}
        dataSource={reportes}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} reportes`
        }}
      />
    </div>
  );

  const renderAnalisisTab = () => (
    <div>
      <div className="page-header">
        <h2><BarChartOutlined /> Análisis Financieros</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setModalType('analisis');
            setIsModalVisible(true);
          }}
        >
          Nuevo Análisis
        </Button>
      </div>

      <Table
        columns={columnsAnalisis}
        dataSource={analisis}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} análisis`
        }}
      />
    </div>
  );

  const renderIndicadoresTab = () => (
    <div>
      <div className="page-header">
        <h2><CalculatorOutlined /> Indicadores Financieros</h2>
        <Button 
          type="primary" 
          icon={<CalculatorOutlined />}
          onClick={cargarDatos}
        >
          Recalcular Indicadores
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {indicadores.map((indicador, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card className="indicador-card">
              <div className="indicador-header">
                <div 
                  className="indicador-color" 
                  style={{ backgroundColor: getTipoIndicadorColor(indicador.tipo_indicador) }}
                />
                <div className="indicador-info">
                  <h4>{indicador.nombre}</h4>
                  <p className="indicador-tipo">{indicador.tipo_indicador}</p>
                </div>
              </div>
              <div className="indicador-value">
                <span className="valor">{indicador.valor}</span>
                <span className="unidad">{indicador.unidad}</span>
              </div>
              <div className="indicador-description">
                {indicador.descripcion}
              </div>
              {indicador.formula && (
                <div className="indicador-formula">
                  <small>Fórmula: {indicador.formula}</small>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  const renderDashboardTab = () => (
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
                  render: (monto) => `$${parseFloat(monto).toLocaleString()}`
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

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Reportes" key="reportes">
          {renderReportesTab()}
        </TabPane>
        <TabPane tab="Análisis" key="analisis">
          {renderAnalisisTab()}
        </TabPane>
        <TabPane tab="Indicadores" key="indicadores">
          {renderIndicadoresTab()}
        </TabPane>
        <TabPane tab="Dashboard" key="dashboard">
          {renderDashboardTab()}
        </TabPane>
      </Tabs>

      {/* Modal para Reportes y Análisis */}
      <Modal
        title={modalType === 'reporte' ? 'Generar Reporte' : 'Nuevo Análisis'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingItem(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[{ required: true, message: 'Ingrese el nombre' }]}
          >
            <Input placeholder="Nombre del reporte/análisis" />
          </Form.Item>

          {modalType === 'reporte' ? (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="tipo_reporte"
                    label="Tipo de Reporte"
                    rules={[{ required: true, message: 'Seleccione el tipo' }]}
                  >
                    <Select placeholder="Seleccione el tipo">
                      <Option value="mensual">Reporte Mensual</Option>
                      <Option value="trimestral">Reporte Trimestral</Option>
                      <Option value="anual">Reporte Anual</Option>
                      <Option value="personalizado">Reporte Personalizado</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="estado"
                    label="Estado"
                    initialValue="generando"
                  >
                    <Select>
                      <Option value="generando">Generando</Option>
                      <Option value="completado">Completado</Option>
                      <Option value="error">Error</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="fecha_inicio"
                    label="Fecha Inicio"
                    rules={[{ required: true, message: 'Seleccione la fecha inicio' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fecha_fin"
                    label="Fecha Fin"
                    rules={[{ required: true, message: 'Seleccione la fecha fin' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="tipo_analisis"
                    label="Tipo de Análisis"
                    rules={[{ required: true, message: 'Seleccione el tipo' }]}
                  >
                    <Select placeholder="Seleccione el tipo">
                      <Option value="tendencia">Análisis de Tendencia</Option>
                      <Option value="comparativo">Análisis Comparativo</Option>
                      <Option value="proyeccion">Proyección Financiera</Option>
                      <Option value="eficiencia">Análisis de Eficiencia</Option>
                      <Option value="morosidad">Análisis de Morosidad</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="periodo_inicio"
                    label="Período Inicio"
                    rules={[{ required: true, message: 'Seleccione la fecha inicio' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="periodo_fin"
                label="Período Fin"
                rules={[{ required: true, message: 'Seleccione la fecha fin' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="observaciones"
            label="Observaciones"
          >
            <TextArea rows={3} placeholder="Observaciones adicionales" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? 'Actualizar' : 'Generar'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingItem(null);
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportesAnalitica;
