import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, DatePicker, TimePicker, message, Tooltip, Select } from 'antd';
import { CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { comunidadAPI } from '../api/comunidad';
import { mantenimientoAPI } from '../api/mantenimiento';
import './ListaUnidades.css';

const ListaEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [areas, setAreas] = useState([]);

  // Extrae solo el nombre del residente desde una descripción larga
  const extractNombreFromDescripcion = (text) => {
    try {
      if (!text) return null;
      const dRaw = String(text).replace(/\s+/g, ' ').trim();
      // Tomar la última ocurrencia de ' por '
      const idx = dRaw.toLowerCase().lastIndexOf(' por ');
      if (idx === -1) return null;
      let tail = dRaw.substring(idx + 5).trim();
      // Cortar en (CI:, ' Residente', o primer punto
      const cutPoints = [
        tail.search(/\(CI:/i),
        tail.search(/\sResidente\b/i),
        tail.indexOf('.')
      ].filter(n => n >= 0);
      if (cutPoints.length) {
        const cut = Math.min(...cutPoints);
        tail = tail.substring(0, cut).trim();
      }
      return tail || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    load();
    loadReservas();
    // Cargar áreas desde mantenimiento (siguen ahí)
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

  const loadReservas = async () => {
    try {
      const data = await comunidadAPI.getReservas();
      setReservas(Array.isArray(data) ? data : (data?.results || []));
    } catch (e) {
      console.error('Error al cargar reservas:', e);
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
      if (row.tipo === 'reserva') {
        // Usar la API de comunidad para eliminar reservas
        await comunidadAPI.deleteReserva(row.id);
        message.success('Reserva eliminada');
        loadReservas();
      } else {
        // Si es un evento, intentar encontrar una Reserva asociada en la descripción
        try {
          const desc = row.descripcion || '';
          const match = desc.match(/Reserva ID:\s*(\d+)/i);
          if (match && match[1]) {
            await comunidadAPI.deleteReserva(Number(match[1]));
          }
        } catch (_) {}
        await comunidadAPI.deleteEvento(row.id);
        message.success('Evento eliminado');
        load();
        loadReservas();
      }
    } catch (e) {
      message.error('No se pudo eliminar');
    }
  };

  const handleConfirmarReserva = async (reserva) => {
    try {
      await comunidadAPI.confirmarReserva(reserva.id);
      message.success('Reserva confirmada y evento creado');
      load();
      loadReservas();
    } catch (e) {
      message.error('No se pudo confirmar la reserva');
    }
  };

  const handleCancelarReserva = async (reserva) => {
    try {
      await comunidadAPI.cancelarReserva(reserva.id);
      message.success('Reserva cancelada');
      loadReservas();
    } catch (e) {
      message.error('No se pudo cancelar la reserva');
    }
  };

  // Combinar eventos y reservas para mostrar en una sola tabla
  // Solo mostrar reservas pendientes y canceladas, no las confirmadas (ya aparecen como eventos)
  const reservasFiltradas = reservas.filter(res => res.estado === 'pendiente' || res.estado === 'cancelada');
  
  const combinedData = [
    // Agregar un campo residente_nombre_simple ya parseado para eventos
    ...eventos.map(ev => ({ ...ev, tipo: 'evento', residente_nombre_simple: extractNombreFromDescripcion(ev.descripcion) })),
    ...reservasFiltradas.map(res => ({ 
      ...res, 
      tipo: 'reserva',
      titulo: `Reserva: ${res.nombre_area || res.area_nombre || 'Área'}`,
      descripcion: `Reserva del área ${res.nombre_area || res.area_nombre || 'N/A'} el ${res.fecha} de ${res.hora_inicio} a ${res.hora_fin} por ${res.nombre_completo_residente || res.residente_nombre || 'Residente'}`,
      fecha: `${res.fecha}T${res.hora_inicio}`,
      estado: res.estado === 'pendiente' ? false : true
    }))
  ];

  // Debug: verificar duplicados
  console.log('Eventos:', eventos.length);
  console.log('Reservas:', reservas.length);
  console.log('Combined:', combinedData.length);

  const filtered = combinedData.filter(item => !searchText ||
    item.titulo?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.descripcion?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60, responsive: ['lg'] },
    { title: 'Título', dataIndex: 'titulo', key: 'titulo', width: 200, render: (t) => <strong style={{fontSize: '12px'}}>{t}</strong> },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      width: 300,
      responsive: ['md'],
      render: (text, record) => {
        if (!text) return '-';
        if (record.tipo === 'evento') {
          try {
            const areaMatch = text.match(/área\s(.+?)\sde/i);
            const horasMatch = text.match(/de\s([0-9:]+)\s+a\s+([0-9:]+)/i);
            const area = areaMatch ? areaMatch[1] : '';
            const h1 = horasMatch ? horasMatch[1] : '';
            const h2 = horasMatch ? horasMatch[2] : '';
            if (area || h1) {
              return `Reserva del área ${area || ''} de ${h1 || ''} a ${h2 || ''}`.trim();
            }
          } catch (_) {}
        }
        return text;
      }
    },
    { 
      title: 'Tipo', 
      key: 'tipo', 
      width: 120,
      render: (_, record) => {
        if (record.tipo === 'reserva') {
          const estadoColor = record.estado === 'pendiente' ? 'orange' : 
                             record.estado === 'confirmada' ? 'green' : 
                             record.estado === 'cancelada' ? 'red' : 'blue';
          return (
            <Tag color={estadoColor}>
              Reserva ({record.estado})
            </Tag>
          );
        }
        return (
          <Tag color="blue">
            Evento
          </Tag>
        );
      }
    },
    { 
      title: 'Residente', 
      key: 'residente', 
      width: 150,
      render: (_, record) => {
        if (record.tipo === 'reserva') {
          const nombreResidente = record.nombre_completo_residente || record.residente_nombre || record.residente?.persona?.nombre;
          return nombreResidente ? <Tag color="orange">{nombreResidente}</Tag> : '-';
        }
        if (record.tipo === 'evento') {
          const name = record.residente_nombre_simple || extractNombreFromDescripcion(record.descripcion);
          return name ? <Tag color="orange">{name}</Tag> : '-';
        }
        return '-';
      }
    },
    { title: 'Fecha', dataIndex: 'fecha', key: 'fecha', width: 160, render: (f) => dayjs(f).format('DD/MM/YYYY HH:mm') },
    { 
      title: 'Áreas', 
      key: 'areas', 
      width: 150, 
      render: (_, r) => {
        if (r.tipo === 'reserva') {
          const nombreArea = r.nombre_area || r.area_nombre;
          if (nombreArea) {
            return <Tag color="blue">{nombreArea}</Tag>;
          }
          return '-';
        }
        if (r.tipo === 'evento' && r.areas_info && r.areas_info.length > 0) {
          return r.areas_info.map(area => (
            <Tag key={area.id} color="blue" style={{ margin: '2px' }}>
              {area.nombre}
            </Tag>
          ));
        }
        return '-';
      }
    },
    { title: 'Estado', dataIndex: 'estado', key: 'estado', width: 90, align: 'center', render: (s) => <Tag color={s ? 'green' : 'default'}>{s ? 'ACTIVO' : 'INACTIVO'}</Tag> },
    { 
      title: 'Acciones', 
      key: 'acciones', 
      width: 200, 
      align: 'center', 
      render: (_, r) => {
        if (r.tipo === 'reserva') {
          return (
            <Space size="small" wrap>
              {r.estado === 'pendiente' && (
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={() => handleConfirmarReserva(r)} 
                  style={{padding:'4px 6px', fontSize:'11px'}}
                >
                  Confirmar
                </Button>
              )}
              {(r.estado === 'pendiente' || r.estado === 'confirmada') && (
                <Button 
                  danger 
                  size="small" 
                  onClick={() => handleCancelarReserva(r)} 
                  style={{padding:'4px 6px', fontSize:'11px'}}
                >
                  Cancelar
                </Button>
              )}
              {/* Agregar acciones de editar/eliminar para reservas también */}
              <Button 
                type="link" 
                size="small" 
                icon={<EditOutlined />} 
                onClick={() => showModal(r)} 
                style={{padding:'4px 6px', fontSize:'11px'}}
              >
                Editar
              </Button>
              <Button 
                type="link" 
                danger 
                size="small" 
                icon={<DeleteOutlined />} 
                onClick={() => handleDelete(r)} 
                style={{padding:'4px 6px', fontSize:'11px'}}
              >
                Eliminar
              </Button>
            </Space>
          );
        }
        return (
          <Space size="small" wrap>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => showModal(r)} style={{padding:'4px 6px', fontSize:'11px'}}>Editar</Button>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(r)} style={{padding:'4px 6px', fontSize:'11px'}}>Eliminar</Button>
          </Space>
        );
      }
    }
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
        <h1><CalendarOutlined /> Gestión de Eventos y Reservas</h1>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Nuevo Evento</Button>
        </Space>
      </div>

      <Card className="unidades-filters" style={{ marginBottom: 20 }}>
        <Space wrap>
          <Input placeholder="Buscar por título o descripción..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} />
        </Space>
      </Card>

      <Card title={`Eventos y Reservas (${filtered.length})`} className="unidades-table" size="small">
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


