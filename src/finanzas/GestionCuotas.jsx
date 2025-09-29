import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip, Badge, Statistic, Row, Col, DatePicker, InputNumber, Divider, Radio } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  MoneyCollectOutlined, CalendarOutlined, UserOutlined, HomeOutlined,
  CalculatorOutlined, AlertOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  CreditCardOutlined, EyeOutlined
} from '@ant-design/icons';
import { finanzasAPI } from '../api/finanzas';
import api from '../api/config';
import dayjs from 'dayjs';
import './GestionCuotas.css';

const { Option } = Select;
const { TextArea } = Input;

const GestionCuotas = () => {
  const { canAccess } = useAuth();
  
  const [cuotasMensuales, setCuotasMensuales] = useState([]);
  const [cuotasUnidad, setCuotasUnidad] = useState([]);
  const [expensasMensuales, setExpensasMensuales] = useState([]);
  const [expensasUnidad, setExpensasUnidad] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCuotaModalVisible, setIsCuotaModalVisible] = useState(false);
  const [isExpensaModalVisible, setIsExpensaModalVisible] = useState(false);
  const [isPagoModalVisible, setIsPagoModalVisible] = useState(false);
  
  const [editingCuota, setEditingCuota] = useState(null);
  const [selectedCuotaUnidad, setSelectedCuotaUnidad] = useState(null);
  const [selectedUnidades, setSelectedUnidades] = useState([]);
  const [enviarATodos, setEnviarATodos] = useState(true);
  
  const [form] = Form.useForm();
  const [pagoForm] = Form.useForm();

  const [filtroMes, setFiltroMes] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroUnidad, setFiltroUnidad] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      try {
        const cuotasMensualesData = await finanzasAPI.getCuotasMensuales();
        setCuotasMensuales(cuotasMensualesData.results || cuotasMensualesData || []);
      } catch (error) {
        console.error('Error cargando cuotas mensuales:', error);
        setCuotasMensuales([]);
      }

      try {
        const cuotasUnidadData = await finanzasAPI.getCuotasUnidad();
        setCuotasUnidad(cuotasUnidadData.results || cuotasUnidadData || []);
      } catch (error) {
        console.error('Error cargando cuotas por unidad:', error);
        setCuotasUnidad([]);
      }

      // Las expensas se manejan como cuotas en este sistema
      // Usar cuotas mensuales para expensas mensuales
      try {
        const expensasMensualesData = await finanzasAPI.getCuotasMensuales();
        setExpensasMensuales(expensasMensualesData.results || expensasMensualesData || []);
      } catch (error) {
        console.error('Error cargando expensas mensuales:', error);
        setExpensasMensuales([]);
      }

      // Usar cuotas por unidad para expensas por unidad
      try {
        const expensasUnidadData = await finanzasAPI.getCuotasUnidad();
        setExpensasUnidad(expensasUnidadData.results || expensasUnidadData || []);
      } catch (error) {
        console.error('Error cargando expensas por unidad:', error);
        setExpensasUnidad([]);
      }

      try {
        const unidadesRes = await api.get('/unidades/');
        setUnidades(unidadesRes.data.results || unidadesRes.data || []);
      } catch (error) {
        console.error('Error cargando unidades:', error);
        setUnidades([]);
      }

      try {
        const residentesRes = await api.get('/residentes/');
        setResidentes(residentesRes.data.results || residentesRes.data || []);
      } catch (error) {
        console.error('Error cargando residentes:', error);
        setResidentes([]);
      }

    } catch (error) {
      console.error('Error general al cargar datos:', error);
      setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const estadisticas = useMemo(() => {
    const totalCuotasMensuales = cuotasMensuales.length;
    const totalCuotasUnidad = cuotasUnidad.length;
    const totalExpensasMensuales = expensasMensuales.length;
    const totalExpensasUnidad = expensasUnidad.length;
    
    const allPagos = [...cuotasUnidad, ...expensasUnidad];
    const totalPendientes = allPagos.filter(c => c.estado === 'pendiente').length;
    const totalPagadas = allPagos.filter(c => c.estado === 'pagada').length;
    const totalVencidas = allPagos.filter(c => c.estado === 'vencida').length;
    const totalParciales = allPagos.filter(c => c.estado === 'parcial').length;
    
    return {
      totalCuotasMensuales,
      totalCuotasUnidad,
      totalExpensasMensuales,
      totalExpensasUnidad,
      totalPendientes,
      totalPagadas,
      totalVencidas,
      totalParciales,
      montoTotal: allPagos.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0),
      montoCobrado: allPagos.reduce((sum, c) => sum + parseFloat(c.monto_pagado || 0), 0),
      montoPendiente: allPagos.reduce((sum, c) => sum + (parseFloat(c.monto || 0) - parseFloat(c.monto_pagado || 0)), 0)
    };
  }, [cuotasMensuales, cuotasUnidad, expensasMensuales, expensasUnidad]);

  // Contador de cuotas por mes optimizado
  const cuotasPorMes = useMemo(() => {
    const count = {};
    cuotasUnidad.forEach(cuota => {
      const mes = cuota.cuota_mensual;
      count[mes] = (count[mes] || 0) + 1;
    });
    return count;
  }, [cuotasUnidad]);

  const mesesDisponibles = useMemo(() => {
    return Array.from(new Set(cuotasUnidad.map(p => p.mes_año).filter(mes => mes)));
  }, [cuotasUnidad]);

  // Handlers - Declarados antes de su uso en useMemo
  const handleRegistrarPago = useCallback((cuotaUnidad) => {
    setSelectedCuotaUnidad(cuotaUnidad);
    pagoForm.resetFields();
    setIsPagoModalVisible(true);
  }, [pagoForm]);

  const handleEditarCuota = useCallback((cuotaUnidad) => {
    console.log('Editando cuota:', cuotaUnidad);
    
    setEditingCuota(cuotaUnidad);
    
    let fechaFormateada = null;
    if (cuotaUnidad.fecha_limite) {
      try {
        fechaFormateada = dayjs(cuotaUnidad.fecha_limite);
        if (!fechaFormateada.isValid()) {
          fechaFormateada = null;
        }
      } catch (error) {
        console.warn('Error al formatear fecha:', error);
        fechaFormateada = null;
      }
    }
    
    const formData = {
      monto: cuotaUnidad.monto,
      fecha_limite: fechaFormateada,
      observaciones: cuotaUnidad.observaciones || ''
    };
    
    console.log('Datos del formulario:', formData);
    
    form.setFieldsValue(formData);
    setIsCuotaModalVisible(true);
  }, [form]);


  const handleEliminarCuota = useCallback((cuotaUnidad) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar esta cuota?',
      content: (
        <div>
          <p><strong>Unidad:</strong> {cuotaUnidad.unidad_numero}</p>
          <p><strong>Mes/Año:</strong> {cuotaUnidad.cuota_mensual}</p>
          <p><strong>Monto:</strong> Bs. {parseFloat(cuotaUnidad.monto).toLocaleString()}</p>
          <p><strong>Estado:</strong> {cuotaUnidad.estado}</p>
          <br />
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ Esta acción no se puede deshacer.
          </p>
        </div>
      ),
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/cuotas-unidad/${cuotaUnidad.id}/eliminar_cuota/`);
          message.success('Cuota eliminada exitosamente');
          loadData();
        } catch (error) {
          message.error('Error al eliminar cuota: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  }, [loadData]);

  const handleVerCuotas = useCallback((mesAño) => {
    setFiltroMes(mesAño);
  }, []);

  const handleEliminarExpensaMensual = useCallback((expensaMensual) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar esta expensa mensual?',
      content: (
        <div>
          <p><strong>Mes/Año:</strong> {expensaMensual.mes_año}</p>
          <p><strong>Monto Total:</strong> Bs. {parseFloat(expensaMensual.monto_total).toLocaleString()}</p>
          <p><strong>Estado:</strong> {expensaMensual.estado}</p>
          <br />
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ Esta acción eliminará TODAS las expensas individuales asociadas.
          </p>
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ Esta acción no se puede deshacer.
          </p>
        </div>
      ),
      okText: 'Sí, eliminar todo',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/cuotas-mensuales/${expensaMensual.id}/eliminar_cuota_mensual/`);
          message.success('Expensa mensual eliminada exitosamente');
          loadData();
        } catch (error) {
          message.error('Error al eliminar expensa mensual: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  }, [loadData]);

  const handleEditarExpensa = useCallback((expensa) => {
    console.log('Editando expensa:', expensa);
  }, []);

  const handleEliminarExpensa = useCallback((expensa) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar esta expensa?',
      content: (
        <div>
          <p><strong>Unidad:</strong> {expensa.unidad_numero}</p>
          <p><strong>Mes/Año:</strong> {expensa.cuota_mensual}</p>
          <p><strong>Monto:</strong> Bs. {parseFloat(expensa.monto).toLocaleString()}</p>
          <p><strong>Estado:</strong> {expensa.estado}</p>
          <br />
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ Esta acción no se puede deshacer.
          </p>
        </div>
      ),
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/cuotas-unidad/${expensa.id}/eliminar_cuota/`);
          message.success('Expensa eliminada exitosamente');
          loadData();
        } catch (error) {
          message.error('Error al eliminar expensa: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  }, [loadData]);



  const handleEliminarCuotaMensual = useCallback((cuotaMensual) => {
    const cuotasCount = cuotasPorMes[cuotaMensual.mes_año] || 0;
    
    Modal.confirm({
      title: '¿Está seguro de eliminar esta cuota mensual?',
      content: (
        <div>
          <p><strong>Mes/Año:</strong> {cuotaMensual.mes_año}</p>
          <p><strong>Monto Total:</strong> Bs. {parseFloat(cuotaMensual.monto_total).toLocaleString()}</p>
          <p><strong>Estado:</strong> {cuotaMensual.estado}</p>
          <p><strong>Cuotas Individuales:</strong> {cuotasCount} cuotas</p>
          <br />
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ Esta acción eliminará TODAS las cuotas individuales asociadas.
          </p>
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ Esta acción no se puede deshacer.
          </p>
        </div>
      ),
      okText: 'Sí, eliminar todo',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await api.delete(`/cuotas-mensuales/${cuotaMensual.id}/eliminar_cuota_mensual/`);
          message.success(`Cuota mensual y ${cuotasCount} cuotas individuales eliminadas exitosamente`);
          loadData();
        } catch (error) {
          message.error('Error al eliminar cuota mensual: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  }, [cuotasPorMes, loadData]);

  // Columnas optimizadas de la tabla de cuotas
  const cuotasColumns = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      responsive: ['lg'],
    },
    {
      title: 'Mes/Año',
      dataIndex: 'cuota_mensual',
      key: 'mes_año',
      width: 100,
      render: (cuotaMensual) => (
        <Space>
          <CalendarOutlined />
          <span>{cuotaMensual}</span>
        </Space>
      ),
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad_numero',
      key: 'unidad',
      width: 100,
      render: (unidad) => (
        <Space>
          <HomeOutlined />
          <span>{unidad}</span>
        </Space>
      ),
    },
    {
      title: 'Residente',
      dataIndex: 'residente_nombre',
      key: 'residente',
      width: 150,
      render: (nombre) => (
        <Space>
          <UserOutlined />
          <span>{nombre}</span>
        </Space>
      ),
    },
    {
      title: 'Monto Total',
      dataIndex: 'monto',
      key: 'monto',
      width: 120,
      render: (monto) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          Bs. {parseFloat(monto || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      render: (estado) => {
        const colors = {
          'pagada': 'green',
          'pendiente': 'blue',
          'vencida': 'red',
          'parcial': 'orange'
        };
        const icons = {
          'pagada': <CheckCircleOutlined />,
          'pendiente': <AlertOutlined />,
          'vencida': <ExclamationCircleOutlined />,
          'parcial': <AlertOutlined />
        };
        return (
          <Tag color={colors[estado]} icon={icons[estado]}>
            {estado.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Vencimiento',
      dataIndex: 'fecha_limite',
      key: 'fecha_limite',
      width: 120,
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Registrar Pago Manual">
            <Button
              type="primary"
              size="small"
              icon={<MoneyCollectOutlined />}
              onClick={() => handleRegistrarPago(record)}
              disabled={record.estado === 'pagada'}
            >
              Registrar Pago
            </Button>
          </Tooltip>
          <Tooltip title="Editar Cuota">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditarCuota(record)}
            >
              Editar
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar Cuota">
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleEliminarCuota(record)}
              disabled={record.estado === 'pagada' || record.estado === 'procesando' || record.monto_pagado > 0}
              danger
            >
              Eliminar
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ], [handleRegistrarPago, handleEditarCuota, handleEliminarCuota]);



  // Columnas de cuotas mensuales optimizadas (mantener para compatibilidad)
  const cuotasMensualesColumns = useMemo(() => [
    {
      title: 'Mes/Año',
      dataIndex: 'mes_año',
      key: 'mes_año',
      width: 120,
      render: (mes) => (
        <Space>
          <CalendarOutlined />
          <span style={{ fontWeight: 'bold' }}>{mes}</span>
        </Space>
      ),
    },
    {
      title: 'Monto Total',
      dataIndex: 'monto_total',
      key: 'monto_total',
      width: 150,
      render: (monto) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          Bs. {parseFloat(monto || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      render: (estado) => {
        const colors = {
          'borrador': 'default',
          'activa': 'blue',
          'cerrada': 'green'
        };
        return (
          <Tag color={colors[estado]}>
            {estado.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Fecha Límite',
      dataIndex: 'fecha_limite',
      key: 'fecha_limite',
      width: 120,
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Cuotas Generadas',
      key: 'cuotas_count',
      width: 150,
      render: (_, record) => {
        const cuotasCount = cuotasPorMes[record.mes_año] || 0;
        return (
          <Tag color="blue">
            {cuotasCount} cuotas
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver Cuotas Individuales">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleVerCuotas(record.mes_año)}
            >
              Ver Cuotas
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar Cuota Mensual">
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleEliminarCuotaMensual(record)}
              disabled={record.estado === 'cerrada'}
              danger
            >
              Eliminar
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ], [cuotasPorMes, handleVerCuotas, handleEliminarCuotaMensual]);

  const expensasMensualesColumns = useMemo(() => [
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      width: 150,
      render: (descripcion) => (
        <Space>
          <HomeOutlined />
          <span style={{ fontWeight: 'bold' }}>{descripcion || 'Cuota Mensual'}</span>
        </Space>
      ),
    },
    {
      title: 'Mes/Año',
      dataIndex: 'mes_año',
      key: 'mes_año',
      width: 120,
      render: (mes) => (
        <Space>
          <CalendarOutlined />
          <span style={{ fontWeight: 'bold' }}>{mes}</span>
        </Space>
      ),
    },
    {
      title: 'Monto Total',
      dataIndex: 'monto_total',
      key: 'monto_total',
      width: 150,
      render: (monto) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          Bs. {parseFloat(monto || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      render: (estado) => {
        const colors = {
          'borrador': 'default',
          'activa': 'blue',
          'cerrada': 'green'
        };
        return (
          <Tag color={colors[estado]}>
            {estado.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Fecha Límite',
      dataIndex: 'fecha_limite',
      key: 'fecha_limite',
      width: 120,
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Expensas Generadas',
      key: 'expensas_count',
      width: 150,
      render: (_, record) => {
        const expensasCount = expensasUnidad.filter(e => e.cuota_mensual === record.mes_año).length;
        return (
          <Tag color="blue">
            {expensasCount} expensas
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver Expensas Individuales">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setFiltroMes(record.mes_año)}
            >
              Ver Expensas
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar Expensa Mensual">
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleEliminarExpensaMensual(record)}
              disabled={record.estado === 'cerrada'}
              danger
            >
              Eliminar
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ], [expensasUnidad]);

  const expensasUnidadColumns = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      responsive: ['lg'],
    },
    {
      title: 'Mes/Año',
      dataIndex: 'cuota_mensual',
      key: 'mes_año',
      width: 100,
      render: (mes) => (
        <Space>
          <CalendarOutlined />
          <span>{mes}</span>
        </Space>
      ),
    },
    {
      title: 'Unidad',
      dataIndex: 'unidad_numero',
      key: 'unidad',
      width: 100,
      render: (unidad) => (
        <Space>
          <HomeOutlined />
          <span>{unidad}</span>
        </Space>
      ),
    },
    {
      title: 'Residente',
      dataIndex: 'residente_nombre',
      key: 'residente',
      width: 150,
      render: (nombre) => (
        <Space>
          <UserOutlined />
          <span>{nombre}</span>
        </Space>
      ),
    },
    {
      title: 'm²',
      dataIndex: 'metros_cuadrados',
      key: 'metros_cuadrados',
      width: 80,
      render: (m2) => `${m2}m²`,
    },
    {
      title: 'Monto Total',
      dataIndex: 'monto',
      key: 'monto',
      width: 120,
      render: (monto) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          Bs. {parseFloat(monto || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      width: 120,
      render: (estado) => {
        const colors = {
          'pagada': 'green',
          'pendiente': 'blue',
          'vencida': 'red',
          'parcial': 'orange'
        };
        const icons = {
          'pagada': <CheckCircleOutlined />,
          'pendiente': <AlertOutlined />,
          'vencida': <ExclamationCircleOutlined />,
          'parcial': <AlertOutlined />
        };
        return (
          <Tag color={colors[estado]} icon={icons[estado]}>
            {estado.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Vencimiento',
      dataIndex: 'fecha_limite',
      key: 'fecha_limite',
      width: 120,
      render: (fecha) => new Date(fecha).toLocaleDateString(),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Registrar Pago Manual">
            <Button
              type="primary"
              size="small"
              icon={<MoneyCollectOutlined />}
              onClick={() => handleRegistrarPago(record)}
              disabled={record.estado === 'pagada'}
            >
              Registrar Pago
            </Button>
          </Tooltip>
          <Tooltip title="Editar Expensa">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditarExpensa(record)}
            >
              Editar
            </Button>
          </Tooltip>
          <Tooltip title="Eliminar Expensa">
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleEliminarExpensa(record)}
              disabled={record.estado === 'pagada' || record.estado === 'procesando' || record.monto_pagado > 0}
              danger
            >
              Eliminar
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ], [handleRegistrarPago]);

  // Handlers optimizados
  const handleCrearCuota = useCallback(() => {
    setEditingCuota(null);
    setSelectedUnidades([]);
    setEnviarATodos(true);
    form.resetFields();
    setIsCuotaModalVisible(true);
  }, [form]);

  const handleCerrarModal = useCallback(() => {
    setEditingCuota(null);
    setSelectedUnidades([]);
    setEnviarATodos(true);
    form.resetFields();
    setIsCuotaModalVisible(false);
  }, [form]);

  const handleLimpiarFiltros = useCallback(() => {
    setFiltroMes('');
    setFiltroEstado('');
    setFiltroUnidad('');
  }, []);

  const handleQuitarFiltroMes = useCallback(() => {
    setFiltroMes('');
  }, []);

  const handleSubmitCuota = async (values) => {
    try {
      if (editingCuota) {
        const cuotaData = {
          monto: values.monto,
          fecha_limite: values.fecha_limite ? dayjs(values.fecha_limite).format('YYYY-MM-DD') : null,
          observaciones: values.observaciones
        };
        await finanzasAPI.updateCuotaUnidad(editingCuota.id, cuotaData);
        message.success('Cuota actualizada exitosamente');
      } else {
        const cuotaData = {
          ...values,
          fecha_limite: values.fecha_limite ? dayjs(values.fecha_limite).format('YYYY-MM-DD') : null,
          enviar_notificacion: true,
          enviar_a_todos: enviarATodos,
          unidades_seleccionadas: enviarATodos ? [] : selectedUnidades
        };
        
        const response = await finanzasAPI.createCuotaMensual(cuotaData);
        message.success('Cuota creada exitosamente y notificación enviada a los residentes');
        
        if (response && response.cuotas_generadas) {
          message.info(`Se generaron ${response.cuotas_generadas} cuotas individuales`);
        }
      }
      handleCerrarModal();
      loadData();
    } catch (error) {
      message.error('Error al guardar cuota: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleSubmitExpensa = async (values) => {
    try {
      const expensaData = {
        ...values,
        fecha_limite: values.fecha_limite ? dayjs(values.fecha_limite).format('YYYY-MM-DD') : null,
        enviar_notificacion: true,
        enviar_a_todos: enviarATodos,
        unidades_seleccionadas: enviarATodos ? [] : selectedUnidades
      };
      
      const response = await finanzasAPI.createCuotaMensual(expensaData);
      message.success('Expensa creada exitosamente y notificación enviada a los residentes');
      
      if (response && response.cuotas_generadas) {
        message.info(`Se generaron ${response.cuotas_generadas} expensas individuales`);
      }
      
      setIsExpensaModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Error al guardar expensa: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleSubmitPago = async (values) => {
    try {
      await finanzasAPI.registrarPago(selectedCuotaUnidad.id, values);
      message.success('Pago registrado exitosamente');
      setIsPagoModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Error al registrar pago: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleGenerarCuotas = async (cuotaId) => {
    try {
      await finanzasAPI.generarCuotasUnidades(cuotaId);
      message.success('Cuotas generadas exitosamente para todas las unidades');
      loadData();
    } catch (error) {
      message.error('Error al generar cuotas: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (!canAccess('administrador')) {
    return (
      <div className="access-denied">
        <h2>Acceso Denegado</h2>
        <p>No tiene permisos para acceder a esta sección.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Cargando datos de cuotas...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-finanzas">
      <div className="dashboard-header">
        <h1>💰 CU22 - Gestión de Cuotas y Expensas</h1>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsCuotaModalVisible(true)}
          >
            Nueva Cuota
          </Button>
          <Button 
            type="default" 
            icon={<PlusOutlined />}
            onClick={() => setIsExpensaModalVisible(true)}
          >
            Nueva Expensa
          </Button>
        </Space>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <Row gutter={16} className="stats-row">
        <Col span={3}>
          <Card>
            <Statistic
              title="Cuotas"
              value={estadisticas.totalCuotasMensuales}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Expensas"
              value={estadisticas.totalExpensasMensuales}
              prefix={<CalculatorOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Pagadas"
              value={estadisticas.totalPagadas}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Pendientes"
              value={estadisticas.totalPendientes}
              valueStyle={{ color: '#1890ff' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Parciales"
              value={estadisticas.totalParciales}
              valueStyle={{ color: '#faad14' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Vencidas"
              value={estadisticas.totalVencidas}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="metrics-row">
        <Col span={8}>
          <Card>
            <Statistic
              title="Monto Total"
              value={estadisticas.montoTotal}
              precision={2}
              formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Monto Cobrado"
              value={estadisticas.montoCobrado}
              precision={2}
              formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Monto Pendiente"
              value={estadisticas.montoPendiente}
              precision={2}
              formatter={(value) => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(value)}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card 
        style={{ marginBottom: 24 }}
        title={
          <Space>
            <span>🔍 Filtros de Cuotas</span>
            {(filtroMes || filtroEstado || filtroUnidad) && (
              <Tag color="blue">
                Filtros activos: {[filtroMes, filtroEstado, filtroUnidad].filter(Boolean).length}
              </Tag>
            )}
          </Space>
        }
      >
        <Space wrap>
          <Select
            placeholder="Filtrar por mes"
            value={filtroMes}
            onChange={setFiltroMes}
            style={{ width: 150 }}
            allowClear
          >
            {mesesDisponibles.map(mes => (
              <Option key={mes} value={mes}>{mes}</Option>
            ))}
          </Select>
          <Select
            placeholder="Filtrar por estado"
            value={filtroEstado}
            onChange={setFiltroEstado}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="pagada">Pagada</Option>
            <Option value="pendiente">Pendiente</Option>
            <Option value="vencida">Vencida</Option>
            <Option value="parcial">Parcial</Option>
          </Select>
          <Select
            placeholder="Filtrar por unidad"
            value={filtroUnidad}
            onChange={setFiltroUnidad}
            style={{ width: 150 }}
            allowClear
          >
            {unidades.map(unidad => (
              <Option key={unidad.id} value={unidad.id}>{unidad.numero_casa}</Option>
            ))}
          </Select>
          <Button 
            onClick={handleLimpiarFiltros}
            disabled={!filtroMes && !filtroEstado && !filtroUnidad}
          >
            Limpiar Filtros
          </Button>
        </Space>
        
        {filtroMes && (
          <div style={{ marginTop: 12, padding: 8, background: '#e6f7ff', borderRadius: 6 }}>
            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
              📅 Mostrando pagos del mes: {filtroMes}
            </span>
            <Button 
              type="link" 
              size="small" 
              onClick={handleQuitarFiltroMes}
              style={{ marginLeft: 8 }}
            >
              ✕ Quitar filtro
            </Button>
          </div>
        )}
      </Card>

      <Card 
        title="💰 Cuotas Mensuales" 
        style={{ marginBottom: 24 }}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsCuotaModalVisible(true)}
          >
            Nueva Cuota
          </Button>
        }
      >
        <Table
          dataSource={cuotasMensuales}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} cuotas mensuales`,
          }}
          columns={cuotasMensualesColumns}
        />
      </Card>

      <Card 
        title="🏠 Expensas Mensuales (Cuotas)" 
        style={{ marginBottom: 24 }}
        extra={
          <Button 
            type="default" 
            icon={<PlusOutlined />}
            onClick={() => setIsExpensaModalVisible(true)}
          >
            Nueva Expensa
          </Button>
        }
      >
        <Table
          dataSource={expensasMensuales}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} expensas mensuales`,
          }}
          columns={expensasMensualesColumns}
        />
      </Card>

      <Card 
        title="🏠 Cuotas por Unidad" 
        style={{ marginBottom: 24 }}
      >
        <Table
          dataSource={cuotasUnidad}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} cuotas por unidad`,
          }}
          columns={cuotasColumns}
          scroll={{ x: 'max-content' }}
          responsive={true}
        />
      </Card>

      <Card 
        title="🏠 Expensas por Unidad (Cuotas Individuales)" 
        style={{ marginBottom: 24 }}
      >
        <Table
          dataSource={expensasUnidad}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} expensas por unidad`,
          }}
          columns={expensasUnidadColumns}
          scroll={{ x: 'max-content' }}
          responsive={true}
        />
      </Card>


      <Modal
        title={editingCuota ? 'Editar Cuota por Unidad' : '💰 Nueva Cuota'}
        open={isCuotaModalVisible}
        onCancel={handleCerrarModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitCuota}
        >
          {editingCuota ? (
            <>
              <Form.Item
                name="monto"
                label="Monto de la Cuota"
                rules={[{ required: true, message: 'Por favor ingrese el monto' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `Bs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/Bs\.\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item
                name="fecha_limite"
                label="Fecha Límite"
                rules={[{ required: true, message: 'Por favor seleccione la fecha límite' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="observaciones"
                label="Observaciones"
              >
                <TextArea rows={3} placeholder="Observaciones de la cuota" />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="mes_año"
                label="Mes/Año"
                rules={[{ required: true, message: 'Por favor ingrese el mes/año' }]}
              >
                <Input placeholder="2025-10" />
              </Form.Item>
              <Form.Item
                name="monto_total"
                label="Monto Total"
                rules={[{ required: true, message: 'Por favor ingrese el monto total' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `Bs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/Bs\.\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item
                name="fecha_limite"
                label="Fecha Límite de Pago"
                rules={[{ required: true, message: 'Por favor seleccione la fecha límite' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="descripcion"
                label="Descripción de la Cuota"
              >
                <TextArea rows={3} placeholder="Ej: Cuota mensual de mantenimiento, gastos comunes, etc." />
              </Form.Item>
              
              <Divider>Distribución de Cuotas</Divider>
              <Form.Item label="Enviar notificación a">
                <Radio.Group 
                  value={enviarATodos} 
                  onChange={(e) => setEnviarATodos(e.target.value)}
                >
                  <Radio value={true}>Todos los residentes</Radio>
                  <Radio value={false}>Residentes específicos</Radio>
                </Radio.Group>
              </Form.Item>
              
              {!enviarATodos && (
                <Form.Item label="Seleccionar Unidades">
                  <Select
                    mode="multiple"
                    placeholder="Seleccione las unidades"
                    value={selectedUnidades}
                    onChange={setSelectedUnidades}
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                  {unidades.map(unidad => {
                    const propietario = unidad.propietario_info;
                    const propietarioInfo = propietario ? 
                      ` - ${propietario.nombre}` : 
                      ' - Sin propietario';
                    
                    return (
                      <Option key={unidad.id} value={unidad.id}>
                        {unidad.numero_casa} ({unidad.metros_cuadrados}m²){propietarioInfo}
                      </Option>
                    );
                  })}
                  </Select>
                </Form.Item>
              )}
              
            </>
          )}
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCuota ? 'Actualizar' : 'Crear'}
              </Button>
              <Button onClick={handleCerrarModal}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="🏠 Nueva Expensa (Cuota Mensual)"
        open={isExpensaModalVisible}
        onCancel={() => setIsExpensaModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmitExpensa}
        >
          <Form.Item
            name="descripcion"
            label="Descripción de la Expensa"
            rules={[{ required: true, message: 'Por favor ingrese la descripción' }]}
          >
            <Input placeholder="Ej: Agua, Luz, Gas, Mantenimiento, etc." />
          </Form.Item>
          <Form.Item
            name="mes_año"
            label="Mes/Año"
            rules={[{ required: true, message: 'Por favor ingrese el mes/año' }]}
          >
            <Input placeholder="2025-01" />
          </Form.Item>
          <Form.Item
            name="monto_total"
            label="Monto Total"
            rules={[{ required: true, message: 'Por favor ingrese el monto total' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `Bs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/Bs\.\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item
            name="fecha_limite"
            label="Fecha Límite de Pago"
            rules={[{ required: true, message: 'Por favor seleccione la fecha límite' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="descripcion"
            label="Descripción"
          >
            <TextArea rows={3} placeholder="Descripción de la expensa" />
          </Form.Item>
          
          <Form.Item label="Enviar notificación a">
            <Radio.Group 
              value={enviarATodos} 
              onChange={(e) => setEnviarATodos(e.target.value)}
            >
              <Radio value={true}>Todos los residentes</Radio>
              <Radio value={false}>Residentes específicos</Radio>
            </Radio.Group>
          </Form.Item>
          
          {!enviarATodos && (
            <Form.Item label="Seleccionar Unidades">
              <Select
                mode="multiple"
                placeholder="Seleccione las unidades"
                value={selectedUnidades}
                onChange={setSelectedUnidades}
                style={{ width: '100%' }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
              {unidades.map(unidad => {
                const propietario = unidad.propietario_info;
                const propietarioInfo = propietario ? 
                  ` - ${propietario.nombre}` : 
                  ' - Sin propietario';
                
                return (
                  <Option key={unidad.id} value={unidad.id}>
                    {unidad.numero_casa} ({unidad.metros_cuadrados}m²){propietarioInfo}
                  </Option>
                );
              })}
              </Select>
            </Form.Item>
          )}
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Crear Expensa
              </Button>
              <Button onClick={() => setIsExpensaModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Pago */}
      <Modal
        title="Registrar Pago"
        open={isPagoModalVisible}
        onCancel={() => setIsPagoModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedCuotaUnidad && (
          <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <h4>Información de la Cuota</h4>
            <p><strong>Unidad:</strong> {selectedCuotaUnidad.unidad_numero}</p>
            <p><strong>Mes/Año:</strong> {selectedCuotaUnidad.cuota_mensual}</p>
            <p><strong>Monto Total:</strong> Bs. {parseFloat(selectedCuotaUnidad.monto).toLocaleString()}</p>
            <p><strong>Pagado:</strong> Bs. {parseFloat(selectedCuotaUnidad.monto_pagado).toLocaleString()}</p>
            <p><strong>Pendiente:</strong> Bs. {parseFloat(selectedCuotaUnidad.saldo_pendiente).toLocaleString()}</p>
          </div>
        )}
        <Form
          form={pagoForm}
          layout="vertical"
          onFinish={handleSubmitPago}
        >
          <Form.Item
            name="monto"
            label="Monto del Pago"
            rules={[{ required: true, message: 'Por favor ingrese el monto' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `Bs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/Bs\.\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item
            name="metodo_pago"
            label="Método de Pago"
            rules={[{ required: true, message: 'Por favor seleccione el método' }]}
          >
            <Select placeholder="Seleccionar método">
              <Option value="efectivo">Efectivo</Option>
              <Option value="transferencia">Transferencia</Option>
              <Option value="cheque">Cheque</Option>
              <Option value="tarjeta">Tarjeta</Option>
              <Option value="online">Pago Online</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="numero_referencia"
            label="Número de Referencia"
          >
            <Input placeholder="Número de referencia del pago" />
          </Form.Item>
          <Form.Item
            name="observaciones"
            label="Observaciones"
          >
            <TextArea rows={3} placeholder="Observaciones del pago" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Registrar Pago
              </Button>
              <Button onClick={() => setIsPagoModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionCuotas;