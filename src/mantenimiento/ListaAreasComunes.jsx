import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message } from 'antd';
import { BuildOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { mantenimientoAPI } from '../api/mantenimiento';

const tiposFijos = [
  { value: 'Piscina', label: 'Piscina' },
  { value: 'Parque', label: 'Parque' },
  { value: 'Salón de eventos', label: 'Salón de eventos' },
  { value: 'Cancha', label: 'Cancha' }
];

const ListaAreasComunes = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    try {
      setLoading(true);
      const data = await mantenimientoAPI.getAreasComunes();
      setAreas(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      message.error('Error al cargar áreas comunes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showModal = (row = null) => {
    setEditing(row);
    if (row) {
      form.setFieldsValue({ nombre: row.nombre, tipo: row.tipo, descripcion: row.descripcion, estado: row.estado });
    } else {
      form.resetFields();
      form.setFieldsValue({ estado: true });
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = { nombre: values.nombre, tipo: values.tipo, descripcion: values.descripcion || '', estado: values.estado };
      if (editing) {
        await mantenimientoAPI.updateAreaComun(editing.id, payload);
        message.success('Área actualizada');
      } else {
        await mantenimientoAPI.createAreaComun(payload);
        message.success('Área creada');
      }
      setIsModalVisible(false);
      setEditing(null);
      form.resetFields();
      load();
    } catch (e) {
      message.error('No se pudo guardar el área');
    }
  };

  const handleDelete = async (row) => {
    try {
      await mantenimientoAPI.deleteAreaComun(row.id);
      message.success('Área eliminada');
      load();
    } catch (e) {
      message.error('No se pudo eliminar');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Nombre', dataIndex: 'nombre', key: 'nombre', width: 200 },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 160 },
    { title: 'Estado', dataIndex: 'estado', key: 'estado', width: 100, render: (s) => <Tag color={s ? 'green' : 'default'}>{s ? 'ACTIVA' : 'INACTIVA'}</Tag> },
    { title: 'Acciones', key: 'acciones', width: 160, align: 'center', render: (_, r) => (
      <Space size="small" wrap>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showModal(r)}>Editar</Button>
        <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(r)}>Eliminar</Button>
      </Space>
    ) }
  ];

  return (
    <div className="dashboard-unidades">
      <div className="dashboard-header">
        <h1><BuildOutlined /> Gestión de Áreas Comunes</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Nueva Área</Button>
      </div>

      <Card className="unidades-table" size="small">
        <Table columns={columns} dataSource={areas} rowKey="id" loading={loading} size="small" />
      </Card>

      <Modal title={editing ? 'Editar Área' : 'Crear Área'} open={isModalVisible} onCancel={() => { setIsModalVisible(false); setEditing(null); form.resetFields(); }} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="nombre" label="Nombre" rules={[{ required: true, message: 'Ingrese el nombre' }]}>
            <Input placeholder="Nombre del área" />
          </Form.Item>
          <Form.Item name="tipo" label="Tipo" rules={[{ required: true, message: 'Seleccione el tipo' }]}>
            <Select options={tiposFijos} placeholder="Seleccione un tipo" />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción">
            <Input.TextArea rows={3} placeholder="Descripción del área" />
          </Form.Item>
          <Form.Item name="estado" label="Estado" initialValue={true}>
            <Select options={[{ value: true, label: 'Activa' }, { value: false, label: 'Inactiva' }]} />
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

export default ListaAreasComunes;


