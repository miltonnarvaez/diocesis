# 🌐 Guía para Configurar Dominio - Diócesis de Ipiales

Esta guía explica cómo configurar un dominio para que apunte a la aplicación de la Diócesis de Ipiales que está corriendo en `http://161.35.188.174/diocesis`.

---

## 📋 Requisitos Previos

- Tener acceso al panel de control de tu proveedor de dominio (GoDaddy, Namecheap, Cloudflare, etc.)
- Tener acceso SSH al servidor (161.35.188.174)
- Dominio registrado y activo

---

## 🔧 PASO 1: Configurar Registros DNS

### Opción A: Configurar DNS en tu Proveedor de Dominio

1. **Accede al panel de control de tu proveedor de dominio** (GoDaddy, Namecheap, Cloudflare, etc.)

2. **Busca la sección de "DNS" o "Zona DNS" o "DNS Management"**

3. **Agrega o modifica los siguientes registros DNS:**

#### Para usar el dominio principal (ejemplo: `diocesisipiales.org`):
```
Tipo: A
Nombre: @ (o deja en blanco, o escribe el dominio sin www)
Valor: 161.35.188.174
TTL: 3600 (o el valor por defecto)
```

#### Para usar subdominio (ejemplo: `www.diocesisipiales.org`):
```
Tipo: A
Nombre: www
Valor: 161.35.188.174
TTL: 3600 (o el valor por defecto)
```

#### Si quieres usar ambos (dominio principal y www):
```
Registro 1:
Tipo: A
Nombre: @
Valor: 161.35.188.174
TTL: 3600

Registro 2:
Tipo: A
Nombre: www
Valor: 161.35.188.174
TTL: 3600
```

4. **Guarda los cambios** y espera la propagación DNS (puede tardar de 5 minutos a 48 horas, normalmente es menos de 1 hora)

### Opción B: Usar Cloudflare (Recomendado - Gratis)

1. **Crea una cuenta en Cloudflare** (https://www.cloudflare.com)

2. **Agrega tu dominio** a Cloudflare

3. **Cloudflare te dará servidores de nombres** (nameservers), por ejemplo:
   ```
   dante.ns.cloudflare.com
   dina.ns.cloudflare.com
   ```

4. **Actualiza los nameservers en tu proveedor de dominio** con los que Cloudflare te proporcionó

5. **En Cloudflare, configura los registros DNS:**
   ```
   Tipo: A
   Nombre: @
   Contenido: 161.35.188.174
   Proxy: Desactivado (nube gris) o Activado (nube naranja)
   TTL: Auto
   ```

6. **Si quieres www:**
   ```
   Tipo: A
   Nombre: www
   Contenido: 161.35.188.174
   Proxy: Desactivado o Activado
   TTL: Auto
   ```

---

## 🔧 PASO 2: Configurar Nginx en el Servidor

### 1. Conectarse al servidor por SSH

```bash
ssh root@161.35.188.174
```

### 2. Crear configuración de Nginx para el dominio

Crea un nuevo archivo de configuración para tu dominio:

```bash
sudo nano /etc/nginx/sites-available/diocesisipiales.org
```

**Reemplaza `diocesisipiales.org` con tu dominio real.**

### 3. Configuración de Nginx (HTTP)

Copia y pega esta configuración en el archivo:

```nginx
server {
    listen 80;
    server_name diocesisipiales.org www.diocesisipiales.org;

    # Redirección de www a no-www (opcional, descomenta si lo prefieres)
    # if ($host = www.diocesisipiales.org) {
    #     return 301 http://diocesisipiales.org$request_uri;
    # }

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

    # Logs
    access_log /var/log/nginx/diocesisipiales.org.access.log;
    error_log /var/log/nginx/diocesisipiales.org.error.log;
}
```

**Importante:** Reemplaza `diocesisipiales.org` con tu dominio real en todas las líneas donde aparezca.

### 4. Crear enlace simbólico

```bash
sudo ln -s /etc/nginx/sites-available/diocesisipiales.org /etc/nginx/sites-enabled/
```

### 5. Verificar configuración de Nginx

```bash
sudo nginx -t
```

Deberías ver:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 6. Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

---

## 🔒 PASO 3: Configurar SSL/HTTPS (Recomendado)

### Opción A: Usar Let's Encrypt (Certbot) - Gratis

1. **Instalar Certbot**

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

2. **Obtener certificado SSL**

```bash
sudo certbot --nginx -d diocesisipiales.org -d www.diocesisipiales.org
```

**Reemplaza `diocesisipiales.org` con tu dominio real.**

3. **Seguir las instrucciones del asistente:**
   - Ingresa tu email
   - Acepta los términos
   - Elige si quieres redirigir HTTP a HTTPS (recomendado: Sí)

4. **Renovación automática** (ya está configurada por defecto)

Certbot configurará automáticamente la renovación. Puedes verificar con:

```bash
sudo certbot renew --dry-run
```

### Opción B: Usar Cloudflare SSL (Si usas Cloudflare)

Si usas Cloudflare con el proxy activado (nube naranja), Cloudflare proporciona SSL automáticamente. Solo necesitas:

1. **En Cloudflare, ve a SSL/TLS**
2. **Selecciona "Full" o "Full (strict)"**
3. **En el servidor, configura Nginx para aceptar conexiones SSL de Cloudflare:**

```bash
sudo nano /etc/nginx/sites-available/diocesisipiales.org
```

Agrega al inicio del archivo (antes del `server`):

```nginx
# IPs de Cloudflare
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
real_ip_header CF-Connecting-IP;
```

---

## ✅ PASO 4: Verificar Configuración

### 1. Verificar DNS

Desde tu máquina local, verifica que el DNS esté propagado:

**Windows (PowerShell):**
```powershell
nslookup diocesisipiales.org
```

**Linux/Mac:**
```bash
dig diocesisipiales.org
# o
nslookup diocesisipiales.org
```

Deberías ver la IP `161.35.188.174`

### 2. Verificar que el sitio funciona

Abre tu navegador y visita:
- `http://diocesisipiales.org/diocesis`
- `http://www.diocesisipiales.org/diocesis` (si configuraste www)

Si configuraste SSL:
- `https://diocesisipiales.org/diocesis`
- `https://www.diocesisipiales.org/diocesis`

### 3. Verificar logs de Nginx

```bash
# Ver logs de acceso
sudo tail -f /var/log/nginx/diocesisipiales.org.access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/diocesisipiales.org.error.log
```

---

## 🔍 Solución de Problemas

### El dominio no resuelve a la IP correcta

1. **Verifica los registros DNS** en tu proveedor de dominio
2. **Espera la propagación DNS** (puede tardar hasta 48 horas)
3. **Limpia la caché DNS local:**
   - Windows: `ipconfig /flushdns`
   - Linux: `sudo systemd-resolve --flush-caches`
   - Mac: `sudo dscacheutil -flushcache`

### Error 502 Bad Gateway

1. **Verifica que el backend esté corriendo:**
   ```bash
   pm2 list
   pm2 logs diocesis-api
   ```

2. **Verifica que el puerto 5001 esté abierto:**
   ```bash
   sudo netstat -tlnp | grep 5001
   ```

### Error 404 Not Found

1. **Verifica que el build exista:**
   ```bash
   ls -la /var/www/diocesis/client/build
   ```

2. **Verifica los permisos:**
   ```bash
   sudo chown -R www-data:www-data /var/www/diocesis/client/build
   sudo chmod -R 755 /var/www/diocesis/client/build
   ```

### El certificado SSL no funciona

1. **Verifica que el dominio apunte correctamente:**
   ```bash
   sudo certbot certificates
   ```

2. **Renueva el certificado manualmente:**
   ```bash
   sudo certbot renew --force-renewal
   ```

---

## 📝 Notas Importantes

1. **Propagación DNS:** Los cambios DNS pueden tardar entre 5 minutos y 48 horas en propagarse completamente. Normalmente es menos de 1 hora.

2. **Renovación SSL:** Los certificados de Let's Encrypt expiran cada 90 días. Certbot los renueva automáticamente, pero verifica que el servicio esté activo:
   ```bash
   sudo systemctl status certbot.timer
   ```

3. **Firewall:** Asegúrate de que los puertos 80 (HTTP) y 443 (HTTPS) estén abiertos:
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw status
   ```

4. **Backup:** Antes de hacer cambios importantes, haz backup de la configuración:
   ```bash
   sudo cp /etc/nginx/sites-available/diocesisipiales.org /etc/nginx/sites-available/diocesisipiales.org.backup
   ```

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Verifica los logs de Nginx: `/var/log/nginx/diocesisipiales.org.error.log`
2. Verifica los logs del backend: `pm2 logs diocesis-api`
3. Verifica el estado de los servicios: `sudo systemctl status nginx`

---

## ✅ Checklist Final

- [ ] Registros DNS configurados en el proveedor de dominio
- [ ] DNS propagado (verificado con nslookup/dig)
- [ ] Configuración de Nginx creada y activada
- [ ] Nginx reiniciado sin errores
- [ ] Certificado SSL instalado (si aplica)
- [ ] Sitio accesible desde el navegador
- [ ] Logs verificados sin errores

---

**¡Listo!** Tu dominio debería estar funcionando y apuntando a la aplicación de la Diócesis de Ipiales. 🎉
