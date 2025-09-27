import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip, Badge, Statistic, Row, Col, DatePicker, InputNumber, Divider, Radio } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, 
  DollarOutlined, CalendarOutlined, UserOutlined, HomeOutlined,
  CalculatorOutlined, AlertOutlined, CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { finanzasAPI } from '../api/finanzas';
import api from '../api/config';
import dayjs from 'dayjs';
import './GestionCuotas.css';

const { Option } = Select;
const { TextArea } = Input;

const GestionCuotas = () => {
  const { canAccess } = useAuth();
  const [cuotasMensuales, setCuotasMensuales] = useState([]);
  const [cuotasUnidad, setCuotasUnidad] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para modales
  const [isCuotaModalVisible, setIsCuotaModalVisible] = useState(false);
  const [isPagoModalVisible, setIsPagoModalVisible] = useState(false);
  
  // Estados para formularios
  const [editingCuota, setEditingCuota] = useState(null);
  const [selectedCuotaUnidad, setSelectedCuotaUnidad] = useState(null);
  const [selectedUnidades, setSelectedUnidades] = useState([]);
  const [enviarATodos, setEnviarATodos] = useState(true);
  
  const [form] = Form.useForm();
  const [pagoForm] = Form.useForm();

  // Filtros
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroUnidad, setFiltroUnidad] = useState('');

  useEffect(() => {
    if (canAccess('administrador')) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar datos de forma individual para mejor manejo de errores
      try {
        const cuotasData = await finanzasAPI.getCuotasMensuales();
        setCuotasMensuales(cuotasData.results || cuotasData || []);
      } catch (error) {
        console.error('Error cargando cuotas mensuales:', error);
        setCuotasMensuales([]);
      }

      try {
        const cuotasUnidadData = await finanzasAPI.getCuotasUnidad();
        setCuotasUnidad(cuotasUnidadData.results || cuotasUnidadData || []);
      } catch (error) {
        console.error('Error cargando cuotas por unidad:', error);
        setCuotasUnidad([]);
      }

      try {
        const pagosData = await finanzasAPI.getPagosCuotas();
        setPagos(pagosData.results || pagosData || []);
      } catch (error) {
        console.error('Error cargando pagos:', error);
        setPagos([]);
      }

      try {
        const unidadesRes = await api.get('/comunidad/unidades/');
        setUnidades(unidadesRes.data.results || unidadesRes.data || []);
      } catch (error) {
        console.error('Error cargando unidades:', error);
        setUnidades([]);
      }

      try {
        const residentesRes = await api.get('/usuarios/residentes/');
        setResidentes(residentesRes.data.results || residentesRes.data || []);
      } catch (error) {
        console.error('Error cargando residentes:', error);
        setResidentes([]);
      }

    } catch (error) {
      console.error('Error general al cargar datos:', error);
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas
  const estadisticas = {
    totalCuotas: cuotasUnidad.length,
    cuotasPagadas: cuotasUnidad.filter(c => c.estado === 'pagada').length,
    cuotasPendientes: cuotasUnidad.filter(c => c.estado === 'pendiente').length,
    cuotasVencidas: cuotasUnidad.filter(c => c.estado === 'vencida').length,
    montoTotal: cuotasUnidad.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0),
    montoCobrado: cuotasUnidad.reduce((sum, c) => sum + parseFloat(c.monto_pagado || 0), 0),
    montoPendiente: cuotasUnidad.reduce((sum, c) => sum + (parseFloat(c.monto || 0) - parseFloat(c.monto_pagado || 0)), 0)
  };

  // Filtrar cuotas
  const cuotasFiltradas = cuotasUnidad.filter(cuota => {
    const matchesMes = !filtroMes || cuota.cuota_mensual === filtroMes;
    const matchesEstado = !filtroEstado || cuota.estado === filtroEstado;
    const matchesUnidad = !filtroUnidad || cuota.unidad === filtroUnidad;
    return matchesMes && matchesEstado && matchesUnidad;
  });

  // Columnas de la tabla de cuotas
  const cuotasColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      responsive: ['lg'],
    },
    {
      title: 'Mes/Año',
      dataIndex: 'cuota_mensual',
      key: 'mes_año',
      width: 100,
      render: (cuotaMensual) => (
        <Space>
          <CalendarOutlined />
          <span>{cuotaMensual}</span>
        </Space>
      ),
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad_numero',
      key: 'unidad',
      width: 100,
      render: (unidad) => (
        <Space>
          <HomeOutlined />
          <span>{unidad}</span>
        </Space>
      ),
    },
    {
      title: 'Residente',
      dataIndex: 'residente_nombre',
      key: 'residente',
      width: 150,
      render: (nombre) => (
        <Space>
          <UserOutlined />
          <span>{nombre}</span>
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
      title: 'Pagado',
      dataIndex: 'monto_pagado',
      key: 'monto_pagado',
      width: 120,
      render: (monto) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          Bs. {parseFloat(monto || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Pendiente',
      dataIndex: 'saldo_pendiente',
      key: 'saldo_pendiente',
      width: 120,
      render: (saldo) => (
        <span style={{ fontWeight: 'bold', color: '#fa8c16' }}>
          Bs. {parseFloat(saldo || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      render: (estado) => {
        const colors = {
          'pagada': 'green',
          'pendiente': 'blue',
          'vencida': 'red',
          'parcial': 'orange'
        };
        const icons = {
          'pagada': <CheckCircleOutlined />,
          'pendiente': <AlertOutlined />,
          'vencida': <ExclamationCircleOutlined />,
          'parcial': <AlertOutlined />
        };
        return (
          <Tag color={colors[estado]} icon={icons[estado]}>
            {estado.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Vencimiento',
      dataIndex: 'fecha_limite',
      key: 'fecha_limite',
      width: 120,
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Registrar Pago">
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handleRegistrarPago(record)}
              disabled={record.estado === 'pagada'}
            >
              Pagar
            </Button>
          </Tooltip>
          <Tooltip title="Editar Cuota">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditarCuota(record)}
            >
              Editar
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar Cuota">
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleEliminarCuota(record)}
            >
              Eliminar
            </Button>
          </Tooltip>
          <Tooltip title="Ver Detalles">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleVerDetalles(record)}
            >
              Ver
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handlers
  const handleCrearCuota = () => {
    setEditingCuota(null);
    setSelectedUnidades([]);
    setEnviarATodos(true);
    form.resetFields();
    setIsCuotaModalVisible(true);
  };

  const handleCerrarModal = () => {
    setEditingCuota(null);
    setSelectedUnidades([]);
    setEnviarATodos(true);
    form.resetFields();
    setIsCuotaModalVisible(false);
  };

  const handleRegistrarPago = (cuotaUnidad) => {
    setSelectedCuotaUnidad(cuotaUnidad);
    pagoForm.resetFields();
    setIsPagoModalVisible(true);
  };

  const handleVerDetalles = (cuotaUnidad) => {
    // Implementar modal de detalles
    message.info('Funcionalidad de detalles en desarrollo');
  };

  const handleEditarCuota = (cuotaUnidad) => {
    console.log('Editando cuota:', cuotaUnidad);
    
    // Editar directamente la cuota por unidad
    setEditingCuota(cuotaUnidad);
    
    // Formatear la fecha correctamente para el DatePicker usando dayjs
    let fechaFormateada = null;
    if (cuotaUnidad.fecha_limite) {
      try {
        fechaFormateada = dayjs(cuotaUnidad.fecha_limite);
        // Verificar que la fecha es válida
        if (!fechaFormateada.isValid()) {
          fechaFormateada = null;
        }
      } catch (error) {
        console.warn('Error al formatear fecha:', error);
        fechaFormateada = null;
      }
    }
    
    const formData = {
      monto: cuotaUnidad.monto,
      fecha_limite: fechaFormateada,
      observaciones: cuotaUnidad.observaciones || ''
    };
    
    console.log('Datos del formulario:', formData);
    
    form.setFieldsValue(formData);
    setIsCuotaModalVisible(true);
  };

  const handleEliminarCuota = (cuotaUnidad) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar esta cuota?',
      content: 'Esta acción eliminará la cuota y todos los pagos asociados. Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          // Eliminar directamente la cuota por unidad
          await finanzasAPI.deleteCuotaUnidad(cuotaUnidad.id);
          message.success('Cuota eliminada exitosamente');
          loadData();
        } catch (error) {
          message.error('Error al eliminar cuota: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  };

  const handleSubmitCuota = async (values) => {
    try {
      if (editingCuota) {
        // Si estamos editando una cuota por unidad existente
        const cuotaData = {
          monto: values.monto,
          fecha_limite: values.fecha_limite ? dayjs(values.fecha_limite).format('YYYY-MM-DD') : null,
          observaciones: values.observaciones
        };
        await finanzasAPI.updateCuotaUnidad(editingCuota.id, cuotaData);
        message.success('Cuota actualizada exitosamente');
      } else {
        // Si estamos creando una nueva cuota mensual
        const cuotaData = {
          ...values,
          fecha_limite: values.fecha_limite ? dayjs(values.fecha_limite).format('YYYY-MM-DD') : null,
          enviar_a_todos: enviarATodos,
          unidades_seleccionadas: enviarATodos ? [] : selectedUnidades
        };
        await finanzasAPI.createCuotaMensual(cuotaData);
        message.success('Cuota creada exitosamente');
      }
      handleCerrarModal();
      loadData();
    } catch (error) {
      message.error('Error al guardar cuota: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleSubmitPago = async (values) => {
    try {
      await finanzasAPI.registrarPago(selectedCuotaUnidad.id, values);
      message.success('Pago registrado exitosamente');
      setIsPagoModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Error al registrar pago: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleGenerarCuotas = async (cuotaId) => {
    try {
      await finanzasAPI.generarCuotasUnidades(cuotaId);
      message.success('Cuotas generadas exitosamente para todas las unidades');
      loadData();
    } catch (error) {
      message.error('Error al generar cuotas: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (!canAccess('administrador')) {
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
        <div>Cargando datos de cuotas...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-finanzas">
      <div className="dashboard-header">
        <h1>CU22 - Gestión de Cuotas y Expensas</h1>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCrearCuota}
          >
            Nueva Cuota Mensual
          </Button>
        </Space>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Cuotas"
              value={estadisticas.totalCuotas}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cuotas Pagadas"
              value={estadisticas.cuotasPagadas}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cuotas Pendientes"
              value={estadisticas.cuotasPendientes}
              valueStyle={{ color: '#1890ff' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Cuotas Vencidas"
              value={estadisticas.cuotasVencidas}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Monto Total"
              value={estadisticas.montoTotal}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Monto Cobrado"
              value={estadisticas.montoCobrado}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Monto Pendiente"
              value={estadisticas.montoPendiente}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="Filtrar por mes"
            value={filtroMes}
            onChange={setFiltroMes}
            style={{ width: 150 }}
            allowClear
          >
            {Array.from(new Set(cuotasUnidad.map(c => c.cuota_mensual))).map(mes => (
              <Option key={mes} value={mes}>{mes}</Option>
            ))}
          </Select>
          <Select
            placeholder="Filtrar por estado"
            value={filtroEstado}
            onChange={setFiltroEstado}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="pagada">Pagada</Option>
            <Option value="pendiente">Pendiente</Option>
            <Option value="vencida">Vencida</Option>
            <Option value="parcial">Parcial</Option>
          </Select>
          <Select
            placeholder="Filtrar por unidad"
            value={filtroUnidad}
            onChange={setFiltroUnidad}
            style={{ width: 150 }}
            allowClear
          >
            {unidades.map(unidad => (
              <Option key={unidad.id} value={unidad.id}>{unidad.numero_casa}</Option>
            ))}
          </Select>
          <Button 
            onClick={() => {
              setFiltroMes('');
              setFiltroEstado('');
              setFiltroUnidad('');
            }}
          >
            Limpiar Filtros
          </Button>
        </Space>
      </Card>

      {/* Tabla de Cuotas */}
      <Card title="Cuotas del Condominio">
        <Table
          columns={cuotasColumns}
          dataSource={cuotasFiltradas}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} cuotas`,
          }}
          scroll={{ x: 'max-content' }}
          responsive={true}
        />
      </Card>

      {/* Modal Cuota */}
      <Modal
        title={editingCuota ? 'Editar Cuota por Unidad' : 'Nueva Cuota Mensual'}
        open={isCuotaModalVisible}
        onCancel={handleCerrarModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitCuota}
        >
          {editingCuota ? (
            // Formulario para editar cuota por unidad
            <>
              <Form.Item
                name="monto"
                label="Monto de la Cuota"
                rules={[{ required: true, message: 'Por favor ingrese el monto' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `Bs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/Bs\.\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item
                name="fecha_limite"
                label="Fecha Límite"
                rules={[{ required: true, message: 'Por favor seleccione la fecha límite' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="observaciones"
                label="Observaciones"
              >
                <TextArea rows={3} placeholder="Observaciones de la cuota" />
              </Form.Item>
            </>
          ) : (
            // Formulario para crear cuota mensual
            <>
              <Form.Item
                name="mes_año"
                label="Mes/Año"
                rules={[{ required: true, message: 'Por favor ingrese el mes/año' }]}
              >
                <Input placeholder="2025-10" />
              </Form.Item>
              <Form.Item
                name="monto_total"
                label="Monto Total"
                rules={[{ required: true, message: 'Por favor ingrese el monto total' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `Bs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/Bs\.\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item
                name="fecha_limite"
                label="Fecha Límite"
                rules={[{ required: true, message: 'Por favor seleccione la fecha límite' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="descripcion"
                label="Descripción"
              >
                <TextArea rows={3} placeholder="Descripción de la cuota" />
              </Form.Item>
              
              <Divider>Distribución de Cuotas</Divider>
              <Form.Item label="Enviar a">
                <Radio.Group 
                  value={enviarATodos} 
                  onChange={(e) => setEnviarATodos(e.target.value)}
                >
                  <Radio value={true}>Todos los residentes</Radio>
                  <Radio value={false}>Residentes específicos</Radio>
                </Radio.Group>
              </Form.Item>
              
              {!enviarATodos && (
                <Form.Item label="Seleccionar Unidades">
                  <Select
                    mode="multiple"
                    placeholder="Seleccione las unidades"
                    value={selectedUnidades}
                    onChange={setSelectedUnidades}
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                  {unidades.map(unidad => {
                    // Usar la información del propietario directamente de la unidad
                    const propietario = unidad.propietario_info;
                    const propietarioInfo = propietario ? 
                      ` - ${propietario.nombre}` : 
                      ' - Sin propietario';
                    
                    return (
                      <Option key={unidad.id} value={unidad.id}>
                        {unidad.numero_casa} ({unidad.metros_cuadrados}m²){propietarioInfo}
                      </Option>
                    );
                  })}
                  </Select>
                </Form.Item>
              )}
            </>
          )}
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCuota ? 'Actualizar' : 'Crear'}
              </Button>
              <Button onClick={handleCerrarModal}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Pago */}
      <Modal
        title="Registrar Pago"
        open={isPagoModalVisible}
        onCancel={() => setIsPagoModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedCuotaUnidad && (
          <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <h4>Información de la Cuota</h4>
            <p><strong>Unidad:</strong> {selectedCuotaUnidad.unidad_numero}</p>
            <p><strong>Mes/Año:</strong> {selectedCuotaUnidad.cuota_mensual}</p>
            <p><strong>Monto Total:</strong> Bs. {parseFloat(selectedCuotaUnidad.monto).toLocaleString()}</p>
            <p><strong>Pagado:</strong> Bs. {parseFloat(selectedCuotaUnidad.monto_pagado).toLocaleString()}</p>
            <p><strong>Pendiente:</strong> Bs. {parseFloat(selectedCuotaUnidad.saldo_pendiente).toLocaleString()}</p>
          </div>
        )}
        <Form
          form={pagoForm}
          layout="vertical"
          onFinish={handleSubmitPago}
        >
          <Form.Item
            name="monto"
            label="Monto del Pago"
            rules={[{ required: true, message: 'Por favor ingrese el monto' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `Bs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/Bs\.\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item
            name="metodo_pago"
            label="Método de Pago"
            rules={[{ required: true, message: 'Por favor seleccione el método' }]}
          >
            <Select placeholder="Seleccionar método">
              <Option value="efectivo">Efectivo</Option>
              <Option value="transferencia">Transferencia</Option>
              <Option value="cheque">Cheque</Option>
              <Option value="tarjeta">Tarjeta</Option>
              <Option value="online">Pago Online</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="numero_referencia"
            label="Número de Referencia"
          >
            <Input placeholder="Número de referencia del pago" />
          </Form.Item>
          <Form.Item
            name="observaciones"
            label="Observaciones"
          >
            <TextArea rows={3} placeholder="Observaciones del pago" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Registrar Pago
              </Button>
              <Button onClick={() => setIsPagoModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionCuotas;