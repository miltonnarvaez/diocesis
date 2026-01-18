# Solución: Error de Bloqueo al Acceder al Repositorio

## Diagnóstico

El error "Sorry, you have been blocked" puede ser causado por:
1. Cloudflare o protección DDoS
2. El build del frontend no está subido
3. Nginx no está configurado correctamente
4. La ruta del repositorio no está accesible

## Pasos para Solucionar

### Paso 1: Verificar que el Build Está Subido

En el servidor, ejecuta:

```bash
# Verificar que existe la carpeta build
ls -la /var/www/concejoguachual/client/build

# Verificar que existe index.html
ls -la /var/www/concejoguachual/client/build/index.html
```

Si no existe, necesitas subir el build.

### Paso 2: Verificar la Configuración de Nginx

```bash
# Ver la configuración actual
cat /etc/nginx/sites-available/milton
# O el archivo que estés usando
```

Asegúrate de que tenga estas secciones:

```nginx
# Aplicación del Concejo en /concejoguachucal
location /concejoguachucal {
    alias /var/www/concejoguachual/client/build;
    try_files $uri $uri/ /concejoguachucal/index.html;
    index index.html;
}

# Backend API del Concejo
location /concejoguachucal/api {
    rewrite ^/concejoguachucal/api/(.*) /api/$1 break;
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
```

### Paso 3: Verificar los Logs de Nginx

```bash
# Ver los últimos errores
sudo tail -f /var/log/nginx/error.log

# Ver los logs de acceso
sudo tail -f /var/log/nginx/access.log
```

### Paso 4: Verificar que Nginx Está Corriendo

```bash
sudo systemctl status nginx
```

### Paso 5: Probar el Endpoint Directamente

```bash
# Desde el servidor
curl http://localhost:5000/api/repositorio/categorias

# Desde tu computadora (reemplaza con tu IP)
curl http://TU_IP:5000/api/repositorio/categorias
```

### Paso 6: Verificar Permisos

```bash
# Asegurar permisos correctos
chown -R www-data:www-data /var/www/concejoguachual/client/build
chmod -R 755 /var/www/concejoguachual/client/build
```

### Paso 7: Reiniciar Nginx

```bash
# Verificar configuración
sudo nginx -t

# Si está bien, reiniciar
sudo systemctl restart nginx
```

## Si el Problema es Cloudflare

Si usas Cloudflare, el bloqueo puede ser por:
- Reglas de firewall de Cloudflare
- Protección DDoS activada
- IP bloqueada

Solución:
1. Ve al panel de Cloudflare
2. Revisa las reglas de Firewall
3. Revisa la sección de Security
4. Agrega una excepción para tu IP o desactiva temporalmente la protección

## Verificar la URL Correcta

Asegúrate de acceder a:
- `https://tu-dominio.com/concejoguachucal/repositorio-upload`
- O `http://TU_IP/concejoguachucal/repositorio-upload`

No a:
- `http://localhost:5000/repositorio-upload` (esto solo funciona localmente)
