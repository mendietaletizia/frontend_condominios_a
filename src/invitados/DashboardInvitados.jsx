import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space, Tag, Progress, Alert, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { CarOutlined, UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import invitadosAPI from '../api/invitados';
import moment from 'moment';
import './DashboardInvitados.css';

const { Option } = Select;
const { confirm } = Modal;

const DashboardInvitados = () => {
  const { user } = useAuth();
  const [invitadosData, setInvitadosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInvitado, setEditingInvitado] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    cargarInvitados();
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarInvitados, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const cargarInvitados = async () => {
    try {
      setLoading(true);
      let data;
      if (user?.rol === 'Administrador') {
        data = await invitadosAPI.getPlacasInvitado();
      } else {
        // Para residentes, obtener solo sus propios invitados
        data = await invitadosAPI.getPlacasInvitadoPorResidente(user?.residente_id);
      }
      setInvitadosData(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos de invitados');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (activo, fechaVencimiento) => {
    if (!activo) return 'default';

    const ahora = moment();
    const vencimiento = moment(fechaVencimiento);
    const diasRestantes = vencimiento.diff(ahora, 'days');

    if (diasRestantes < 0) return 'error'; // Vencido
    if (diasRestantes <= 3) return 'warning'; // Por vencer
    return 'success'; // Activo
  };

  const getEstadoTexto = (activo, fechaVencimiento) => {
    if (!activo) return 'Inactivo';

    const ahora = moment();
    const vencimiento = moment(fechaVencimiento);
    const diasRestantes = vencimiento.diff(ahora, 'days');

    if (diasRestantes < 0) return 'Vencido';
    if (diasRestantes <= 3) return `Vence en ${diasRestantes} día(s)`;
    return 'Activo';
  };

  const showModal = (invitado = null) => {
    setEditingInvitado(invitado);
    if (invitado) {
      form.setFieldsValue({
        ...invitado,
        fecha_autorizacion: moment(invitado.fecha_autorizacion),
        fecha_vencimiento: invitado.fecha_vencimiento ? moment(invitado.fecha_vencimiento) : null,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingInvitado(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        fecha_autorizacion: values.fecha_autorizacion.format('YYYY-MM-DD HH:mm:ss'),
        fecha_vencimiento: values.fecha_vencimiento ? values.fecha_vencimiento.format('YYYY-MM-DD HH:mm:ss') : null,
        residente: user?.residente_id || 1, // Por defecto el primer residente
      };

      if (editingInvitado) {
        await invitadosAPI.updatePlacaInvitado(editingInvitado.id, data);
        message.success('Invitado actualizado exitosamente');
      } else {
        await invitadosAPI.createPlacaInvitado(data);
        message.success('Invitado registrado exitosamente');
      }

      handleCancel();
      cargarInvitados();
    } catch (error) {
      console.error('Error al guardar invitado:', error);
      message.error('Error al guardar invitado');
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: '¿Está seguro de eliminar este invitado?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await invitadosAPI.deletePlacaInvitado(id);
          message.success('Invitado eliminado exitosamente');
          cargarInvitados();
        } catch (error) {
          console.error('Error al eliminar invitado:', error);
          message.error('Error al eliminar invitado');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Placa',
      dataIndex: 'placa',
      key: 'placa',
      render: (placa) => <Tag color="blue">{placa}</Tag>,
    },
    {
      title: 'Visitante',
      dataIndex: 'nombre_visitante',
      key: 'nombre_visitante',
      render: (nombre) => nombre || 'No especificado',
    },
    {
      title: 'CI Visitante',
      dataIndex: 'ci_visitante',
      key: 'ci_visitante',
      render: (ci) => ci || 'No especificado',
    },
    {
      title: 'Vehículo',
      key: 'vehiculo',
      render: (_, record) => {
        const info = [];
        if (record.marca) info.push(record.marca);
        if (record.modelo) info.push(record.modelo);
        if (record.color) info.push(record.color);
        return info.length > 0 ? info.join(' ') : 'No especificado';
      },
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'estado',
      render: (activo, record) => (
        <Tag color={getEstadoColor(activo, record.fecha_vencimiento)} icon={<ClockCircleOutlined />}>
          {getEstadoTexto(activo, record.fecha_vencimiento)}
        </Tag>
      ),
    },
    {
      title: 'Fecha Autorización',
      dataIndex: 'fecha_autorizacion',
      key: 'fecha_autorizacion',
      render: (fecha) => moment(fecha).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Fecha Vencimiento',
      dataIndex: 'fecha_vencimiento',
      key: 'fecha_vencimiento',
      render: (fecha) => fecha ? moment(fecha).format('DD/MM/YYYY HH:mm') : 'Sin vencimiento',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          >
            Editar
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  // Calcular estadísticas
  const estadisticas = {
    total: invitadosData.length,
    activos: invitadosData.filter(i => i.activo && moment(i.fecha_vencimiento).isAfter(moment())).length,
    vencidos: invitadosData.filter(i => i.activo && moment(i.fecha_vencimiento).isBefore(moment())).length,
    porVencer: invitadosData.filter(i => {
      if (!i.activo || !i.fecha_vencimiento) return false;
      const diasRestantes = moment(i.fecha_vencimiento).diff(moment(), 'days');
      return diasRestantes >= 0 && diasRestantes <= 3;
    }).length,
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Cargando dashboard de invitados...</div>
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
          <Button size="small" onClick={cargarInvitados}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <div className="dashboard-invitados">
      <div className="dashboard-header">
        <h1>
          <CarOutlined /> Gestión de Invitados
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Registrar Invitado
        </Button>
      </div>

      {/* Estadísticas */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Invitados"
              value={estadisticas.total}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Activos"
              value={estadisticas.activos}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Por Vencer"
              value={estadisticas.porVencer}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Vencidos"
              value={estadisticas.vencidos}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla de Invitados */}
      <Card
        title="Lista de Invitados Autorizados"
        className="invitados-table"
        extra={
          <Button type="link" size="small" onClick={cargarInvitados}>
            Actualizar
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={invitadosData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Mostrando ${range[0]}-${range[1]} de ${total} invitados`,
          }}
          scroll={false}
        />
      </Card>

      {/* Modal para crear/editar invitado */}
      <Modal
        title={editingInvitado ? 'Editar Invitado' : 'Registrar Nuevo Invitado'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="placa"
                label="Placa del Vehículo"
                rules={[{ required: true, message: 'Por favor ingrese la placa' }]}
              >
                <Input placeholder="ABC-1234" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nombre_visitante"
                label="Nombre del Visitante"
                rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
              >
                <Input placeholder="Nombre completo" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ci_visitante"
                label="CI del Visitante"
              >
                <Input placeholder="12345678" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="activo"
                label="Estado"
                rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
              >
                <Select placeholder="Seleccionar estado">
                  <Option value={true}>Activo</Option>
                  <Option value={false}>Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="marca"
                label="Marca"
              >
                <Input placeholder="Toyota" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="modelo"
                label="Modelo"
              >
                <Input placeholder="Corolla" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="color"
                label="Color"
              >
                <Input placeholder="Blanco" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fecha_autorizacion"
                label="Fecha de Autorización"
                rules={[{ required: true, message: 'Por favor seleccione la fecha' }]}
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Seleccionar fecha"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fecha_vencimiento"
                label="Fecha de Vencimiento"
              >
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  placeholder="Seleccionar fecha (opcional)"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingInvitado ? 'Actualizar' : 'Registrar'}
              </Button>
              <Button onClick={handleCancel}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardInvitados;
