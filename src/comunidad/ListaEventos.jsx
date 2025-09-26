import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, DatePicker, TimePicker, message, Tooltip, Select } from 'antd';
import { CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { comunidadAPI } from '../api/comunidad';
import { mantenimientoAPI } from '../api/mantenimiento';
import './ListaUnidades.css';

const ListaEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    load();
    mantenimientoAPI.getAreasComunes().then((data) => {
      const list = Array.isArray(data) ? data : (data?.results || []);
      setAreas(list);
    }).catch(() => {});
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await comunidadAPI.getEventos();
      setEventos(data);
      setError('');
    } catch (e) {
      setError('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (row = null) => {
    setEditing(row);
    if (row) {
      form.setFieldsValue({
        titulo: row.titulo,
        descripcion: row.descripcion,
        fecha: dayjs(row.fecha),
        areas: (row.areas || row.areas_info?.map(a => a.id)) || []
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        titulo: values.titulo,
        descripcion: values.descripcion || '',
        fecha: values.fecha ? values.fecha.toISOString() : new Date().toISOString(),
        estado: true,
        areas: values.areas || []
      };
      if (editing) {
        await comunidadAPI.updateEvento(editing.id, payload);
        message.success('Evento actualizado');
      } else {
        await comunidadAPI.createEvento(payload);
        message.success('Evento creado');
      }
      setIsModalVisible(false);
      setEditing(null);
      form.resetFields();
      load();
    } catch (e) {
      message.error('No se pudo guardar el evento');
    }
  };

  const handleDelete = async (row) => {
    try {
      await comunidadAPI.deleteEvento(row.id);
      message.success('Evento eliminado');
      load();
    } catch (e) {
      message.error('No se pudo eliminar');
    }
  };

  const filtered = eventos.filter(ev => !searchText ||
    ev.titulo?.toLowerCase().includes(searchText.toLowerCase()) ||
    ev.descripcion?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60, responsive: ['lg'] },
    { title: 'Título', dataIndex: 'titulo', key: 'titulo', width: 200, render: (t) => <strong style={{fontSize: '12px'}}>{t}</strong> },
    { title: 'Descripción', dataIndex: 'descripcion', key: 'descripcion', width: 300, responsive: ['md'] },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', width: 160, render: (f) => dayjs(f).format('DD/MM/YYYY HH:mm') },
    { title: 'Áreas', key: 'areas', width: 220, render: (_, r) => (r.areas_info || []).map(a => a.nombre).join(', ') || '-' },
    { title: 'Estado', dataIndex: 'estado', key: 'estado', width: 90, align: 'center', render: (s) => <Tag color={s ? 'green' : 'default'}>{s ? 'ACTIVO' : 'INACTIVO'}</Tag> },
    { title: 'Acciones', key: 'acciones', width: 160, align: 'center', render: (_, r) => (
      <Space size="small" wrap>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showModal(r)} style={{padding:'4px 6px', fontSize:'11px'}}>Editar</Button>
        <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(r)} style={{padding:'4px 6px', fontSize:'11px'}}>Eliminar</Button>
      </Space>
    ) }
  ];

  if (loading) {
    return <div className="dashboard-loading">Cargando eventos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-unidades">
      <div className="dashboard-header">
        <h1><CalendarOutlined /> Gestión de Eventos</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Nuevo Evento</Button>
      </div>

      <Card className="unidades-filters" style={{ marginBottom: 20 }}>
        <Space wrap>
          <Input placeholder="Buscar por título o descripción..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} />
        </Space>
      </Card>

      <Card title={`Eventos (${filtered.length})`} className="unidades-table" size="small">
        <Table columns={columns} dataSource={filtered} rowKey="id" size="small" pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, size: 'small' }} responsive />
      </Card>

      <Modal title={editing ? 'Editar Evento' : 'Crear Evento'} open={isModalVisible} onCancel={() => { setIsModalVisible(false); setEditing(null); form.resetFields(); }} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Ingrese el título' }]}>
            <Input placeholder="Título del evento" />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción">
            <Input.TextArea placeholder="Descripción del evento" rows={3} />
          </Form.Item>
          <Form.Item name="areas" label="Áreas comunes">
            <Select mode="multiple" allowClear placeholder="Seleccione áreas (opcional)" options={areas.map(a => ({ value: a.id, label: `${a.nombre} - ${a.tipo}` }))} />
          </Form.Item>
          <Form.Item name="fecha" label="Fecha y hora" rules={[{ required: true, message: 'Seleccione fecha y hora' }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{editing ? 'Actualizar' : 'Crear'}</Button>
              <Button onClick={() => { setIsModalVisible(false); setEditing(null); form.resetFields(); }}>Cancelar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListaEventos;


