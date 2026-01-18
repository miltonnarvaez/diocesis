# Diagnóstico: Página de Noticias No Se Conecta al Servidor

## 🔍 Problema
La página `https://camsoft.com.co/concejoguachucal/noticias` no se conecta al servidor.

## 📋 Checklist de Diagnóstico

### 1. Verificar que el Backend está Corriendo

```bash
pm2 status
pm2 logs concejo-backend --lines 20
```

**Deberías ver:**
```
✅ Conectado a MySQL
🚀 Servidor corriendo en http://localhost:5000
```

### 2. Probar el Endpoint de Noticias Localmente

```bash
# Desde el servidor
curl http://localhost:5000/api/noticias
```

**Debería devolver JSON** (array vacío `[]` o con noticias).

### 3. Probar el Endpoint desde el Navegador

Abre: `https://camsoft.com.co/concejoguachucal/api/noticias`

**Debería devolver JSON**, no HTML de error.

**Si devuelve 404:**
- La configuración de Nginx no está correcta
- El proxy_pass no está funcionando

**Si devuelve 502:**
- El backend no está corriendo
- El puerto 5000 no está accesible

**Si devuelve 500:**
- Hay un error en el código del servidor
- Revisa los logs de PM2

### 4. Verificar la Configuración de Nginx

```bash
sudo cat /etc/nginx/sites-available/milton | grep -A 10 "location.*api"
```

**Debería tener:**
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
sudo tail -f /var/log/nginx/error.log
```

**Busca errores como:**
- `connect() failed (111: Connection refused)` → Backend no está corriendo
- `upstream timed out` → Backend está lento o no responde
- `502 Bad Gateway` → Problema con proxy_pass

### 6. Verificar que la Ruta está Registrada en el Servidor

```bash
cd /var/www/concejoguachual/server
grep -n "noticias" index.js
```

**Deberías ver algo como:**
```javascript
app.use('/api/noticias', require('./routes/noticias'));
```

### 7. Verificar Conexión a la Base de Datos

```bash
cd /var/www/concejoguachual/server
mysql -u concejo_user -p concejo_guachucal -e "SELECT COUNT(*) as total FROM noticias;"
```

### 8. Verificar Errores en la Consola del Navegador

1. Abre `https://camsoft.com.co/concejoguachucal/noticias`
2. Presiona `F12` para abrir las herramientas de desarrollador
3. Ve a la pestaña **Console**
4. Busca errores en rojo

**Errores comunes:**
- `Failed to fetch` → Problema de conexión con el servidor
- `404 Not Found` → Ruta no encontrada
- `401 Unauthorized` → Problema de autenticación
- `500 Internal Server Error` → Error en el servidor

### 9. Verificar la Red (Network Tab)

1. Abre `https://camsoft.com.co/concejoguachucal/noticias`
2. Presiona `F12` → Pestaña **Network**
3. Busca la petición a `/api/noticias`
4. Haz clic en ella y revisa:
   - **Status Code**: Debería ser `200`
   - **Response**: Debería ser JSON
   - **Request URL**: Debería ser `https://camsoft.com.co/concejoguachucal/api/noticias`

## 🛠️ Soluciones Paso a Paso

### Solución 1: Reiniciar el Backend

```bash
cd /var/www/concejoguachual/server
pm2 restart concejo-backend --update-env
pm2 logs concejo-backend --lines 30
```

### Solución 2: Verificar y Corregir Nginx

```bash
# 1. Ver la configuración actual
sudo cat /etc/nginx/sites-available/milton | grep -A 10 "location.*api"

# 2. Si no tiene la configuración correcta, editarla
sudo nano /etc/nginx/sites-available/milton

# 3. Verificar que tiene esta sección:
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

### Solución 3: Verificar que el Endpoint Está Registrado

```bash
cd /var/www/concejoguachual/server
cat index.js | grep noticias
```

**Debería tener:**
```javascript
app.use('/api/noticias', require('./routes/noticias'));
```

Si no está, agregarlo antes de `app.listen()`.

### Solución 4: Probar Conexión Directa

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
echo "  Diagnóstico Página de Noticias"
echo "=========================================="

echo -e "\n1. Estado de PM2:"
pm2 status

echo -e "\n2. Test endpoint local:"
curl -s http://localhost:5000/api/noticias | head -c 200
echo ""

echo -e "\n3. Logs del backend (últimas 10 líneas):"
pm2 logs concejo-backend --lines 10 --nostream

echo -e "\n4. Configuración de Nginx (proxy API):"
sudo grep -A 5 "location.*api" /etc/nginx/sites-available/* 2>/dev/null

echo -e "\n5. Test de Nginx:"
sudo nginx -t

echo -e "\n6. Verificar ruta en index.js:"
cd /var/www/concejoguachual/server
grep "noticias" index.js

echo -e "\n7. Test de conexión a BD:"
mysql -u concejo_user -pConcejo_2025*+- concejo_guachucal -e "SELECT COUNT(*) as total FROM noticias;" 2>/dev/null || echo "⚠️  Error de conexión"

echo -e "\n=========================================="
```

## 🔗 URLs para Probar

1. **API Noticias (desde servidor)**: `curl http://localhost:5000/api/noticias`
2. **API Noticias (desde navegador)**: `https://camsoft.com.co/concejoguachucal/api/noticias`
3. **Página de Noticias**: `https://camsoft.com.co/concejoguachucal/noticias`

## ⚠️ Errores Comunes y Soluciones

### Error: "Failed to fetch" en la consola del navegador
**Causa**: No se puede conectar al servidor
**Solución**: 
1. Verificar que el backend está corriendo: `pm2 status`
2. Verificar que Nginx está corriendo: `sudo systemctl status nginx`
3. Verificar la configuración de proxy_pass en Nginx

### Error: "404 Not Found"
**Causa**: La ruta no está configurada correctamente
**Solución**: 
1. Verificar que existe `location /concejoguachucal/api` en Nginx
2. Verificar que el rewrite está correcto
3. Recargar Nginx: `sudo systemctl reload nginx`

### Error: "502 Bad Gateway"
**Causa**: Nginx no puede conectar con el backend
**Solución**: 
1. Verificar que el backend está corriendo: `pm2 status`
2. Verificar que el puerto es correcto: `sudo netstat -tulpn | grep 5000`
3. Verificar proxy_pass en Nginx: `sudo grep "proxy_pass" /etc/nginx/sites-available/*`

### Error: "500 Internal Server Error"
**Causa**: Error en el código del servidor o en la base de datos
**Solución**: 
1. Ver logs de PM2: `pm2 logs concejo-backend`
2. Verificar conexión a BD
3. Verificar que las tablas existen
