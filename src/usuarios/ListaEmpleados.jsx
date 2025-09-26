import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip, Badge, Divider } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, SearchOutlined, FilterOutlined, TeamOutlined, SafetyOutlined, ToolOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../api/config';
import './ListaEmpleados.css';

const { Option } = Select;
const { confirm } = Modal;

const ListaEmpleados = () => {
  const { canAccess } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterCargo, setFilterCargo] = useState('');
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);

  const CARGO_OPTIONS = [
    { value: 'administrador', label: '👨‍💼 Administrador', color: 'red' },
    { value: 'seguridad', label: '🛡️ Seguridad', color: 'blue' },
    { value: 'mantenimiento', label: '🔧 Mantenimiento', color: 'green' },
    { value: 'limpieza', label: '🧹 Limpieza', color: 'orange' },
    { value: 'jardinero', label: '🌱 Jardinero', color: 'green' },
    { value: 'portero', label: '🚪 Portero', color: 'purple' }
  ];

  useEffect(() => {
    if (canAccess('administrador') || canAccess('empleado') || canAccess('seguridad')) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando datos de empleados...');
      
      const [empleadosRes, personasRes, usuariosRes, rolesRes] = await Promise.all([
        api.get('/usuarios/empleados/'),
        api.get('/usuarios/persona/'),
        api.get('/usuarios/usuario/'),
        api.get('/usuarios/roles/')
      ]);

      console.log('✅ Datos cargados:', {
        empleados: empleadosRes.data.results?.length || empleadosRes.data.length || 0,
        personas: personasRes.data.results?.length || personasRes.data.length || 0,
        usuarios: usuariosRes.data.results?.length || usuariosRes.data.length || 0,
        roles: rolesRes.data.results?.length || rolesRes.data.length || 0
      });

      // Handle paginated responses
      setEmpleados(empleadosRes.data.results || empleadosRes.data || []);
      setPersonas(personasRes.data.results || personasRes.data || []);
      setUsuarios(usuariosRes.data.results || usuariosRes.data || []);
      setRoles(rolesRes.data.results || rolesRes.data || []);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingEmpleado) {
        await handleUpdate(values);
      } else {
        await handleCreate(values);
      }
    } catch (error) {
      console.error('Error al guardar empleado:', error);
      message.error('Error al guardar empleado: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCreate = async (values) => {
    const empleadoData = {
      persona: parseInt(values.persona),
      usuario: parseInt(values.usuario),
      cargo: values.cargo
    };

    console.log('👷 Creando empleado:', empleadoData);
    await api.post('/usuarios/empleados/', empleadoData);
    message.success('Empleado creado exitosamente');
    setIsModalVisible(false);
    form.resetFields();
    loadData();
  };

  const handleUpdate = async (values) => {
    const empleadoData = {
      persona: parseInt(values.persona),
      usuario: parseInt(values.usuario),
      cargo: values.cargo
    };

    console.log('🔄 Actualizando empleado:', empleadoData);
    await api.put(`/usuarios/empleados/${editingEmpleado.id}/`, empleadoData);
    message.success('Empleado actualizado exitosamente');
    setIsModalVisible(false);
    setEditingEmpleado(null);
    form.resetFields();
    loadData();
  };

  const handleDelete = (id) => {
    confirm({
      title: '¿Está seguro de eliminar este empleado?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/usuarios/empleados/${id}/`);
          message.success('Empleado eliminado exitosamente');
          loadData();
        } catch (error) {
          console.error('Error al eliminar empleado:', error);
          message.error('Error al eliminar empleado: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  };

  const handleEdit = (empleado) => {
    setEditingEmpleado(empleado);
    form.setFieldsValue({
      persona: empleado.persona,
      usuario: empleado.usuario,
      cargo: empleado.cargo
    });
    setIsModalVisible(true);
  };

  const handleCreateNew = () => {
    setEditingEmpleado(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const getPersonaNombre = (personaId) => {
    const persona = personas.find(p => p.id === personaId);
    return persona ? persona.nombre : 'Desconocido';
  };

  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuarios.find(u => u.id === usuarioId);
    return usuario ? usuario.username : 'Desconocido';
  };

  const getCargoIcon = (cargo) => {
    const icons = {
      'administrador': '👨‍💼',
      'seguridad': '🛡️',
      'mantenimiento': '🔧',
      'limpieza': '🧹',
      'jardinero': '🌱',
      'portero': '🚪'
    };
    return icons[cargo] || '👷';
  };

  const getCargoColor = (cargo) => {
    const cargoOption = CARGO_OPTIONS.find(opt => opt.value === cargo);
    return cargoOption ? cargoOption.color : 'default';
  };

  // Filtrar empleados - asegurar que empleados sea un array
  const filteredEmpleados = (Array.isArray(empleados) ? empleados : []).filter(empleado => {
    const matchesSearch = !searchText || 
      getPersonaNombre(empleado.persona).toLowerCase().includes(searchText.toLowerCase()) ||
      getUsuarioNombre(empleado.usuario).toLowerCase().includes(searchText.toLowerCase()) ||
      empleado.cargo.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCargo = !filterCargo || empleado.cargo === filterCargo;
    
    return matchesSearch && matchesCargo;
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      responsive: ['lg'],
    },
    {
      title: 'Empleado',
      dataIndex: 'persona',
      key: 'persona',
      width: 180,
      responsive: ['sm'],
      render: (personaId, record) => (
        <Space>
          <span style={{ fontSize: '16px' }}>{getCargoIcon(record.cargo)}</span>
          <div>
            <div><strong>{getPersonaNombre(personaId)}</strong></div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              @{getUsuarioNombre(record.usuario)}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Cargo',
      dataIndex: 'cargo',
      key: 'cargo',
      width: 120,
      render: (cargo) => (
        <Tag color={getCargoColor(cargo)}>
          {getCargoIcon(cargo)} {cargo.charAt(0).toUpperCase() + cargo.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Información Personal',
      key: 'persona_info',
      width: 220,
      responsive: ['md'],
      render: (_, record) => {
        const persona = personas.find(p => p.id === record.persona);
        return persona ? (
          <div>
            <div><strong>CI:</strong> {persona.ci || 'N/A'}</div>
            <div><strong>Teléfono:</strong> {persona.telefono || 'N/A'}</div>
            <div><strong>Email:</strong> {persona.email || 'N/A'}</div>
          </div>
        ) : 'N/A';
      },
    },
    {
      title: 'Estado Usuario',
      dataIndex: 'usuario',
      key: 'usuario_status',
      width: 100,
      align: 'center',
      render: (usuarioId) => {
        const usuario = usuarios.find(u => u.id === usuarioId);
        return usuario ? (
          <Badge 
            status={usuario.is_active ? 'success' : 'error'} 
            text={usuario.is_active ? 'Activo' : 'Inactivo'} 
          />
        ) : 'Desconocido';
      },
    },
    {
      title: 'Rol',
      dataIndex: 'usuario',
      key: 'rol',
      width: 100,
      align: 'center',
      render: (usuarioId) => {
        const usuario = usuarios.find(u => u.id === usuarioId);
        return usuario && usuario.rol ? (
          <Tag color="blue">{usuario.rol.nombre || usuario.rol}</Tag>
        ) : 'Sin rol';
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 140,
      align: 'center',
      render: (_, record) => (
        canAccess('administrador') ? (
          <Space>
            <Tooltip title="Ver detalles">
              <Button 
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => { setSelectedEmpleado(record); setIsDetailsVisible(true); }}
                style={{ padding: '4px 6px', fontSize: '11px' }}
              >
                Ver
              </Button>
            </Tooltip>
            <Tooltip title="Editar empleado">
              <Button 
                type="link"
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{ padding: '4px 6px', fontSize: '11px' }}
              >
                Editar
              </Button>
            </Tooltip>
            <Tooltip title="Eliminar empleado">
              <Button 
                type="link"
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
                style={{ padding: '4px 6px', fontSize: '11px' }}
              >
                Eliminar
              </Button>
            </Tooltip>
          </Space>
        ) : (
          <span style={{ color: '#999' }}>Solo lectura</span>
        )
      ),
    },
  ];

  if (!canAccess('administrador') && !canAccess('empleado') && !canAccess('seguridad')) {
    return (
      <div className="access-denied">
        <h2>Acceso Denegado</h2>
        <p>No tiene permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-usuarios">
      <div className="dashboard-header">
        <h1>Gestión de Empleados</h1>
        {canAccess('administrador') && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateNew}
            size="large"
          >
            Nuevo Empleado
          </Button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="usuarios-stats">
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">👷</div>
            <div>
              <h3>TOTAL EMPLEADOS</h3>
              <p className="stat-value">{Array.isArray(empleados) ? empleados.length : 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🛡️</div>
            <div>
              <h3>SEGURIDAD</h3>
              <p className="stat-value">{Array.isArray(empleados) ? empleados.filter(e => e.cargo === 'seguridad').length : 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🔧</div>
            <div>
              <h3>MANTENIMIENTO</h3>
              <p className="stat-value">{Array.isArray(empleados) ? empleados.filter(e => e.cargo === 'mantenimiento').length : 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="usuarios-filters">
        <Space wrap>
          <Input
            placeholder="Buscar por nombre, usuario o cargo..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filtrar por cargo"
            value={filterCargo}
            onChange={setFilterCargo}
            style={{ width: 200 }}
            allowClear
          >
            {CARGO_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      {/* Tabla */}
      <div className="usuarios-table">
        <Table
          columns={columns}
          dataSource={filteredEmpleados}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} empleados`,
          }}
          responsive={true}
        />
      </div>

      {/* Modal de detalles del empleado */}
      <Modal
        title={
          <Space>
            <TeamOutlined />
            Detalles del Empleado
          </Space>
        }
        open={isDetailsVisible}
        onCancel={() => { setIsDetailsVisible(false); setSelectedEmpleado(null); }}
        footer={null}
        width={700}
      >
        {selectedEmpleado && (
          <div style={{ lineHeight: 1.8 }}>
            <div><strong>Nombre:</strong> {getPersonaNombre(selectedEmpleado.persona)}</div>
            <div><strong>Usuario:</strong> @{getUsuarioNombre(selectedEmpleado.usuario)}</div>
            <div><strong>Cargo:</strong> {selectedEmpleado.cargo}</div>
            <Divider />
            {(() => {
              const persona = personas.find(p => p.id === selectedEmpleado.persona);
              const usuario = usuarios.find(u => u.id === selectedEmpleado.usuario);
              return (
                <div>
                  <div><strong>CI:</strong> {persona?.ci || 'N/A'}</div>
                  <div><strong>Teléfono:</strong> {persona?.telefono || 'N/A'}</div>
                  <div><strong>Email Persona:</strong> {persona?.email || 'N/A'}</div>
                  <div><strong>Email Usuario:</strong> {usuario?.email || 'N/A'}</div>
                  <div><strong>Rol:</strong> {usuario?.rol?.nombre || usuario?.rol || 'Sin rol'}</div>
                  <div>
                    <strong>Estado Usuario:</strong>
                    {' '}
                    <Badge status={usuario?.is_active ? 'success' : 'error'} text={usuario?.is_active ? 'Activo' : 'Inactivo'} />
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Modal de formulario - Solo para administradores */}
      {canAccess('administrador') && (
        <Modal
          title={editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingEmpleado(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="persona"
            label="Persona"
            rules={[{ required: true, message: 'Por favor seleccione una persona' }]}
          >
            <Select placeholder="Seleccionar persona">
              {personas.map(persona => (
                <Option key={persona.id} value={persona.id}>
                  {persona.nombre} - {persona.ci}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="usuario"
            label="Usuario"
            rules={[{ required: true, message: 'Por favor seleccione un usuario' }]}
          >
            <Select placeholder="Seleccionar usuario">
              {usuarios.map(usuario => (
                <Option key={usuario.id} value={usuario.id}>
                  {usuario.username} - {usuario.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="cargo"
            label="Cargo"
            rules={[{ required: true, message: 'Por favor seleccione un cargo' }]}
          >
            <Select placeholder="Seleccionar cargo">
              {CARGO_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEmpleado ? 'Actualizar' : 'Crear'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingEmpleado(null);
                form.resetFields();
              }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
        </Modal>
      )}
    </div>
  );
};

export default ListaEmpleados;
