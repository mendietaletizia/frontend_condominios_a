import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, DatePicker, Select, message, Tag } from 'antd';
import dayjs from 'dayjs';
import { comunidadAPI } from '../api/comunidad';
import { NotificationOutlined, SendOutlined, PlusOutlined } from '@ant-design/icons';

const ListaComunicados = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        titulo: values.titulo,
        contenido: values.contenido,
        tipo: values.tipo,
        fecha: values.fecha ? values.fecha.toISOString() : new Date().toISOString()
      };
      await comunidadAPI.broadcastComunicado(payload);
      message.success('Comunicado enviado');
      setIsModalVisible(false);
      form.resetFields();
      load();
    } catch (e) {
      message.error('No se pudo enviar');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Título', dataIndex: 'titulo', key: 'titulo', width: 220 },
    { title: 'Tipo', dataIndex: 'tipo', key: 'tipo', width: 140, render: (t) => <Tag color="blue">{t}</Tag> },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', width: 180, render: (f) => dayjs(f).format('DD/MM/YYYY HH:mm') },
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

      <Modal title="Enviar Comunicado" open={isModalVisible} onCancel={() => { setIsModalVisible(false); form.resetFields(); }} footer={null} width={700}>
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
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>Enviar</Button>
              <Button onClick={() => { setIsModalVisible(false); form.resetFields(); }}>Cancelar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListaComunicados;



