import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space, Tag, Alert, Modal, Form, Input, DatePicker, Select, message, Popconfirm } from 'antd';
import { CarOutlined, UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
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

  const esAdminOSeguridad = ['Administrador', 'Seguridad', 'Portero', 'administrador', 'seguridad', 'portero'].includes(user?.rol);

  useEffect(() => {
    cargarInvitados();
    const interval = setInterval(cargarInvitados, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const cargarInvitados = async () => {
    try {
      setLoading(true);
      const data = await invitadosAPI.list();
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.invitados)
            ? data.invitados
            : [];
      setInvitadosData(normalized);
      if (!Array.isArray(data) && !Array.isArray(data?.results) && !Array.isArray(data?.invitados)) {
        console.warn('Respuesta inesperada de invitados:', data);
      }
      setError(null);
    } catch (err) {
      setError('Error al cargar datos de invitados');
      console.error('Error:', err);
      setInvitadosData([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoTag = (record) => {
    const ahora = moment();
    const inicio = record?.fecha_inicio ? moment(record.fecha_inicio) : null;
    const fin = record?.fecha_fin ? moment(record.fecha_fin) : null;
    const estaDentroDeVigencia = inicio && inicio.isSameOrBefore(ahora) && (!fin || fin.isSameOrAfter(ahora));

    let color = 'default';
    let texto = 'Inactivo';

    if (record?.activo) {
      if (record.check_in_at && !record.check_out_at) {
        color = 'processing';
        texto = 'En condominio';
      } else if (estaDentroDeVigencia) {
        color = 'success';
        texto = 'Vigente';
      } else if (fin && fin.isBefore(ahora)) {
        color = 'error';
        texto = 'Vencido';
      } else {
        color = 'warning';
        texto = 'Pendiente';
      }
    }

    return <Tag color={color}>{texto}</Tag>;
  };

  const showModal = (invitado = null) => {
    setEditingInvitado(invitado);
    if (invitado) {
      form.setFieldsValue({
        nombre: invitado.nombre,
        ci: invitado.ci,
        tipo: invitado.tipo,
        vehiculo_placa: invitado.vehiculo_placa,
        fecha_inicio: invitado.fecha_inicio ? moment(invitado.fecha_inicio) : null,
        fecha_fin: invitado.fecha_fin ? moment(invitado.fecha_fin) : null,
        activo: invitado.activo,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ tipo: 'casual', activo: true });
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
      const payload = {
        ...values,
        fecha_inicio: values.fecha_inicio ? values.fecha_inicio.format('YYYY-MM-DDTHH:mm:ss') : null,
        fecha_fin: values.fecha_fin ? values.fecha_fin.format('YYYY-MM-DDTHH:mm:ss') : null,
      };

      if (editingInvitado) {
        await invitadosAPI.update(editingInvitado.id, payload);
        message.success('Invitado actualizado exitosamente');
      } else {
        await invitadosAPI.create(payload);
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
          await invitadosAPI.remove(id);
          message.success('Invitado eliminado exitosamente');
          cargarInvitados();
        } catch (error) {
          console.error('Error al eliminar invitado:', error);
          message.error('Error al eliminar invitado');
        }
      },
    });
  };

  const onCheckIn = async (record) => {
    try {
      await invitadosAPI.checkIn(record.id);
      message.success('Check-in registrado');
      cargarInvitados();
    } catch (e) {
      message.error('No se pudo registrar el check-in');
    }
  };

  const onCheckOut = async (record) => {
    try {
      await invitadosAPI.checkOut(record.id);
      message.success('Check-out registrado');
      cargarInvitados();
    } catch (e) {
      message.error('No se pudo registrar el check-out');
    }
  };

  const list = Array.isArray(invitadosData) ? invitadosData : [];

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      render: (v) => (
        <Space>
          <UserOutlined /> {v}
        </Space>
      )
    },
    {
      title: 'CI',
      dataIndex: 'ci',
      key: 'ci',
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (t, r) => <Tag color={t === 'evento' ? 'purple' : 'blue'}>{r.tipo_display || t}</Tag>
    },
    {
      title: 'Placa',
      dataIndex: 'vehiculo_placa',
      key: 'vehiculo_placa',
      render: (p) => p ? <Tag color="geekblue">{p}</Tag> : <Tag>Sin vehículo</Tag>
    },
    {
      title: 'Residente',
      key: 'residente',
      render: (_, r) => r.residente_info?.nombre || '—'
    },
    {
      title: 'Inicio',
      dataIndex: 'fecha_inicio',
      key: 'fecha_inicio',
      render: (f) => f ? moment(f).format('DD/MM/YYYY HH:mm') : '—'
    },
    {
      title: 'Fin',
      dataIndex: 'fecha_fin',
      key: 'fecha_fin',
      render: (f) => f ? moment(f).format('DD/MM/YYYY HH:mm') : '—'
    },
    {
      title: 'Estado',
      key: 'estado',
      render: (_, r) => getEstadoTag(r)
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)} size="small">Editar</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} size="small">Eliminar</Button>
          {esAdminOSeguridad && !record.check_in_at && (
            <Popconfirm title="Registrar entrada?" onConfirm={() => onCheckIn(record)}>
              <Button type="link" icon={<LoginOutlined />} size="small">Check-in</Button>
            </Popconfirm>
          )}
          {esAdminOSeguridad && record.check_in_at && !record.check_out_at && (
            <Popconfirm title="Registrar salida?" onConfirm={() => onCheckOut(record)}>
              <Button type="link" icon={<LogoutOutlined />} size="small">Check-out</Button>
            </Popconfirm>
          )}
        </Space>
      )
    },
  ];

  const total = list.length;
  const enCondominio = list.filter(i => i.check_in_at && !i.check_out_at).length;
  const deEvento = list.filter(i => i.tipo === 'evento').length;
  const casuales = list.filter(i => i.tipo === 'casual').length;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Cargando gestión de invitados...</div>
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

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total" value={total} prefix={<CarOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="En condominio" value={enCondominio} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Evento" value={deEvento} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Casuales" value={casuales} prefix={<ExclamationCircleOutlined />} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
      </Row>

      <Card title="Invitados" className="invitados-table" extra={<Button type="link" size="small" onClick={cargarInvitados}>Actualizar</Button>}>
        <Table columns={columns} dataSource={list} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }} />
      </Card>

      <Modal title={editingInvitado ? 'Editar Invitado' : 'Registrar Nuevo Invitado'} open={isModalVisible} onCancel={handleCancel} footer={null} width={640}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nombre" label="Nombre del Invitado" rules={[{ required: true, message: 'Ingrese nombre' }]}> 
                <Input placeholder="Nombre completo" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ci" label="CI del Invitado"> 
                <Input placeholder="12345678" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'Seleccione tipo' }]}> 
                <Select>
                  <Option value="casual">Visita Casual</Option>
                  <Option value="evento">Invitado Evento</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="vehiculo_placa" label="Placa (opcional)"> 
                <Input placeholder="ABC-1234" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fecha_inicio" label="Fecha inicio" rules={[{ required: true, message: 'Seleccione fecha inicio' }]}> 
                <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fecha_fin" label="Fecha fin (opcional)"> 
                <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="activo" label="Estado" rules={[{ required: true, message: 'Seleccione estado' }]}> 
                <Select>
                  <Option value={true}>Activo</Option>
                  <Option value={false}>Inactivo</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{editingInvitado ? 'Actualizar' : 'Registrar'}</Button>
              <Button onClick={handleCancel}>Cancelar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardInvitados;
