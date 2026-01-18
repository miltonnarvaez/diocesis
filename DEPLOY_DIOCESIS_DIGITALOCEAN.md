# 🚀 Guía de Despliegue - Diócesis de Ipiales en DigitalOcean Droplet

Esta guía está basada en el despliegue exitoso del proyecto del Concejo de Guachucal, adaptada para la Diócesis de Ipiales.

## 📋 PREREQUISITOS

- Droplet de DigitalOcean configurado
- Acceso SSH al servidor
- Dominio configurado (opcional pero recomendado)
- Git instalado en el servidor

---

## 🔧 PASO 1: CONECTARSE AL SERVIDOR

```bash
ssh root@TU_IP_DEL_DROPLET
# o si usas un usuario específico:
ssh usuario@TU_IP_DEL_DROPLET
```

---

## 📦 PASO 2: INSTALAR DEPENDENCIAS DEL SISTEMA

```bash
# Actualizar sistema
sudo apt update
sudo apt upgrade -y

# Instalar Git (si no está instalado)
sudo apt install git -y

# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version

# Instalar MySQL
sudo apt install mysql-server -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar PM2 globalmente
sudo npm install -g pm2
```

---

## 📁 PASO 3: CLONAR O CREAR EL DIRECTORIO DEL PROYECTO

### Opción A: Si usas Git

```bash
cd /var/www
git clone https://github.com/TU_USUARIO/diocesis.git
cd diocesis
```

### Opción B: Si subes archivos manualmente

```bash
cd /var/www
sudo mkdir -p diocesis
cd diocesis
# Aquí subirás todos los archivos del proyecto
```

---

## 📥 PASO 4: INSTALAR DEPENDENCIAS DEL PROYECTO

```bash
# Instalar dependencias del servidor
cd /var/www/diocesis/server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
```

---

## ⚙️ PASO 5: CONFIGURAR VARIABLES DE ENTORNO

```bash
cd /var/www/diocesis/server
nano .env
```

Agregar las siguientes variables (ajustar según tu configuración):

```env
PORT=5001
DB_HOST=localhost
DB_USER=diocesis_user
DB_PASSWORD=tu_password_segura
DB_NAME=diocesis
JWT_SECRET=tu_secret_key_muy_segura_y_larga_minimo_32_caracteres
JWT_EXPIRE=7d
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
SMTP_FROM=noreply@diocesisdeipiales.org
```

**⚠️ IMPORTANTE:**
- Cambiar `JWT_SECRET` por una clave segura y única
- Cambiar `DB_PASSWORD` por una contraseña segura
- Configurar `FRONTEND_URL` con tu dominio real

---

## 🗄️ PASO 6: CONFIGURAR BASE DE DATOS MYSQL

```bash
# Configurar MySQL (solo la primera vez)
sudo mysql_secure_installation

# Crear base de datos y usuario
sudo mysql -u root -p
```

En MySQL ejecutar:

```sql
CREATE DATABASE IF NOT EXISTS diocesis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'diocesis_user'@'localhost' IDENTIFIED BY 'tu_password_segura';
GRANT ALL PRIVILEGES ON diocesis.* TO 'diocesis_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Ejecutar Scripts SQL

```bash
cd /var/www/diocesis/database

# Script principal
sudo mysql -u diocesis_user -p diocesis < schema.sql

# Script de módulos nuevos
sudo mysql -u diocesis_user -p diocesis < modulos_nuevos.sql

# Otros scripts si existen
# sudo mysql -u diocesis_user -p diocesis < initial_data.sql
```

---

## 👤 PASO 7: CREAR USUARIO ADMINISTRADOR

```bash
cd /var/www/diocesis/server
node scripts/crear-admin-diocesis.js
```

O manualmente en MySQL:

```sql
USE diocesis;
INSERT INTO usuarios (nombre, email, password, rol, activo) 
VALUES (
  'Administrador',
  'admin@diocesisdeipiales.org',
  '$2a$10$TuHashGeneradoAqui',
  'admin',
  TRUE
);
```

---

## 🏗️ PASO 8: CONSTRUIR EL FRONTEND

### Opción A: Build en el Servidor

```bash
cd /var/www/diocesis/client
npm run build
```

**Si el build falla por falta de memoria:**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Opción B: Build Local y Subir (Recomendado)

**En tu máquina local (Windows):**

```bash
cd client
npm run build
```

**Luego subir la carpeta build al servidor:**

```bash
# Usando SCP (desde Git Bash o WSL)
scp -r client/build/* usuario@TU_IP:/var/www/diocesis/client/build/

# O usando rsync (mejor para actualizaciones)
rsync -avz --delete client/build/ usuario@TU_IP:/var/www/diocesis/client/build/
```

**Configurar permisos en el servidor:**
```bash
sudo chown -R www-data:www-data /var/www/diocesis/client/build
sudo chmod -R 755 /var/www/diocesis/client/build
```

---

## 🌐 PASO 9: CONFIGURAR NGINX

```bash
sudo nano /etc/nginx/sites-available/diocesis
```

**Configuración de Nginx para Diócesis:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Frontend (React)
    location / {
        root /var/www/diocesis/client/build;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Archivos estáticos (uploads)
    location /uploads {
        alias /var/www/diocesis/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Imágenes del proyecto
    location /diocesis/images {
        alias /var/www/diocesis/client/build/images;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;
}
```

**Activar configuración:**

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/diocesis /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

**Si ya existe el sitio del concejo, asegúrate de que ambos puedan coexistir:**

```bash
# Verificar que ambos sitios están habilitados
ls -la /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t
```

---

## 🔄 PASO 10: CONFIGURAR PM2 PARA EL BACKEND

```bash
cd /var/www/diocesis/server

# Crear archivo ecosystem.config.js
nano ecosystem.config.js
```

**Contenido de ecosystem.config.js:**

```javascript
module.exports = {
  apps: [{
    name: 'diocesis-api',
    script: './index.js',
    cwd: '/var/www/diocesis/server',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

**Iniciar con PM2:**

```bash
# Crear carpeta de logs
mkdir -p /var/www/diocesis/server/logs

# Iniciar aplicación
pm2 start ecosystem.config.js

# Guardar configuración para auto-inicio
pm2 save

# Configurar PM2 para iniciar al arrancar el sistema
pm2 startup
# (Seguir las instrucciones que aparezcan)
```

**Comandos útiles de PM2:**

```bash
# Ver estado
pm2 list

# Ver logs
pm2 logs diocesis-api

# Reiniciar
pm2 restart diocesis-api

# Detener
pm2 stop diocesis-api

# Eliminar
pm2 delete diocesis-api
```

---

## 🔒 PASO 11: CONFIGURAR SSL/HTTPS (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

El certificado se renovará automáticamente cada 90 días.

---

## 📁 PASO 12: CONFIGURAR PERMISOS Y CARPETAS

```bash
# Crear carpetas de uploads
sudo mkdir -p /var/www/diocesis/server/uploads/{documents,galeria,images,repositorio-temporal}

# Configurar permisos
sudo chown -R www-data:www-data /var/www/diocesis
sudo chmod -R 755 /var/www/diocesis
sudo chmod -R 775 /var/www/diocesis/server/uploads
```

---

## ✅ PASO 13: VERIFICAR DESPLIEGUE

### Verificar que el servidor backend está corriendo:

```bash
# Ver procesos PM2
pm2 list

# Ver logs
pm2 logs diocesis-api

# Probar API localmente
curl http://localhost:5001/api/health
```

### Verificar Nginx:

```bash
# Verificar estado
sudo systemctl status nginx

# Ver logs de error
sudo tail -f /var/log/nginx/error.log

# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log
```

### Verificar desde el navegador:

1. Visita: `http://TU_IP` o `https://tu-dominio.com`
2. Verifica que la página carga correctamente
3. Prueba hacer login en `/admin/login`
4. Verifica que las imágenes se cargan
5. Prueba crear una noticia desde el admin

---

## 🔄 PASO 14: SCRIPT DE ACTUALIZACIÓN

Crear script para actualizar fácilmente:

```bash
nano /var/www/diocesis/update.sh
```

**Contenido:**

```bash
#!/bin/bash

echo "🔄 Actualizando Diócesis de Ipiales..."

# Ir al directorio del proyecto
cd /var/www/diocesis

# Actualizar código desde Git (si usas Git)
# git pull origin main

# Instalar dependencias del servidor
echo "📦 Instalando dependencias del servidor..."
cd server
npm install --production

# Instalar dependencias del cliente
echo "📦 Instalando dependencias del cliente..."
cd ../client
npm install

# Construir frontend
echo "🏗️ Construyendo frontend..."
npm run build

# Reiniciar servidor backend
echo "🔄 Reiniciando servidor backend..."
pm2 restart diocesis-api

# Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx

echo "✅ Actualización completada!"
```

**Hacer ejecutable:**

```bash
chmod +x /var/www/diocesis/update.sh
```

**Usar el script:**

```bash
cd /var/www/diocesis
./update.sh
```

---

## 📝 PASO 15: CONFIGURACIÓN ADICIONAL

### Configurar Backups Automáticos de Base de Datos

```bash
# Crear script de backup
nano /var/www/diocesis/backup-db.sh
```

**Contenido:**

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/diocesis"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mysqldump -u diocesis_user -p'tu_password' diocesis > $BACKUP_DIR/diocesis_$DATE.sql

# Eliminar backups más antiguos de 30 días
find $BACKUP_DIR -name "diocesis_*.sql" -mtime +30 -delete

echo "✅ Backup creado: diocesis_$DATE.sql"
```

**Agregar a crontab (backup diario a las 2 AM):**

```bash
crontab -e
```

Agregar:
```
0 2 * * * /var/www/diocesis/backup-db.sh
```

---

## 🔍 VERIFICACIÓN FINAL

### Checklist de Verificación:

- [ ] ✅ Servidor backend corriendo (PM2)
- [ ] ✅ Nginx configurado y corriendo
- [ ] ✅ Base de datos conectada
- [ ] ✅ Frontend construido y accesible
- [ ] ✅ SSL/HTTPS configurado (si aplica)
- [ ] ✅ Login de admin funciona
- [ ] ✅ Subida de archivos funciona
- [ ] ✅ Todas las rutas principales funcionan
- [ ] ✅ Logs sin errores críticos

### Comandos de Verificación:

```bash
# Verificar PM2
pm2 list
pm2 logs diocesis-api --lines 50

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx

# Verificar MySQL
sudo systemctl status mysql
mysql -u diocesis_user -p diocesis -e "SHOW TABLES;"

# Verificar puertos
sudo netstat -tulpn | grep -E '5001|80|443'

# Verificar espacio en disco
df -h
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS COMUNES

### El servidor no responde

```bash
# Verificar que PM2 está corriendo
pm2 list

# Ver logs
pm2 logs diocesis-api

# Reiniciar
pm2 restart diocesis-api
```

### Error 502 Bad Gateway

```bash
# Verificar que el backend está corriendo en el puerto correcto
curl http://localhost:5001/api/health

# Verificar configuración de Nginx
sudo nginx -t

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### Error de conexión a MySQL

```bash
# Verificar que MySQL está corriendo
sudo systemctl status mysql

# Probar conexión
mysql -u diocesis_user -p diocesis

# Verificar variables en .env
cat /var/www/diocesis/server/.env | grep DB_
```

### Las imágenes no se cargan

```bash
# Verificar permisos
ls -la /var/www/diocesis/client/build/images/

# Verificar configuración de Nginx para imágenes
sudo nginx -t

# Verificar que las imágenes están en el build
ls -la /var/www/diocesis/client/build/images/
```

---

## 📞 ESTRUCTURA FINAL DEL SERVIDOR

```
/var/www/
├── concejoguachucal/          # Proyecto del Concejo (existente)
│   ├── client/
│   ├── server/
│   └── ...
└── diocesis/                  # Proyecto de la Diócesis (nuevo)
    ├── client/
    │   └── build/            # Frontend compilado
    ├── server/
    │   ├── index.js
    │   ├── .env
    │   ├── uploads/
    │   └── ...
    ├── database/
    └── update.sh
```

---

## 🎯 RESUMEN DE COMANDOS RÁPIDOS

```bash
# Conectarse al servidor
ssh usuario@TU_IP

# Ir al proyecto
cd /var/www/diocesis

# Actualizar código (si usas Git)
git pull origin main

# Reiniciar backend
pm2 restart diocesis-api

# Ver logs
pm2 logs diocesis-api

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver estado de servicios
pm2 list
sudo systemctl status nginx
sudo systemctl status mysql
```

---

## 📚 ARCHIVOS DE REFERENCIA

- `CHECKLIST_PRE_DEPLOY.md` - Checklist completo antes del deploy
- `server/scripts/verificar-pre-deploy.js` - Script de verificación
- `database/modulos_nuevos.sql` - Script SQL con todos los módulos nuevos

---

## ✅ LISTO PARA PRODUCCIÓN

Una vez completados todos los pasos, tu sitio de la Diócesis de Ipiales estará disponible en:
- `http://TU_IP` (sin SSL)
- `https://tu-dominio.com` (con SSL)

¡Éxito con el despliegue! 🎉
