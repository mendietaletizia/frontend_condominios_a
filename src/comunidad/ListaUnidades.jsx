import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip, Badge, Divider, List, Avatar, Descriptions, Collapse } from 'antd';
import { HomeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, SearchOutlined, FilterOutlined, UserOutlined, TeamOutlined, CarOutlined, EyeOutlined, InfoCircleOutlined, HeartOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/config';
import { usuariosAPI } from '../api/usuarios';
import './ListaUnidades.css';

const { Option } = Select;
const { confirm } = Modal;
const { Panel } = Collapse;

const ListaUnidades = () => {
  const { canAccess } = useAuth();
  const [unidades, setUnidades] = useState([]);
  const [residentesUnidades, setResidentesUnidades] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [residentes, setResidentes] = useState([]);
  const [usuariosResidentes, setUsuariosResidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isPropietarioModalVisible, setIsPropietarioModalVisible] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState(null);
  const [editingUnidad, setEditingUnidad] = useState(null);
  const [form] = Form.useForm();
  const [propietarioForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (canAccess('administrador')) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unidadesRes, residentesUnidadesRes, mascotasRes, residentesRes, usuariosResidentesRes] = await Promise.all([
        api.get('/unidades/'),
        api.get('/residentes-unidad/'),
        api.get('/mascotas/'),
        api.get('/residentes/'),
        usuariosAPI.getUsuariosResidentes()
      ]);
      
      // Manejar formato de respuesta de Django REST Framework
      const unidadesData = Array.isArray(unidadesRes.data) ? unidadesRes.data : unidadesRes.data.results || [];
      const residentesUnidadesData = Array.isArray(residentesUnidadesRes.data) ? residentesUnidadesRes.data : residentesUnidadesRes.data.results || [];
      const mascotasData = Array.isArray(mascotasRes.data) ? mascotasRes.data : mascotasRes.data.results || [];
      const residentesData = Array.isArray(residentesRes.data) ? residentesRes.data : residentesRes.data.results || [];
      const usuariosResidentesData = Array.isArray(usuariosResidentesRes) ? usuariosResidentesRes : usuariosResidentesRes.results || [];
      
      console.log('📊 Datos cargados:', {
        unidades: unidadesData,
        residentes: residentesUnidadesData,
        mascotas: mascotasData,
        residentesList: residentesData,
        usuariosResidentes: usuariosResidentesData
      });
      
      setUnidades(unidadesData);
      setResidentesUnidades(residentesUnidadesData);
      setMascotas(mascotasData);
      setResidentes(residentesData);
      setUsuariosResidentes(usuariosResidentesData);
      setVehiculos([]); // Por ahora vacío hasta que se implemente el endpoint
      setError(null);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar unidades');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (unidad = null) => {
    setEditingUnidad(unidad);
    if (unidad) {
      form.setFieldsValue({
        numero_casa: unidad.numero_casa || '',
        metros_cuadrados: unidad.metros_cuadrados || '',
        cantidad_residentes: unidad.cantidad_residentes || 0,
        cantidad_mascotas: unidad.cantidad_mascotas || 0,
        cantidad_vehiculos: unidad.cantidad_vehiculos || 0
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUnidad(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      const dataToSend = {
        numero_casa: values.numero_casa.trim(),
        metros_cuadrados: parseFloat(values.metros_cuadrados),
        cantidad_residentes: parseInt(values.cantidad_residentes) || 0,
        cantidad_mascotas: parseInt(values.cantidad_mascotas) || 0,
        cantidad_vehiculos: parseInt(values.cantidad_vehiculos) || 0
      };

      if (editingUnidad) {
        await api.put(`/unidades/${editingUnidad.id}/`, dataToSend);
        message.success('Unidad actualizada exitosamente');
      } else {
        await api.post('/unidades/', dataToSend);
        message.success('Unidad creada exitosamente');
      }
      
      handleCancel();
      loadData();
    } catch (error) {
      console.error('Error al guardar unidad:', error);
      let errorMessage = 'Error desconocido';
      
      if (error.response?.status === 401) {
        errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        errorMessage = 'No tiene permisos para realizar esta acción.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Por favor, intente nuevamente.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error('Error al guardar unidad: ' + errorMessage);
    }
  };

  const handleDelete = (id) => {
    confirm({
      title: '¿Está seguro de eliminar esta unidad?',
      icon: <ExclamationCircleOutlined />,
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/unidades/${id}/`);
          message.success('Unidad eliminada exitosamente');
          loadData();
        } catch (error) {
          console.error('Error al eliminar unidad:', error);
          const errorMessage = error.response?.data?.detail || 
                             error.response?.data?.error || 
                             error.response?.data?.message ||
                             error.message;
          message.error('Error al eliminar unidad: ' + errorMessage);
        }
      },
    });
  };

  const getResidentesForUnidad = (unidadId) => {
    return residentesUnidades.filter(ru => ru.id_unidad === unidadId && ru.estado);
  };

  const getMascotasForUnidad = (unidadId) => {
    return mascotas.filter(m => m.unidad === unidadId && m.activo);
  };

  const getVehiculosForUnidad = (unidadId) => {
    return vehiculos.filter(v => v.unidad === unidadId && v.activo);
  };

  const showDetailsModal = (unidad) => {
    setSelectedUnidad(unidad);
    setIsDetailsModalVisible(true);
  };

  const showPropietarioModal = (unidad) => {
    setSelectedUnidad(unidad);
    const propietario = unidad.propietario_info;
    if (propietario) {
      // Buscar el usuario residente correspondiente al propietario
      const usuarioResidente = usuariosResidentes.find(ur => 
        ur.residente_info && ur.residente_info.id === propietario.id
      );
      if (usuarioResidente) {
        propietarioForm.setFieldsValue({
          propietario_id: usuarioResidente.id
        });
      }
    } else {
      propietarioForm.resetFields();
    }
    setIsPropietarioModalVisible(true);
  };

  const handlePropietarioSubmit = async (values) => {
    try {
      if (values.propietario_id) {
        // Buscar el usuario residente seleccionado
        const usuarioResidente = usuariosResidentes.find(ur => ur.id === values.propietario_id);
        if (!usuarioResidente) {
          message.error('Usuario residente no encontrado');
          return;
        }

        // Buscar o crear el residente asociado a este usuario
        let residenteId;
        if (usuarioResidente.residente_info) {
          // Si ya tiene un residente asociado, usar ese ID
          residenteId = usuarioResidente.residente_info.id;
        } else {
          // Si no tiene residente asociado, crear uno nuevo
          try {
            const nuevoResidente = await usuariosAPI.createResidente({
              nombre: usuarioResidente.nombre_completo,
              email: usuarioResidente.email,
              usuario_asociado: usuarioResidente.id
            });
            residenteId = nuevoResidente.id;
          } catch (error) {
            message.error('Error al crear residente asociado: ' + error.message);
            return;
          }
        }

        // Crear o actualizar la relación como propietario
        const relacionData = {
          id_residente: residenteId,
          id_unidad: selectedUnidad.id,
          rol_en_unidad: 'propietario',
          fecha_inicio: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
          estado: true
        };

        console.log('🔍 Datos de relación a enviar:', relacionData);
        console.log('🔍 Residente ID:', residenteId, typeof residenteId);
        console.log('🔍 Unidad ID:', selectedUnidad.id, typeof selectedUnidad.id);
        console.log('🔍 Tipo de datos:', {
          id_residente: typeof relacionData.id_residente,
          id_unidad: typeof relacionData.id_unidad,
          rol_en_unidad: typeof relacionData.rol_en_unidad,
          fecha_inicio: typeof relacionData.fecha_inicio,
          estado: typeof relacionData.estado
        });

        // Validar que los IDs existen
        if (!residenteId || residenteId <= 0) {
          throw new Error('ID de residente inválido');
        }
        if (!selectedUnidad.id || selectedUnidad.id <= 0) {
          throw new Error('ID de unidad inválido');
        }

        // Verificar que el residente existe
        try {
          const residenteCheck = await api.get(`/residentes/${residenteId}/`);
          console.log('✅ Residente existe:', residenteCheck.data);
        } catch (error) {
          console.error('❌ Residente no existe:', error);
          throw new Error(`El residente con ID ${residenteId} no existe`);
        }

        // Verificar que la unidad existe
        try {
          const unidadCheck = await api.get(`/unidades/${selectedUnidad.id}/`);
          console.log('✅ Unidad existe:', unidadCheck.data);
        } catch (error) {
          console.error('❌ Unidad no existe:', error);
          throw new Error(`La unidad con ID ${selectedUnidad.id} no existe`);
        }

        // Verificar si ya existe una relación con la misma combinación única
        const relacionExistente = residentesUnidades.find(ru => 
          ru.id_residente === residenteId && 
          ru.id_unidad === selectedUnidad.id && 
          ru.fecha_inicio === relacionData.fecha_inicio
        );

        // Verificar si ya existe una relación como propietario
        const propietarioExistente = residentesUnidades.find(ru => 
          ru.id_unidad === selectedUnidad.id && 
          ru.rol_en_unidad === 'propietario' && 
          ru.estado
        );

        console.log('🔍 Relación existente (unique constraint):', relacionExistente);
        console.log('🔍 Propietario existente:', propietarioExistente);

        if (relacionExistente) {
          // Si ya existe una relación con la misma combinación única, actualizarla
          console.log('🔄 Actualizando relación existente (unique constraint)...');
          console.log('🔄 URL:', `/residentes-unidad/${relacionExistente.id}/`);
          console.log('🔄 Datos:', relacionData);
          await api.put(`/residentes-unidad/${relacionExistente.id}/`, relacionData);
        } else if (propietarioExistente) {
          // Si existe otro propietario pero no la misma relación, actualizar el existente
          console.log('🔄 Cambiando propietario existente...');
          console.log('🔄 URL:', `/residentes-unidad/${propietarioExistente.id}/`);
          console.log('🔄 Datos:', relacionData);
          await api.put(`/residentes-unidad/${propietarioExistente.id}/`, relacionData);
        } else {
          // Crear nueva relación
          console.log('➕ Creando nueva relación...');
          console.log('➕ URL:', '/residentes-unidad/');
          console.log('➕ Datos:', relacionData);
          await api.post('/residentes-unidad/', relacionData);
        }

        message.success('Propietario asignado exitosamente');
      }
      
      setIsPropietarioModalVisible(false);
      loadData();
    } catch (error) {
      console.error('❌ Error al asignar propietario:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      console.error('❌ Error config:', error.config);
      
      let errorMessage = 'Error al asignar propietario';
      if (error.response?.data) {
        console.error('❌ Error data completo:', JSON.stringify(error.response.data, null, 2));
        if (typeof error.response.data === 'string') {
          errorMessage += ': ' + error.response.data;
        } else if (error.response.data.detail) {
          errorMessage += ': ' + error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage += ': ' + error.response.data.error;
        } else if (error.response.data.non_field_errors) {
          errorMessage += ': ' + error.response.data.non_field_errors.join(', ');
        } else {
          errorMessage += ': ' + JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      message.error(errorMessage);
    }
  };

  const handleRemovePropietario = async () => {
    try {
      const propietarioExistente = residentesUnidades.find(ru => 
        ru.id_unidad === selectedUnidad.id && 
        ru.rol_en_unidad === 'propietario' && 
        ru.estado
      );

      if (propietarioExistente) {
        await api.delete(`/residentes-unidad/${propietarioExistente.id}/`);
        message.success('Propietario removido exitosamente');
        setIsPropietarioModalVisible(false);
        loadData();
      }
    } catch (error) {
      console.error('Error al remover propietario:', error);
      message.error('Error al remover propietario: ' + (error.response?.data?.detail || error.message));
    }
  };


  const formatArea = (metros) => {
    return `${metros} m²`;
  };

  // Filtrar unidades
  const filteredUnidades = unidades.filter(unidad => {
    const matchesSearch = !searchText || 
      unidad.numero_casa.toLowerCase().includes(searchText.toLowerCase());
    return matchesSearch;
  });

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
      title: 'Número de Casa',
      dataIndex: 'numero_casa',
      key: 'numero_casa',
      width: 140,
      fixed: 'left',
      render: (numero_casa) => <strong style={{ fontSize: '13px' }}>{numero_casa}</strong>,
    },
    {
      title: 'Área (m²)',
      key: 'metros_cuadrados',
      width: 110,
      responsive: ['md'],
      align: 'center',
      render: (_, record) => <span style={{ fontSize: '12px' }}>{formatArea(record.metros_cuadrados)}</span>,
    },
    {
      title: 'Propietario',
      key: 'propietario',
      width: 200,
      responsive: ['lg'],
      render: (_, record) => {
        const propietario = record.propietario_info;
        if (propietario) {
          return (
            <div style={{ fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold' }}>
                {propietario.nombre}
              </div>
              <div style={{ color: '#666', fontSize: '11px' }}>
                {propietario.tiene_usuario ? 
                  `👤 ${propietario.username} (${propietario.rol})` : 
                  '👤 Sin usuario'
                }
              </div>
            </div>
          );
        }
        return <span style={{ color: '#999', fontSize: '12px' }}>Sin propietario</span>;
      },
    },
    {
      title: 'Residentes',
      dataIndex: 'cantidad_residentes',
      key: 'cantidad_residentes',
      width: 90,
      responsive: ['sm'],
      align: 'center',
      render: (cantidad) => (
        <Tag color="blue" size="small">
          {cantidad}
        </Tag>
      ),
    },
    {
      title: 'Mascotas',
      dataIndex: 'cantidad_mascotas',
      key: 'cantidad_mascotas',
      width: 90,
      responsive: ['sm'],
      align: 'center',
      render: (cantidad) => (
        <Tag color="green" size="small">
          {cantidad}
        </Tag>
      ),
    },
    {
      title: 'Vehículos',
      dataIndex: 'cantidad_vehiculos',
      key: 'cantidad_vehiculos',
      width: 90,
      responsive: ['sm'],
      align: 'center',
      render: (cantidad) => (
        <Tag color="orange" size="small">
          {cantidad}
        </Tag>
      ),
    },
    {
      title: 'Estado',
      key: 'activa',
      width: 90,
      responsive: ['sm'],
      align: 'center',
      render: (_, record) => (
        <Tag color={record.activa ? 'success' : 'default'} size="small">
          {record.activa ? 'ACTIVA' : 'INACTIVA'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 160,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="Ver detalles">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showDetailsModal(record)}
              size="small"
              style={{ padding: '4px 6px', fontSize: '11px', color: '#1890ff' }}
            >
              Ver
            </Button>
          </Tooltip>
          <Tooltip title="Gestionar propietario">
            <Button
              type="link"
              icon={<UserOutlined />}
              onClick={() => showPropietarioModal(record)}
              size="small"
              style={{ padding: '4px 6px', fontSize: '11px', color: '#52c41a' }}
            >
              Propietario
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
        <div>Cargando unidades...</div>
      </div>
    );
  }

  console.log('🔍 Estado actual:', {
    unidades: unidades.length,
    residentes: residentesUnidades.length,
    mascotas: mascotas.length,
    loading,
    error
  });

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
    <div className="dashboard-unidades">
      <div className="dashboard-header">
        <h1>
          <HomeOutlined /> Gestión de Unidades
        </h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Nueva Unidad
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="unidades-filters" style={{ marginBottom: 20 }}>
        <Space wrap>
          <Input
            placeholder="Buscar por número de casa..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button 
            icon={<FilterOutlined />} 
            onClick={() => setSearchText('')}
          >
            Limpiar Filtros
          </Button>
        </Space>
      </Card>

      {/* Estadísticas */}
      <div className="unidades-stats">
        <Card className="stat-card total">
          <div className="stat-content">
            <div className="stat-icon">🏠</div>
            <div>
              <h3>Total Unidades</h3>
              <p className="stat-value">{Array.isArray(unidades) ? unidades.length : 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="stat-card area">
          <div className="stat-content">
            <div className="stat-icon">📐</div>
            <div>
              <h3>Área Total</h3>
              <p className="stat-value">
                {formatArea(Array.isArray(unidades) ? unidades.reduce((sum, u) => sum + parseFloat(u.metros_cuadrados || 0), 0) : 0)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="stat-card residents">
          <div className="stat-content">
            <div className="stat-icon">👥</div>
            <div>
              <h3>Total Residentes</h3>
              <p className="stat-value">
                {Array.isArray(unidades) ? unidades.reduce((sum, u) => sum + parseInt(u.cantidad_residentes || 0), 0) : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de Unidades */}
      <Card
        title={`Unidades (${filteredUnidades.length})`}
        className="unidades-table"
        size="small"
        extra={
          <Button type="link" size="small" onClick={loadData}>
            Actualizar
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredUnidades}
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
          scroll={{ x: 'max-content' }}
          responsive={true}
        />
      </Card>

      {/* Modal para crear/editar unidad */}
      <Modal
        title={editingUnidad ? 'Editar Unidad' : 'Crear Nueva Unidad'}
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
            name="numero_casa"
            label="Número de Casa"
            rules={[{ required: true, message: 'Por favor ingrese el número de casa' }]}
          >
            <Input placeholder="Ej: A-101, B-205" />
          </Form.Item>

          <Form.Item
            name="metros_cuadrados"
            label="Metros Cuadrados"
            rules={[{ required: true, message: 'Por favor ingrese los metros cuadrados' }]}
          >
            <Input type="number" placeholder="Área en metros cuadrados" min="0" step="0.01" />
          </Form.Item>

          <Form.Item
            name="cantidad_residentes"
            label="Cantidad de Residentes"
            rules={[{ required: true, message: 'Por favor ingrese la cantidad de residentes' }]}
          >
            <Input type="number" placeholder="Número de residentes" min="0" />
          </Form.Item>

          <Form.Item
            name="cantidad_mascotas"
            label="Cantidad de Mascotas"
            rules={[{ required: true, message: 'Por favor ingrese la cantidad de mascotas' }]}
          >
            <Input type="number" placeholder="Número de mascotas" min="0" />
          </Form.Item>

          <Form.Item
            name="cantidad_vehiculos"
            label="Cantidad de Vehículos"
            rules={[{ required: true, message: 'Por favor ingrese la cantidad de vehículos' }]}
          >
            <Input type="number" placeholder="Número de vehículos" min="0" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUnidad ? 'Actualizar' : 'Crear'}
              </Button>
              <Button onClick={handleCancel}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de detalles de la unidad */}
      <Modal
        title={
          <Space>
            <HomeOutlined />
            Detalles de la Unidad {selectedUnidad?.numero_casa}
          </Space>
        }
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedUnidad && (
          <div>
            {/* Información básica */}
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Número de Casa" span={1}>
                <Tag color="blue">{selectedUnidad.numero_casa}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Área" span={1}>
                <Tag color="green">{formatArea(selectedUnidad.metros_cuadrados)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Propietario" span={1}>
                {selectedUnidad.propietario_info ? (
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {selectedUnidad.propietario_info.nombre}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {selectedUnidad.propietario_info.tiene_usuario ? 
                        `👤 ${selectedUnidad.propietario_info.username} (${selectedUnidad.propietario_info.rol})` : 
                        '👤 Sin usuario'
                      }
                    </div>
                  </div>
                ) : (
                  <Tag color="default">Sin propietario</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Estado" span={1}>
                <Tag color={selectedUnidad.activa ? 'success' : 'default'}>
                  {selectedUnidad.activa ? 'ACTIVA' : 'INACTIVA'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Fecha Creación" span={2}>
                {new Date(selectedUnidad.fecha_creacion).toLocaleDateString('es-CO')}
              </Descriptions.Item>
            </Descriptions>

            {/* Collapse con detalles */}
            <Collapse defaultActiveKey={['residentes']}>
              {/* Residentes */}
              <Panel 
                header={
                  <Space>
                    <TeamOutlined />
                    <span>Residentes ({getResidentesForUnidad(selectedUnidad.id).length})</span>
                  </Space>
                } 
                key="residentes"
              >
                {getResidentesForUnidad(selectedUnidad.id).length > 0 ? (
                  <List
                    dataSource={getResidentesForUnidad(selectedUnidad.id)}
                    renderItem={(ru) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={ru.residente_info?.nombre || 'Sin nombre'}
                          description={
                            <Space direction="vertical" size="small">
                              <Tag color="blue">{ru.rol_en_unidad}</Tag>
                              <span style={{ fontSize: '12px', color: '#666' }}>
                                Desde: {new Date(ru.fecha_inicio).toLocaleDateString('es-CO')}
                              </span>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    <UserOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                    <p>No hay residentes registrados</p>
                  </div>
                )}
              </Panel>

              {/* Mascotas */}
              <Panel 
                header={
                  <Space>
                    <HeartOutlined />
                    <span>Mascotas ({getMascotasForUnidad(selectedUnidad.id).length})</span>
                  </Space>
                } 
                key="mascotas"
              >
                {getMascotasForUnidad(selectedUnidad.id).length > 0 ? (
                  <List
                    dataSource={getMascotasForUnidad(selectedUnidad.id)}
                    renderItem={(mascota) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<HeartOutlined />} style={{ backgroundColor: '#52c41a' }} />}
                          title={mascota.nombre}
                          description={
                            <Space direction="vertical" size="small">
                              <Space>
                                <Tag color="green">{mascota.tipo}</Tag>
                                {mascota.raza && <Tag color="blue">{mascota.raza}</Tag>}
                                {mascota.color && <Tag color="orange">{mascota.color}</Tag>}
                              </Space>
                              <span style={{ fontSize: '12px', color: '#666' }}>
                                Dueño: {mascota.residente_nombre || 'No especificado'}
                              </span>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                    <HeartOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                    <p>No hay mascotas registradas</p>
                  </div>
                )}
              </Panel>

              {/* Vehículos - Por implementar */}
              <Panel 
                header={
                  <Space>
                    <CarOutlined />
                    <span>Vehículos (0)</span>
                  </Space>
                } 
                key="vehiculos"
              >
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  <CarOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <p>Funcionalidad de vehículos por implementar</p>
                </div>
              </Panel>
            </Collapse>
          </div>
        )}
      </Modal>

      {/* Modal para gestionar propietario */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            Gestionar Propietario - {selectedUnidad?.numero_casa}
          </Space>
        }
        open={isPropietarioModalVisible}
        onCancel={() => setIsPropietarioModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={propietarioForm}
          layout="vertical"
          onFinish={handlePropietarioSubmit}
        >
          <Form.Item
            name="propietario_id"
            label="Seleccionar Propietario"
            rules={[{ required: true, message: 'Por favor seleccione un propietario' }]}
          >
            <Select
              placeholder="Seleccionar usuario residente como propietario de la unidad"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {usuariosResidentes.map(usuarioResidente => (
                <Option key={usuarioResidente.id} value={usuarioResidente.id}>
                  {usuarioResidente.nombre_completo} ({usuarioResidente.username})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Asignar Propietario
              </Button>
              {selectedUnidad?.propietario_info && (
                <Button 
                  danger 
                  onClick={handleRemovePropietario}
                >
                  Remover Propietario
                </Button>
              )}
              <Button onClick={() => setIsPropietarioModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default ListaUnidades;