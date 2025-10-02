// Tipos TypeScript para la aplicación

// Tipos de usuario y autenticación
export interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
  residente_id?: number;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Tipos de API comunes
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T = any> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Tipos de componentes
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export interface PublicRouteProps {
  children: React.ReactNode;
}

// Tipos de datos del dominio
export interface Residente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  unidad_id: number;
}

export interface Unidad {
  id: number;
  numero: string;
  tipo: string;
  area: number;
  propietario?: string;
}

export interface Reserva {
  id: number;
  area_comun_id: number;
  residente_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  observaciones?: string;
}

export interface AreaComun {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  disponible: boolean;
  precio_hora?: number;
}

// Tipos de finanzas
export interface CuotaMensual {
  id: number;
  mes: number;
  año: number;
  monto: number;
  descripcion: string;
}

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
}

export interface Multa {
  id: number;
  residente_id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  pagada: boolean;
}

// Tipos de eventos
export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  tipo: string;
}

// Tipos de comunicados
export interface Comunicado {
  id: number;
  titulo: string;
  contenido: string;
  fecha_publicacion: string;
  autor: string;
  importante: boolean;
}

// Tipos de vehículos
export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  residente_id: number;
}

// Tipos de mascotas
export interface Mascota {
  id: number;
  nombre: string;
  tipo: string;
  raza: string;
  residente_id: number;
}

// Tipos de empleados
export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  cargo: string;
  telefono: string;
  email: string;
}

// Tipos de invitados
export interface Invitado {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  residente_id: number;
  fecha_entrada?: string;
  fecha_salida?: string;
}

// Tipos de estadísticas
export interface DashboardStats {
  financiero?: {
    total_pagos: number;
    total_expensas: number;
    total_gastos: number;
    total_multas: number;
  };
  morosidad?: {
    estadisticas: {
      total_morosidad: number;
      cantidad_morosos: number;
    };
  };
  notificaciones?: Array<{
    id: number;
    mensaje: string;
    leido: boolean;
    fecha: string;
  }>;
}


// Tipos de usuario y autenticación
export interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
  residente_id?: number;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Tipos de API comunes
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T = any> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Tipos de componentes
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export interface PublicRouteProps {
  children: React.ReactNode;
}

// Tipos de datos del dominio
export interface Residente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  unidad_id: number;
}

export interface Unidad {
  id: number;
  numero: string;
  tipo: string;
  area: number;
  propietario?: string;
}

export interface Reserva {
  id: number;
  area_comun_id: number;
  residente_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  observaciones?: string;
}

export interface AreaComun {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  disponible: boolean;
  precio_hora?: number;
}

// Tipos de finanzas
export interface CuotaMensual {
  id: number;
  mes: number;
  año: number;
  monto: number;
  descripcion: string;
}

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
}

export interface Multa {
  id: number;
  residente_id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  pagada: boolean;
}

// Tipos de eventos
export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  tipo: string;
}

// Tipos de comunicados
export interface Comunicado {
  id: number;
  titulo: string;
  contenido: string;
  fecha_publicacion: string;
  autor: string;
  importante: boolean;
}

// Tipos de vehículos
export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  residente_id: number;
}

// Tipos de mascotas
export interface Mascota {
  id: number;
  nombre: string;
  tipo: string;
  raza: string;
  residente_id: number;
}

// Tipos de empleados
export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  cargo: string;
  telefono: string;
  email: string;
}

// Tipos de invitados
export interface Invitado {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  residente_id: number;
  fecha_entrada?: string;
  fecha_salida?: string;
}

// Tipos de estadísticas
export interface DashboardStats {
  financiero?: {
    total_pagos: number;
    total_expensas: number;
    total_gastos: number;
    total_multas: number;
  };
  morosidad?: {
    estadisticas: {
      total_morosidad: number;
      cantidad_morosos: number;
    };
  };
  notificaciones?: Array<{
    id: number;
    mensaje: string;
    leido: boolean;
    fecha: string;
  }>;
}

// Tipos de usuario y autenticación
export interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
  residente_id?: number;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Tipos de API comunes
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T = any> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Tipos de componentes
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export interface PublicRouteProps {
  children: React.ReactNode;
}

// Tipos de datos del dominio
export interface Residente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  unidad_id: number;
}

export interface Unidad {
  id: number;
  numero: string;
  tipo: string;
  area: number;
  propietario?: string;
}

export interface Reserva {
  id: number;
  area_comun_id: number;
  residente_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  observaciones?: string;
}

export interface AreaComun {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  disponible: boolean;
  precio_hora?: number;
}

// Tipos de finanzas
export interface CuotaMensual {
  id: number;
  mes: number;
  año: number;
  monto: number;
  descripcion: string;
}

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
}

export interface Multa {
  id: number;
  residente_id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  pagada: boolean;
}

// Tipos de eventos
export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  tipo: string;
}

// Tipos de comunicados
export interface Comunicado {
  id: number;
  titulo: string;
  contenido: string;
  fecha_publicacion: string;
  autor: string;
  importante: boolean;
}

// Tipos de vehículos
export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  residente_id: number;
}

// Tipos de mascotas
export interface Mascota {
  id: number;
  nombre: string;
  tipo: string;
  raza: string;
  residente_id: number;
}

// Tipos de empleados
export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  cargo: string;
  telefono: string;
  email: string;
}

// Tipos de invitados
export interface Invitado {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  residente_id: number;
  fecha_entrada?: string;
  fecha_salida?: string;
}

// Tipos de estadísticas
export interface DashboardStats {
  financiero?: {
    total_pagos: number;
    total_expensas: number;
    total_gastos: number;
    total_multas: number;
  };
  morosidad?: {
    estadisticas: {
      total_morosidad: number;
      cantidad_morosos: number;
    };
  };
  notificaciones?: Array<{
    id: number;
    mensaje: string;
    leido: boolean;
    fecha: string;
  }>;
}


// Tipos de usuario y autenticación
export interface User {
  id: number;
  username: string;
  email: string;
  rol: string;
  residente_id?: number;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Tipos de API comunes
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T = any> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

// Tipos de componentes
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export interface PublicRouteProps {
  children: React.ReactNode;
}

// Tipos de datos del dominio
export interface Residente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  unidad_id: number;
}

export interface Unidad {
  id: number;
  numero: string;
  tipo: string;
  area: number;
  propietario?: string;
}

export interface Reserva {
  id: number;
  area_comun_id: number;
  residente_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  observaciones?: string;
}

export interface AreaComun {
  id: number;
  nombre: string;
  descripcion: string;
  capacidad: number;
  disponible: boolean;
  precio_hora?: number;
}

// Tipos de finanzas
export interface CuotaMensual {
  id: number;
  mes: number;
  año: number;
  monto: number;
  descripcion: string;
}

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  categoria: string;
}

export interface Multa {
  id: number;
  residente_id: number;
  descripcion: string;
  monto: number;
  fecha: string;
  pagada: boolean;
}

// Tipos de eventos
export interface Evento {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  tipo: string;
}

// Tipos de comunicados
export interface Comunicado {
  id: number;
  titulo: string;
  contenido: string;
  fecha_publicacion: string;
  autor: string;
  importante: boolean;
}

// Tipos de vehículos
export interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  color: string;
  residente_id: number;
}

// Tipos de mascotas
export interface Mascota {
  id: number;
  nombre: string;
  tipo: string;
  raza: string;
  residente_id: number;
}

// Tipos de empleados
export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  cargo: string;
  telefono: string;
  email: string;
}

// Tipos de invitados
export interface Invitado {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  residente_id: number;
  fecha_entrada?: string;
  fecha_salida?: string;
}

// Tipos de estadísticas
export interface DashboardStats {
  financiero?: {
    total_pagos: number;
    total_expensas: number;
    total_gastos: number;
    total_multas: number;
  };
  morosidad?: {
    estadisticas: {
      total_morosidad: number;
      cantidad_morosos: number;
    };
  };
  notificaciones?: Array<{
    id: number;
    mensaje: string;
    leido: boolean;
    fecha: string;
  }>;
}
