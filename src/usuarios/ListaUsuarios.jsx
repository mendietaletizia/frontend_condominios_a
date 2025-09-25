import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { usuariosAPI } from '../api/usuarios';
import './ListaUsuarios.css';

const { Option } = Select;
const { confirm } = Modal;

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuariosAPI.getUsuarios();
      const list = Array.isArray(data)
        ? data
        : (Array.isArray(data?.results) ? data.results : (Array.isArray(data?.items) ? data.items : []));
      setUsuarios(list);
      setError(null);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const cargarRoles = async () => {
    try {
      const data = await usuariosAPI.getRoles();
      const list = Array.isArray(data)
        ? data
        : (Array.isArray(data?.results) ? data.results : (Array.isArray(data?.items) ? data.items : []));
      setRoles(list);
    } catch (error) {
      console.error('Error cargando roles:', error);
    }
  };

  const showModal = (usuario = null) => {
    setEditingUser(usuario);
    if (usuario) {
      form.setFieldsValue({
        username: usuario.username || '',
        email: usuario.email || '',
        first_name: usuario.first_name || '',
        last_name: usuario.last_name || '',
        password: '',
        is_active: usuario.is_active || true,
        rol_id: usuario.rol?.id || ''
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await usuariosAPI.updateUsuario(editingUser.id, values);
        message.success('Usuario actualizado exitosamente');
      } else {
        await usuariosAPI.createUsuario(values);
        message.success('Usuario creado exitosamente');
      }
      handleCancel();
      cargarUsuarios();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      message.error('Error al guardar usuario');
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: '¿Está seguro de eliminar este usuario?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await usuariosAPI.deleteUsuario(id);
          message.success('Usuario eliminado exitosamente');
          cargarUsuarios();
        } catch (error) {
          console.error('Error al eliminar usuario:', error);
          message.error('Error al eliminar usuario');
        }
      },
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
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
      render: (username) => <strong>{username}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Nombre Completo',
      key: 'fullname',
      render: (_, record) => {
        const fullName = `${record.first_name || ''} ${record.last_name || ''}`.trim();
        return fullName || '-';
      },
    },
    {
      title: 'Estado',
      dataIndex: 'is_active',
      key: 'estado',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'ACTIVO' : 'INACTIVO'}
        </Tag>
      ),
    },
    {
      title: 'Rol',
      key: 'rol',
      render: (_, record) => {
        const rolName = record.rol?.nombre || record.rol || 'Usuario';
        const color = rolName.toLowerCase() === 'administrador' ? 'blue' : 
                     rolName.toLowerCase() === 'residente' ? 'green' : 
                     rolName.toLowerCase() === 'seguridad' ? 'orange' : 'default';
        return <Tag color={color}>{rolName}</Tag>;
      },
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <Button size="small" onClick={cargarUsuarios} style={{ marginLeft: 10 }}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-usuarios">
      <div className="dashboard-header">
        <h1>
          <UserOutlined /> Gestión de Usuarios
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Nuevo Usuario
        </Button>
      </div>

      {/* Tabla de Usuarios */}
      <Card
        title="Lista de Usuarios del Sistema"
        className="usuarios-table"
        extra={
          <Button type="link" size="small" onClick={cargarUsuarios}>
            Actualizar
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={usuarios}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Mostrando ${range[0]}-${range[1]} de ${total} usuarios`,
          }}
          scroll={false}
        />
      </Card>

      {/* Modal para crear/editar usuario */}
      <Modal
        title={editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
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
            name="username"
            label="Usuario"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de usuario' }]}
          >
            <Input placeholder="Nombre de usuario" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Correo electrónico"
            rules={[
              { required: true, message: 'Por favor ingrese el email' },
              { type: 'email', message: 'Email inválido' }
            ]}
          >
            <Input placeholder="usuario@ejemplo.com" />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="Nombre"
          >
            <Input placeholder="Nombre" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Apellido"
          >
            <Input placeholder="Apellido" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[
              { required: !editingUser, message: 'Por favor ingrese la contraseña' }
            ]}
          >
            <Input.Password 
              placeholder={editingUser ? "Dejar vacío para mantener la actual" : "Contraseña"} 
            />
          </Form.Item>

          <Form.Item
            name="rol_id"
            label="Rol"
            rules={[{ required: true, message: 'Por favor seleccione un rol' }]}
          >
            <Select placeholder="Seleccione un rol">
              {roles.map(rol => (
                <Option key={rol.id} value={rol.id}>{rol.nombre}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Estado"
            valuePropName="checked"
          >
            <input type="checkbox" /> Usuario activo
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Actualizar' : 'Crear'}
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

export default ListaUsuarios;