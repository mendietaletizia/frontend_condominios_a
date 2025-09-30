import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, CheckOutlined, PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import api from '../api/config';

const { Option } = Select;

const TareasMantenimiento = () => {
  const [tareas, setTareas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [tRes, ttRes, eRes] = await Promise.all([
        api.get('/tareas-mantenimiento/'),
        api.get('/tipos-mantenimiento/activos/'),
        api.get('/empleados/')
      ]);
      setTareas(tRes.data.results || tRes.data || []);
      setTipos(ttRes.data.results || ttRes.data || []);
      setEmpleados(eRes.data.results || eRes.data || []);
    } catch (e) {
      console.error(e);
      message.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const crearTarea = async (values) => {
    try {
      const payload = {
        titulo: values.titulo,
        descripcion: values.descripcion || '',
        tipo_tarea: values.tipo_tarea,
        empleado_asignado: values.empleado_asignado,
        prioridad: values.prioridad,
        fecha_limite: values.fecha_limite.format('YYYY-MM-DD')
      };
      await api.post('/tareas-mantenimiento/', payload);
      message.success('Tarea creada');
      setIsModalVisible(false);
      cargarDatos();
    } catch (e) {
      console.error(e);
      message.error('Error al crear tarea');
    }
  };

  const iniciarTarea = async (id) => {
    try {
      await api.put(`/tareas-mantenimiento/${id}/`, { estado: 'en_progreso' });
      message.success('Tarea iniciada');
      cargarDatos();
    } catch (e) {
      console.error(e);
      message.error('No se pudo iniciar');
    }
  };

  const completarTarea = async (id) => {
    try {
      await api.put(`/tareas-mantenimiento/${id}/`, { estado: 'completada' });
      message.success('Tarea completada');
      cargarDatos();
    } catch (e) {
      console.error(e);
      message.error('No se pudo completar');
    }
  };

  const columns = [
    { title: 'Título', dataIndex: 'titulo', key: 'titulo' },
    { title: 'Tipo', dataIndex: ['tipo_tarea', 'nombre'], key: 'tipo' },
    { title: 'Empleado', dataIndex: ['empleado_asignado', 'persona_relacionada', 'nombre'], key: 'empleado', render: (_, r) => r.empleado_asignado?.persona_relacionada?.nombre || '—' },
    { title: 'Prioridad', dataIndex: 'prioridad', key: 'prioridad', render: (p) => <Tag color={p==='alta'?'red':p==='media'?'blue':'default'}>{p?.toUpperCase()}</Tag> },
    { title: 'Estado', dataIndex: 'estado', key: 'estado', render: (e) => <Tag color={e==='completada'?'green':e==='en_progreso'?'blue':'default'}>{e?.toUpperCase()}</Tag> },
    { title: 'Vence', dataIndex: 'fecha_limite', key: 'fecha_limite' },
    { title: 'Acciones', key: 'acciones', render: (_, r) => (
      <Space>
        {r.estado === 'asignada' && (
          <Button size="small" icon={<PlayCircleOutlined />} onClick={() => iniciarTarea(r.id)}>Iniciar</Button>
        )}
        {r.estado === 'en_progreso' && (
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => completarTarea(r.id)}>Completar</Button>
        )}
      </Space>
    )}
  ];

  return (
    <div className="tareas-mantenimiento">
      <div className="page-header">
        <h1>🛠️ Tareas de Mantenimiento</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirModal}>Nueva Tarea</Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={tareas} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="Nueva Tarea" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={crearTarea}>
          <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Ingrese el título' }]}>
            <Input placeholder="Ej: Limpieza de piscina" />
          </Form.Item>
          <Form.Item name="descripcion" label="Descripción">
            <Input.TextArea rows={3} placeholder="Detalles de la tarea" />
          </Form.Item>
          <Form.Item name="tipo_tarea" label="Tipo de Tarea" rules={[{ required: true, message: 'Seleccione el tipo' }]}>
            <Select placeholder="Seleccionar tipo">
              {(Array.isArray(tipos)?tipos:[]).map(t => (
                <Option key={t.id} value={t.id}>{t.nombre}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="empleado_asignado" label="Empleado Asignado" rules={[{ required: true, message: 'Seleccione el empleado' }]}>
            <Select placeholder="Seleccionar empleado">
              {(Array.isArray(empleados)?empleados:[]).map(e => (
                <Option key={e.id} value={e.id}>{e.persona?.nombre || `Empleado ${e.id}`}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="prioridad" label="Prioridad" initialValue="media" rules={[{ required: true }]}>
            <Select>
              <Option value="baja">Baja</Option>
              <Option value="media">Media</Option>
              <Option value="alta">Alta</Option>
            </Select>
          </Form.Item>
          <Form.Item name="fecha_limite" label="Fecha Límite" rules={[{ required: true, message: 'Seleccione fecha límite' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Crear</Button>
              <Button onClick={() => setIsModalVisible(false)}>Cancelar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TareasMantenimiento;


