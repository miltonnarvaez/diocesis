# 🔧 Guía Manual para Editar Nginx - Diócesis de Ipiales

Esta guía te ayuda paso a paso a editar la configuración de Nginx para tu dominio.

---

## 📋 Información Necesaria

Antes de empezar, necesitas:
- **Dominio:** (ejemplo: `diocesisipiales.org`)
- **Acceso SSH al servidor:** `161.35.188.174`

---

## 🚀 Método 1: Usar el Script Automático (Recomendado)

### 1. Subir el script al servidor

Desde tu máquina local, sube el script `configurar-nginx-dominio.sh` al servidor:

```bash
# Usando SCP
scp configurar-nginx-dominio.sh root@161.35.188.174:/tmp/

# O usando WinSCP, sube el archivo a /tmp/
```

### 2. Ejecutar el script en el servidor

```bash
# Conectarse al servidor
ssh root@161.35.188.174

# Hacer ejecutable y ejecutar
chmod +x /tmp/configurar-nginx-dominio.sh
sudo bash /tmp/configurar-nginx-dominio.sh
```

El script te pedirá:
- El dominio que quieres usar
- Confirmación
- Si quieres reiniciar Nginx automáticamente

---

## ✏️ Método 2: Edición Manual

### Paso 1: Conectarse al servidor

```bash
ssh root@161.35.188.174
```

### Paso 2: Crear archivo de configuración

```bash
sudo nano /etc/nginx/sites-available/TU_DOMINIO.org
```

**Reemplaza `TU_DOMINIO.org` con tu dominio real.**

### Paso 3: Pegar esta configuración

```nginx
server {
    listen 80;
    server_name TU_DOMINIO.org www.TU_DOMINIO.org;

    # Frontend (React) - Ruta /diocesis
    location /diocesis {
        alias /var/www/diocesis/client/build;
        try_files $uri $uri/ @diocesis;
        index index.html;
    }
    
    # Fallback para React Router
    location @diocesis {
        rewrite ^.*$ /diocesis/index.html last;
    }

    # API Backend
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

    # Archivos estáticos (uploads, imágenes)
    location /uploads {
        alias /var/www/diocesis/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /images {
        alias /var/www/diocesis/server/images;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Redirección de la raíz a /diocesis
    location = / {
        return 301 /diocesis;
    }

    # Compresión gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Logs
    access_log /var/log/nginx/TU_DOMINIO.org.access.log;
    error_log /var/log/nginx/TU_DOMINIO.org.error.log;
}
```

**Importante:** Reemplaza `TU_DOMINIO.org` con tu dominio real en:
- `server_name` (línea 2)
- `access_log` (línea 40)
- `error_log` (línea 41)

### Paso 4: Guardar el archivo

En nano:
- Presiona `Ctrl + O` para guardar
- Presiona `Enter` para confirmar
- Presiona `Ctrl + X` para salir

### Paso 5: Crear enlace simbólico

```bash
sudo ln -s /etc/nginx/sites-available/TU_DOMINIO.org /etc/nginx/sites-enabled/
```

### Paso 6: Verificar configuración

```bash
sudo nginx -t
```

Deberías ver:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Paso 7: Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

### Paso 8: Verificar estado

```bash
sudo systemctl status nginx
```

---

## 🔍 Verificar Configuración Actual

### Ver archivos de configuración existentes

```bash
# Ver todos los archivos disponibles
ls -la /etc/nginx/sites-available/

# Ver archivos activos
ls -la /etc/nginx/sites-enabled/

# Ver contenido de un archivo específico
cat /etc/nginx/sites-available/TU_DOMINIO.org
```

### Ver configuración activa

```bash
# Ver todas las configuraciones activas
sudo nginx -T | grep -A 50 "server_name"
```

---

## 🔧 Editar Configuración Existente

Si ya tienes un archivo de configuración y quieres editarlo:

### 1. Editar el archivo

```bash
sudo nano /etc/nginx/sites-available/TU_DOMINIO.org
```

### 2. Hacer cambios necesarios

Los cambios más comunes:

**Cambiar dominio:**
```nginx
server_name nuevo-dominio.org www.nuevo-dominio.org;
```

**Agregar redirección de www a no-www:**
```nginx
# Agregar después de server_name
if ($host = www.TU_DOMINIO.org) {
    return 301 http://TU_DOMINIO.org$request_uri;
}
```

**Cambiar ruta del frontend:**
```nginx
location /diocesis {
    alias /var/www/diocesis/client/build;
    # ... resto de la configuración
}
```

### 3. Verificar y reiniciar

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🗑️ Eliminar Configuración

Si necesitas eliminar una configuración:

### 1. Eliminar enlace simbólico

```bash
sudo rm /etc/nginx/sites-enabled/TU_DOMINIO.org
```

### 2. (Opcional) Eliminar archivo de configuración

```bash
sudo rm /etc/nginx/sites-available/TU_DOMINIO.org
```

### 3. Reiniciar Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Agregar SSL/HTTPS

Después de configurar el dominio, puedes agregar SSL:

### 1. Instalar Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtener certificado

```bash
sudo certbot --nginx -d TU_DOMINIO.org -d www.TU_DOMINIO.org
```

Certbot modificará automáticamente tu archivo de configuración para agregar SSL.

### 3. Verificar renovación automática

```bash
sudo certbot renew --dry-run
```

---

## 🐛 Solución de Problemas

### Error: "nginx: [emerg] bind() to 0.0.0.0:80 failed"

**Causa:** Otro servicio está usando el puerto 80.

**Solución:**
```bash
# Ver qué está usando el puerto 80
sudo netstat -tlnp | grep :80

# Detener el servicio o cambiar el puerto en Nginx
```

### Error: "nginx: [emerg] duplicate listen options"

**Causa:** Hay múltiples bloques `server` escuchando en el mismo puerto.

**Solución:**
```bash
# Ver todas las configuraciones
sudo nginx -T | grep "listen"

# Desactivar configuraciones duplicadas
sudo rm /etc/nginx/sites-enabled/configuracion-duplicada
```

### Error 502 Bad Gateway

**Causa:** El backend no está corriendo o Nginx no puede conectarse.

**Solución:**
```bash
# Verificar que el backend está corriendo
pm2 list
pm2 logs diocesis-api

# Verificar que el puerto 5001 está abierto
sudo netstat -tlnp | grep 5001

# Probar conexión local
curl http://localhost:5001/api/health
```

### Error 404 Not Found

**Causa:** La ruta del build no existe o tiene permisos incorrectos.

**Solución:**
```bash
# Verificar que el build existe
ls -la /var/www/diocesis/client/build

# Verificar permisos
sudo chown -R www-data:www-data /var/www/diocesis/client/build
sudo chmod -R 755 /var/www/diocesis/client/build
```

---

## 📝 Comandos Útiles

### Ver logs en tiempo real

```bash
# Logs de acceso
sudo tail -f /var/log/nginx/TU_DOMINIO.org.access.log

# Logs de errores
sudo tail -f /var/log/nginx/TU_DOMINIO.org.error.log

# Todos los logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### Recargar configuración sin reiniciar

```bash
sudo nginx -s reload
```

### Ver configuración completa

```bash
sudo nginx -T
```

### Verificar qué archivos están activos

```bash
ls -la /etc/nginx/sites-enabled/
```

---

## ✅ Checklist Final

- [ ] Archivo de configuración creado en `/etc/nginx/sites-available/`
- [ ] Enlace simbólico creado en `/etc/nginx/sites-enabled/`
- [ ] Configuración verificada con `nginx -t`
- [ ] Nginx reiniciado sin errores
- [ ] Dominio configurado en DNS apuntando a `161.35.188.174`
- [ ] Sitio accesible desde el navegador
- [ ] SSL configurado (opcional pero recomendado)

---

**¿Necesitas ayuda?** Revisa los logs de Nginx para ver errores específicos.
