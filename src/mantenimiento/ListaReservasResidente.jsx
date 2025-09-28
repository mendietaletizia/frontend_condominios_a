import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, DatePicker, TimePicker, Select, message, Popconfirm } from 'antd';
import { CalendarOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { mantenimientoAPI } from '../api/mantenimiento';
import '../comunidad/ListaUnidades.css';

const ListaReservasResidente = () => {
  const [reservas, setReservas] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingReserva, setViewingReserva] = useState(null);
  const [editingReserva, setEditingReserva] = useState(null);
  const [form] = Form.useForm();

  const load = async () => {
    try {
      setLoading(true);
      const data = await mantenimientoAPI.getReservas();
      setReservas(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      message.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    try {
      const data = await mantenimientoAPI.getAreasComunes();
      const areasActivas = (Array.isArray(data) ? data : (data?.results || []))
        .filter(area => area.estado === true);
      setAreas(areasActivas);
    } catch (e) {
      message.error('Error al cargar áreas comunes');
    }
  };

  useEffect(() => { 
    load(); 
    loadAreas();
  }, []);

  const showModal = (reserva = null) => {
    setEditingReserva(reserva);
    if (reserva) {
      form.setFieldsValue({
        fecha: dayjs(reserva.fecha),
        hora_inicio: dayjs(reserva.hora_inicio, 'HH:mm:ss'),
        hora_fin: dayjs(reserva.hora_fin, 'HH:mm:ss'),
        area: reserva.area?.id,
        motivo: reserva.motivo,
        costo: reserva.costo
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ costo: 0 });
    }
    setIsModalVisible(true);
  };

  const showViewModal = (reserva) => {
    setViewingReserva(reserva);
    setIsViewModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        fecha: values.fecha.format('YYYY-MM-DD'),
        hora_inicio: values.hora_inicio.format('HH:mm:ss'),
        hora_fin: values.hora_fin.format('HH:mm:ss'),
        area: values.area,
        motivo: values.motivo || '',
        costo: values.costo || 0
      };

      if (editingReserva) {
        await mantenimientoAPI.updateReserva(editingReserva.id, payload);
        message.success('Reserva actualizada exitosamente');
      } else {
        await mantenimientoAPI.createReserva(payload);
        message.success('Reserva creada exitosamente');
      }
      
      setIsModalVisible(false);
      setEditingReserva(null);
      form.resetFields();
      load();
    } catch (e) {
      message.error('No se pudo guardar la reserva');
    }
  };

  const handleDelete = async (reserva) => {
    try {
      await mantenimientoAPI.deleteReserva(reserva.id);
      message.success('Reserva eliminada exitosamente');
      load();
    } catch (e) {
      message.error('No se pudo eliminar la reserva');
    }
  };

  const verificarDisponibilidad = async (areaId, fecha, horaInicio, horaFin) => {
    try {
      const result = await mantenimientoAPI.verificarDisponibilidad(
        areaId, 
        fecha.format('YYYY-MM-DD'), 
        horaInicio.format('HH:mm:ss'), 
        horaFin.format('HH:mm:ss')
      );
      return result.disponible;
    } catch (e) {
      return false;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'orange';
      case 'confirmada': return 'green';
      case 'cancelada': return 'red';
      case 'completada': return 'blue';
      default: return 'default';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'cancelada': return 'Cancelada';
      case 'completada': return 'Completada';
      default: return estado;
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { 
      title: 'Área', 
      dataIndex: 'area', 
      key: 'area', 
      width: 150,
      render: (area) => area?.nombre || 'N/A'
    },
    { 
      title: 'Fecha', 
      dataIndex: 'fecha', 
      key: 'fecha', 
      width: 120,
      render: (fecha) => dayjs(fecha).format('DD/MM/YYYY')
    },
    { 
      title: 'Horario', 
      key: 'horario', 
      width: 150,
      render: (_, record) => `${record.hora_inicio} - ${record.hora_fin}`
    },
    { 
      title: 'Estado', 
      dataIndex: 'estado', 
      key: 'estado', 
      width: 120,
      render: (estado) => (
        <Tag color={getEstadoColor(estado)}>
          {getEstadoText(estado)}
        </Tag>
      )
    },
    { 
      title: 'Costo', 
      dataIndex: 'costo', 
      key: 'costo', 
      width: 100,
      render: (costo) => `$${costo || 0}`
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="default" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showViewModal(record)}
          >
            Ver
          </Button>
          {record.estado === 'pendiente' && (
            <Button 
              type="primary" 
              size="small"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            >
              Editar
            </Button>
          )}
          {record.estado === 'pendiente' && (
            <Popconfirm
              title="¿Eliminar esta reserva?"
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
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="dashboard-unidades">
      <div className="dashboard-header">
        <h1><CalendarOutlined /> Mis Reservas</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          Nueva Reserva
        </Button>
      </div>

      <Card className="unidades-table" size="small">
        <Table 
          columns={columns} 
          dataSource={reservas} 
          rowKey="id" 
          loading={loading} 
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal para crear/editar reserva */}
      <Modal 
        title={editingReserva ? 'Editar Reserva' : 'Nueva Reserva'} 
        open={isModalVisible} 
        onCancel={() => { setIsModalVisible(false); setEditingReserva(null); form.resetFields(); }} 
        footer={null} 
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="area" 
            label="Área Común" 
            rules={[{ required: true, message: 'Seleccione un área' }]}
          >
            <Select 
              placeholder="Seleccione un área"
              options={areas.map(area => ({ 
                value: area.id, 
                label: `${area.nombre} - ${area.tipo}` 
              }))}
            />
          </Form.Item>
          
          <Form.Item 
            name="fecha" 
            label="Fecha" 
            rules={[{ required: true, message: 'Seleccione la fecha' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            name="hora_inicio" 
            label="Hora de Inicio" 
            rules={[{ required: true, message: 'Seleccione la hora de inicio' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            name="hora_fin" 
            label="Hora de Fin" 
            rules={[{ required: true, message: 'Seleccione la hora de fin' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item name="motivo" label="Motivo">
            <Input.TextArea rows={3} placeholder="Motivo de la reserva" />
          </Form.Item>
          
          <Form.Item name="costo" label="Costo" initialValue={0}>
            <Input type="number" placeholder="0" min={0} step={0.01} />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingReserva ? 'Actualizar' : 'Crear'}
              </Button>
              <Button onClick={() => { setIsModalVisible(false); setEditingReserva(null); form.resetFields(); }}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para ver detalles de la reserva */}
      <Modal 
        title="Detalles de la Reserva" 
        open={isViewModalVisible} 
        onCancel={() => { setIsViewModalVisible(false); setViewingReserva(null); }} 
        footer={[
          <Button key="close" onClick={() => { setIsViewModalVisible(false); setViewingReserva(null); }}>
            Cerrar
          </Button>
        ]} 
        width={600}
      >
        {viewingReserva && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1890ff' }}>
                Reserva #{viewingReserva.id}
              </h3>
              <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Tag color={getEstadoColor(viewingReserva.estado)}>
                  {getEstadoText(viewingReserva.estado)}
                </Tag>
                <Tag color="blue">
                  {dayjs(viewingReserva.fecha).format('DD/MM/YYYY')}
                </Tag>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Información del Área:</h4>
              <p><strong>Nombre:</strong> {viewingReserva.area?.nombre || 'N/A'}</p>
              <p><strong>Tipo:</strong> {viewingReserva.area?.tipo || 'N/A'}</p>
              <p><strong>Descripción:</strong> {viewingReserva.area?.descripcion || 'Sin descripción'}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Detalles de la Reserva:</h4>
              <p><strong>Fecha:</strong> {dayjs(viewingReserva.fecha).format('DD/MM/YYYY')}</p>
              <p><strong>Horario:</strong> {viewingReserva.hora_inicio} - {viewingReserva.hora_fin}</p>
              <p><strong>Costo:</strong> ${viewingReserva.costo || 0}</p>
              <p><strong>Pagado:</strong> {viewingReserva.pagado ? 'Sí' : 'No'}</p>
              {viewingReserva.motivo && (
                <p><strong>Motivo:</strong> {viewingReserva.motivo}</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListaReservasResidente;
