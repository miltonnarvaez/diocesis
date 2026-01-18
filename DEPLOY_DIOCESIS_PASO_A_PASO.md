# 🚀 Despliegue Diócesis de Ipiales - Paso a Paso

Esta guía replica exactamente el proceso usado para el Concejo de Guachucal, pero para la Diócesis de Ipiales.

## 📍 ESTRUCTURA EN EL SERVIDOR

```
/var/www/
├── concejoguachucal/    # Proyecto del Concejo (existente)
└── diocesis/           # Proyecto de la Diócesis (nuevo)
```

---

## 🔧 PASO 1: CONECTARSE AL SERVIDOR

```bash
ssh root@TU_IP_DEL_DROPLET
# o
ssh usuario@TU_IP_DEL_DROPLET
```

---

## 📁 PASO 2: CREAR DIRECTORIO Y SUBIR ARCHIVOS

### ⚠️ PRIMERO: Configurar Git y Subir a GitHub

**Antes de clonar en el servidor, necesitas subir el código a GitHub.**

Sigue la guía completa en: **`GUIA_GIT_DIOCESIS.md`**

**Resumen rápido:**

1. **En tu máquina local:**
   ```bash
   cd "C:\Users\Milton Narvaez\Documents\cursor\diocesis"
   git init
   git add .
   git commit -m "Initial commit - Diócesis de Ipiales"
   ```

2. **Crear repositorio en GitHub:**
   - Ve a GitHub.com → New repository
   - Nombre: `diocesis`
   - Crea el repositorio

3. **Conectar y subir:**
   ```bash
   git remote add origin https://github.com/TU_USUARIO/diocesis.git
   git branch -M main
   git push -u origin main
   ```

### Ahora en el servidor, clonar el repositorio:

```bash
cd /var/www

# Si ya creaste el directorio con mkdir, elimínalo primero:
# sudo rmdir diocesis  (si está vacío)
# o
# sudo rm -rf diocesis  (si tiene contenido)

# Clonar el repositorio (Git creará el directorio automáticamente)
git clone https://github.com/TU_USUARIO/diocesis.git
cd diocesis
```

**Si el repositorio es privado**, necesitarás autenticarte con tu Personal Access Token o configurar SSH keys (ver `GUIA_GIT_DIOCESIS.md`).

### Opción Alternativa: Si prefieres subir archivos manualmente (SCP/WinSCP)

```bash
cd /var/www
sudo mkdir -p diocesis
cd diocesis
```

Luego sube todos los archivos del proyecto desde tu máquina local a `/var/www/diocesis/`

---

## 📦 PASO 3: INSTALAR DEPENDENCIAS

```bash
cd /var/www/diocesis

# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
```

---

## ⚙️ PASO 4: CONFIGURAR VARIABLES DE ENTORNO

```bash
cd /var/www/diocesis/server
nano .env
```

**Pegar este contenido (ajustar valores):**

```env
PORT=5001
DB_HOST=localhost
DB_USER=diocesis_user
DB_PASSWORD=tu_password_segura_aqui
DB_NAME=diocesis
JWT_SECRET=tu_secret_key_muy_segura_y_larga_minimo_32_caracteres_aleatorios
JWT_EXPIRE=7d
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
SMTP_FROM=noreply@diocesisdeipiales.org
```

**Guardar:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🗄️ PASO 5: CONFIGURAR BASE DE DATOS MYSQL

```bash
# Crear base de datos y usuario
sudo mysql -u root -p
```

**En MySQL ejecutar:**

```sql
CREATE DATABASE IF NOT EXISTS diocesis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'diocesis_user'@'localhost' IDENTIFIED BY 'tu_password_segura_aqui';
GRANT ALL PRIVILEGES ON diocesis.* TO 'diocesis_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Ejecutar scripts SQL:**

```bash
cd /var/www/diocesis/database

# Script principal
sudo mysql -u diocesis_user -p diocesis < schema.sql

# Script de módulos nuevos
sudo mysql -u diocesis_user -p diocesis < modulos_nuevos.sql
```

---

## 👤 PASO 6: CREAR USUARIO ADMINISTRADOR

```bash
cd /var/www/diocesis/server
node scripts/crear-admin-diocesis.js
```

---

## 🏗️ PASO 7: CONSTRUIR EL FRONTEND

### Opción A: Build en el Servidor

```bash
cd /var/www/diocesis/client
npm run build
```

**Si falla por memoria:**

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Opción B: Build Local y Subir (Recomendado si el servidor tiene poca RAM)

**En tu máquina local:**

```bash
cd client
npm run build
```

**Subir al servidor (desde tu máquina local):**

```bash
# Usando SCP
scp -r client/build/* usuario@TU_IP:/var/www/diocesis/client/build/

# O usando rsync
rsync -avz --delete client/build/ usuario@TU_IP:/var/www/diocesis/client/build/
```

**En el servidor, configurar permisos:**

```bash
sudo chown -R www-data:www-data /var/www/diocesis/client/build
sudo chmod -R 755 /var/www/diocesis/client/build
```

---

## 🔄 PASO 8: CONFIGURAR PM2 PARA EL BACKEND

```bash
cd /var/www/diocesis/server

# Crear archivo ecosystem.config.js
nano ecosystem.config.js
```

**Pegar este contenido:**

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

**Guardar y crear carpeta de logs:**

```bash
mkdir -p logs

# Iniciar con PM2
pm2 start ecosystem.config.js

# Guardar configuración
pm2 save

# Configurar auto-inicio (ejecutar el comando que muestre)
pm2 startup
```

---

## 🌐 PASO 9: CONFIGURAR NGINX

```bash
sudo nano /etc/nginx/sites-available/diocesis
```

**Pegar esta configuración (ajustar dominio/IP):**

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Frontend (React) - Ruta /diocesis
    location /diocesis {
        alias /var/www/diocesis/client/build;
        try_files $uri $uri/ /diocesis/index.html;
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

# Si todo está bien, reiniciar Nginx
sudo systemctl restart nginx
```

---

## 📁 PASO 10: CONFIGURAR PERMISOS Y CARPETAS

```bash
# Crear carpetas de uploads
sudo mkdir -p /var/www/diocesis/server/uploads/{documents,galeria,images,repositorio-temporal}

# Configurar permisos
sudo chown -R www-data:www-data /var/www/diocesis
sudo chmod -R 755 /var/www/diocesis
sudo chmod -R 775 /var/www/diocesis/server/uploads
```

---

## ✅ PASO 11: VERIFICAR QUE TODO FUNCIONA

```bash
# Verificar PM2
pm2 list
pm2 logs diocesis-api --lines 50

# Verificar Nginx
sudo systemctl status nginx
sudo nginx -t

# Probar API localmente
curl http://localhost:5001/api/health

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 🔒 PASO 12: CONFIGURAR SSL (Opcional pero Recomendado)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

---

## 📝 PASO 13: CREAR SCRIPT DE ACTUALIZACIÓN

```bash
nano /var/www/diocesis/update.sh
```

**Pegar este contenido:**

```bash
#!/bin/bash

echo "🔄 Actualizando Diócesis de Ipiales..."

cd /var/www/diocesis

# Actualizar código (si usas Git)
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

---

## 🎯 COMANDOS RÁPIDOS DE REFERENCIA

### Reiniciar servicios:
```bash
pm2 restart diocesis-api
sudo systemctl restart nginx
```

### Ver logs:
```bash
pm2 logs diocesis-api
sudo tail -f /var/log/nginx/error.log
```

### Ver estado:
```bash
pm2 list
sudo systemctl status nginx
sudo systemctl status mysql
```

### Actualizar código:
```bash
cd /var/www/diocesis
./update.sh
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Puerto diferente:** El backend de la diócesis usa el puerto **5001** (el concejo usa 5000)
2. **Ruta diferente:** El frontend se sirve desde `/diocesis` (según `homepage` en `package.json`)
3. **Base de datos separada:** La base de datos se llama `diocesis` (no `concejo_guachucal`)
4. **PM2 separado:** El proceso PM2 se llama `diocesis-api` (no `concejo-backend`)

---

## ✅ VERIFICACIÓN FINAL

1. ✅ Visita: `http://TU_IP/diocesis` o `https://tu-dominio.com/diocesis`
2. ✅ Verifica que la página carga correctamente
3. ✅ Prueba hacer login en `/diocesis/admin/login`
4. ✅ Verifica que las imágenes se cargan
5. ✅ Prueba crear una noticia desde el admin

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Si el servidor no responde:
```bash
pm2 restart diocesis-api
pm2 logs diocesis-api
```

### Si hay error 502:
```bash
# Verificar que el backend está corriendo
curl http://localhost:5001/api/health

# Verificar configuración de Nginx
sudo nginx -t
```

### Si las imágenes no cargan:
```bash
# Verificar permisos
ls -la /var/www/diocesis/client/build/images/

# Verificar configuración de Nginx
sudo nginx -t
```

---

¡Listo! El proyecto de la Diócesis de Ipiales debería estar funcionando en el servidor. 🎉
