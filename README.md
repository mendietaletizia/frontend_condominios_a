# Sistema de Gestión de Condominio - Frontend

Este es el frontend del sistema de gestión de condominio desarrollado en React con Vite.

## Características Implementadas

### Autenticación (CU1, CU2)
- ✅ Inicio de sesión con validación de credenciales
- ✅ Cierre de sesión seguro
- ✅ Manejo de tokens de autenticación
- ✅ Redirección automática según rol de usuario

### Gestión de Usuarios (CU3, CU4, CU5, CU13)
- ✅ CRUD completo de usuarios
- ✅ Gestión de roles y permisos
- ✅ Gestión de residentes e inquilinos
- ✅ Gestión de empleados
- ✅ Filtros por rol de usuario

### Gestión de Comunidad (CU6, CU11, CU12, CU17)
- ✅ Gestión de unidades habitacionales
- ✅ Eventos comunitarios
- ✅ Comunicados y noticias
- ✅ Asambleas vecinales

### Gestión de Finanzas (CU18)
- ✅ Gestión de pagos
- ✅ Control de expensas
- ✅ Filtros por usuario (residentes ven solo sus pagos)

### Gestión de Economía (CU8, CU9, CU19, CU20)
- ✅ Gestión de gastos del condominio
- ✅ Gestión de multas y sanciones
- ✅ Reportes y analítica
- ✅ Analítica predictiva de morosidad

### Gestión de Mantenimiento (CU10)
- ✅ Gestión de áreas comunes
- ✅ Sistema de reservas
- ✅ Control de mantenimiento

## Tecnologías Utilizadas

- **React 19.1.1** - Framework principal
- **React Router DOM 7.9.1** - Sistema de rutas
- **Vite** - Herramienta de construcción
- **Axios** - Cliente HTTP para API
- **CSS3** - Estilos personalizados
- **Context API** - Manejo de estado global

## Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Las dependencias ya están incluidas en package.json:**
   - react-router-dom para el sistema de rutas
   - axios para comunicación con la API

3. **Configurar la URL del backend:**
   - Editar `src/api/config.js`
   - Cambiar `API_BASE_URL` por la URL de tu backend Django

4. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

## Estructura del Proyecto

```
src/
├── api/
│   └── config.js              # Configuración de Axios
├── contexts/
│   └── AuthContext.jsx        # Contexto de autenticación
├── routers/
│   └── AppRouter.jsx          # Configuración de rutas
├── components/
│   ├── Layout.jsx             # Layout principal con sidebar
│   ├── Sidebar.jsx            # Navegación lateral
│   ├── Dashboard.jsx          # Panel principal
│   └── *.css                  # Estilos de componentes
├── autenticacion/
│   ├── IniciarSesion.jsx      # Componente de login
│   ├── CerrarSesion.jsx       # Componente de logout
│   └── *.css                  # Estilos de autenticación
├── usuarios/
│   ├── ListaUsuarios.jsx      # Gestión de usuarios
│   ├── ListaResidentes.jsx    # Gestión de residentes
│   ├── ListaRoles.jsx         # Gestión de roles
│   └── *.css                  # Estilos de usuarios
├── comunidad/
│   ├── ListaUnidades.jsx      # Gestión de unidades
│   └── *.css                  # Estilos de comunidad
├── economia/
│   ├── ListaGastos.jsx        # Gestión de gastos
│   ├── ListaMultas.jsx        # Gestión de multas
│   └── *.css                  # Estilos de economía
├── finanzas/
│   ├── ListaPagos.jsx         # Gestión de pagos
│   └── *.css                  # Estilos de finanzas
├── App.jsx                    # Componente principal
├── App.css                    # Estilos globales
└── main.tsx                   # Punto de entrada
```

## Roles y Permisos

### Administrador
- Acceso completo a todas las funcionalidades
- Puede crear, editar y eliminar registros
- Ve todas las estadísticas y reportes

### Residente
- Acceso a su información personal
- Ve solo sus pagos y notificaciones
- Puede reservar áreas comunes
- Puede ver eventos y comunicados

### Empleado
- Acceso según su cargo específico
- Puede gestionar mantenimiento
- Acceso limitado a información

### Seguridad
- Control de acceso vehicular
- Gestión de visitas
- Acceso a cámaras y sistemas de seguridad

## Funcionalidades por Módulo

### Dashboard
- Estadísticas generales del condominio
- Resumen de pagos y gastos
- Análisis de morosidad
- Notificaciones importantes

### Gestión de Usuarios
- CRUD de usuarios del sistema
- Asignación de roles y permisos
- Gestión de residentes e inquilinos
- Control de empleados

### Gestión de Comunidad
- Registro de unidades habitacionales
- Asociación de residentes a unidades
- Eventos y comunicados
- Actas de asambleas

### Gestión Financiera
- Control de pagos y expensas
- Gestión de gastos del condominio
- Aplicación de multas
- Reportes financieros

### Gestión de Mantenimiento
- Control de áreas comunes
- Sistema de reservas
- Programación de mantenimiento
- Bitácoras de trabajo

## Sistema de Rutas

El proyecto utiliza React Router DOM para el manejo de rutas con las siguientes características:

### Rutas Públicas
- `/login` - Página de inicio de sesión

### Rutas Protegidas
- `/` - Redirige a `/dashboard`
- `/dashboard` - Dashboard principal (accesible para todos los usuarios autenticados)
- `/usuarios` - Gestión de usuarios (solo administradores)
- `/residentes` - Gestión de residentes (solo administradores)
- `/roles` - Gestión de roles y permisos (solo administradores)
- `/unidades` - Gestión de unidades habitacionales (solo administradores)
- `/gastos` - Gestión de gastos (solo administradores)
- `/multas` - Gestión de multas (solo administradores)
- `/pagos` - Gestión de pagos (administradores y residentes)
- `/residente` - Dashboard de residente
- `/empleado` - Dashboard de empleado
- `/seguridad` - Dashboard de seguridad

### Características del Sistema de Rutas
- **Rutas Protegidas**: Verificación de autenticación automática
- **Control de Permisos**: Redirección según rol de usuario
- **Layout Compartido**: Sidebar y header consistentes
- **Navegación Programática**: Uso de `useNavigate` hook
- **Rutas Anidadas**: Layout principal con rutas hijas

## API Endpoints Utilizados

- `POST /autenticacion/login/` - Inicio de sesión
- `POST /autenticacion/logout/` - Cierre de sesión
- `GET /usuarios/usuario/` - Lista de usuarios
- `GET /usuarios/persona/` - Lista de residentes
- `GET /usuarios/roles/` - Lista de roles
- `GET /comunidad/unidad/` - Lista de unidades
- `GET /finanzas/pago/` - Lista de pagos
- `GET /economia/gastos/` - Lista de gastos
- `GET /economia/multa/` - Lista de multas
- `GET /economia/reporte/resumen_financiero/` - Reportes
- `GET /economia/morosidad/predecir_morosidad/` - Análisis de morosidad

## Características de Seguridad

- Autenticación basada en tokens
- Interceptores de Axios para manejo automático de tokens
- Redirección automática en caso de token expirado
- Validación de permisos por rol en cada componente
- Filtrado de datos según el rol del usuario

## Responsive Design

- Diseño adaptable a dispositivos móviles
- Sidebar colapsable en pantallas pequeñas
- Tablas con scroll horizontal en móviles
- Formularios optimizados para touch

## Próximas Mejoras

- [ ] Implementar React Router para navegación SPA
- [ ] Agregar validación de formularios con librerías especializadas
- [ ] Implementar notificaciones push
- [ ] Agregar gráficos y visualizaciones de datos
- [ ] Implementar sistema de notificaciones en tiempo real
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar PWA (Progressive Web App)

## Notas de Desarrollo

- Todos los componentes están desarrollados en JSX
- Se utiliza Context API para el manejo de estado global
- Los estilos están organizados por módulo
- Se implementó un sistema de permisos granular
- La interfaz es completamente responsive
- Se mantiene consistencia en el diseño y UX

## Soporte

Para soporte técnico o consultas sobre el desarrollo, contactar al equipo de desarrollo.