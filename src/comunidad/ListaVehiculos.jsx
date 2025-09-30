import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip } from 'antd';
import { CarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../api/config';
import './ListaUnidades.css';

const { Option } = Select;

const ListaVehiculos = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [residentes, setResidentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterUnidad, setFilterUnidad] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehRes, resRes, uniRes] = await Promise.all([
        api.get('/placas-vehiculo/'),
        api.get('/residentes/'),
        api.get('/unidades/')
      ]);
      const veh = Array.isArray(vehRes.data) ? vehRes.data : (vehRes.data.results || []);
      const resList = Array.isArray(resRes.data) ? resRes.data : (resRes.data.results || []);
      const uniList = Array.isArray(uniRes.data) ? uniRes.data : (uniRes.data.results || []);
      setVehiculos(veh);
      setResidentes(resList);
      setUnidades(uniList);
      setError('');
    } catch (e) {
      console.error(e);
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (record = null) => {
    setEditing(record);
    if (record) {
      form.setFieldsValue({
        placa: record.placa,
        marca: record.marca,
        modelo: record.modelo,
        color: record.color,
        residente: record.residente,
        activo: record.activo,
        unidad: String(record?.unidad_info?.id || filterUnidad || '')
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ unidad: String(filterUnidad || '') });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setEditing(null);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        placa: (values.placa || '').toUpperCase().trim(),
        marca: (values.marca || '').trim(),
        modelo: (values.modelo || '').trim(),
        color: (values.color || '').trim(),
        residente: values.residente,
        activo: true
      };
      if (editing) {
        await api.put(`/placas-vehiculo/${editing.id}/`, payload);
        message.success('Vehículo actualizado');
      } else {
        await api.post('/placas-vehiculo/', payload);
        message.success('Vehículo creado');
      }
      handleCancel();
      // Mostrar la unidad seleccionada tras crear/actualizar
      if (values.unidad) setFilterUnidad(String(values.unidad));
      loadData();
    } catch (e) {
      console.error(e);
      message.error('Error al guardar vehículo');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/placas-vehiculo/${id}/`);
      message.success('Vehículo eliminado');
      loadData();
    } catch (e) {
      console.error(e);
      message.error('Error al eliminar vehículo');
    }
  };

  const getResidenteNombre = (id) => {
    const r = residentes.find(x => x.id === id);
    return r ? (r.persona_info?.nombre || 'Sin nombre') : 'Desconocido';
  };

  const getUnidadNumero = (record) => {
    const u = record.unidad_info;
    return u ? u.numero_casa : '—';
  };

  const filtered = (Array.isArray(vehiculos) ? vehiculos : []).filter(v => {
    const matchesSearch = !searchText || v.placa.toLowerCase().includes(searchText.toLowerCase()) || getResidenteNombre(v.residente).toLowerCase().includes(searchText.toLowerCase());
    const matchesUnidad = !filterUnidad || (v.unidad_info && String(v.unidad_info.id) === String(filterUnidad));
    return matchesSearch && matchesUnidad;
  });

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Placa', dataIndex: 'placa', key: 'placa', width: 120, render: (p) => <Tag color="geekblue">{p}</Tag> },
    { title: 'Marca', dataIndex: 'marca', key: 'marca', width: 120 },
    { title: 'Modelo', dataIndex: 'modelo', key: 'modelo', width: 120 },
    { title: 'Color', dataIndex: 'color', key: 'color', width: 100 },
    { title: 'Residente', dataIndex: 'residente', key: 'residente', width: 200, render: (id) => getResidenteNombre(id) },
    { title: 'Unidad', key: 'unidad', width: 140, render: (_, r) => getUnidadNumero(r) },
    { title: 'Estado', dataIndex: 'activo', key: 'activo', width: 100, render: (a) => <Tag color={a ? 'success' : 'default'}>{a ? 'ACTIVO' : 'INACTIVO'}</Tag> },
    {
      title: 'Acciones', key: 'acciones', width: 140, fixed: 'right', render: (_, record) => (
        <Space>
          <Tooltip title="Editar">
            <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)} />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="dashboard-usuarios">
      <div className="dashboard-header">
        <h1><CarOutlined /> Gestión de Vehículos</h1>
        <Space>
          <Input placeholder="Buscar por placa o residente" prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 260 }} />
          <Select placeholder="Filtrar por unidad" allowClear style={{ width: 200 }} value={filterUnidad} onChange={setFilterUnidad}>
            {(Array.isArray(unidades) ? unidades : []).map(u => (
              <Option key={u.id} value={String(u.id)}>{u.numero_casa}</Option>
            ))}
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Nuevo Vehículo</Button>
        </Space>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <Card className="usuarios-table" style={{ marginTop: 16 }}>
        <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (t, r) => `${r[0]}-${r[1]} de ${t}` }} scroll={{ x: 'max-content' }} />
      </Card>

      <Modal title={editing ? 'Editar Vehículo' : 'Nuevo Vehículo'} open={isModalVisible} onCancel={handleCancel} footer={null} width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="unidad" label="Unidad" rules={[{ required: true, message: 'Seleccione unidad' }]}>
            <Select placeholder="Seleccionar unidad" allowClear showSearch optionFilterProp="children">
              {(Array.isArray(unidades) ? unidades : []).map(u => (
                <Option key={u.id} value={String(u.id)}>{u.numero_casa}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="placa" label="Placa" rules={[{ required: true, message: 'Ingrese placa' }]}>
            <Input placeholder="ABC-123" />
          </Form.Item>
          <Form.Item name="marca" label="Marca" rules={[{ required: true, message: 'Ingrese marca' }]}>
            <Input placeholder="Toyota" />
          </Form.Item>
          <Form.Item name="modelo" label="Modelo" rules={[{ required: true, message: 'Ingrese modelo' }]}>
            <Input placeholder="Corolla" />
          </Form.Item>
          <Form.Item name="color" label="Color" rules={[{ required: true, message: 'Ingrese color' }]}>
            <Input placeholder="Blanco" />
          </Form.Item>
          <Form.Item name="residente" label="Residente" rules={[{ required: true, message: 'Seleccione residente' }]}>
            <Select placeholder="Seleccionar residente" showSearch optionFilterProp="children">
              {(() => {
                const unidadSel = form.getFieldValue('unidad');
                const lista = (Array.isArray(residentes) ? residentes : []).filter(r => {
                  if (!unidadSel) return true;
                  const uinfo = r.unidades_info || [];
                  return Array.isArray(uinfo) && uinfo.some(u => String(u.id) === String(unidadSel));
                });
                return lista.map(r => (
                  <Option key={r.id} value={r.id}>{r.persona_info?.nombre || `Residente ${r.id}`}</Option>
                ));
              })()}
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{editing ? 'Actualizar' : 'Crear'}</Button>
              <Button onClick={handleCancel}>Cancelar</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ListaVehiculos;
