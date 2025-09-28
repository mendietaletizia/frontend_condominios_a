import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message, Popconfirm, Select } from 'antd';
import { CalendarOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { mantenimientoAPI } from '../api/mantenimiento';
import '../comunidad/ListaUnidades.css';

const ListaReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewingReserva, setViewingReserva] = useState(null);

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

  useEffect(() => { load(); }, []);

  const showViewModal = (reserva) => {
    setViewingReserva(reserva);
    setIsModalVisible(true);
  };

  const handleConfirmar = async (reserva) => {
    try {
      await mantenimientoAPI.confirmarReserva(reserva.id);
      message.success('Reserva confirmada y evento creado');
      load();
    } catch (e) {
      message.error('No se pudo confirmar la reserva');
    }
  };

  const handleCancelar = async (reserva) => {
    try {
      await mantenimientoAPI.cancelarReserva(reserva.id);
      message.success('Reserva cancelada');
      load();
    } catch (e) {
      message.error('No se pudo cancelar la reserva');
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
      title: 'Residente', 
      dataIndex: 'residente', 
      key: 'residente', 
      width: 200,
      render: (residente) => {
        if (residente?.persona) {
          return `${residente.persona.nombre} (${residente.persona.ci})`;
        }
        return 'N/A';
      }
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
      width: 200,
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
            <Popconfirm
              title="¿Confirmar esta reserva?"
              description="Se creará un evento automáticamente en la agenda"
              onConfirm={() => handleConfirmar(record)}
              okText="Sí, confirmar"
              cancelText="Cancelar"
            >
              <Button 
                type="primary" 
                size="small"
                icon={<CheckOutlined />}
              >
                Confirmar
              </Button>
            </Popconfirm>
          )}
          {(record.estado === 'pendiente' || record.estado === 'confirmada') && (
            <Popconfirm
              title="¿Cancelar esta reserva?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => handleCancelar(record)}
              okText="Sí, cancelar"
              cancelText="Cancelar"
              okType="danger"
            >
              <Button 
                danger
                size="small"
                icon={<CloseOutlined />}
              >
                Cancelar
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
        <h1><CalendarOutlined /> Gestión de Reservas</h1>
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

      {/* Modal para ver detalles de la reserva */}
      <Modal 
        title="Detalles de la Reserva" 
        open={isModalVisible} 
        onCancel={() => { setIsModalVisible(false); setViewingReserva(null); }} 
        footer={[
          <Button key="close" onClick={() => { setIsModalVisible(false); setViewingReserva(null); }}>
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
              <h4 style={{ marginBottom: '8px' }}>Información del Residente:</h4>
              <p><strong>Nombre:</strong> {viewingReserva.residente?.persona?.nombre || 'N/A'}</p>
              <p><strong>CI:</strong> {viewingReserva.residente?.persona?.ci || 'N/A'}</p>
              <p><strong>Email:</strong> {viewingReserva.residente?.persona?.email || 'N/A'}</p>
              <p><strong>Teléfono:</strong> {viewingReserva.residente?.persona?.telefono || 'N/A'}</p>
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

export default ListaReservas;
