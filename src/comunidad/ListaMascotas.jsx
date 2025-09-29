import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip, Badge, Divider } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, HomeOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import api from '../api/config';
import './ListaMascotas.css';

const { Option } = Select;
const { confirm } = Modal;

const ListaMascotas = () => {
  const { canAccess } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMascota, setEditingMascota] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  useEffect(() => {
    if (canAccess('administrador') || canAccess('residente')) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando datos de mascotas...');
      
      const [mascotasRes, residentesRes, unidadesRes] = await Promise.all([
        api.get('/mascotas/'),
        api.get('/residentes/'),
        api.get('/unidades/')
      ]);

      console.log('✅ Datos cargados:', {
        mascotas: mascotasRes.data.results?.length || mascotasRes.data.length || 0,
        residentes: residentesRes.data.results?.length || residentesRes.data.length || 0,
        unidades: unidadesRes.data.results?.length || unidadesRes.data.length || 0
      });

      // Handle paginated responses
      setMascotas(mascotasRes.data.results || mascotasRes.data || []);
      setResidentes(residentesRes.data.results || residentesRes.data || []);
      setUnidades(unidadesRes.data.results || unidadesRes.data || []);
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingMascota) {
        await handleUpdate(values);
      } else {
        await handleCreate(values);
      }
    } catch (error) {
      console.error('Error al guardar mascota:', error);
      message.error('Error al guardar mascota: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleCreate = async (values) => {
    const mascotaData = {
      nombre: values.nombre,
      tipo: values.tipo,
      raza: values.raza || null,
      color: values.color || null,
      fecha_nacimiento: values.fecha_nacimiento || null,
      observaciones: values.observaciones || null,
      residente: parseInt(values.residente),
      unidad: values.unidad ? parseInt(values.unidad) : null,
      activo: true
    };

    console.log('🐾 Creando mascota:', mascotaData);
    await api.post('/mascotas/', mascotaData);
    message.success('Mascota creada exitosamente');
    setIsModalVisible(false);
    form.resetFields();
    loadData();
  };

  const handleUpdate = async (values) => {
    const mascotaData = {
      nombre: values.nombre,
      tipo: values.tipo,
      raza: values.raza || null,
      color: values.color || null,
      fecha_nacimiento: values.fecha_nacimiento || null,
      observaciones: values.observaciones || null,
      residente: parseInt(values.residente),
      unidad: values.unidad ? parseInt(values.unidad) : null,
      activo: true
    };

    console.log('🔄 Actualizando mascota:', mascotaData);
    await api.put(`/mascotas/${editingMascota.id}/`, mascotaData);
    message.success('Mascota actualizada exitosamente');
    setIsModalVisible(false);
    setEditingMascota(null);
    form.resetFields();
    loadData();
  };

  const handleDelete = (id) => {
    confirm({
      title: '¿Está seguro de eliminar esta mascota?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/mascotas/${id}/`);
          message.success('Mascota eliminada exitosamente');
          loadData();
        } catch (error) {
          console.error('Error al eliminar mascota:', error);
          message.error('Error al eliminar mascota: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  };

  const handleEdit = (mascota) => {
    setEditingMascota(mascota);
    form.setFieldsValue({
      nombre: mascota.nombre,
      tipo: mascota.tipo,
      raza: mascota.raza || '',
      color: mascota.color || '',
      fecha_nacimiento: mascota.fecha_nacimiento || '',
      observaciones: mascota.observaciones || '',
      residente: mascota.residente,
      unidad: mascota.unidad || ''
    });
    setIsModalVisible(true);
  };

  const handleCreateNew = () => {
    setEditingMascota(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const getResidenteNombre = (residenteId) => {
    const residente = residentes.find(r => r.id === residenteId);
    return residente ? residente.persona_info?.nombre || 'Desconocido' : 'Desconocido';
  };

  const getUnidadNombre = (unidadId) => {
    const unidad = unidades.find(u => u.id === unidadId);
    return unidad ? unidad.numero_casa : 'Sin asignar';
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      'perro': '🐕',
      'gato': '🐱',
      'ave': '🐦',
      'pez': '🐠',
      'otro': '🐾'
    };
    return icons[tipo] || '🐾';
  };

  const getTipoColor = (tipo) => {
    const colors = {
      'perro': 'blue',
      'gato': 'orange',
      'ave': 'green',
      'pez': 'cyan',
      'otro': 'purple'
    };
    return colors[tipo] || 'default';
  };

  // Filtrar mascotas - asegurar que mascotas sea un array
  const filteredMascotas = (Array.isArray(mascotas) ? mascotas : []).filter(mascota => {
    const matchesSearch = !searchText || 
      mascota.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      getResidenteNombre(mascota.residente).toLowerCase().includes(searchText.toLowerCase()) ||
      getUnidadNombre(mascota.unidad).toLowerCase().includes(searchText.toLowerCase());
    
    const matchesTipo = !filterTipo || mascota.tipo === filterTipo;
    
    return matchesSearch && matchesTipo;
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
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      width: 140,
      responsive: ['sm'],
      render: (text, record) => (
        <Space>
          <span style={{ fontSize: '16px' }}>{getTipoIcon(record.tipo)}</span>
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      width: 90,
      render: (tipo) => (
        <Tag color={getTipoColor(tipo)}>
          {getTipoIcon(tipo)} {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Raza',
      dataIndex: 'raza',
      key: 'raza',
      width: 110,
      responsive: ['lg'],
      render: (raza) => raza || '-',
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 90,
      responsive: ['lg'],
      render: (color) => color || '-',
    },
    {
      title: 'Propietario',
      dataIndex: 'residente',
      key: 'residente',
      width: 160,
      render: (residenteId) => (
        <Tooltip title={`ID: ${residenteId}`}>
          <Badge status="processing" text={getResidenteNombre(residenteId)} />
        </Tooltip>
      ),
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad',
      key: 'unidad',
      width: 110,
      render: (unidadId) => (
        <Tooltip title={unidadId ? `ID: ${unidadId}` : 'Sin unidad asignada'}>
          <Tag color={unidadId ? 'green' : 'default'} icon={<HomeOutlined />}>
            {getUnidadNombre(unidadId)}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'activo',
      key: 'activo',
      width: 90,
      align: 'center',
      render: (activo) => (
        <Badge status={activo ? 'success' : 'error'} text={activo ? 'Activa' : 'Inactiva'} />
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Editar mascota">
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
          <Tooltip title="Eliminar mascota">
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
      ),
    },
  ];

  if (!canAccess('administrador') && !canAccess('residente')) {
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
        <h1>Gestión de Mascotas</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreateNew}
          size="large"
        >
          Nueva Mascota
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
            <div className="stat-icon">🐾</div>
            <div>
              <h3>TOTAL MASCOTAS</h3>
              <p className="stat-value">{Array.isArray(mascotas) ? mascotas.length : 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🐕</div>
            <div>
              <h3>PERROS</h3>
              <p className="stat-value">{Array.isArray(mascotas) ? mascotas.filter(m => m.tipo === 'perro').length : 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="stat-card">
          <div className="stat-content">
            <div className="stat-icon">🐱</div>
            <div>
              <h3>GATOS</h3>
              <p className="stat-value">{Array.isArray(mascotas) ? mascotas.filter(m => m.tipo === 'gato').length : 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="usuarios-filters">
        <Space wrap>
          <Input
            placeholder="Buscar por nombre, propietario o unidad..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            placeholder="Filtrar por tipo"
            value={filterTipo}
            onChange={setFilterTipo}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="perro">🐕 Perro</Option>
            <Option value="gato">🐱 Gato</Option>
            <Option value="ave">🐦 Ave</Option>
            <Option value="pez">🐠 Pez</Option>
            <Option value="otro">🐾 Otro</Option>
          </Select>
        </Space>
      </div>

      {/* Tabla */}
      <div className="usuarios-table">
        <Table
          columns={columns}
          dataSource={filteredMascotas}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} mascotas`,
          }}
          responsive={true}
        />
      </div>

      {/* Modal de formulario */}
      <Modal
        title={editingMascota ? 'Editar Mascota' : 'Nueva Mascota'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingMascota(null);
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
            name="nombre"
            label="Nombre de la Mascota"
            rules={[{ required: true, message: 'Por favor ingrese el nombre de la mascota' }]}
          >
            <Input placeholder="Nombre de la mascota" />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo de Mascota"
            rules={[{ required: true, message: 'Por favor seleccione el tipo de mascota' }]}
          >
            <Select placeholder="Seleccionar tipo">
              <Option value="perro">🐕 Perro</Option>
              <Option value="gato">🐱 Gato</Option>
              <Option value="ave">🐦 Ave</Option>
              <Option value="pez">🐠 Pez</Option>
              <Option value="otro">🐾 Otro</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="raza"
            label="Raza"
          >
            <Input placeholder="Raza de la mascota (opcional)" />
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
          >
            <Input placeholder="Color de la mascota (opcional)" />
          </Form.Item>

          <Form.Item
            name="fecha_nacimiento"
            label="Fecha de Nacimiento"
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="observaciones"
            label="Observaciones"
          >
            <Input.TextArea 
              placeholder="Observaciones adicionales (opcional)" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="residente"
            label="Residente Propietario"
            rules={[{ required: true, message: 'Por favor seleccione un residente' }]}
          >
            <Select placeholder="Seleccionar residente">
              {residentes.map(r => (
                <Option key={r.id} value={r.id}>
                  {r.persona_info?.nombre || 'Residente sin nombre'}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="unidad"
            label="Unidad (opcional)"
          >
            <Select placeholder="Seleccionar unidad" allowClear>
              {unidades.map(u => (
                <Option key={u.id} value={u.id}>{u.numero_casa}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingMascota ? 'Actualizar' : 'Crear'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingMascota(null);
                form.resetFields();
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

export default ListaMascotas;