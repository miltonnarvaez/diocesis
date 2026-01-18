# Configurar SSL para camsoft.com.co

## Problema
Certbot no puede encontrar un bloque de servidor en Nginx que coincida con `camsoft.com.co` porque el `server_name` no está configurado correctamente.

## Solución Paso a Paso

### 1. Verificar la configuración actual de Nginx

Primero, veamos qué archivos de configuración tienes:

```bash
# Ver todos los sitios disponibles
ls -la /etc/nginx/sites-available/

# Ver todos los sitios habilitados
ls -la /etc/nginx/sites-enabled/

# Ver la configuración actual (si tienes un archivo llamado 'milton' o 'default')
cat /etc/nginx/sites-available/milton
# O
cat /etc/nginx/sites-available/default
```

### 2. Editar la configuración de Nginx

Necesitas editar el archivo de configuración que maneja tu dominio. Si no tienes uno específico para `camsoft.com.co`, puedes:

**Opción A: Editar el archivo existente (si ya tienes uno)**

```bash
sudo nano /etc/nginx/sites-available/milton
# O el nombre que tenga tu archivo de configuración
```

**Opción B: Crear un nuevo archivo para camsoft.com.co**

```bash
sudo nano /etc/nginx/sites-available/camsoft
```

### 3. Configurar el server_name

Dentro del archivo de configuración, asegúrate de que el bloque `server` tenga el `server_name` correcto:

```nginx
server {
    listen 80;
    server_name camsoft.com.co www.camsoft.com.co;

    # Frontend (React Build)
    location / {
        root /var/www/concejoguachual/client/build;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
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
        alias /var/www/concejoguachual/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Archivos de imágenes
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        root /var/www/concejoguachual/client/build;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/camsoft_access.log;
    error_log /var/log/nginx/camsoft_error.log;
}
```

**IMPORTANTE**: 
- Reemplaza `camsoft.com.co` con tu dominio real si es diferente
- Asegúrate de que las rutas (`root`, `alias`) apunten a las ubicaciones correctas de tus archivos

### 4. Activar el sitio (si creaste un nuevo archivo)

```bash
# Si creaste un nuevo archivo 'camsoft', activarlo:
sudo ln -s /etc/nginx/sites-available/camsoft /etc/nginx/sites-enabled/

# Verificar que el enlace se creó correctamente
ls -la /etc/nginx/sites-enabled/
```

### 5. Verificar la configuración de Nginx

```bash
sudo nginx -t
```

Si ves `nginx: configuration file /etc/nginx/nginx.conf test is successful`, continúa. Si hay errores, corrígelos antes de continuar.

### 6. Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

### 7. Verificar que el dominio apunta al servidor

Antes de obtener el certificado SSL, asegúrate de que:

1. El dominio `camsoft.com.co` apunta a la IP de tu servidor
2. Puedes acceder al sitio en `http://camsoft.com.co` (sin HTTPS)

Para verificar:

```bash
# Verificar que el DNS está configurado
dig camsoft.com.co
# O
nslookup camsoft.com.co

# Deberías ver la IP de tu servidor
```

### 8. Obtener el certificado SSL con Certbot

Ahora que Nginx está configurado correctamente, puedes obtener el certificado:

```bash
# Obtener e instalar el certificado SSL automáticamente
sudo certbot --nginx -d camsoft.com.co -d www.camsoft.com.co
```

Certbot:
- Obtendrá el certificado de Let's Encrypt
- Configurará automáticamente Nginx para usar HTTPS
- Configurará la redirección de HTTP a HTTPS
- Configurará la renovación automática

### 9. Verificar que SSL funciona

```bash
# Verificar el estado del certificado
sudo certbot certificates

# Probar la renovación (no renueva realmente, solo prueba)
sudo certbot renew --dry-run
```

### 10. Verificar en el navegador

Visita:
- `https://camsoft.com.co` - Debería cargar con el candado verde
- `http://camsoft.com.co` - Debería redirigir automáticamente a HTTPS

## Solución de Problemas

### Error: "Could not automatically find a matching server block"

**Causa**: El `server_name` en Nginx no coincide con el dominio que estás usando en Certbot.

**Solución**:
1. Verifica que el `server_name` en tu configuración de Nginx incluya exactamente el dominio:
   ```bash
   grep -r "server_name" /etc/nginx/sites-enabled/
   ```
2. Asegúrate de que el dominio en Certbot coincida exactamente:
   ```bash
   sudo certbot --nginx -d camsoft.com.co -d www.camsoft.com.co
   ```

### Error: "Failed to connect to camsoft.com.co"

**Causa**: El dominio no apunta al servidor o el firewall está bloqueando el puerto 80.

**Solución**:
1. Verifica el DNS:
   ```bash
   dig camsoft.com.co
   ```
2. Verifica que el puerto 80 esté abierto:
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Error: "The domain name does not point to this server"

**Causa**: El DNS del dominio no está configurado correctamente.

**Solución**:
1. Ve a tu proveedor de dominio (donde compraste `camsoft.com.co`)
2. Configura un registro A que apunte a la IP de tu servidor
3. Espera a que el DNS se propague (puede tardar hasta 48 horas, pero generalmente es más rápido)

### Si ya tienes un certificado pero quieres reinstalarlo

```bash
# Ver certificados existentes
sudo certbot certificates

# Eliminar el certificado existente (si es necesario)
sudo certbot delete --cert-name camsoft.com.co

# Obtener un nuevo certificado
sudo certbot --nginx -d camsoft.com.co -d www.camsoft.com.co
```

## Notas Importantes

1. **Renovación automática**: Certbot configura automáticamente la renovación. El certificado se renueva cada 90 días.

2. **Verificar renovación**: Puedes verificar que la renovación automática funciona:
   ```bash
   sudo certbot renew --dry-run
   ```

3. **Múltiples dominios**: Si tienes múltiples dominios en el mismo servidor, puedes obtener certificados para todos:
   ```bash
   sudo certbot --nginx -d camsoft.com.co -d www.camsoft.com.co -d otro-dominio.com
   ```

4. **Logs**: Si algo falla, revisa los logs:
   ```bash
   sudo tail -f /var/log/letsencrypt/letsencrypt.log
   sudo tail -f /var/log/nginx/error.log
   ```




