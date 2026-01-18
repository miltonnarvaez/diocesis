# Solución: Servidor No Responde - Diagnóstico Completo

## 🔍 Problema
El servidor no está respondiendo a las peticiones de la API, específicamente `/api/noticias`.

## 📋 Checklist de Diagnóstico (Ejecutar en el Servidor)

### 1. Verificar que el Backend está Corriendo

```bash
# Ver estado de PM2
pm2 status

# Si no está corriendo o está en error:
cd /var/www/concejoguachual/server
pm2 restart concejo-backend

# Ver logs detallados
pm2 logs concejo-backend --lines 50
```

**Si PM2 no está instalado o el proceso no existe:**
```bash
cd /var/www/concejoguachual/server
npm install
node index.js
# Deberías ver: "🚀 Servidor corriendo en http://localhost:5000"
```

### 2. Verificar que el Puerto 5000 está Escuchando

```bash
# Verificar qué está usando el puerto 5000
sudo netstat -tulpn | grep 5000
# o
sudo ss -tulpn | grep 5000
# o
sudo lsof -i :5000
```

**Deberías ver algo como:**
```
tcp  0  0 127.0.0.1:5000  0.0.0.0:*  LISTEN  12345/node
```

### 3. Probar el Endpoint Localmente

```bash
# Desde el servidor, probar directamente
curl http://localhost:5000/api/noticias

# Debería devolver JSON (array vacío [] o con noticias)
```

**Si devuelve error de conexión:**
- El servidor Node.js no está corriendo
- El puerto está bloqueado por firewall
- Hay un error en el código del servidor

### 4. Verificar la Configuración de Nginx

```bash
# Ver la configuración actual de Nginx
sudo cat /etc/nginx/sites-available/milton
# o el archivo que uses (podría ser default, concejoguachucal, etc.)

# Verificar que la configuración es válida
sudo nginx -t
```

**La configuración debe tener:**
```nginx
location /concejoguachucal/api {
    rewrite ^/concejoguachucal/api/(.*) /api/$1 break;
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 5. Verificar Logs de Nginx

```bash
# Ver logs de errores
sudo tail -f /var/log/nginx/error.log

# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Si hay logs específicos del sitio
sudo tail -f /var/log/nginx/milton_error.log
```

**Busca errores como:**
- `connect() failed (111: Connection refused)` → Backend no está corriendo
- `upstream timed out` → Backend está lento o no responde
- `502 Bad Gateway` → Problema con proxy_pass

### 6. Verificar Variables de Entorno

```bash
cd /var/www/concejoguachual/server
cat .env

# Debe tener:
# DB_HOST=localhost
# DB_USER=root (o tu usuario)
# DB_PASSWORD=tu_password
# DB_NAME=concejo_guachucal
# PORT=5000 (opcional, por defecto es 5000)
```

### 7. Verificar Conexión a la Base de Datos

```bash
cd /var/www/concejoguachual/server
node -e "
const pool = require('./config/database');
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL');
    conn.release();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
"
```

### 8. Probar el Endpoint desde el Navegador

1. Abre: `https://camsoft.com.co/concejoguachucal/api/noticias`
2. Debería devolver JSON (no HTML de error)

**Si devuelve 404:**
- La configuración de Nginx no está correcta
- El proxy_pass no está funcionando

**Si devuelve 502:**
- El backend no está corriendo
- El puerto 5000 no está accesible

**Si devuelve 500:**
- Hay un error en el código del servidor
- Revisa los logs de PM2

## 🛠️ Soluciones Paso a Paso

### Solución 1: Reiniciar el Backend

```bash
cd /var/www/concejoguachual/server
pm2 restart concejo-backend

# Si no funciona, detener y volver a iniciar
pm2 stop concejo-backend
pm2 start index.js --name concejo-backend
pm2 save
```

### Solución 2: Verificar y Corregir Nginx

```bash
# 1. Ver la configuración actual
sudo cat /etc/nginx/sites-available/milton | grep -A 10 "location.*api"

# 2. Si no tiene la configuración correcta, editarla
sudo nano /etc/nginx/sites-available/milton

# 3. Agregar o corregir esta sección:
location /concejoguachucal/api {
    rewrite ^/concejoguachucal/api/(.*) /api/$1 break;
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# 4. Verificar la configuración
sudo nginx -t

# 5. Recargar Nginx
sudo systemctl reload nginx
```

### Solución 3: Verificar que el Servidor Node.js Inicia Correctamente

```bash
cd /var/www/concejoguachual/server

# Detener PM2 temporalmente
pm2 stop concejo-backend

# Iniciar manualmente para ver errores
node index.js
```

**Deberías ver:**
```
✅ Conectado a MySQL
✅ Ruta /api/repositorio registrada correctamente
🚀 Servidor corriendo en http://localhost:5000
```

**Si hay errores:**
- Revisa los mensajes de error
- Verifica las dependencias: `npm install`
- Verifica las variables de entorno en `.env`

### Solución 4: Verificar Firewall

```bash
# Verificar que el puerto 5000 no está bloqueado localmente
sudo ufw status
sudo iptables -L -n | grep 5000

# Si está bloqueado, permitirlo (solo para localhost, no público)
sudo ufw allow from 127.0.0.1 to any port 5000
```

### Solución 5: Probar Conexión Directa

```bash
# Desde el servidor, probar directamente sin Nginx
curl http://localhost:5000/api/noticias

# Si funciona, el problema es Nginx
# Si no funciona, el problema es el servidor Node.js
```

## 📝 Script de Diagnóstico Completo

```bash
#!/bin/bash
echo "=========================================="
echo "  Diagnóstico Completo del Servidor"
echo "=========================================="

echo -e "\n1. Estado de PM2:"
pm2 status

echo -e "\n2. Puerto 5000:"
sudo netstat -tulpn | grep 5000 || echo "❌ Puerto 5000 no está en uso"

echo -e "\n3. Test endpoint local:"
curl -s http://localhost:5000/api/noticias | head -c 200
echo ""

echo -e "\n4. Logs del backend (últimas 10 líneas):"
pm2 logs concejo-backend --lines 10 --nostream

echo -e "\n5. Configuración de Nginx (proxy API):"
sudo grep -A 5 "location.*api" /etc/nginx/sites-available/* 2>/dev/null

echo -e "\n6. Test de Nginx:"
sudo nginx -t

echo -e "\n7. Estado de MySQL:"
sudo systemctl status mysql --no-pager -l | head -5

echo -e "\n=========================================="
```

## 🔗 URLs para Probar

1. **API Root (desde servidor)**: `curl http://localhost:5000/api`
2. **API Root (desde navegador)**: `https://camsoft.com.co/concejoguachucal/api`
3. **Noticias API (desde servidor)**: `curl http://localhost:5000/api/noticias`
4. **Noticias API (desde navegador)**: `https://camsoft.com.co/concejoguachucal/api/noticias`

## ⚠️ Errores Comunes y Soluciones

### Error: "connect() failed (111: Connection refused)"
**Causa**: El servidor Node.js no está corriendo
**Solución**: 
```bash
cd /var/www/concejoguachual/server
pm2 start index.js --name concejo-backend
```

### Error: "502 Bad Gateway"
**Causa**: Nginx no puede conectar con el backend
**Solución**: 
1. Verificar que el backend está corriendo: `pm2 status`
2. Verificar que el puerto es correcto: `sudo netstat -tulpn | grep 5000`
3. Verificar proxy_pass en Nginx: `sudo grep "proxy_pass" /etc/nginx/sites-available/*`

### Error: "404 Not Found"
**Causa**: La ruta en Nginx no está configurada correctamente
**Solución**: 
1. Verificar que existe `location /concejoguachucal/api` en Nginx
2. Verificar que el rewrite está correcto
3. Recargar Nginx: `sudo systemctl reload nginx`

### Error: "500 Internal Server Error"
**Causa**: Error en el código del servidor o en la base de datos
**Solución**: 
1. Ver logs de PM2: `pm2 logs concejo-backend`
2. Verificar conexión a BD
3. Verificar que las tablas existen
