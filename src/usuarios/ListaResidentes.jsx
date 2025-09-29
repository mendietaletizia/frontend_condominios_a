import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip, Badge, Divider } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, HomeOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import api from '../api/config';
import { usuariosAPI } from '../api/usuarios';
import './ListaResidentes.css';

const { Option } = Select;
const { confirm } = Modal;

const ListaResidentes = () => {
  const { canAccess } = useAuth();
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [usuariosResidentes, setUsuariosResidentes] = useState([]);
  const [residentesRaw, setResidentesRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingResidente, setEditingResidente] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterTipo, setFilterTipo] = useState('');


  useEffect(() => {
    if (canAccess('administrador')) {
      loadData();
      loadUsuariosResidentes(); // Load residents' users
    }
  }, []);

  const loadUsuariosResidentes = async () => {
    try {
      console.log('🔍 Iniciando carga de usuarios residentes...');
      const response = await usuariosAPI.getUsuarios();
      console.log('✅ Usuarios cargados exitosamente:', response);
      
      // Handle Django REST Framework response format
      const usuarios = Array.isArray(response) ? response : response.results || [];
      console.log('📋 Usuarios procesados:', usuarios);
      
      // Filtrar usuarios con rol residente
      const usuariosResidentes = usuarios.filter(u => {
        console.log('👤 Analizando usuario:', u.username, 'Rol:', u.rol);
        
        // Verificar diferentes formatos de rol
        if (typeof u.rol === 'string') {
          const esResidente = u.rol.toLowerCase() === 'residente';
          console.log(`   📝 Rol como string: ${u.rol} -> Es residente: ${esResidente}`);
          return esResidente;
        } 
        else if (u.rol && u.rol.nombre) {
          const esResidente = u.rol.nombre.toLowerCase() === 'residente';
          console.log(`   📝 Rol como objeto: ${u.rol.nombre} -> Es residente: ${esResidente}`);
          return esResidente;
        }
        
        console.log(`   ❌ Usuario ${u.username} no es residente`);
        return false;
      });
      
      console.log('🎯 Usuarios residentes encontrados:', usuariosResidentes);
      setUsuariosResidentes(usuariosResidentes);
    } catch (error) {
      console.error('❌ Error cargando usuarios residentes:', error);
      console.error('Detalles del error:', error.response?.data || error.message);
      setUsuariosResidentes([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Traer datos básicos usando la nueva API mejorada
      const [residentesRes, unidadesRes] = await Promise.all([
        api.get('/residentes/'),
        api.get('/unidades/')
      ]);

      // Manejar formato de respuesta de Django REST Framework
      const unidadesData = Array.isArray(unidadesRes.data) ? unidadesRes.data : unidadesRes.data.results || [];
      setUnidades(unidadesData);

      // Procesar residentes usando la información mejorada del serializer
      // Django REST Framework devuelve los datos en un formato específico
      const residentesData = Array.isArray(residentesRes.data) ? residentesRes.data : residentesRes.data.results || [];
      const residentesTabla = residentesData.map(residente => {
        const persona = residente.persona_info;
        const unidades = residente.unidades_info || [];
        const unidadActiva = unidades.find(u => u.fecha_fin === null || !u.fecha_fin);
        const usuarioAsociado = residente.usuario_asociado_info;

        console.log('🔍 Procesando residente:', {
          id: residente.id,
          persona_info: persona,
          persona_id: persona ? persona.id : null,
          unidades_info: unidades
        });

        return {
          id: residente.id,
          persona_id: persona ? persona.id : null,
          ci: persona ? persona.ci : '-',
          nombre: persona ? persona.nombre : '-',
          email: persona ? persona.email : '-',
          telefono: persona ? persona.telefono : '-',
          tipo: unidadActiva ? (unidadActiva.rol_en_unidad === 'propietario' ? 'Responsable de Unidad' : unidadActiva.rol_en_unidad) : 'Sin unidad asignada',
          unidad_nombre: unidadActiva ? unidadActiva.numero_casa : 'Sin asignar',
          usuario: residente.usuario,
          usuario_asociado: usuarioAsociado ? usuarioAsociado.username : null,
          rel_id: unidadActiva ? unidadActiva.id : null,
          tiene_relacion_unidad: !!unidadActiva,
          unidades_info: unidades,
          mascotas_info: residente.mascotas_info || []
        };
      });

      setResidentes(residentesTabla);
      setResidentesRaw(residentesData);
    } catch (error) {
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const showModal = (residente = null) => {
    setEditingResidente(residente);
    if (residente) {
      form.setFieldsValue({
        ci: residente.ci !== '-' ? residente.ci : '',
        nombre: residente.nombre !== '-' ? residente.nombre : '',
        email: residente.email !== '-' ? residente.email : '',
        telefono: residente.telefono !== '-' ? residente.telefono : '',
        tipo: residente.tipo && residente.tipo !== 'Sin unidad asignada' ? 
          (residente.tipo === 'Responsable de Unidad' ? 'propietario' : residente.tipo) : 'residente',
        unidad: residente.unidad_nombre !== 'Sin asignar' ? 
          unidades.find(u => u.numero_casa === residente.unidad_nombre)?.id || '' : '',
        usuario_asociado: usuariosResidentes.find(u => u.username === residente.usuario_asociado)?.id || ''
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingResidente(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      if (editingResidente) {
        await handleUpdate(values);
      } else {
        await handleCreate(values);
      }
      handleCancel();
      await loadUsuariosResidentes();
      await loadData();
    } catch (error) {
      console.error('Error al guardar residente:', error);
      message.error('Error al guardar residente: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCreate = async (values) => {
    try {
      // 1. Crear persona
      const personaData = {
        nombre: values.nombre
      };
      
      // Solo agregar campos si tienen valor
      if (values.ci && values.ci.trim()) {
        personaData.ci = values.ci.trim();
      }
      if (values.email && values.email.trim()) {
        personaData.email = values.email.trim();
      }
      if (values.telefono && values.telefono.trim()) {
        personaData.telefono = values.telefono.trim();
      }
      
      const personaRes = await api.post('/persona/', personaData);
      const personaId = personaRes.data.id;

      // 2. Crear residente
      const residenteData = {
        persona: personaId,
        usuario: null,
        usuario_asociado: values.usuario_asociado || null
      };
      
      const residenteRes = await api.post('/residentes/', residenteData);
      const residenteId = residenteRes.data.id;

      // 3. Crear relación con unidad si se especificó
      if (values.unidad) {
        await createResidenteUnidadRelation(residenteId, values.unidad, values.tipo);
      }

      message.success('Residente creado exitosamente');
    } catch (error) {
      console.error('Error al crear residente:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.error || 
                          error.response?.data?.message ||
                          error.message;
      message.error('Error al crear residente: ' + errorMessage);
    }
  };

  const createResidenteUnidadRelation = async (residenteId, unidadId, tipo) => {
    const relacionData = {
      id_residente: residenteId,
      id_unidad: parseInt(unidadId),
      rol_en_unidad: tipo,
      fecha_inicio: new Date().toISOString().slice(0, 10),
      estado: true
    };
    
    console.log('🏠 Creando relación unidad:', relacionData);
    await api.post('/residentes-unidad/', relacionData);
    console.log('✅ Relación unidad creada');
  };

  const handleUpdate = async (values) => {
    try {
      if (!editingResidente) {
        message.error('No se puede actualizar porque no se encontró el residente.');
        return;
      }

      console.log('🔄 Actualizando residente:', editingResidente.id);

      // 1. Actualizar persona
      await updatePersona(editingResidente.persona_id, values);
      
      // 2. Actualizar residente
      await api.put(`/residentes/${editingResidente.id}/`, {
        persona: editingResidente.persona_id,
        usuario: editingResidente.usuario,
        usuario_asociado: values.usuario_asociado || null
      });

      // 3. Manejar relación con unidad
      await handleUnidadRelation(editingResidente, values);

      message.success('Residente actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar residente:', error);
      message.error('Error al actualizar residente: ' + (error.response?.data?.detail || error.message));
    }
  };

  const updatePersona = async (personaId, values) => {
    const personaData = {
      nombre: values.nombre
    };
    
    // Solo agregar campos si tienen valor
    if (values.ci && values.ci.trim()) {
      personaData.ci = values.ci.trim();
    }
    if (values.email && values.email.trim()) {
      personaData.email = values.email.trim();
    }
    if (values.telefono && values.telefono.trim()) {
      personaData.telefono = values.telefono.trim();
    }
    
    if (!personaId) {
      // Crear nueva persona
      const personaRes = await api.post('/persona/', personaData);
      return personaRes.data.id;
    } else {
      // Actualizar persona existente
      await api.put(`/persona/${personaId}/`, personaData);
      return personaId;
    }
  };

  const handleUnidadRelation = async (residente, values) => {
    if (values.unidad) {
      const relacionData = {
        id_residente: residente.id,
        id_unidad: parseInt(values.unidad),
        rol_en_unidad: values.tipo,
        fecha_inicio: new Date().toISOString().slice(0, 10),
        estado: true
      };
      
      if (residente.rel_id && residente.tiene_relacion_unidad) {
        // Actualizar relación existente
        await api.put(`/residentes-unidad/${residente.rel_id}/`, relacionData);
      } else {
        // Crear nueva relación
        await api.post('/residentes-unidad/', relacionData);
      }
    } else if (residente.rel_id && residente.tiene_relacion_unidad) {
      // Eliminar relación si no se especifica unidad
      await api.delete(`/residentes-unidad/${residente.rel_id}/`);
    }
  };


  const handleDelete = (id) => {
    confirm({
      title: '¿Está seguro de eliminar este residente?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/residentes/${id}/`);
          message.success('Residente eliminado exitosamente');
          await loadUsuariosResidentes();
          await loadData();
        } catch (error) {
          console.error('Error al eliminar residente:', error);
          message.error('Error al eliminar residente: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  };

  // Filtrar residentes
  const filteredResidentes = residentes.filter(residente => {
    const matchesSearch = !searchText || 
      residente.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      residente.email.toLowerCase().includes(searchText.toLowerCase()) ||
      residente.ci.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesTipo = !filterTipo || 
      residente.tipo.toLowerCase() === filterTipo.toLowerCase();
    
    return matchesSearch && matchesTipo;
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      align: 'center',
    },
    {
      title: 'CI',
      dataIndex: 'ci',
      key: 'ci',
      width: 130,
      render: (ci) => <span>{ci || '-'}</span>,
    },
    {
      title: 'Nombre Completo',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 200,
      render: (nombre) => <strong>{nombre}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (email) => <span>{email || '-'}</span>,
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
      width: 140,
      render: (telefono) => <span>{telefono || '-'}</span>,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 110,
      align: 'center',
      render: (tipo) => {
        const color = tipo === 'residente' ? 'green' : tipo === 'inquilino' ? 'blue' : 'default';
        return <Tag color={color}>{tipo}</Tag>;
      },
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad_nombre',
      key: 'unidad',
      width: 130,
      render: (unidad) => <span>{unidad || '-'}</span>,
    },
    {
      title: 'Usuario Asociado',
      key: 'usuario_asociado',
      width: 150,
      render: (_, record) => {
        if (record.usuario_asociado) {
          return (
            <Tooltip title="Dependiente de usuario">
              <Badge status="success" text={record.usuario_asociado} />
            </Tooltip>
          );
        } else if (record.usuario) {
          return (
            <Tooltip title="Residente principal con usuario">
              <Badge status="processing" text="Usuario propio" />
            </Tooltip>
          );
        } else {
          return (
            <Tooltip title="Residente independiente sin usuario">
              <Badge status="default" text="Independiente" />
            </Tooltip>
          );
        }
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
            style={{ padding: '4px 6px', fontSize: '11px' }}
          >
            Editar
          </Button>
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
        <div>Cargando residentes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
        <Button size="small" onClick={loadData} style={{ marginLeft: 10 }}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="dashboard-usuarios">
      <div className="dashboard-header">
        <h1>Gestión de Residentes e Inquilinos</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          size="large"
        >
          Nuevo Residente
        </Button>
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
            <div className="stat-icon">👥</div>
            <div>
              <h3>TOTAL RESIDENTES</h3>
              <p className="stat-value">{residentes.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🏠</div>
            <div>
              <h3>RESIDENTES</h3>
              <p className="stat-value">{residentes.filter(r => r.tipo === 'residente').length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🏢</div>
            <div>
              <h3>INQUILINOS</h3>
              <p className="stat-value">{residentes.filter(r => r.tipo === 'inquilino').length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="usuarios-filters">
        <Space wrap>
          <Input
            placeholder="Buscar por CI, nombre o email..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filtrar por tipo"
            value={filterTipo}
            onChange={setFilterTipo}
            style={{ width: 200 }}
            allowClear
          >
            <Option value="propietario">Responsable de Unidad</Option>
            <Option value="residente">Residente</Option>
            <Option value="inquilino">Inquilino</Option>
          </Select>
        </Space>
      </div>

      {/* Tabla */}
      <Card className="usuarios-table">
        <Table
          columns={columns}
          dataSource={filteredResidentes}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} residentes`,
          }}
          responsive={true}
        />
      </Card>

      {/* Modal para crear/editar residente */}
      <Modal
        title={editingResidente ? 'Editar Residente' : 'Crear Nuevo Residente'}
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
              <Option value="propietario">Responsable de Unidad</Option>
              <Option value="residente">Residente</Option>
              <Option value="inquilino">Inquilino</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="unidad"
            label="Unidad"
          >
            <Select placeholder="Seleccione una unidad">
              <Option value="">Sin unidad asignada</Option>
              {Array.isArray(unidades) && unidades.map(u => (
                <Option key={u.id} value={u.id}>{u.numero_casa}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="usuario_asociado"
            label="Usuario Asociado"
          >
            <Select placeholder="Seleccione un usuario asociado">
              <Option value="">Sin usuario asociado</Option>
              {Array.isArray(usuariosResidentes) && usuariosResidentes.length > 0 ? (
                usuariosResidentes.map(u => (
                  <Option key={u.id} value={u.id}>{u.username}</Option>
                ))
              ) : (
                <Option disabled>No hay usuarios disponibles</Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingResidente ? 'Actualizar' : 'Crear'}
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

export default ListaResidentes;
