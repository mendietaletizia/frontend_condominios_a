import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip, Statistic, Row, Col, DatePicker, InputNumber, Divider, Radio } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  DollarOutlined, CalendarOutlined, UserOutlined, HomeOutlined,
  CalculatorOutlined, AlertOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  CreditCardOutlined, EyeOutlined
} from '@ant-design/icons';
import { finanzasAPI } from '../api/finanzas';
import api from '../api/config';
import dayjs from 'dayjs';
import './GestionCuotasFixed.css';

const { Option } = Select;
const { TextArea } = Input;

const GestionCuotasFixed = () => {
  const { canAccess } = useAuth();
  
  const [cuotasMensuales, setCuotasMensuales] = useState([]);
  const [expensasMensuales, setExpensasMensuales] = useState([]);
  const [cuotasUnidad, setCuotasUnidad] = useState([]);
  const [expensasUnidad, setExpensasUnidad] = useState([]);
  const [unidades, setUnidades] = useState([]);
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
  const [expensaForm] = Form.useForm();
  const [pagoForm] = Form.useForm();

  const [filtroMes, setFiltroMes] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroUnidad, setFiltroUnidad] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadData = async () => {
    // Evitar múltiples llamadas simultáneas
    if (isLoadingData) {
      return;
    }
    
    try {
      setIsLoadingData(true);
      setLoading(true);
      setError('');
      
      // Hacer solo 3 llamadas API en paralelo para evitar rate limiting
      const [cuotasMensualesData, cuotasUnidadData, unidadesRes] = await Promise.all([
        finanzasAPI.getCuotasMensuales(),
        finanzasAPI.getCuotasUnidad(),
        api.get('/unidades/')
      ]);

      // Usar los mismos datos para cuotas y expensas (diferentes propósitos)
      const cuotasMensuales = cuotasMensualesData.results || cuotasMensualesData || [];
      const cuotasUnidad = cuotasUnidadData.results || cuotasUnidadData || [];
      const unidades = unidadesRes.data.results || unidadesRes.data || [];

      setCuotasMensuales(cuotasMensuales);
      setExpensasMensuales(cuotasMensuales); // Mismos datos, diferente propósito
      setCuotasUnidad(cuotasUnidad);
      setExpensasUnidad(cuotasUnidad); // Mismos datos, diferente propósito
      setUnidades(unidades);

    } catch (error) {
      console.error('Error cargando datos:', error);
      
      // Manejo específico para errores 429 (rate limiting)
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.detail?.match(/(\d+)/)?.[1];
        const waitTime = retryAfter ? Math.min(parseInt(retryAfter), 300) : 60; // Máximo 5 minutos
        setError(`Demasiadas solicitudes. El servidor está temporalmente sobrecargado. Intenta nuevamente en ${waitTime} segundos.`);
        
        // Auto-retry después del tiempo de espera
        setTimeout(() => {
          setIsLoadingData(false);
          loadData();
        }, waitTime * 1000);
      } else {
        setError('Error al cargar datos: ' + (error.response?.data?.detail || error.message));
      }
    } finally {
      setLoading(false);
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Estadísticas simplificadas
  const estadisticas = {
    totalCuotasMensuales: cuotasMensuales.length,
    totalExpensasMensuales: expensasMensuales.length,
    totalCuotasUnidad: cuotasUnidad.length,
    totalExpensasUnidad: expensasUnidad.length,
    totalPendientes: [...cuotasUnidad, ...expensasUnidad].filter(c => c.estado === 'pendiente').length,
    totalPagadas: [...cuotasUnidad, ...expensasUnidad].filter(c => c.estado === 'pagada').length,
    totalVencidas: [...cuotasUnidad, ...expensasUnidad].filter(c => c.estado === 'vencida').length,
    totalParciales: [...cuotasUnidad, ...expensasUnidad].filter(c => c.estado === 'parcial').length,
    montoTotal: [...cuotasUnidad, ...expensasUnidad].reduce((sum, c) => sum + parseFloat(c.monto || 0), 0),
    montoCobrado: [...cuotasUnidad, ...expensasUnidad].reduce((sum, c) => sum + parseFloat(c.monto_pagado || 0), 0),
    montoPendiente: [...cuotasUnidad, ...expensasUnidad].reduce((sum, c) => sum + (parseFloat(c.monto || 0) - parseFloat(c.monto_pagado || 0)), 0)
  };

  // Contador de cuotas por mes
  const cuotasPorMes = {};
  cuotasUnidad.forEach(cuota => {
    const mes = cuota.cuota_mensual;
    cuotasPorMes[mes] = (cuotasPorMes[mes] || 0) + 1;
  });

  const mesesDisponibles = Array.from(new Set(cuotasUnidad.map(p => p.mes_año).filter(mes => mes)));

  const handleRegistrarPago = (cuotaUnidad) => {
    setSelectedCuotaUnidad(cuotaUnidad);
    pagoForm.resetFields();
    setIsPagoModalVisible(true);
  };

  const handleEditarCuota = (cuotaUnidad) => {
    setEditingCuota(cuotaUnidad);
    
    let fechaFormateada = null;
    if (cuotaUnidad.fecha_limite) {
      try {
        fechaFormateada = dayjs(cuotaUnidad.fecha_limite);
        if (!fechaFormateada.isValid()) {
          fechaFormateada = null;
        }
      } catch (error) {
        fechaFormateada = null;
      }
    }
    
    const formData = {
      monto: cuotaUnidad.monto,
      fecha_limite: fechaFormateada,
      observaciones: cuotaUnidad.observaciones || ''
    };
    
    form.setFieldsValue(formData);
    setIsCuotaModalVisible(true);
  };

  const handleEliminarCuota = (cuotaUnidad) => {
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
          await api.delete(`/finanzas/cuotas-unidad/${cuotaUnidad.id}/eliminar_cuota/`);
          message.success('Cuota eliminada exitosamente');
          loadData();
        } catch (error) {
          message.error('Error al eliminar cuota: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  };

  const handleEliminarCuotaMensual = (cuotaMensual) => {
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
          await finanzasAPI.deleteCuotaMensual(cuotaMensual.id);
          message.success(`Cuota mensual y ${cuotasCount} cuotas individuales eliminadas exitosamente`);
          loadData();
        } catch (error) {
          message.error('Error al eliminar cuota mensual: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  };

  // Columnas de la tabla de cuotas
  const cuotasColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
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
              icon={<DollarOutlined />}
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
  ];

  // Columnas de cuotas mensuales
  const cuotasMensualesColumns = [
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
      width: 250,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver Cuotas Individuales">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setFiltroMes(record.mes_año)}
            >
              Ver Cuotas
            </Button>
          </Tooltip>
          <Tooltip title="Editar Cuota Mensual">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditarCuotaMensual(record)}
              disabled={record.estado === 'cerrada'}
            >
              Editar
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
  ];

  const handleCrearCuota = () => {
    setEditingCuota(null);
    setSelectedUnidades([]);
    setEnviarATodos(true);
    form.resetFields();
    setIsCuotaModalVisible(true);
  };

  const handleEditarCuotaMensual = (cuotaMensual) => {
    setEditingCuota(cuotaMensual);
    
    let fechaFormateada = null;
    if (cuotaMensual.fecha_limite) {
      try {
        fechaFormateada = dayjs(cuotaMensual.fecha_limite);
        if (!fechaFormateada.isValid()) {
          fechaFormateada = null;
        }
      } catch (error) {
        fechaFormateada = null;
      }
    }
    
    const formData = {
      descripcion: cuotaMensual.descripcion || '',
      mes_año: cuotaMensual.mes_año,
      monto_total: cuotaMensual.monto_total,
      fecha_limite: fechaFormateada
    };
    
    form.setFieldsValue(formData);
    setIsCuotaModalVisible(true);
  };

  const handleCrearExpensa = () => {
    setSelectedUnidades([]);
    setEnviarATodos(true);
    expensaForm.resetFields();
    setIsExpensaModalVisible(true);
  };

  const handleEditarExpensaMensual = (expensaMensual) => {
    setEditingCuota(expensaMensual);
    
    let fechaFormateada = null;
    if (expensaMensual.fecha_limite) {
      try {
        fechaFormateada = dayjs(expensaMensual.fecha_limite);
        if (!fechaFormateada.isValid()) {
          fechaFormateada = null;
        }
      } catch (error) {
        fechaFormateada = null;
      }
    }
    
    const formData = {
      descripcion: expensaMensual.descripcion || '',
      mes_año: expensaMensual.mes_año,
      monto_total: expensaMensual.monto_total,
      fecha_limite: fechaFormateada
    };
    
    expensaForm.setFieldsValue(formData);
    setIsExpensaModalVisible(true);
  };

  const handleEliminarExpensaMensual = (expensaMensual) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar esta expensa mensual?',
      content: (
        <div>
          <p><strong>Descripción:</strong> {expensaMensual.descripcion || 'Sin descripción'}</p>
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
          await api.delete(`/finanzas/cuotas-mensuales/${expensaMensual.id}/eliminar_cuota_mensual/`);
          message.success('Expensa mensual eliminada exitosamente');
          loadData();
        } catch (error) {
          message.error('Error al eliminar expensa mensual: ' + (error.response?.data?.detail || error.message));
        }
      },
    });
  };

  const handleCerrarModal = () => {
    setEditingCuota(null);
    setSelectedUnidades([]);
    setEnviarATodos(true);
    form.resetFields();
    setIsCuotaModalVisible(false);
  };

  const handleLimpiarFiltros = () => {
    setFiltroMes('');
    setFiltroEstado('');
    setFiltroUnidad('');
  };

  const handleSubmitCuota = async (values) => {
    try {
      if (editingCuota) {
        // Verificar si es una cuota mensual o una cuota por unidad
        if (editingCuota.mes_año) {
          // Es una cuota mensual
          const cuotaData = {
            descripcion: values.descripcion,
            monto_total: values.monto_total,
            fecha_limite: values.fecha_limite ? dayjs(values.fecha_limite).format('YYYY-MM-DD') : null
          };
          await finanzasAPI.updateCuotaMensual(editingCuota.id, cuotaData);
          message.success('Cuota mensual actualizada exitosamente');
        } else {
          // Es una cuota por unidad
          const cuotaData = {
            monto: values.monto,
            fecha_limite: values.fecha_limite ? dayjs(values.fecha_limite).format('YYYY-MM-DD') : null,
            observaciones: values.observaciones
          };
          await finanzasAPI.updateCuotaUnidad(editingCuota.id, cuotaData);
          message.success('Cuota actualizada exitosamente');
        }
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
      console.error('Error al guardar cuota:', error);
      message.error('Error al guardar cuota: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleSubmitExpensa = async (values) => {
    try {
      if (editingCuota) {
        // Actualizar expensa existente
        const expensaData = {
          descripcion: values.descripcion,
          monto_total: values.monto_total,
          fecha_limite: values.fecha_limite ? dayjs(values.fecha_limite).format('YYYY-MM-DD') : null
        };
        await finanzasAPI.updateCuotaMensual(editingCuota.id, expensaData);
        message.success('Expensa actualizada exitosamente');
      } else {
        // Crear nueva expensa
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
      }
      
      setIsExpensaModalVisible(false);
      setEditingCuota(null);
      loadData();
    } catch (error) {
      console.error('Error al guardar expensa:', error);
      message.error('Error al guardar expensa: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleSubmitPago = async (values) => {
    try {
      const pagoData = {
        monto: values.monto,
        metodo_pago: values.metodo_pago,
        observaciones: values.observaciones,
        numero_referencia: values.numero_referencia
      };
      
      await finanzasAPI.registrarPago(selectedCuota.id, pagoData);
      message.success('Pago registrado exitosamente');
      setIsPagoModalVisible(false);
      loadData();
    } catch (error) {
      message.error('Error al registrar pago: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (!canAccess('administrador')) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
        <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>Acceso Denegado</h2>
        <p>No tiene permisos para acceder a esta sección.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', fontSize: '16px', color: '#666' }}>
        Cargando datos de cuotas...
      </div>
    );
  }

  return (
    <div className="dashboard-finanzas-fixed">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 2px' }}>
        <div>
          <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '24px', fontWeight: 600 }}>💰 CU22 - Gestión de Cuotas y Expensas</h1>
        </div>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCrearCuota}
          >
            Nueva Cuota
          </Button>
          <Button 
            type="default" 
            icon={<PlusOutlined />}
            onClick={handleCrearExpensa}
          >
            Nueva Expensa
          </Button>
        </Space>
      </div>

      {loading && (
        <div style={{ backgroundColor: '#d1ecf1', color: '#0c5460', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bee5eb', fontSize: '14px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ marginRight: '10px' }}>⏳</div>
            <span>Cargando datos de cuotas y expensas...</span>
          </div>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb', fontSize: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            <Button 
              size="small" 
              type="primary" 
              onClick={loadData}
              style={{ marginLeft: '10px' }}
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={3}>
          <Card>
            <Statistic
              title="Cuotas Mensuales"
              value={estadisticas.totalCuotasMensuales}
              prefix={<HomeOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Expensas Mensuales"
              value={estadisticas.totalExpensasMensuales}
              prefix={<CalculatorOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Pagadas"
              value={estadisticas.totalPagadas}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Pendientes"
              value={estadisticas.totalPendientes}
              valueStyle={{ color: '#1890ff' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Parciales"
              value={estadisticas.totalParciales}
              valueStyle={{ color: '#faad14' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
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

      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Monto Total"
              value={estadisticas.montoTotal}
              precision={2}
              prefix={<DollarOutlined />}
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
              prefix={<DollarOutlined />}
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
              prefix={<DollarOutlined />}
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
      </Card>

      <Card 
        title="💰 Cuotas Mensuales" 
        style={{ marginBottom: 24 }}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCrearCuota}
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
        title="🏠 Expensas Mensuales" 
        style={{ marginBottom: 24 }}
        extra={
          <Button 
            type="default" 
            icon={<PlusOutlined />}
            onClick={handleCrearExpensa}
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
          columns={cuotasMensualesColumns}
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

      <Modal
        title={editingCuota ? (editingCuota.mes_año ? 'Editar Cuota Mensual' : 'Editar Cuota por Unidad') : '💰 Nueva Cuota'}
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

      {/* Modal Expensa */}
      <Modal
        title={editingCuota ? 'Editar Expensa' : '🏠 Nueva Expensa'}
        open={isExpensaModalVisible}
        onCancel={() => setIsExpensaModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={expensaForm}
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
          
          <Divider>Distribución de Expensas</Divider>
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
                {editingCuota ? 'Actualizar Expensa' : 'Crear Expensa'}
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

export default GestionCuotasFixed;
