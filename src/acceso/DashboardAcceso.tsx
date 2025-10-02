import { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space, Tag, Progress, Alert, Modal, Popconfirm, notification } from 'antd';
import { CarOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, VideoCameraOutlined, DeleteOutlined, BarChartOutlined, SearchOutlined } from '@ant-design/icons';
import accesoAPI from '../api/acceso';
import { Input, Upload, message } from 'antd';
import { CameraOutlined, UploadOutlined } from '@ant-design/icons';
import type { DashboardStats } from '../types';
import './DashboardAcceso.css';
// Tipos para el componente
interface RegistroAcceso {
  id: number;
  placa_detectada: string;
  tipo_acceso: 'entrada' | 'salida';
  estado_acceso: 'autorizado' | 'denegado' | 'pendiente';
  ia_confidence: number;
  fecha_hora: string;
  mensaje?: string;
  tipo_propietario?: string;
  propietario_nombre?: string;
  vehiculo_info?: string;
  visitante_nombre?: string;
}

interface DashboardData {
  estadisticas: {
    total_registros: number;
    registros_hoy: number;
    tasa_exito: number;
    pendientes: number;
    autorizados: number;
    denegados: number;
  };
  placas: {
    residentes_activas: number;
    invitados_activos: number;
  };
  ultimos_registros: RegistroAcceso[];
}

// Carga diferida para evitar errores de resolución iniciales
let __tesseractPromise: Promise<any> | null = null;
const loadTesseract = () => {
  if (!__tesseractPromise) {
    __tesseractPromise = import('tesseract.js');
  }
  return __tesseractPromise;
};

const DashboardAcceso: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [capturando, setCapturando] = useState<boolean>(false);
  const [placaManual, setPlacaManual] = useState<string>('');
  const [cameraOpen, setCameraOpen] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [placasRegistradas, setPlacasRegistradas] = useState<any>(null);
  const [mostrarPlacas, setMostrarPlacas] = useState<boolean>(false);
  const [vehiculosAutorizados, setVehiculosAutorizados] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    cargarDashboard();
    cargarVehiculosAutorizados();
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      cargarDashboard();
      cargarVehiculosAutorizados();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarVehiculosAutorizados = async () => {
    try {
      const data = await accesoAPI.getListaPlacasAutorizadas();
      setVehiculosAutorizados(data.placas_autorizadas || []);
    } catch (err) {
      console.error('Error al cargar vehículos autorizados:', err);
    }
  };

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const data = await accesoAPI.getDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar datos del dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarPlacasRegistradas = async () => {
    try {
      const data = await accesoAPI.getPlacasRegistradas();
      setPlacasRegistradas(data);
      setMostrarPlacas(true);
    } catch (err) {
      message.error('Error al cargar placas registradas');
      console.error('Error:', err);
    }
  };

  const InvitadosActivos = () => (
    <Card title="Invitados Activos Hoy" className="metrics-card">
      <div className="metrics-content">
        <div className="metric-item">
          <div className="metric-label">
            <CarOutlined /> Invitados activos
          </div>
          <div className="metric-value">
            {dashboardData?.placas?.invitados_activos ?? 0}
          </div>
        </div>
      </div>
    </Card>
  );

  const onRegistrarAccesoDemo = async () => {
    try {
      if (!placaManual || placaManual.trim().length < 5) {
        message.warning('Ingrese una placa válida');
        return;
      }
      const data = await accesoAPI.registrarAcceso({
        placa_detectada: placaManual.trim().toUpperCase(),
        ia_confidence: 92.5,
        ia_placa_reconocida: true,
        ia_vehiculo_reconocido: false,
        tipo_acceso: 'entrada'
      });
      
      // Mostrar modal de resultado
      mostrarResultadoAcceso(data);
      
      cargarDashboard();
      setPlacaManual('');
    } catch (e) {
      console.error(e);
      message.error('Error registrando acceso');
    }
  };

  const beforeUpload = async (file: any) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const dataUrl = e.target.result;
        setCapturedImage(dataUrl);
        
        message.loading('Procesando imagen y detectando placa...', 0);
        
        try {
        const { default: Tesseract } = await loadTesseract();
        const { data: { text } } = await Tesseract.recognize(dataUrl, 'eng', { logger: () => {} });
        const raw = (text || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        let placa = raw;
        if (raw.length > 8 || raw.length < 5) {
          const m = raw.match(/[A-Z0-9]{5,8}/);
          if (m) placa = m[0];
        }
          
          message.destroy(); // Limpiar mensaje de loading
          
        if (placa && placa.length >= 5) {
          setPlacaManual(placa);
          message.success(`Placa detectada: ${placa}`);
            
            // Auto-registrar si se detectó una placa válida
            Modal.confirm({
              title: '🔍 Placa Detectada',
              content: (
                <div>
                  <p>Se detectó la placa: <strong>{placa}</strong></p>
                  <p>¿Desea registrar el acceso automáticamente?</p>
                </div>
              ),
              okText: 'Registrar Acceso',
              cancelText: 'Solo Detectar',
              onOk: async () => {
                try {
                  const data = await accesoAPI.registrarAcceso({
                    placa_detectada: placa.toUpperCase(),
                    ia_confidence: 85,
                    ia_placa_reconocida: true,
                    ia_vehiculo_reconocido: false,
                    tipo_acceso: 'entrada',
                    imagen_url: dataUrl
                  });
                  
                  mostrarResultadoAcceso(data);
                  cargarDashboard();
                  setPlacaManual('');
                  setCapturedImage('');
                } catch (error) {
                  message.error('Error al registrar acceso');
                }
              }
            });
        } else {
            message.info('No se detectó una placa clara. Puede escribirla manualmente.');
          }
        } catch (ocrError) {
          message.destroy();
          message.error('Error al procesar la imagen con OCR');
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      message.error('No se pudo procesar la imagen');
    }
    return false; // Evita upload real
  };

  const openCamera = async () => {
    try {
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        message.error('Tu navegador no soporta acceso a la cámara');
        return;
      }

      message.loading('Iniciando cámara...', 0);

      // Intentar con configuración de cámara trasera primero
      let constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };

      console.log('Solicitando acceso a la cámara trasera...');
      let stream;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Stream de cámara trasera obtenido:', stream);
      } catch (rearError) {
        console.log('Cámara trasera no disponible, intentando cámara frontal...');
        
        // Fallback a cámara frontal
        constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };
        
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Stream de cámara frontal obtenido:', stream);
        } catch (frontError) {
          console.log('Cámara frontal no disponible, intentando cualquier cámara...');
          
          // Fallback a cualquier cámara disponible
          constraints = {
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 }
            }
          };
          
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Stream de cualquier cámara obtenido:', stream);
        }
      }
      
      if (videoRef.current) {
        // Limpiar cualquier stream anterior
        if (videoRef.current.srcObject) {
          const oldTracks = videoRef.current.srcObject.getTracks();
          oldTracks.forEach(track => track.stop());
        }

        videoRef.current.srcObject = stream;
        
        // Configurar eventos del video
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata cargado');
          console.log('Dimensiones del video:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
        };

        videoRef.current.oncanplay = () => {
          console.log('Video puede reproducirse');
          message.destroy(); // Limpiar mensaje de loading
          message.success('Cámara lista');
        };

        videoRef.current.onplay = () => {
          console.log('Video reproduciéndose');
        };

        videoRef.current.onerror = (e) => {
          console.error('Error en video:', e);
          message.destroy();
          message.error('Error en el video. Intenta cerrar y abrir la cámara de nuevo.');
        };

        // Intentar reproducir el video
        try {
          await videoRef.current.play();
          console.log('Video iniciado correctamente');
        } catch (playError) {
          console.error('Error al reproducir video:', playError);
          message.destroy();
          message.error('Error al reproducir video. Verifica que la cámara no esté siendo usada por otra aplicación.');
        }
      }
      
      setCameraOpen(true);
      
    } catch (e) {
      console.error('Error de cámara:', e);
      message.destroy(); // Limpiar mensaje de loading
      
      if (e.name === 'NotAllowedError') {
        message.error('Permisos de cámara denegados. Por favor, permite el acceso a la cámara y recarga la página.');
      } else if (e.name === 'NotFoundError') {
        message.error('No se encontró ninguna cámara en tu dispositivo.');
      } else if (e.name === 'NotReadableError') {
        message.error('La cámara está siendo usada por otra aplicación. Cierra otras aplicaciones que usen la cámara.');
      } else if (e.name === 'OverconstrainedError') {
        message.error('La cámara no soporta la configuración solicitada. Intenta con una cámara diferente.');
      } else {
        message.error(`Error de cámara: ${e.message || 'Error desconocido'}`);
      }
    }
  };

  const closeCamera = () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          track.stop();
          console.log('Stream track detenido:', track.kind);
        });
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      console.error('Error al cerrar cámara:', e);
    }
    setCameraOpen(false);
    setCapturedImage('');
    setPlacaManual('');
    message.info('Cámara cerrada');
  };

  const clearCapturedImage = () => {
    setCapturedImage('');
    setPlacaManual('');
    message.info('Imagen capturada eliminada');
  };



  const captureFrame = () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      console.log('Iniciando captura...');
      console.log('Video ref:', video);
      console.log('Canvas ref:', canvas);
      
      if (!video) {
        message.error('Error: Video no disponible');
        return;
      }

      // Crear canvas si no existe
      let canvasElement = canvas;
      if (!canvasElement) {
        console.log('Canvas no encontrado, creando uno nuevo...');
        canvasElement = document.createElement('canvas');
        canvasElement.style.display = 'none';
        document.body.appendChild(canvasElement);
        canvasRef.current = canvasElement;
      }

      // Verificar que el video esté listo
      if (video.readyState < 2) {
        message.warning('El video aún no está listo. Espera un momento e intenta de nuevo.');
        return;
      }

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        message.warning('El video no tiene dimensiones válidas. Espera un momento e intenta de nuevo.');
        return;
      }

      // Verificar que el video esté reproduciéndose
      if (video.paused) {
        message.warning('El video está pausado. Intenta de nuevo.');
        return;
      }

      console.log(`Video estado: readyState=${video.readyState}, paused=${video.paused}, dimensions=${video.videoWidth}x${video.videoHeight}`);

      // Capturar inmediatamente
      try {
        const width = video.videoWidth;
        const height = video.videoHeight;
        
        console.log(`Capturando video: ${width}x${height}`);
        
        // Configurar canvas
        canvasElement.width = width;
        canvasElement.height = height;
        
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
          message.error('Error al obtener contexto del canvas');
          return;
        }

        console.log('Canvas configurado correctamente');

        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Dibujar el frame del video en el canvas SIN filtros
        try {
          // Configurar el canvas para mejor calidad
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Dibujar el frame del video en el canvas SIN modificar colores
          ctx.drawImage(video, 0, 0, width, height);
          
          console.log('Imagen dibujada en canvas (colores originales)');
        } catch (drawError) {
          console.error('Error al dibujar en canvas:', drawError);
          message.error('Error al capturar el frame del video');
          return;
        }
        
        // Convertir a imagen
        let dataUrl;
        try {
          dataUrl = canvasElement.toDataURL('image/jpeg', 0.9);
          console.log('Imagen convertida a data URL');
        } catch (dataUrlError) {
          console.error('Error al convertir a data URL:', dataUrlError);
          message.error('Error al procesar la imagen capturada');
          return;
        }
        
        setCapturedImage(dataUrl);
        message.success('Imagen capturada correctamente');
        
        // Procesar con OCR
        message.loading('Procesando imagen con OCR...', 0);
        
        loadTesseract()
          .then(({ default: Tesseract }) => {
            console.log('Iniciando OCR...');
            return Tesseract.recognize(dataUrl, 'eng', { 
              logger: m => {
                if (m.status === 'recognizing text') {
                  console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
              },
              // Configuración simplificada para mejor detección
              tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
              tessedit_pageseg_mode: '6', // Modo de segmentación para bloque de texto uniforme
              tessedit_ocr_engine_mode: '1', // Modo LSTM
              // Configuraciones básicas
              preserve_interword_spaces: '1',
              textord_min_linesize: '1.0',
              textord_min_xheight: '8'
            });
          })
          .then(({ data: { text } }) => {
            message.destroy(); // Limpiar mensaje de loading
            
            console.log('Texto detectado por OCR:', text);
            
            // Procesar el texto detectado de manera más inteligente
            let originalText = (text || '').trim();
            console.log('Texto original del OCR:', originalText);
            
            // Limpiar el texto pero mantener espacios para mejor análisis
            let cleanText = originalText.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
            console.log('Texto limpio:', cleanText);
            
            // Buscar patrones de placas en el texto original y limpio
            const platePatterns = [
              // Patrones comunes de placas
              /[A-Z]{3}[0-9]{3}/, // ABC123
              /[A-Z]{2}[0-9]{4}/, // AB1234
              /[A-Z]{1}[0-9]{4}[A-Z]{1}/, // A1234B
              /[0-9]{4}[A-Z]{2}/, // 1234AB
              /[A-Z]{1}[0-9]{3}[A-Z]{2}/, // A123BC
              /[A-Z]{2}[0-9]{3}[A-Z]{1}/, // AB123C
              /[A-Z]{2}[0-9]{2}[A-Z]{2}/, // AB12CD
              /[A-Z]{1}[0-9]{2}[A-Z]{3}/, // A12BCD
              /[0-9]{3}[A-Z]{3}/, // 123ABC
              /[A-Z]{3}[0-9]{2}[A-Z]{1}/, // ABC12D
              // Patrones más flexibles
              /[A-Z]{2,3}[0-9]{2,4}/, // 2-3 letras + 2-4 números
              /[0-9]{2,4}[A-Z]{2,3}/, // 2-4 números + 2-3 letras
              /[A-Z]{1,2}[0-9]{2,3}[A-Z]{1,2}/, // Letras-números-letras
            ];
            
            let bestMatch = '';
            let bestScore = 0;
            
            // Buscar en el texto original
            for (const pattern of platePatterns) {
              const matches = originalText.match(new RegExp(pattern.source, 'gi'));
              if (matches) {
                for (const match of matches) {
                  const cleanMatch = match.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (cleanMatch.length > bestScore) {
                    bestMatch = cleanMatch;
                    bestScore = cleanMatch.length;
                  }
                }
              }
            }
            
            // Si no se encontró en el original, buscar en el texto limpio
            if (!bestMatch) {
              for (const pattern of platePatterns) {
                const match = cleanText.match(pattern);
                if (match && match[0].length > bestScore) {
                  bestMatch = match[0];
                  bestScore = match[0].length;
                }
              }
            }
            
            // Si aún no se encontró, buscar cualquier secuencia de letras y números
            if (!bestMatch) {
              const sequences = cleanText.match(/[A-Z0-9]{4,8}/g);
              if (sequences) {
                bestMatch = sequences[0]; // Tomar la primera secuencia larga
              }
            }
            
            // Si no se encontró nada, usar los primeros caracteres válidos
            if (!bestMatch) {
              const validChars = cleanText.replace(/[^A-Z0-9]/g, '');
              if (validChars.length > 0) {
                bestMatch = validChars.substring(0, Math.min(8, validChars.length));
              }
            }
            
            console.log('Mejor coincidencia encontrada:', bestMatch);
            console.log('Puntuación:', bestScore);
            
            if (bestMatch && bestMatch.length >= 4) {
              setPlacaManual(bestMatch);
              message.success(`Placa detectada: ${bestMatch}`);
            } else {
              message.warning('No se detectó una placa clara. Puedes escribirla manualmente.');
              if (cleanText.length > 0) {
                const fallback = cleanText.replace(/[^A-Z0-9]/g, '').substring(0, 8);
                if (fallback.length > 0) {
                  setPlacaManual(fallback);
                }
              }
            }
          })
          .catch((error) => {
            message.destroy(); // Limpiar mensaje de loading
            console.error('Error en OCR:', error);
            message.error('Error al procesar la imagen. Puedes escribir la placa manualmente.');
          });
          
      } catch (e) {
        console.error('Error en captura:', e);
        message.error(`Error al capturar: ${e.message}`);
      }
        
    } catch (e) {
      console.error('Error general al capturar:', e);
      message.error(`Error general: ${e.message}`);
    }
  };

  // Función para mostrar modal de resultado
  const mostrarResultadoAcceso = (data: any) => {
    const placa = data.placa_detectada || placaManual.trim().toUpperCase();
    
    if (data.estado_acceso === 'autorizado') {
      // Modal de éxito para vehículo autorizado
      Modal.success({
        title: '🚗 VEHÍCULO AUTORIZADO',
        width: 500,
        content: (
          <div style={{ padding: '20px 0' }}>
            <div style={{ 
              textAlign: 'center', 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#52c41a',
              marginBottom: '20px'
            }}>
              ✅ ACCESO PERMITIDO
            </div>
            <div style={{ fontSize: '16px', marginBottom: '10px' }}>
              <strong>Placa:</strong> {placa}
            </div>
            {data.tipo_propietario === 'residente' && (
              <>
                <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <strong>Propietario:</strong> {data.propietario_nombre}
                </div>
                <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <strong>Vehículo:</strong> {data.vehiculo_info}
                </div>
              </>
            )}
            {data.tipo_propietario === 'invitado' && (
              <>
                <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <strong>Visitante:</strong> {data.visitante_nombre}
                </div>
                <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <strong>Autorizado por:</strong> {data.propietario_nombre}
                </div>
                <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <strong>Vehículo:</strong> {data.vehiculo_info}
                </div>
              </>
            )}
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#f6ffed', 
              borderRadius: '6px',
              border: '1px solid #b7eb8f'
            }}>
              {data.mensaje || 'Vehículo registrado en el sistema'}
            </div>
          </div>
        ),
        okText: 'Entendido',
        onOk: () => {
          notification.success({
            message: 'Acceso Registrado',
            description: `Entrada autorizada para ${placa}`,
            placement: 'topRight',
            duration: 4
          });
        }
      });
    } else if (data.estado_acceso === 'pendiente') {
      // Modal de advertencia para vehículo pendiente
      Modal.warning({
        title: '⏳ VEHÍCULO NO REGISTRADO',
        width: 500,
        content: (
          <div style={{ padding: '20px 0' }}>
            <div style={{ 
              textAlign: 'center', 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#faad14',
              marginBottom: '20px'
            }}>
              ⚠️ REQUIERE AUTORIZACIÓN
            </div>
            <div style={{ fontSize: '16px', marginBottom: '10px' }}>
              <strong>Placa:</strong> {placa}
            </div>
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#fffbe6', 
              borderRadius: '6px',
              border: '1px solid #ffe58f'
            }}>
              Esta placa no está registrada en el sistema. El administrador o personal de seguridad debe autorizar manualmente el acceso.
            </div>
          </div>
        ),
        okText: 'Entendido',
        onOk: () => {
          notification.warning({
            message: 'Acceso Pendiente',
            description: `Placa ${placa} requiere autorización manual`,
            placement: 'topRight',
            duration: 6
          });
        }
      });
    } else {
      // Modal de error para vehículo denegado
      Modal.error({
        title: '🚫 ACCESO DENEGADO',
        width: 500,
        content: (
          <div style={{ padding: '20px 0' }}>
            <div style={{ 
              textAlign: 'center', 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#ff4d4f',
              marginBottom: '20px'
            }}>
              ❌ ACCESO NO AUTORIZADO
            </div>
            <div style={{ fontSize: '16px', marginBottom: '10px' }}>
              <strong>Placa:</strong> {placa}
            </div>
            <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#fff2f0', 
              borderRadius: '6px',
              border: '1px solid #ffccc7'
            }}>
              {data.mensaje || 'Esta placa no está autorizada para ingresar al condominio.'}
            </div>
          </div>
        ),
        okText: 'Entendido',
        onOk: () => {
          notification.error({
            message: 'Acceso Denegado',
            description: `Placa ${placa} no autorizada`,
            placement: 'topRight',
            duration: 4
          });
        }
      });
    }
  };

  const onRegistrarDesdeCamara = async () => {
    try {
      if (!placaManual || placaManual.trim().length < 4) {
        message.warning('Ingrese la placa detectada (mínimo 4 caracteres)');
        return;
      }
      
      const data = await accesoAPI.registrarAcceso({
        placa_detectada: placaManual.trim().toUpperCase(),
        ia_confidence: 90,
        ia_placa_reconocida: true,
        ia_vehiculo_reconocido: false,
        tipo_acceso: 'entrada',
        imagen_url: capturedImage
      });
      
      // Mostrar modal de resultado
      mostrarResultadoAcceso(data);
      
      setPlacaManual('');
      setCapturedImage('');
      closeCamera();
      cargarDashboard();
    } catch (e) {
      console.error(e);
      message.error('Error registrando acceso');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'autorizado': return 'success';
      case 'denegado': return 'error';
      case 'pendiente': return 'warning';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'autorizado': return <CheckCircleOutlined />;
      case 'denegado': return <CloseCircleOutlined />;
      case 'pendiente': return <ClockCircleOutlined />;
      default: return null;
    }
  };

  const handleAutorizar = async (id) => {
    try {
      await accesoAPI.autorizarRegistro(id);
      message.success('Registro autorizado');
      cargarDashboard();
    } catch (error) {
      message.error('Error al autorizar registro');
    }
  };

  const handleDenegar = async (id) => {
    try {
      await accesoAPI.denegarRegistro(id);
      message.success('Registro denegado');
      cargarDashboard();
    } catch (error) {
      message.error('Error al denegar registro');
    }
  };

  const handleEliminar = async (id) => {
    try {
      await accesoAPI.eliminarRegistro(id);
      message.success('Registro eliminado');
      cargarDashboard();
    } catch (error) {
      message.error('Error al eliminar registro');
    }
  };


  const columns = [
    {
      title: 'Placa',
      dataIndex: 'placa_detectada',
      key: 'placa_detectada',
      render: (placa) => <Tag color="blue">{placa}</Tag>,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_acceso',
      key: 'tipo_acceso',
      render: (tipo) => tipo === 'entrada' ? 'Entrada' : 'Salida',
    },
    {
      title: 'Estado',
      dataIndex: 'estado_acceso',
      key: 'estado_acceso',
      render: (estado) => (
        <Tag color={getEstadoColor(estado)} icon={getEstadoIcon(estado)}>
          {estado.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Confianza IA',
      dataIndex: 'ia_confidence',
      key: 'ia_confidence',
      render: (confidence) => (
        <Progress
          percent={confidence}
          size="small"
          status={confidence >= 80 ? 'success' : confidence >= 60 ? 'normal' : 'exception'}
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: 'Fecha/Hora',
      dataIndex: 'fecha_hora',
      key: 'fecha_hora',
      render: (fecha) => new Date(fecha).toLocaleString(),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          {(record.estado_acceso === 'pendiente' || record.estado_acceso === 'denegado') && (
            <Button 
              size="small" 
              type="primary" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleAutorizar(record.id)}
            >
              Autorizar
            </Button>
          )}
          {(record.estado_acceso === 'pendiente' || record.estado_acceso === 'autorizado') && (
            <Button 
              size="small" 
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleDenegar(record.id)}
            >
              Denegar
            </Button>
          )}
          <Popconfirm
            title="¿Eliminar este registro?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleEliminar(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button 
              size="small" 
              danger
              icon={<DeleteOutlined />}
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Cargando dashboard de acceso...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={cargarDashboard}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <div className="dashboard-acceso">
      <div className="dashboard-header">
        <h1>
          <CarOutlined /> Control de Acceso Vehicular
        </h1>
        <Space>
          <Input
            placeholder="Placa detectada (demo)"
            value={placaManual}
            onChange={(e) => setPlacaManual(e.target.value)}
            style={{ width: 200, textTransform: 'uppercase' }}
          />
          <Button icon={<CameraOutlined />} onClick={onRegistrarAccesoDemo} type="primary">
            Registrar Acceso (Demo)
          </Button>
          <Button icon={<VideoCameraOutlined />} onClick={openCamera}>
            Cámara (Web)
          </Button>
          <Upload beforeUpload={beforeUpload} showUploadList={false} accept="image/*">
            <Button icon={<UploadOutlined />}>Subir Imagen (Demo)</Button>
          </Upload>
          <Button icon={<SearchOutlined />} onClick={cargarPlacasRegistradas}>
            Ver Placas Registradas
          </Button>
        </Space>
      </div>

      <Modal 
        open={cameraOpen} 
        onCancel={closeCamera} 
        footer={null} 
        title="Cámara Web - Detección de Placas"
        width={600}
        centered
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'inline-block',
              position: 'relative',
              borderRadius: 8,
              overflow: 'hidden',
              border: '2px solid #d9d9d9'
            }}>
              <video 
                ref={videoRef} 
                style={{ 
                  width: 480, 
                  height: 300,
                  background: '#000',
                  display: 'block'
                }} 
                autoPlay
                playsInline
                muted
                controls={false}
                preload="metadata"
              />
              {/* Canvas oculto para captura */}
              <canvas 
                ref={canvasRef} 
                style={{ 
                  display: 'none',
                  width: 480,
                  height: 300
                }}
              />
            </div>
            
            {capturedImage && (
              <div style={{ marginTop: 16 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 8 
                }}>
                  <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                    Imagen Capturada:
                  </span>
                  <Button 
                    size="small" 
                    onClick={clearCapturedImage}
                    style={{ color: '#ff4d4f' }}
                  >
                    ✕ Limpiar
                  </Button>
                </div>
                <div style={{ 
                  display: 'inline-block',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '2px solid #52c41a'
                }}>
                  <img 
                    src={capturedImage} 
                    alt="Imagen capturada" 
                    style={{ 
                      width: 480, 
                      height: 200,
                      objectFit: 'cover',
                      display: 'block'
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
          
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap>
              <Button 
                type="primary" 
                icon={<CameraOutlined />}
                onClick={captureFrame}
                size="large"
              >
                Capturar Imagen
              </Button>
              <Button onClick={closeCamera} size="large">
                Cerrar Cámara
              </Button>
            </Space>
            
            <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
              <Input
                placeholder="Placa detectada (editable)"
                value={placaManual}
                onChange={(e) => setPlacaManual(e.target.value.toUpperCase())}
                style={{ 
                  width: '100%', 
                  textTransform: 'uppercase',
                  fontSize: 16,
                  textAlign: 'center'
                }}
                size="large"
              />
            </div>
            
            <Button 
              type="primary" 
              onClick={onRegistrarDesdeCamara}
              size="large"
              disabled={!placaManual || placaManual.trim().length < 5}
              style={{ minWidth: 200 }}
            >
              Registrar Acceso
            </Button>
          </Space>
        </div>
      </Modal>

      {/* Modal para mostrar placas registradas */}
      <Modal
        title="📋 Placas Registradas en el Sistema"
        open={mostrarPlacas}
        onCancel={() => setMostrarPlacas(false)}
        footer={[
          <Button key="close" onClick={() => setMostrarPlacas(false)}>
            Cerrar
          </Button>
        ]}
        width={1000}
      >
        {placasRegistradas && (
          <div>
            {/* Resumen */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Residentes"
                    value={placasRegistradas.sistema_acceso?.total_residentes || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Invitados"
                    value={placasRegistradas.sistema_acceso?.total_invitados || 0}
                    prefix={<CarOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Vehículos Originales"
                    value={placasRegistradas.gestion_original?.total_vehiculos || 0}
                    prefix={<CarOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Total Placas"
                    value={placasRegistradas.total_general?.total_placas || 0}
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Placas de Residentes */}
            <Card title="🏠 Placas de Residentes" style={{ marginBottom: 16 }}>
              <Table
                dataSource={placasRegistradas.sistema_acceso?.placas_residentes || []}
                columns={[
                  {
                    title: 'Placa',
                    dataIndex: 'placa',
                    key: 'placa',
                    render: (placa: string) => <Tag color="blue" style={{ fontSize: '14px' }}>{placa}</Tag>
                  },
                  {
                    title: 'Vehículo',
                    key: 'vehiculo',
                    render: (record: any) => `${record.marca} ${record.modelo} (${record.color})`
                  },
                  {
                    title: 'Propietario',
                    dataIndex: 'residente_nombre',
                    key: 'residente_nombre'
                  },
                  {
                    title: 'Fecha Registro',
                    dataIndex: 'fecha_registro',
                    key: 'fecha_registro',
                    render: (fecha: string) => new Date(fecha).toLocaleDateString()
                  }
                ]}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </Card>

            {/* Placas de Invitados */}
            <Card title="👥 Placas de Invitados" style={{ marginBottom: 16 }}>
              <Table
                dataSource={placasRegistradas.sistema_acceso?.placas_invitados || []}
                columns={[
                  {
                    title: 'Placa',
                    dataIndex: 'placa',
                    key: 'placa',
                    render: (placa: string) => <Tag color="green" style={{ fontSize: '14px' }}>{placa}</Tag>
                  },
                  {
                    title: 'Vehículo',
                    key: 'vehiculo',
                    render: (record: any) => `${record.marca || 'N/A'} ${record.modelo || 'N/A'} (${record.color || 'N/A'})`
                  },
                  {
                    title: 'Visitante',
                    key: 'visitante',
                    render: (record: any) => record.nombre_visitante || 'N/A'
                  },
                  {
                    title: 'Autorizado por',
                    dataIndex: 'residente_nombre',
                    key: 'residente_nombre'
                  },
                  {
                    title: 'Vence',
                    dataIndex: 'fecha_vencimiento',
                    key: 'fecha_vencimiento',
                    render: (fecha: string) => {
                      const vencimiento = new Date(fecha);
                      const hoy = new Date();
                      const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <span style={{ color: diasRestantes <= 3 ? '#ff4d4f' : diasRestantes <= 7 ? '#faad14' : '#52c41a' }}>
                          {vencimiento.toLocaleDateString()} ({diasRestantes} días)
                        </span>
                      );
                    }
                  }
                ]}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </Card>

            {/* Vehículos del Sistema Original (si existen) */}
            {placasRegistradas.gestion_original?.vehiculos?.length > 0 && (
              <Card title="🚗 Vehículos del Sistema Original">
                <Table
                  dataSource={placasRegistradas.gestion_original.vehiculos}
                  columns={[
                    {
                      title: 'Placa',
                      dataIndex: 'placa',
                      key: 'placa',
                      render: (placa: string) => <Tag color="orange" style={{ fontSize: '14px' }}>{placa}</Tag>
                    },
                    {
                      title: 'Vehículo',
                      key: 'vehiculo',
                      render: (record: any) => `${record.marca} ${record.modelo} (${record.color})`
                    }
                  ]}
                  pagination={false}
                  size="small"
                  rowKey="id"
                />
              </Card>
            )}
          </div>
        )}
      </Modal>

      {dashboardData && (
        <>
          {/* Estadísticas Principales */}
          <Row gutter={[16, 16]} className="stats-row">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Registros"
                  value={dashboardData.estadisticas.total_registros}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Hoy"
                  value={dashboardData.estadisticas.registros_hoy}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Tasa de Éxito"
                  value={dashboardData.estadisticas.tasa_exito}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Pendientes"
                  value={dashboardData.estadisticas.pendientes}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Métricas Detalladas */}
          <Row gutter={[16, 16]} className="metrics-row">
            <Col xs={24} md={12}>
              <Card title="Estado de Accesos" className="metrics-card">
                <div className="metrics-content">
                  <div className="metric-item">
                    <div className="metric-label">Autorizados</div>
                    <div className="metric-value success">
                      {dashboardData.estadisticas.autorizados}
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Denegados</div>
                    <div className="metric-value error">
                      {dashboardData.estadisticas.denegados}
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Pendientes</div>
                    <div className="metric-value warning">
                      {dashboardData.estadisticas.pendientes || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Placas Activas" className="metrics-card">
                <div className="metrics-content">
                  <div className="metric-item">
                    <div className="metric-label">
                      <UserOutlined /> Residentes
                    </div>
                    <div className="metric-value">
                      {dashboardData.placas.residentes_activas}
                    </div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">
                      <CarOutlined /> Invitados
                    </div>
                    <div className="metric-value">
                      {dashboardData.placas.invitados_activos}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Últimos Registros */}
          <Card
            title="Últimos Registros de Acceso"
            className="recent-records"
            extra={
              <Button type="link" size="small">
                Ver Todos
              </Button>
            }
          >
            <Table
              columns={columns}
              dataSource={dashboardData.ultimos_registros}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
            />
          </Card>


        </>
      )}
    </div>
  );
};

export default DashboardAcceso;
