import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, DatePicker, Upload, Row, Col, Statistic, Progress, Divider } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, 
  MoneyCollectOutlined, RiseOutlined, BarChartOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined,
  UploadOutlined, DownloadOutlined, FilterOutlined
} from '@ant-design/icons';
import api from '../api/config';
import './GestionIngresos.css';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const GestionIngresos = () => {
  const [ingresos, setIngresos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIngreso, setEditingIngreso] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({
    tipo_ingreso: '',
    estado: '',
    mes_año: '',
    unidad_id: ''
  });

  useEffect(() => {
    cargarIngresos();
  }, [filters]);

  const cargarIngresos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await api.get(`/ingresos/?${params.toString()}`);
      setIngresos(response.data.results || response.data);
    } catch (error) {
      console.error('Error cargando ingresos:', error);
      message.error('Error al cargar ingresos');
    } finally {
      setLoading(false);
    }
  };

  

  const handleSubmit = async (values) => {
    try {
      const dataToSend = {
        ...values,
        fecha_ingreso: values.fecha_ingreso.format('YYYY-MM-DD')
      };

      if (editingIngreso) {
        await api.put(`/ingresos/${editingIngreso.id}/`, dataToSend);
        message.success('Ingreso actualizado exitosamente');
      } else {
        await api.post('/ingresos/', dataToSend);
        message.success('Ingreso creado exitosamente');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingIngreso(null);
      cargarIngresos();
    } catch (error) {
      console.error('Error guardando ingreso:', error);
      message.error('Error al guardar ingreso: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (ingreso) => {
    setEditingIngreso(ingreso);
    form.setFieldsValue({
      ...ingreso,
      fecha_ingreso: ingreso.fecha_ingreso ? moment(ingreso.fecha_ingreso) : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar este ingreso?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/ingresos/${id}/`);
          message.success('Ingreso eliminado exitosamente');
          cargarIngresos();
        } catch (error) {
          console.error('Error eliminando ingreso:', error);
          message.error('Error al eliminar ingreso');
        }
      }
    });
  };

  const handleConfirmarIngreso = async (id) => {
    try {
      await api.post('/ingresos/confirmar_ingreso/', { ingreso_id: id });
      message.success('Ingreso confirmado exitosamente');
      cargarIngresos();
    } catch (error) {
      console.error('Error confirmando ingreso:', error);
      message.error('Error al confirmar ingreso');
    }
  };

  const handleCancelarIngreso = async (id) => {
    Modal.confirm({
      title: 'Cancelar Ingreso',
      content: (
        <Form>
          <Form.Item name="motivo" label="Motivo de cancelación">
            <TextArea rows={3} placeholder="Ingrese el motivo de cancelación" />
          </Form.Item>
        </Form>
      ),
      onOk: async (close) => {
        try {
          const motivo = document.querySelector('textarea').value;
          await api.post('/ingresos/cancelar_ingreso/', { 
            ingreso_id: id, 
            motivo: motivo 
          });
          message.success('Ingreso cancelado exitosamente');
          cargarIngresos();
          close();
        } catch (error) {
          console.error('Error cancelando ingreso:', error);
          message.error('Error al cancelar ingreso');
        }
      }
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_ingreso_display',
      key: 'tipo_ingreso',
      render: (text, record) => (
        <Tag color={getTipoColor(record.tipo_ingreso)}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      key: 'concepto',
      ellipsis: true,
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(parseFloat(monto)),
      sorter: (a, b) => parseFloat(a.monto) - parseFloat(b.monto),
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha_ingreso',
      key: 'fecha_ingreso',
      sorter: (a, b) => new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso),
    },
    {
      title: 'Estado',
      dataIndex: 'estado_display',
      key: 'estado',
      render: (text, record) => (
        <Tag color={getEstadoColor(record.estado)}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad_numero',
      key: 'unidad_numero',
      render: (text) => text || '-',
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
          {record.estado === 'pendiente' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<CheckCircleOutlined />}
                onClick={() => handleConfirmarIngreso(record.id)}
              >
                Confirmar
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancelarIngreso(record.id)}
              >
                Cancelar
              </Button>
            </>
          )}
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  const getTipoColor = (tipo) => {
    const colors = {
      'cuotas': 'blue',
      'multas': 'red',
      'servicios': 'green',
      'alquiler': 'orange',
      'eventos': 'purple',
      'donaciones': 'cyan',
      'otros': 'gray'
    };
    return colors[tipo] || 'default';
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'pendiente': 'orange',
      'confirmado': 'green',
      'cancelado': 'red'
    };
    return colors[estado] || 'default';
  };

  return (
    <div className="gestion-ingresos">
      <div className="page-header">
        <h1><MoneyCollectOutlined /> Gestión de Ingresos</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Nuevo Ingreso
        </Button>
      </div>

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ingresos del Mes"
              value={estadisticas.total_ingresos_mes || 0}
              precision={2}
              formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ingresos del Año"
              value={estadisticas.total_ingresos_año || 0}
              precision={2}
              formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Promedio Mensual"
              value={estadisticas.promedio_mensual || 0}
              precision={2}
              formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Crecimiento Mensual"
              value={estadisticas.crecimiento_mensual || 0}
              suffix="%"
              precision={2}
              valueStyle={{ 
                color: (estadisticas.crecimiento_mensual || 0) >= 0 ? '#3f8600' : '#cf1322' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              placeholder="Tipo de Ingreso"
              value={filters.tipo_ingreso}
              onChange={(value) => setFilters({...filters, tipo_ingreso: value})}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="cuotas">Cuotas Mensuales</Option>
              <Option value="multas">Multas</Option>
              <Option value="servicios">Servicios Adicionales</Option>
              <Option value="alquiler">Alquiler de Áreas</Option>
              <Option value="eventos">Eventos</Option>
              <Option value="donaciones">Donaciones</Option>
              <Option value="otros">Otros</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Estado"
              value={filters.estado}
              onChange={(value) => setFilters({...filters, estado: value})}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="pendiente">Pendiente</Option>
              <Option value="confirmado">Confirmado</Option>
              <Option value="cancelado">Cancelado</Option>
            </Select>
          </Col>
          <Col span={6}>
            <DatePicker
              placeholder="Mes/Año"
              picker="month"
              value={filters.mes_año ? moment(filters.mes_año) : null}
              onChange={(date) => setFilters({...filters, mes_año: date ? date.format('YYYY-MM') : ''})}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Button 
              icon={<FilterOutlined />}
              onClick={() => setFilters({tipo_ingreso: '', estado: '', mes_año: '', unidad_id: ''})}
            >
              Limpiar Filtros
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabla de Ingresos */}
      <Card>
        <Table
          columns={columns}
          dataSource={ingresos}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} ingresos`
          }}
        />
      </Card>

      {/* Modal de Ingreso */}
      <Modal
        title={editingIngreso ? 'Editar Ingreso' : 'Nuevo Ingreso'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingIngreso(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tipo_ingreso"
                label="Tipo de Ingreso"
                rules={[{ required: true, message: 'Seleccione el tipo de ingreso' }]}
              >
                <Select placeholder="Seleccione el tipo">
                  <Option value="cuotas">Cuotas Mensuales</Option>
                  <Option value="multas">Multas</Option>
                  <Option value="servicios">Servicios Adicionales</Option>
                  <Option value="alquiler">Alquiler de Áreas Comunes</Option>
                  <Option value="eventos">Eventos</Option>
                  <Option value="donaciones">Donaciones</Option>
                  <Option value="otros">Otros Ingresos</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="estado"
                label="Estado"
                rules={[{ required: true, message: 'Seleccione el estado' }]}
                initialValue="pendiente"
              >
                <Select>
                  <Option value="pendiente">Pendiente</Option>
                  <Option value="confirmado">Confirmado</Option>
                  <Option value="cancelado">Cancelado</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="concepto"
            label="Concepto"
            rules={[{ required: true, message: 'Ingrese el concepto' }]}
          >
            <Input placeholder="Ej: Pago cuota mensual enero 2025" />
          </Form.Item>

          <Form.Item
            name="descripcion"
            label="Descripción"
          >
            <TextArea rows={3} placeholder="Descripción detallada del ingreso" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="monto"
                label="Monto"
                rules={[{ required: true, message: 'Ingrese el monto' }]}
              >
                <Input type="number" step="0.01" placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fecha_ingreso"
                label="Fecha de Ingreso"
                rules={[{ required: true, message: 'Seleccione la fecha' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="numero_referencia"
            label="Número de Referencia"
          >
            <Input placeholder="Número de referencia o comprobante" />
          </Form.Item>

          <Form.Item
            name="observaciones"
            label="Observaciones"
          >
            <TextArea rows={2} placeholder="Observaciones adicionales" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingIngreso ? 'Actualizar' : 'Crear'} Ingreso
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                setEditingIngreso(null);
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

export default GestionIngresos;
