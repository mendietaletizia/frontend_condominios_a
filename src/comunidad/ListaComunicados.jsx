import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, DatePicker, Select, message, Tag, Checkbox, Divider, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { comunidadAPI } from '../api/comunidad';
import { NotificationOutlined, SendOutlined, PlusOutlined, UserOutlined, TeamOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const ListaComunicados = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingComunicado, setEditingComunicado] = useState(null);
  
  // Estados para destinatarios
  const [destinatariosSeleccionados, setDestinatariosSeleccionados] = useState({
    residentes: false,
    empleados: false,
    seguridad: false
  });

  const load = async () => {
    try {
      setLoading(true);
      const data = await comunidadAPI.getNotificaciones();
      setItems(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      message.error('Error al cargar comunicados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showModal = () => {
    form.resetFields();
    form.setFieldsValue({ tipo: 'Comunicado', fecha: dayjs() });
    setDestinatariosSeleccionados({
      residentes: false,
      empleados: false,
      seguridad: false
    });
    setEditingComunicado(null);
    setIsModalVisible(true);
  };

  const showEditModal = (comunicado) => {
    console.log('Comunicado para editar:', comunicado);
    console.log('Tipo del comunicado:', comunicado.tipo, 'Tipo de dato:', typeof comunicado.tipo);
    
    form.setFieldsValue({
      titulo: comunicado.titulo,
      contenido: comunicado.contenido,
      tipo: Array.isArray(comunicado.tipo) ? comunicado.tipo[0] : comunicado.tipo,
      fecha: comunicado.fecha ? dayjs(comunicado.fecha) : dayjs()
    });
    
    // Cargar destinatarios existentes
    const destinatarios = comunicado.destinatarios || {};
    setDestinatariosSeleccionados({
      residentes: destinatarios.residentes || false,
      empleados: destinatarios.empleados || false,
      seguridad: destinatarios.seguridad || false
    });
    
    setEditingComunicado(comunicado);
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      // Validar que al menos un destinatario esté seleccionado
      const destinatariosActivos = Object.values(destinatariosSeleccionados).some(Boolean);
      if (!destinatariosActivos) {
        message.error('Debe seleccionar al menos un destinatario');
        return;
      }

      const payload = {
        titulo: values.titulo,
        contenido: values.contenido,
        tipo: Array.isArray(values.tipo) ? values.tipo[0] : values.tipo,
        destinatarios: destinatariosSeleccionados
      };
      
      // Solo agregar fecha si se proporciona y es válida
      if (values.fecha && values.fecha instanceof Date && !isNaN(values.fecha.getTime())) {
        payload.fecha = values.fecha.toISOString();
      }
      
      console.log('Values del formulario:', values);
      console.log('Tipo recibido:', values.tipo, 'Tipo de dato:', typeof values.tipo);
      console.log('Payload a enviar:', payload);
      console.log('Editando comunicado:', editingComunicado?.id);
      
      if (editingComunicado) {
        // Actualizar comunicado existente usando el endpoint estándar
        console.log('Actualizando comunicado ID:', editingComunicado.id);
        await comunidadAPI.updateNotificacion(editingComunicado.id, payload);
        message.success('Comunicado actualizado exitosamente');
      } else {
        // Crear nuevo comunicado usando broadcast
        console.log('Creando nuevo comunicado');
        await comunidadAPI.broadcastComunicado(payload);
        message.success('Comunicado enviado exitosamente');
      }
      
      // Mostrar mensaje con destinatarios
      const destinatariosTexto = Object.entries(destinatariosSeleccionados)
        .filter(([_, selected]) => selected)
        .map(([rol, _]) => rol)
        .join(', ');
      
      message.success(`Comunicado ${editingComunicado ? 'actualizado' : 'enviado'} a: ${destinatariosTexto}`);
      setIsModalVisible(false);
      form.resetFields();
      setEditingComunicado(null);
      load();
    } catch (e) {
      console.error('Error completo:', e);
      console.error('Error response:', e.response?.data);
      console.error('Error status:', e.response?.status);
      message.error(`No se pudo ${editingComunicado ? 'actualizar' : 'enviar'} el comunicado: ${e.message || e.response?.data?.detail || 'Error desconocido'}`);
    }
  };

  // Función para manejar cambios en destinatarios
  const handleDestinatarioChange = (rol, checked) => {
    setDestinatariosSeleccionados(prev => ({
      ...prev,
      [rol]: checked
    }));
  };

  const handleDelete = async (comunicado) => {
    try {
      await comunidadAPI.deleteNotificacion(comunicado.id);
      message.success('Comunicado eliminado exitosamente');
      load();
    } catch (e) {
      message.error('No se pudo eliminar el comunicado');
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingComunicado(null);
    setDestinatariosSeleccionados({
      residentes: false,
      empleados: false,
      seguridad: false
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Título', dataIndex: 'titulo', key: 'titulo', width: 200 },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 120, render: (t) => <Tag color="blue">{t}</Tag> },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', width: 160, render: (f) => dayjs(f).format('DD/MM/YYYY HH:mm') },
    { 
      title: 'Destinatarios', 
      dataIndex: 'destinatarios', 
      key: 'destinatarios', 
      width: 180,
      render: (destinatarios) => {
        if (!destinatarios) return '-';
        return Object.entries(destinatarios)
          .filter(([_, selected]) => selected)
          .map(([rol, _]) => (
            <Tag key={rol} color="green" style={{ margin: '2px' }}>
              {rol === 'residentes' ? '👥 Residentes' : 
               rol === 'empleados' ? '👷 Empleados' : 
               rol === 'seguridad' ? '🛡️ Seguridad' : rol}
            </Tag>
          ));
      }
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar este comunicado?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDelete(record)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
            okType="danger"
          >
            <Button 
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="dashboard-unidades">
      <div className="dashboard-header">
        <h1><NotificationOutlined /> Comunicados</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>Nuevo Comunicado</Button>
      </div>

      <Card className="unidades-table" size="small">
        <Table columns={columns} dataSource={items} rowKey="id" loading={loading} size="small" />
      </Card>

      <Modal 
        title={editingComunicado ? "Editar Comunicado" : "Enviar Comunicado"} 
        open={isModalVisible} 
        onCancel={handleCancelModal} 
        footer={null} 
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Ingrese el título' }]}>
            <Input placeholder="Título del comunicado" />
          </Form.Item>
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true }]}>
            <Select options={[{ value: 'Comunicado', label: 'Comunicado' }, { value: 'Noticia', label: 'Noticia' }]} />
          </Form.Item>
          <Form.Item name="fecha" label="Fecha">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contenido" label="Contenido" rules={[{ required: true, message: 'Ingrese el contenido' }]}>
            <Input.TextArea rows={6} placeholder="Contenido del comunicado" />
          </Form.Item>
          
          <Divider>Destinatarios</Divider>
          <Form.Item label="Enviar a:" required>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Checkbox 
                checked={destinatariosSeleccionados.residentes}
                onChange={(e) => handleDestinatarioChange('residentes', e.target.checked)}
              >
                <UserOutlined /> Residentes
              </Checkbox>
              <Checkbox 
                checked={destinatariosSeleccionados.empleados}
                onChange={(e) => handleDestinatarioChange('empleados', e.target.checked)}
              >
                <TeamOutlined /> Empleados
              </Checkbox>
              <Checkbox 
                checked={destinatariosSeleccionados.seguridad}
                onChange={(e) => handleDestinatarioChange('seguridad', e.target.checked)}
              >
                <TeamOutlined /> Seguridad
              </Checkbox>
            </Space>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                {editingComunicado ? 'Actualizar' : 'Enviar'}
              </Button>
              <Button onClick={handleCancelModal}>Cancelar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListaComunicados;



