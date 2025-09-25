import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la aplicación
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      
      const response = await authAPI.login(username, password);

      const { token: newToken, username: userUsername, email, rol, user_id, residente_id } = response;

      const userData = {
        id: user_id,
        username: userUsername,
        email,
        rol,
        residente_id,
      };

      // Guardar en localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Actualizar estado
      setToken(newToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Error en login:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || error.response?.data?.error || error.message || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos independientemente del resultado del logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    // Administrador tiene acceso a todo
    if (user.rol?.toLowerCase() === 'administrador') return true;
    
    // Verificar si el rol del usuario coincide con el requerido
    return user.rol?.toLowerCase() === requiredRole?.toLowerCase();
  };

  const canAccess = (roles) => {
    if (!user) return false;
    
    // Administrador tiene acceso a todo
    if (user.rol?.toLowerCase() === 'administrador') return true;
    
    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (Array.isArray(roles)) {
      return roles.some(role => user.rol?.toLowerCase() === role.toLowerCase());
    }
    
    return user.rol?.toLowerCase() === roles?.toLowerCase();
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasPermission,
    canAccess,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
