# Guía de Despliegue en DigitalOcean Droplet

## Pasos para Sincronizar el Código con tu Droplet

### 1. Conectarse al Droplet via SSH

```bash
ssh root@TU_IP_DEL_DROPLET
# o
ssh usuario@TU_IP_DEL_DROPLET
```

### 2. Instalar Git (si no está instalado)

```bash
sudo apt update
sudo apt install git -y
```

### 3. Clonar el Repositorio

```bash
cd /var/www  # o el directorio donde quieras el proyecto
git clone https://github.com/miltonnarvaez/concejoguachual.git
cd concejoguachual
```

### 4. Instalar Node.js y npm (si no están instalados)

```bash
# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 5. Instalar Dependencias

```bash
# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
```

### 6. Configurar Variables de Entorno

```bash
# Crear archivo .env en el servidor
cd ../server
nano .env
```

Agregar las siguientes variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_NAME=concejo_guachucal
JWT_SECRET=tu_secret_key_muy_segura
NODE_ENV=production
```

### 7. Configurar Base de Datos MySQL

```bash
# Instalar MySQL
sudo apt install mysql-server -y

# Configurar MySQL
sudo mysql_secure_installation

# Crear base de datos
sudo mysql -u root -p
```

En MySQL:
```sql
CREATE DATABASE concejo_guachucal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tu_usuario'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON concejo_guachucal.* TO 'tu_usuario'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Ejecutar scripts SQL:
```bash
cd /var/www/concejoguachual/database
sudo mysql -u tu_usuario -p concejo_guachucal < schema.sql
sudo mysql -u tu_usuario -p concejo_guachucal < usuarios_permisos.sql
# ... ejecutar otros scripts según necesidad
```

### 8. Construir el Frontend

```bash
cd /var/www/concejoguachual/client
npm run build:prod
```

**Nota:** Si el build falla por falta de memoria, usar:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

Esto aumenta el límite de memoria de Node.js a 4GB para evitar errores durante el proceso de compilación.

### 9. Configurar Nginx (Recomendado)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/concejo
```

Configuración de Nginx:
```nginx
server {
    listen 80;
    server_name tu_dominio.com www.tu_dominio.com;

    # Frontend (React)
    location / {
        root /var/www/concejoguachual/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Archivos estáticos
    location /uploads {
        alias /var/www/concejoguachual/server/uploads;
    }
}
```

Activar configuración:
```bash
sudo ln -s /etc/nginx/sites-available/concejo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. Configurar PM2 para el Backend

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar el servidor con PM2
cd /var/www/concejoguachual/server
pm2 start index.js --name concejo-backend
pm2 save
pm2 startup
```

### 11. Configurar SSL con Let's Encrypt (Opcional pero Recomendado)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu_dominio.com -d www.tu_dominio.com
```

### 12. Script de Actualización Automática

Crear script para actualizar desde GitHub:
```bash
nano /var/www/concejoguachual/update.sh
```

Contenido:
```bash
#!/bin/bash
cd /var/www/concejoguachual
git pull origin main
cd server
npm install
cd ../client
npm install
npm run build:prod
pm2 restart concejo-backend
echo "Actualización completada"
```

Hacer ejecutable:
```bash
chmod +x /var/www/concejoguachual/update.sh
```

## Actualizar el Código en el Futuro

Para sincronizar cambios desde GitHub:

```bash
cd /var/www/concejoguachual
git pull origin main
cd client
npm run build
pm2 restart concejo-backend
```

O usar el script:
```bash
/var/www/concejoguachual/update.sh
```

## Configurar Webhook para Auto-Deploy (Opcional)

Puedes configurar un webhook de GitHub para que se actualice automáticamente cuando hagas push.








