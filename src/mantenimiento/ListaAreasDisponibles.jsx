import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, message } from 'antd';
import { BuildOutlined, EyeOutlined, CalendarOutlined } from '@ant-design/icons';
import { mantenimientoAPI } from '../api/mantenimiento';
import '../comunidad/ListaUnidades.css';

const ListaAreasDisponibles = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewingArea, setViewingArea] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await mantenimientoAPI.getAreasComunes();
      // Solo mostrar áreas activas
      const areasActivas = (Array.isArray(data) ? data : (data?.results || []))
        .filter(area => area.estado === true);
      setAreas(areasActivas);
    } catch (e) {
      message.error('Error al cargar áreas comunes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showViewModal = (area) => {
    setViewingArea(area);
    setIsModalVisible(true);
  };

  const getTipoColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'piscina': return 'blue';
      case 'parque': return 'green';
      case 'salón de eventos': return 'purple';
      case 'cancha': return 'orange';
      default: return 'default';
    }
  };

  const columns = [
    { 
      title: 'ID', 
      dataIndex: 'id', 
      key: 'id', 
      width: 60 
    },
    { 
      title: 'Nombre', 
      dataIndex: 'nombre', 
      key: 'nombre', 
      width: 200,
      render: (nombre) => <strong>{nombre}</strong>
    },
    { 
      title: 'Tipo', 
      dataIndex: 'tipo', 
      key: 'tipo', 
      width: 160,
      render: (tipo) => (
        <Tag color={getTipoColor(tipo)}>
          {tipo}
        </Tag>
      )
    },
    { 
      title: 'Descripción', 
      dataIndex: 'descripcion', 
      key: 'descripcion', 
      width: 300,
      render: (descripcion) => descripcion || 'Sin descripción'
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 120,
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
          <Button 
            type="primary" 
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => {
              // Redirigir a la página de reservas
              window.location.href = '/mis-reservas';
            }}
          >
            Reservar
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="dashboard-unidades">
      <div className="dashboard-header">
        <h1><BuildOutlined /> Áreas Comunes Disponibles</h1>
        <p>Selecciona un área para hacer una reserva</p>
      </div>

      <Card className="unidades-table" size="small">
        <Table 
          columns={columns} 
          dataSource={areas} 
          rowKey="id" 
          loading={loading} 
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal para ver detalles del área */}
      <Modal 
        title="Detalles del Área" 
        open={isModalVisible} 
        onCancel={() => { setIsModalVisible(false); setViewingArea(null); }} 
        footer={[
          <Button key="close" onClick={() => { setIsModalVisible(false); setViewingArea(null); }}>
            Cerrar
          </Button>,
          <Button 
            key="reservar" 
            type="primary" 
            onClick={() => {
              setIsModalVisible(false);
              setViewingArea(null);
              window.location.href = '/mis-reservas';
            }}
          >
            Hacer Reserva
          </Button>
        ]} 
        width={600}
      >
        {viewingArea && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1890ff' }}>
                {viewingArea.nombre}
              </h3>
              <div style={{ marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Tag color={getTipoColor(viewingArea.tipo)}>
                  {viewingArea.tipo}
                </Tag>
                <Tag color="green">
                  Disponible
                </Tag>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Descripción:</h4>
              <p>{viewingArea.descripcion || 'Sin descripción disponible'}</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Estado:</h4>
              <p>✅ Área activa y disponible para reservas</p>
            </div>

            <div style={{ 
              padding: '12px', 
              backgroundColor: '#f0f8ff', 
              borderRadius: '6px',
              border: '1px solid #d6e4ff'
            }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#1890ff' }}>
                💡 <strong>Tip:</strong> Para hacer una reserva, haz clic en "Hacer Reserva" y selecciona la fecha y horario deseado.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListaAreasDisponibles;
