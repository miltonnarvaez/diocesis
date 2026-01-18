# Diagnóstico: Página de Noticias No Carga Datos

## 🔍 Problema
La página de noticias (`https://camsoft.com.co/concejoguachucal/noticias`) no está mostrando datos de la base de datos.

## 📋 Checklist de Diagnóstico

### 1. Verificar que el Backend está Corriendo

```bash
# En el servidor
pm2 status

# Ver logs del backend
pm2 logs concejo-backend --lines 50

# Si no está corriendo, iniciarlo
cd /var/www/concejoguachucal/server
pm2 start index.js --name concejo-backend
```

### 2. Verificar que el Endpoint Responde

```bash
# Desde el servidor
curl http://localhost:5000/api/noticias

# O desde tu máquina local (si tienes acceso)
curl https://camsoft.com.co/concejoguachucal/api/noticias
```

**Respuesta esperada:** Debería devolver un array JSON con las noticias o un array vacío `[]`.

### 3. Verificar la Conexión a la Base de Datos

```bash
# Verificar que MySQL está corriendo
sudo systemctl status mysql

# Si no está corriendo
sudo systemctl start mysql

# Verificar conexión desde Node.js
cd /var/www/concejoguachucal/server
node -e "require('./config/database').getConnection().then(() => console.log('✅ Conectado')).catch(e => console.error('❌ Error:', e.message))"
```

### 4. Verificar que Existen Noticias en la Base de Datos

```bash
# Conectarse a MySQL
mysql -u root -p

# Usar la base de datos
USE concejo_guachucal;

# Ver todas las noticias
SELECT id, titulo, publicada, fecha_publicacion FROM noticias;

# Ver solo noticias publicadas
SELECT id, titulo, publicada, fecha_publicacion FROM noticias WHERE publicada = TRUE;
```

### 5. Verificar la Configuración de la API en el Frontend

El frontend está configurado para usar:
- **Desarrollo**: `http://localhost:5000/api`
- **Producción**: `/concejoguachucal/api`

Verifica en la consola del navegador (F12 → Network) qué URL está intentando usar.

### 6. Verificar Errores en la Consola del Navegador

1. Abre `https://camsoft.com.co/concejoguachucal/noticias`
2. Presiona `F12` para abrir las herramientas de desarrollador
3. Ve a la pestaña **Console** y busca errores
4. Ve a la pestaña **Network** y busca la petición a `/api/noticias`
   - ¿Qué código de estado devuelve? (200, 404, 500, etc.)
   - ¿Qué respuesta devuelve?

### 7. Verificar la Configuración de Nginx

```bash
# Verificar configuración de Nginx
sudo nginx -t

# Ver la configuración del sitio
sudo cat /etc/nginx/sites-available/concejoguachucal
# o el archivo de configuración que uses

# Verificar que el proxy_pass está configurado correctamente
# Debería tener algo como:
# location /concejoguachucal/api {
#   proxy_pass http://localhost:5000/api;
# }
```

### 8. Verificar Variables de Entorno del Servidor

```bash
cd /var/www/concejoguachucal/server
cat .env

# Verificar que tenga:
# DB_HOST=localhost (o la IP correcta)
# DB_USER=root (o el usuario correcto)
# DB_PASSWORD=tu_password
# DB_NAME=concejo_guachucal
```

## 🛠️ Soluciones Comunes

### Problema 1: Backend no está corriendo
```bash
cd /var/www/concejoguachucal/server
pm2 restart concejo-backend
# o
pm2 start index.js --name concejo-backend
```

### Problema 2: MySQL no está corriendo
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Problema 3: No hay noticias en la base de datos
- Accede al panel de administración: `https://camsoft.com.co/concejoguachucal/admin/noticias`
- Crea algunas noticias de prueba
- Asegúrate de marcarlas como "publicadas"

### Problema 4: Error de conexión a la base de datos
- Verifica las credenciales en `server/.env`
- Verifica que la base de datos existe: `SHOW DATABASES;`
- Verifica que la tabla existe: `SHOW TABLES;`

### Problema 5: Error de CORS o Proxy
- Verifica la configuración de Nginx
- Verifica que el proxy_pass esté configurado correctamente
- Recarga Nginx: `sudo systemctl reload nginx`

## 📝 Comandos de Diagnóstico Rápido

```bash
# Todo en uno - diagnóstico completo
cd /var/www/concejoguachucal/server && \
echo "=== Estado PM2 ===" && \
pm2 status && \
echo -e "\n=== Logs Backend (últimas 20 líneas) ===" && \
pm2 logs concejo-backend --lines 20 --nostream && \
echo -e "\n=== Test Endpoint ===" && \
curl -s http://localhost:5000/api/noticias | head -c 200 && \
echo -e "\n\n=== Estado MySQL ===" && \
sudo systemctl status mysql --no-pager -l
```

## 🔗 URLs para Verificar

1. **API Root**: `https://camsoft.com.co/concejoguachucal/api`
   - Debería devolver: `{"message":"API del Concejo Municipal de Guachucal",...}`

2. **Noticias API**: `https://camsoft.com.co/concejoguachucal/api/noticias`
   - Debería devolver: `[]` o un array de noticias

3. **Página de Noticias**: `https://camsoft.com.co/concejoguachucal/noticias`
   - Debería mostrar las noticias o "No se encontraron noticias"
