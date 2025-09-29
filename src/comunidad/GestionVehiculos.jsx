import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip, Badge, Divider, List, Avatar, Descriptions, Collapse, Alert } from 'antd';
import { CarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UserOutlined, TeamOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';

const { Option } = Select;
const { confirm } = Modal;
const { Panel } = Collapse;

const GestionVehiculos = ({ unidadId, unidadNumero }) => {
  const { user } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [invitados, setInvitados] = useState([]);
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isInvitadoModalVisible, setIsInvitadoModalVisible] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const [form] = Form.useForm();
  const [invitadoForm] = Form.useForm();

  useEffect(() => {
    if (unidadId) {
      loadVehiculos();
      loadInvitados();
      loadResidentes();
    }
  }, [unidadId]);

  const loadVehiculos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/unidades/${unidadId}/vehiculos/`);
      setVehiculos(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error cargando vehículos:', err);
      setError('Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };

  const loadInvitados = async () => {
    try {
      const response = await api.get(`/unidades/${unidadId}/detalle_completo/`);
      setInvitados(response.data.invitados_hoy || []);
    } catch (err) {
      console.error('Error cargando invitados:', err);
    }
  };

  const loadResidentes = async () => {
    try {
      const response = await api.get('/residentes/');
      setResidentes(response.data || []);
    } catch (err) {
      console.error('Error cargando residentes:', err);
    }
  };

  const showModal = (vehiculo = null) => {
    setEditingVehiculo(vehiculo);
    if (vehiculo) {
      form.setFieldsValue({
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        color: vehiculo.color,
        residente: vehiculo.residente_id,
        activo: vehiculo.activo
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingVehiculo(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      const dataToSend = {
        placa: values.placa.trim().toUpperCase(),
        marca: values.marca.trim(),
        modelo: values.modelo.trim(),
        color: values.color.trim(),
        residente: values.residente,
        activo: values.activo !== false
      };

      if (editingVehiculo) {
        await api.put(`/placas-vehiculo/${editingVehiculo.id}/`, dataToSend);
        message.success('Vehículo actualizado exitosamente');
      } else {
        await api.post(`/unidades/${unidadId}/vehiculos/`, dataToSend);
        message.success('Vehículo creado exitosamente');
      }
      
      handleCancel();
      loadVehiculos();
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.error || 
                           error.message;
      message.error('Error al guardar vehículo: ' + errorMessage);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: '¿Está seguro de eliminar este vehículo?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/unidades/${unidadId}/vehiculos/${id}/`);
          message.success('Vehículo eliminado exitosamente');
          loadVehiculos();
        } catch (error) {
          console.error('Error al eliminar vehículo:', error);
          const errorMessage = error.response?.data?.detail || 
                             error.response?.data?.error || 
                             error.message;
          message.error('Error al eliminar vehículo: ' + errorMessage);
        }
      },
    });
  };

  const showInvitadoModal = () => {
    invitadoForm.resetFields();
    setIsInvitadoModalVisible(true);
  };

  const handleInvitadoSubmit = async (values) => {
    try {
      const dataToSend = {
        nombre: values.nombre.trim(),
        ci: values.ci.trim(),
        tipo: values.tipo,
        fecha_inicio: values.fecha_inicio,
        fecha_fin: values.fecha_fin,
        vehiculo_placa: values.vehiculo_placa?.trim() || null,
        evento: values.evento || null
      };

      await api.post('/invitados/', dataToSend);
      message.success('Invitado registrado exitosamente');
      setIsInvitadoModalVisible(false);
      invitadoForm.resetFields();
      loadInvitados();
    } catch (error) {
      console.error('Error al registrar invitado:', error);
      const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.error || 
                           error.message;
      message.error('Error al registrar invitado: ' + errorMessage);
    }
  };

  const vehiculoColumns = [
    {
      title: 'Placa',
      dataIndex: 'placa',
      key: 'placa',
      width: 100,
      render: (placa) => <Tag color="blue">{placa}</Tag>,
    },
    {
      title: 'Marca',
      dataIndex: 'marca',
      key: 'marca',
      width: 120,
    },
    {
      title: 'Modelo',
      dataIndex: 'modelo',
      key: 'modelo',
      width: 120,
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color) => <Tag color="orange">{color}</Tag>,
    },
    {
      title: 'Residente',
      key: 'residente',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.residente_nombre}</div>
          <div style={{ fontSize: '11px', color: '#666' }}>ID: {record.residente_id}</div>
        </div>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 80,
      align: 'center',
      render: (activo) => (
        <Tag color={activo ? 'success' : 'default'}>
          {activo ? 'ACTIVO' : 'INACTIVO'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const invitadoColumns = [
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 150,
    },
    {
      title: 'CI',
      dataIndex: 'ci',
      key: 'ci',
      width: 100,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 100,
      render: (tipo) => (
        <Tag color={tipo === 'evento' ? 'purple' : 'green'}>
          {tipo === 'evento' ? 'EVENTO' : 'CASUAL'}
        </Tag>
      ),
    },
    {
      title: 'Vehículo',
      dataIndex: 'vehiculo_placa',
      key: 'vehiculo_placa',
      width: 100,
      render: (placa) => placa ? <Tag color="blue">{placa}</Tag> : '-',
    },
    {
      title: 'Check-in',
      dataIndex: 'check_in_at',
      key: 'check_in_at',
      width: 120,
      render: (checkIn) => checkIn ? (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          {new Date(checkIn).toLocaleTimeString()}
        </Tag>
      ) : (
        <Tag color="default" icon={<ClockCircleOutlined />}>
          Pendiente
        </Tag>
      ),
    },
    {
      title: 'Check-out',
      dataIndex: 'check_out_at',
      key: 'check_out_at',
      width: 120,
      render: (checkOut) => checkOut ? (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          {new Date(checkOut).toLocaleTimeString()}
        </Tag>
      ) : (
        <Tag color="default" icon={<ClockCircleOutlined />}>
          Pendiente
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <CarOutlined />
            Gestión de Vehículos - Unidad {unidadNumero}
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            Nuevo Vehículo
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button size="small" onClick={loadVehiculos}>
                Reintentar
              </Button>
            }
          />
        )}

        <Table
          columns={vehiculoColumns}
          dataSource={vehiculos}
          rowKey="id"
          size="small"
          loading={loading}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `${total} vehículos`,
            size: 'small'
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Card
        title={
          <Space>
            <TeamOutlined />
            Invitados de Hoy - Unidad {unidadNumero}
          </Space>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={showInvitadoModal}>
            Nuevo Invitado
          </Button>
        }
      >
        <Table
          columns={invitadoColumns}
          dataSource={invitados}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `${total} invitados`,
            size: 'small'
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal para crear/editar vehículo */}
      <Modal
        title={editingVehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
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
          <Form.Item
            name="placa"
            label="Placa"
            rules={[{ required: true, message: 'Por favor ingrese la placa' }]}
          >
            <Input placeholder="ABC-123" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Form.Item
            name="marca"
            label="Marca"
            rules={[{ required: true, message: 'Por favor ingrese la marca' }]}
          >
            <Input placeholder="Toyota, Honda, etc." />
          </Form.Item>

          <Form.Item
            name="modelo"
            label="Modelo"
            rules={[{ required: true, message: 'Por favor ingrese el modelo' }]}
          >
            <Input placeholder="Corolla, Civic, etc." />
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
            rules={[{ required: true, message: 'Por favor ingrese el color' }]}
          >
            <Input placeholder="Blanco, Negro, etc." />
          </Form.Item>

          <Form.Item
            name="residente"
            label="Residente"
            rules={[{ required: true, message: 'Por favor seleccione un residente' }]}
          >
            <Select
              placeholder="Seleccionar residente"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {residentes.map(residente => (
                <Option key={residente.id} value={residente.id}>
                  {residente.persona_info?.nombre || 'Sin nombre'} (ID: {residente.id})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="activo"
            label="Estado"
            valuePropName="checked"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Activo</Option>
              <Option value={false}>Inactivo</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingVehiculo ? 'Actualizar' : 'Crear'}
              </Button>
              <Button onClick={handleCancel}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para crear invitado */}
      <Modal
        title="Nuevo Invitado"
        open={isInvitadoModalVisible}
        onCancel={() => setIsInvitadoModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={invitadoForm}
          layout="vertical"
          onFinish={handleInvitadoSubmit}
        >
          <Form.Item
            name="nombre"
            label="Nombre del Invitado"
            rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
          >
            <Input placeholder="Nombre completo del invitado" />
          </Form.Item>

          <Form.Item
            name="ci"
            label="Cédula de Identidad"
            rules={[{ required: true, message: 'Por favor ingrese la cédula' }]}
          >
            <Input placeholder="12345678" />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo de Visita"
            rules={[{ required: true, message: 'Por favor seleccione el tipo' }]}
            initialValue="casual"
          >
            <Select>
              <Option value="casual">Visita Casual</Option>
              <Option value="evento">Invitado de Evento</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="vehiculo_placa"
            label="Placa del Vehículo (Opcional)"
          >
            <Input placeholder="ABC-123" style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <Form.Item
            name="fecha_inicio"
            label="Fecha y Hora de Inicio"
            rules={[{ required: true, message: 'Por favor seleccione la fecha de inicio' }]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item
            name="fecha_fin"
            label="Fecha y Hora de Fin (Opcional)"
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Registrar Invitado
              </Button>
              <Button onClick={() => setIsInvitadoModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionVehiculos;
