# Guía de Configuración Paso a Paso - Droplet DigitalOcean

## Estado Actual ✅
- ✅ Nginx instalado y corriendo
- ✅ Repositorio clonado en `/var/www/concejoguachual`

## Paso 1: Actualizar el Código

```bash
cd /var/www/concejoguachual
git pull origin main
```

## Paso 2: Instalar Node.js (si no está instalado)

```bash
# Verificar si Node.js está instalado
node --version
npm --version

# Si no está instalado:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

## Paso 3: Instalar Dependencias

```bash
cd /var/www/concejoguachual

# Instalar dependencias del servidor
cd server
npm install

# Instalar dependencias del cliente
cd ../client
npm install
```

## Paso 4: Configurar Variables de Entorno

```bash
cd /var/www/concejoguachual/server
nano .env
```

Agregar estas variables (ajusta según tu configuración):
```env
PORT=5000
DB_HOST=localhost
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_NAME=concejo_guachucal
JWT_SECRET=tu_secret_key_muy_segura_y_larga
NODE_ENV=production
```

## Paso 5: Configurar Base de Datos MySQL

```bash
# Instalar MySQL si no está instalado
sudo apt update
sudo apt install mysql-server -y

# Crear base de datos
sudo mysql -u root -p
```

En MySQL ejecutar:
```sql
CREATE DATABASE IF NOT EXISTS concejo_guachucal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'concejo_user'@'localhost' IDENTIFIED BY 'tu_password_segura';
GRANT ALL PRIVILEGES ON concejo_guachucal.* TO 'concejo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Ejecutar scripts SQL:
```bash
cd /var/www/concejoguachual/database
sudo mysql -u concejo_user -p concejo_guachucal < schema.sql
sudo mysql -u concejo_user -p concejo_guachucal < usuarios_permisos.sql
sudo mysql -u concejo_user -p concejo_guachucal < autoridades.sql
sudo mysql -u concejo_user -p concejo_guachucal < galeria_multimedia.sql
sudo mysql -u concejo_user -p concejo_guachucal < encuestas.sql
sudo mysql -u concejo_user -p concejo_guachucal < foros.sql
sudo mysql -u concejo_user -p concejo_guachucal < historia_concejo.sql
sudo mysql -u concejo_user -p concejo_guachucal < tramites.sql
sudo mysql -u concejo_user -p concejo_guachucal < pqrsd.sql
sudo mysql -u concejo_user -p concejo_guachucal < sesiones_concejo.sql
sudo mysql -u concejo_user -p concejo_guachucal < opiniones_proyectos.sql
sudo mysql -u concejo_user -p concejo_guachucal < transparencia_categorias.sql
```

## Paso 6: Construir el Frontend

```bash
cd /var/www/concejoguachual/client
npm run build:prod
```

**Nota:** Si el build falla por falta de memoria, usar:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

Esto aumenta el límite de memoria de Node.js a 4GB para evitar errores durante el proceso de compilación.

Esto creará la carpeta `build` con los archivos estáticos.

## Paso 7: Instalar y Configurar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar el servidor backend
cd /var/www/concejoguachual/server
pm2 start index.js --name concejo-backend

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para iniciar al arrancar el servidor
pm2 startup
# Ejecutar el comando que te muestre (será algo como: sudo env PATH=... pm2 startup systemd -u root --hp /root)
```

## Paso 8: Configurar Nginx

```bash
# Copiar el archivo de configuración
cd /var/www/concejoguachual
sudo cp nginx-concejo.conf /etc/nginx/sites-available/concejo

# Editar la configuración (reemplaza TU_DOMINIO_O_IP)
sudo nano /etc/nginx/sites-available/concejo
```

**En el archivo, reemplaza `TU_DOMINIO_O_IP` con:**
- Tu dominio si tienes uno (ej: `concejo.guachucal.gov.co`)
- O la IP de tu Droplet (ej: `123.456.789.0`)

```bash
# Activar el sitio
sudo ln -s /etc/nginx/sites-available/concejo /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Si todo está bien, reiniciar Nginx
sudo systemctl restart nginx
```

## Paso 9: Configurar Permisos

```bash
# Dar permisos a Nginx para acceder a los archivos
sudo chown -R www-data:www-data /var/www/concejoguachual/client/build
sudo chown -R www-data:www-data /var/www/concejoguachual/server/uploads

# Crear directorio de uploads si no existe
mkdir -p /var/www/concejoguachual/server/uploads
sudo chown -R www-data:www-data /var/www/concejoguachual/server/uploads
```

## Paso 10: Verificar que Todo Funciona

```bash
# Ver estado de PM2
pm2 list
pm2 logs concejo-backend

# Ver estado de Nginx
sudo systemctl status nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/concejo_error.log
```

## Paso 11: Configurar SSL (Opcional pero Recomendado)

Si tienes un dominio:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

## Comandos Útiles

### Reiniciar servicios:
```bash
pm2 restart concejo-backend
sudo systemctl restart nginx
```

### Ver logs:
```bash
pm2 logs concejo-backend
sudo tail -f /var/log/nginx/concejo_error.log
```

### Actualizar código:
```bash
cd /var/www/concejoguachual
git pull origin main
cd client && npm install && npm run build:prod
cd ../server && npm install
pm2 restart concejo-backend
```

**Nota:** Si el build falla por falta de memoria, usar:
```bash
cd client
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```








