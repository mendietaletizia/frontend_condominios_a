import { useState, useEffect, useCallback } from 'react';
import { comunidadAPI } from '../api/comunidad';
import { useAuth } from '../contexts/AuthContext';

export const useNotificaciones = () => {
  const [nuevasReservas, setNuevasReservas] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, canAccess } = useAuth();

  const checkNuevasReservas = useCallback(async () => {
    // Solo para administradores
    if (!user || !canAccess(['administrador'])) {
      return;
    }

    try {
      setLoading(true);
      const response = await comunidadAPI.getNuevasReservasCount();
      setNuevasReservas(response.nuevas_reservas || 0);
    } catch (error) {
      console.error('Error al verificar nuevas reservas:', error);
      setNuevasReservas(0);
    } finally {
      setLoading(false);
    }
  }, [user, canAccess]);

  const marcarReservasVistas = useCallback(async () => {
    if (!user || !canAccess(['administrador'])) {
      return;
    }

    try {
      await comunidadAPI.marcarReservasVistas();
      setNuevasReservas(0);
    } catch (error) {
      console.error('Error al marcar reservas como vistas:', error);
    }
  }, [user, canAccess]);

  // Polling cada 30 segundos
  useEffect(() => {
    if (!user || !canAccess(['administrador'])) {
      return;
    }

    // Verificar inmediatamente
    checkNuevasReservas();

    // Configurar polling
    const interval = setInterval(checkNuevasReservas, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [checkNuevasReservas, user, canAccess]);

  return {
    nuevasReservas,
    loading,
    checkNuevasReservas,
    marcarReservasVistas
  };
};


