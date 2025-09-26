import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip, Badge, Divider } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, HomeOutlined, UserAddOutlined, SearchOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import { usuariosAPI } from '../api/usuarios';
import api from '../api/config';
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
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [residentes, setResidentes] = useState([]);
  const [showCreateResidentModal, setShowCreateResidentModal] = useState(false);
  const [selectedUserForResident, setSelectedUserForResident] = useState(null);
  const [residentForm] = Form.useForm();
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
    cargarResidentes();
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

  const cargarResidentes = async () => {
    try {
      const response = await api.get('/usuarios/residentes/');
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setResidentes(data);
    } catch (error) {
      console.error('Error cargando residentes:', error);
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
        const createdUser = await usuariosAPI.createUsuario(values);
        try {
          const personaNombre = (values.first_name || values.last_name)
            ? `${values.first_name || ''} ${values.last_name || ''}`.trim()
            : values.username;
          await api.post('/usuarios/persona/', {
            ci: null,
            nombre: personaNombre,
            email: values.email || null,
            telefono: null
          });
        } catch (personaErr) {
          console.error('Error creando persona para el usuario:', personaErr);
          // No bloqueamos la creación del usuario si falla la persona
        }
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
          cargarResidentes();
        } catch (error) {
          console.error('Error al eliminar usuario:', error);
          message.error('Error al eliminar usuario');
        }
      },
    });
  };

  const openCreateResidentModal = (usuario) => {
    setSelectedUserForResident(usuario);
    residentForm.setFieldsValue({
      ci: '',
      nombre: usuario.first_name && usuario.last_name ? `${usuario.first_name} ${usuario.last_name}` : usuario.username,
      email: usuario.email,
      telefono: '',
      tipo: 'residente',
      unidad: '',
      usuario_asociado: ''
    });
    setShowCreateResidentModal(true);
  };

  const handleCreateResident = async (values) => {
    try {
      // 1. Crear persona
      const personaRes = await api.post('/usuarios/persona/', {
        ci: values.ci || null,
        nombre: values.nombre,
        email: values.email || null,
        telefono: values.telefono || null
      });
      const personaId = personaRes.data.id;

      // 2. Crear residente (con usuario asociado)
      const residenteData = {
        persona: personaId,
        usuario: selectedUserForResident.id,
        usuario_asociado: values.usuario_asociado || null
      };
      
      await api.post('/usuarios/residentes/', residenteData);

      message.success('Residente creado exitosamente');
      setShowCreateResidentModal(false);
      setSelectedUserForResident(null);
      residentForm.resetFields();
      cargarResidentes();
    } catch (error) {
      console.error('Error al crear residente:', error);
      message.error('Error al crear residente: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCancelResidentModal = () => {
    setShowCreateResidentModal(false);
    setSelectedUserForResident(null);
    residentForm.resetFields();
  };

  // Filtrar usuarios
  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = !searchText || 
      usuario.username.toLowerCase().includes(searchText.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchText.toLowerCase()) ||
      `${usuario.first_name || ''} ${usuario.last_name || ''}`.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesRole = !filterRole || 
      (usuario.rol?.nombre || usuario.rol || '').toLowerCase() === filterRole.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  // Verificar si un usuario ya tiene residente asociado
  const hasResident = (usuarioId) => {
    return residentes.some(residente => residente.usuario === usuarioId);
  };

  const openUserDetails = (usuario) => {
    setSelectedUserDetails(usuario);
    setIsDetailsVisible(true);
  };

  

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      responsive: ['xl'],
      align: 'center',
    },
    {
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      render: (username) => <strong style={{ fontSize: '13px' }}>{username}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 160,
      responsive: ['lg'],
      render: (email) => <span style={{ fontSize: '12px' }}>{email}</span>,
    },
    {
      title: 'Nombre Completo',
      key: 'fullname',
      width: 150,
      responsive: ['md'],
      render: (_, record) => {
        const fullName = `${record.first_name || ''} ${record.last_name || ''}`.trim();
        return <span style={{ fontSize: '12px' }}>{fullName || '-'}</span>;
      },
    },
    {
      title: 'Estado',
      dataIndex: 'is_active',
      key: 'estado',
      width: 90,
      responsive: ['sm'],
      align: 'center',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'} size="small">
          {isActive ? 'ACTIVO' : 'INACTIVO'}
        </Tag>
      ),
    },
    {
      title: 'Rol',
      key: 'rol',
      width: 100,
      responsive: ['sm'],
      align: 'center',
      render: (_, record) => {
        const rolName = record.rol?.nombre || record.rol || 'Usuario';
        const color = rolName.toLowerCase() === 'administrador' ? 'blue' : 
                     rolName.toLowerCase() === 'residente' ? 'green' : 
                     rolName.toLowerCase() === 'seguridad' ? 'orange' : 'default';
        return <Tag color={color} size="small">{rolName}</Tag>;
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="Ver detalles">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => openUserDetails(record)}
              size="small"
              style={{ padding: '4px 6px', fontSize: '11px' }}
            >
              Ver
            </Button>
          </Tooltip>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
            style={{ padding: '4px 6px', fontSize: '11px' }}
          >
            Editar
          </Button>
          {!hasResident(record.id) && (record.rol?.nombre || record.rol || '').toLowerCase() === 'residente' && (
            <Tooltip title="Crear residente para este usuario">
              <Button
                type="link"
                icon={<HomeOutlined />}
                onClick={() => openCreateResidentModal(record)}
                size="small"
                style={{ color: '#52c41a', padding: '4px 6px', fontSize: '11px' }}
              >
                Residente
              </Button>
            </Tooltip>
          )}
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
            style={{ padding: '4px 6px', fontSize: '11px' }}
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

      {/* Filtros y búsqueda */}
      <Card className="usuarios-filters" style={{ marginBottom: 20 }}>
        <Space wrap>
          <Input
            placeholder="Buscar por usuario, email o nombre..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filtrar por rol"
            value={filterRole}
            onChange={setFilterRole}
            style={{ width: 150 }}
            allowClear
          >
            {roles.map(rol => (
              <Option key={rol.id} value={rol.nombre}>{rol.nombre}</Option>
            ))}
          </Select>
          <Button 
            icon={<FilterOutlined />} 
            onClick={() => {
              setSearchText('');
              setFilterRole('');
            }}
          >
            Limpiar Filtros
          </Button>
        </Space>
      </Card>


      {/* Tabla de Usuarios */}
      <Card
        title={`Usuarios (${filteredUsuarios.length})`}
        className="usuarios-table"
        size="small"
        extra={
          <Button type="link" size="small" onClick={cargarUsuarios}>
            Actualizar
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredUsuarios}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total}`,
            size: 'small',
            responsive: true
          }}
          responsive={true}
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

      {/* Modal para crear residente desde usuario */}
      <Modal
        title={`Crear Residente para ${selectedUserForResident?.username}`}
        open={showCreateResidentModal}
        onCancel={handleCancelResidentModal}
        footer={null}
        width={600}
      >
        <Form
          form={residentForm}
          layout="vertical"
          onFinish={handleCreateResident}
        >
          <Form.Item
            name="ci"
            label="CI"
          >
            <Input placeholder="Ingrese el CI (opcional)" maxLength="20" />
          </Form.Item>

          <Form.Item
            name="nombre"
            label="Nombre Completo"
            rules={[{ required: true, message: 'Por favor ingrese el nombre completo' }]}
          >
            <Input placeholder="Ingrese el nombre completo" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Email inválido' }
            ]}
          >
            <Input placeholder="Ingrese el email" />
          </Form.Item>

          <Form.Item
            name="telefono"
            label="Teléfono"
          >
            <Input placeholder="Ingrese el teléfono" />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: 'Por favor seleccione el tipo' }]}
          >
            <Select>
              <Option value="residente">Residente</Option>
              <Option value="inquilino">Inquilino</Option>
            </Select>
          </Form.Item>

          <Divider>Información del Usuario</Divider>
          <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '6px', marginBottom: '16px' }}>
            <div><strong>Usuario:</strong> {selectedUserForResident?.username}</div>
            <div><strong>Email:</strong> {selectedUserForResident?.email}</div>
            <div><strong>Rol:</strong> {selectedUserForResident?.rol?.nombre || selectedUserForResident?.rol}</div>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Crear Residente
              </Button>
              <Button onClick={handleCancelResidentModal}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de detalles de usuario */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            Detalles de Usuario {selectedUserDetails?.username}
          </Space>
        }
        open={isDetailsVisible}
        onCancel={() => setIsDetailsVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUserDetails && (
          <div style={{ lineHeight: 1.8 }}>
            <div>
              <strong>Usuario:</strong> {selectedUserDetails.username}
            </div>
            <div>
              <strong>Email:</strong> {selectedUserDetails.email}
            </div>
            <div>
              <strong>Nombre:</strong> {(selectedUserDetails.first_name || '') + ' ' + (selectedUserDetails.last_name || '')}
            </div>
            <div>
              <strong>Rol:</strong> {selectedUserDetails.rol?.nombre || selectedUserDetails.rol || 'Usuario'}
            </div>
            <div>
              <strong>Estado:</strong>{' '}
              <Tag color={selectedUserDetails.is_active ? 'success' : 'default'}>
                {selectedUserDetails.is_active ? 'ACTIVO' : 'INACTIVO'}
              </Tag>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default ListaUsuarios;