# ✅ CHECKLIST PRE-DEPLOY - Diócesis de Ipiales

## 🔐 1. VARIABLES DE ENTORNO Y CONFIGURACIÓN

### Servidor (`server/.env`)
- [ ] **DB_HOST**: IP o hostname del servidor MySQL
- [ ] **DB_USER**: Usuario de MySQL (NO usar 'root' en producción)
- [ ] **DB_PASSWORD**: Contraseña segura de MySQL
- [ ] **DB_NAME**: Nombre de la base de datos (diocesis)
- [ ] **JWT_SECRET**: Cambiar por una clave secreta fuerte y única
- [ ] **JWT_EXPIRE**: Tiempo de expiración de tokens (ej: 7d)
- [ ] **PORT**: Puerto del servidor (5001 o el que uses)
- [ ] **NODE_ENV**: Cambiar a `production`
- [ ] **FRONTEND_URL**: URL completa del frontend en producción
- [ ] **SMTP_HOST**: Servidor SMTP para emails
- [ ] **SMTP_PORT**: Puerto SMTP (587 para TLS)
- [ ] **SMTP_USER**: Usuario del servicio de email
- [ ] **SMTP_PASSWORD**: Contraseña del servicio de email
- [ ] **SMTP_FROM**: Email remitente

### Cliente
- [ ] Verificar que `homepage: "/diocesis"` en `client/package.json` coincida con la ruta del servidor
- [ ] Verificar `PUBLIC_URL` si se usa en producción
- [ ] Configurar `REACT_APP_API_URL` si es necesario

## 🗄️ 2. BASE DE DATOS

- [ ] **Crear base de datos** en el servidor MySQL
- [ ] **Ejecutar scripts SQL** en orden:
  - [ ] `database/schema.sql` (estructura base)
  - [ ] `database/initial_data.sql` (si existe)
  - [ ] Verificar que todas las tablas se crearon correctamente
- [ ] **Crear usuario administrador**:
  ```bash
  cd server
  node scripts/crear-admin-diocesis.js
  ```
- [ ] **Verificar conexión** a la base de datos desde el servidor
- [ ] **Backup de la base de datos** antes de cualquier cambio

## 🔒 3. SEGURIDAD

- [ ] **Cambiar JWT_SECRET** por una clave fuerte (mínimo 32 caracteres aleatorios)
- [ ] **Verificar rate limiting** está activo en el servidor
- [ ] **Verificar Helmet** está configurado correctamente
- [ ] **Revisar CORS** - solo permitir el dominio de producción
- [ ] **Verificar permisos de archivos**:
  - [ ] `server/uploads/` debe tener permisos de escritura
  - [ ] `server/temp/` debe tener permisos de escritura
- [ ] **Cambiar credenciales por defecto** de cualquier servicio
- [ ] **Verificar que no hay** información sensible en el código (API keys, passwords)

## 📦 4. BUILD Y OPTIMIZACIÓN

### Cliente
- [ ] **Ejecutar build de producción**:
  ```bash
  cd client
  npm run build
  ```
- [ ] **Verificar que el build se completó** sin errores
- [ ] **Revisar tamaño del build** (optimizar si es muy grande)
- [ ] **Verificar que las imágenes** están en `client/build/images/`
- [ ] **Verificar robots.txt y sitemap.xml** están en `client/build/`

### Servidor
- [ ] **Instalar dependencias de producción**:
  ```bash
  cd server
  npm install --production
  ```
- [ ] **Verificar que no hay dependencias de desarrollo** en producción

## 🌐 5. CONFIGURACIÓN DEL SERVIDOR WEB

### Nginx
- [ ] **Configurar proxy reverso** para el API (puerto 5001)
- [ ] **Configurar servir archivos estáticos** desde `client/build`
- [ ] **Configurar rutas** para `/diocesis` si es necesario
- [ ] **Configurar SSL/HTTPS** con certificado válido
- [ ] **Configurar redirección HTTP → HTTPS**
- [ ] **Verificar headers de seguridad** en Nginx
- [ ] **Configurar compresión gzip** para archivos estáticos
- [ ] **Configurar cache** para archivos estáticos

### PM2 (si usas)
- [ ] **Instalar PM2**: `npm install -g pm2`
- [ ] **Crear archivo ecosystem.config.js**:
  ```javascript
  module.exports = {
    apps: [{
      name: 'diocesis-api',
      script: './server/index.js',
      cwd: '/ruta/completa/al/proyecto',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      instances: 2,
      exec_mode: 'cluster',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }]
  };
  ```
- [ ] **Iniciar con PM2**: `pm2 start ecosystem.config.js`
- [ ] **Configurar auto-restart**: `pm2 startup` y `pm2 save`

## 📧 6. CONFIGURACIÓN DE EMAIL

- [ ] **Configurar servicio de email** (Gmail, SendGrid, etc.)
- [ ] **Probar envío de emails**:
  ```bash
  cd server
  npm run configurar-email
  ```
- [ ] **Verificar que los emails** se envían correctamente
- [ ] **Configurar email de contacto** en el frontend

## 🖼️ 7. IMÁGENES Y ARCHIVOS ESTÁTICOS

- [ ] **Verificar que todas las imágenes** están en `client/public/images/`
- [ ] **Verificar rutas de imágenes** en el código
- [ ] **Optimizar imágenes** grandes (comprimir antes de subir)
- [ ] **Verificar permisos** de las carpetas de uploads:
  - `server/uploads/documents/`
  - `server/uploads/galeria/`
  - `server/uploads/images/`
  - `server/uploads/repositorio-temporal/`

## 🔗 8. ENLACES Y RUTAS

- [ ] **Verificar que todos los enlaces internos** funcionan
- [ ] **Verificar que los enlaces externos** están actualizados
- [ ] **Probar todas las rutas principales**:
  - [ ] `/` (Home)
  - [ ] `/noticias`
  - [ ] `/acerca`
  - [ ] `/contacto`
  - [ ] `/gaceta`
  - [ ] `/agenda`
  - [ ] `/pqrsd`
  - [ ] `/search-profile`
- [ ] **Verificar rutas del admin** (`/admin/*`)
- [ ] **Probar login de administrador**

## 🧪 9. PRUEBAS FINALES

- [ ] **Probar creación de noticia** desde el admin
- [ ] **Probar subida de archivos** (documentos, imágenes)
- [ ] **Probar formulario PQRSD**
- [ ] **Probar búsqueda de perfiles**
- [ ] **Probar en diferentes navegadores** (Chrome, Firefox, Safari, Edge)
- [ ] **Probar en dispositivos móviles**
- [ ] **Verificar que no hay errores** en la consola del navegador
- [ ] **Verificar que no hay errores** en los logs del servidor

## 📝 10. DOCUMENTACIÓN

- [ ] **Documentar credenciales** de acceso (guardar en lugar seguro)
- [ ] **Documentar configuración** del servidor
- [ ] **Documentar rutas importantes** del sistema
- [ ] **Crear manual de usuario** básico (opcional)

## 🚀 11. DEPLOY

### Pasos finales:
1. [ ] **Hacer backup completo** del servidor actual (si existe)
2. [ ] **Subir archivos** al servidor (FTP, SCP, Git, etc.)
3. [ ] **Instalar dependencias** en el servidor
4. [ ] **Configurar variables de entorno** en el servidor
5. [ ] **Ejecutar migraciones** de base de datos
6. [ ] **Iniciar servicios** (PM2, systemd, etc.)
7. [ ] **Verificar que el servidor responde**
8. [ ] **Probar funcionalidades críticas**
9. [ ] **Monitorear logs** durante las primeras horas

## ⚠️ 12. POST-DEPLOY

- [ ] **Configurar monitoreo** (opcional: PM2 monit, logs, etc.)
- [ ] **Configurar backups automáticos** de la base de datos
- [ ] **Configurar alertas** de errores críticos
- [ ] **Documentar URL de producción**
- [ ] **Comunicar a usuarios** que el sistema está disponible

---

## 🔧 COMANDOS ÚTILES

### Verificar conexión a MySQL:
```bash
mysql -h [HOST] -u [USER] -p [DATABASE]
```

### Verificar que el servidor está corriendo:
```bash
curl http://localhost:5001/api/health
```

### Ver logs de PM2:
```bash
pm2 logs diocesis-api
```

### Reiniciar servidor:
```bash
pm2 restart diocesis-api
```

### Verificar procesos:
```bash
pm2 list
```

---

## 📞 CONTACTO Y SOPORTE

Si encuentras problemas durante el deploy, revisa:
1. Logs del servidor (`pm2 logs` o `journalctl`)
2. Logs de Nginx (`/var/log/nginx/error.log`)
3. Logs de MySQL (`/var/log/mysql/error.log`)
4. Consola del navegador (F12)
