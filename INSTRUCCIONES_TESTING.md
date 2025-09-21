# 🚀 Instrucciones para Probar el Sistema

## ✅ Problema Solucionado
El error `The requested module '/src/api/config.jsx' does not provide an export named 'api'` ha sido corregido.

## 🔧 Pasos para Probar el Sistema

### 1. Iniciar el Backend
```bash
cd backend_condominio_a
python manage.py runserver
```
El backend estará disponible en: `http://localhost:8000`

### 2. Iniciar el Frontend
```bash
cd frontend_condominio_a
npm run dev
```
El frontend estará disponible en: `http://localhost:5173` (o el puerto que muestre Vite)

### 3. Acceder a la Aplicación
1. Abre tu navegador en `http://localhost:5173`
2. Serás redirigido automáticamente a `/login`

### 4. Probar el Login
**Credenciales de prueba:**
- **Administrador**: `jael` / `password123`
- **Residente**: `residente1` / `password123`

### 5. Funcionalidades de Prueba en el Login
En la página de login encontrarás:
- **Botón "Probar Conexión"**: Verifica si el backend está disponible
- **Botón "Probar Login"**: Prueba el login con credenciales de administrador
- **Botones "Cargar Admin/Residente"**: Rellenan automáticamente los campos

## 🎯 Navegación por Roles

### 👑 Administrador (`jael`)
- **Dashboard**: Estadísticas financieras completas
- **Gestión de Usuarios**: CRUD completo de usuarios
- **Residentes e Inquilinos**: Gestión de residentes
- **Roles y Permisos**: Administración de roles
- **Unidades Habitacionales**: Gestión de unidades
- **Gastos**: Administración de gastos
- **Multas**: Gestión de multas
- **Pagos**: Visualización de todos los pagos

### 🏠 Residente (`residente1`)
- **Mi Dashboard**: Información personal y pagos
- **Mis Pagos**: Solo sus propios pagos

### 👷 Empleado
- **Dashboard**: Panel específico para empleados

### 🛡️ Seguridad
- **Dashboard**: Panel de control de seguridad

## 🔍 Verificación de Funcionamiento

### ✅ Indicadores de Éxito
1. **Página de login se carga** sin errores en consola
2. **Botón "Probar Conexión"** muestra "✅ Conectado"
3. **Login funciona** con las credenciales de prueba
4. **Redirección automática** al dashboard según el rol
5. **Sidebar se muestra** con opciones según permisos
6. **Navegación funciona** entre secciones

### ❌ Si hay Problemas
1. **Verifica la consola del navegador** (F12) para errores
2. **Confirma que el backend esté ejecutándose** en puerto 8000
3. **Verifica que no haya errores** en la terminal del backend
4. **Usa los botones de prueba** en la página de login para diagnosticar

## 🛠️ Estructura del Proyecto

```
frontend_condominio_a/
├── src/
│   ├── api/                 # Conexiones con backend (modular)
│   ├── components/          # Componentes reutilizables
│   ├── contexts/           # Context API (AuthContext)
│   ├── routers/            # React Router (AppRouter)
│   ├── autenticacion/      # Login/Logout
│   ├── usuarios/           # Gestión de usuarios
│   ├── comunidad/          # Gestión de comunidad
│   ├── economia/           # Gestión económica
│   ├── finanzas/           # Gestión financiera
│   └── mantenimiento/      # Gestión de mantenimiento
```

## 🎉 ¡Listo para Usar!
El sistema ahora debería funcionar completamente. Si encuentras algún problema, revisa la consola del navegador y usa los botones de prueba en la página de login.

