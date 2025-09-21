# Instrucciones para Iniciar Sesión

## 🚀 Pasos para Probar el Sistema

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
El frontend estará disponible en: `http://localhost:5173`

### 3. Crear Datos de Prueba (Solo la primera vez)
```bash
cd backend_condominio_a
python manage.py crear_datos_prueba
```

### 4. Usuarios de Prueba Disponibles

#### 👨‍💼 Administrador
- **Usuario:** `jael`
- **Contraseña:** `password123`
- **Acceso:** Completo al sistema

#### 👨‍👩‍👧‍👦 Residentes
- **Usuario:** `residente1`
- **Contraseña:** `password123`
- **Acceso:** Solo sus pagos y dashboard

- **Usuario:** `residente2`
- **Contraseña:** `password123`
- **Acceso:** Solo sus pagos y dashboard

- **Usuario:** `residente3`
- **Contraseña:** `password123`
- **Acceso:** Solo sus pagos y dashboard

## 🔧 Solución de Problemas

### Error de Conexión
Si ves errores de conexión:

1. **Verificar que el backend esté corriendo:**
   - Abrir `http://localhost:8000/admin/` en el navegador
   - Debe mostrar la página de admin de Django

2. **Verificar la URL de la API:**
   - El frontend está configurado para usar `http://localhost:8000/api`
   - Si tu backend corre en otro puerto, editar `src/api/config.js`

3. **Verificar CORS:**
   - El backend debe tener CORS configurado para permitir `http://localhost:5173`

### Error de Autenticación
Si el login falla:

1. **Verificar que los datos de prueba estén creados:**
   ```bash
   cd backend_condominio_a
   python manage.py crear_datos_prueba
   ```

2. **Verificar en la consola del navegador:**
   - Abrir DevTools (F12)
   - Ir a la pestaña Console
   - Ver los logs de la petición de login

3. **Verificar en la consola del backend:**
   - Ver los logs del servidor Django
   - Verificar que las peticiones lleguen correctamente

## 📱 Funcionalidades por Rol

### Administrador (jael)
- ✅ Dashboard completo
- ✅ Gestión de usuarios
- ✅ Gestión de residentes
- ✅ Gestión de roles y permisos
- ✅ Gestión de unidades habitacionales
- ✅ Gestión de gastos
- ✅ Gestión de multas
- ✅ Gestión de pagos

### Residente (residente1, residente2, residente3)
- ✅ Dashboard personal
- ✅ Ver sus pagos
- ❌ No puede acceder a gestión administrativa

## 🎯 Próximos Pasos

1. **Probar el login** con los usuarios de prueba
2. **Verificar la navegación** entre diferentes secciones
3. **Probar las funcionalidades CRUD** en cada módulo
4. **Verificar el control de permisos** por rol

## 📞 Soporte

Si tienes problemas:
1. Revisar la consola del navegador (F12)
2. Revisar los logs del backend
3. Verificar que ambos servidores estén corriendo
4. Verificar que los datos de prueba estén creados
