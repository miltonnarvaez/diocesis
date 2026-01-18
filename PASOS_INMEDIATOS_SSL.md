# Pasos Inmediatos para Configurar SSL

## Situación Actual
- Tienes un archivo `milton` vacío (0 bytes)
- Tienes un backup `milton.backup` del 14 de diciembre
- Tienes el archivo `default` de Nginx

## PASO 1: Ver qué archivos están habilitados

```bash
ls -la /etc/nginx/sites-enabled/
```

## PASO 2: Ver el contenido del backup

```bash
cat /etc/nginx/sites-available/milton.backup
```

## PASO 3: Ver el contenido del archivo default

```bash
cat /etc/nginx/sites-available/default
```

## PASO 4: Restaurar el backup o copiar desde default

**Opción A: Si el backup tiene la configuración correcta**

```bash
# Copiar el backup al archivo milton
sudo cp /etc/nginx/sites-available/milton.backup /etc/nginx/sites-available/milton
```

**Opción B: Si necesitas crear una nueva configuración**

```bash
# Editar el archivo milton
sudo nano /etc/nginx/sites-available/milton
```

Y pega esta configuración (ajusta las rutas según tu caso):

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
    access_log /var/log/nginx/milton_access.log;
    error_log /var/log/nginx/milton_error.log;
}
```

**Para guardar en nano:**
- `Ctrl + O` → `Enter` → `Ctrl + X`

## PASO 5: Verificar que milton tiene contenido

```bash
cat /etc/nginx/sites-available/milton
```

## PASO 6: Asegurarse de que milton está habilitado

```bash
# Ver si está habilitado
ls -la /etc/nginx/sites-enabled/

# Si no está habilitado, habilitarlo
sudo ln -s /etc/nginx/sites-available/milton /etc/nginx/sites-enabled/milton

# Verificar que se creó el enlace
ls -la /etc/nginx/sites-enabled/milton
```

## PASO 7: Verificar la configuración

```bash
sudo nginx -t
```

## PASO 8: Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

## PASO 9: Obtener el certificado SSL

```bash
sudo certbot --nginx -d camsoft.com.co -d www.camsoft.com.co
```




