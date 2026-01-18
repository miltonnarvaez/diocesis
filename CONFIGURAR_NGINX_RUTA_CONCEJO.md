# Configurar Nginx para /concejoguachucal

## Objetivo
Mantener la página principal en `161.35.188.174` y servir la aplicación del concejo en `161.35.188.174/concejoguachucal`

## Pasos en el Servidor

### 1. Ver la configuración actual
```bash
cat /etc/nginx/sites-available/milton
```

### 2. Editar la configuración
```bash
sudo nano /etc/nginx/sites-available/milton
```

### 3. Agregar estas secciones dentro del bloque `server`

Agrega estas líneas ANTES del cierre del bloque `server` (antes de la última `}`):

```nginx
    # Aplicación del Concejo en /concejoguachucal
    location /concejoguachucal {
        alias /var/www/concejoguachual/client/build;
        try_files $uri $uri/ /concejoguachucal/index.html;
        index index.html;
    }

    # Archivos estáticos del Concejo (JS, CSS, imágenes)
    location /concejoguachucal/static {
        alias /var/www/concejoguachual/client/build/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
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

    # Archivos estáticos del Concejo (uploads)
    location /concejoguachucal/uploads {
        alias /var/www/concejoguachual/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
```

### 4. Verificar y reiniciar
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Ejemplo de configuración completa

Tu archivo `milton` debería verse algo así:

```nginx
server {
    listen 80;
    server_name 161.35.188.174;

    # Tu configuración actual aquí (root, locations existentes, etc.)
    
    # ... tus locations existentes ...

    # Aplicación del Concejo en /concejoguachucal
    location /concejoguachucal {
        alias /var/www/concejoguachual/client/build;
        try_files $uri $uri/ /concejoguachucal/index.html;
        index index.html;
    }

    # Archivos estáticos del Concejo (JS, CSS, imágenes)
    location /concejoguachucal/static {
        alias /var/www/concejoguachual/client/build/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
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

    # Archivos estáticos del Concejo (uploads)
    location /concejoguachucal/uploads {
        alias /var/www/concejoguachual/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Verificar que funciona

1. Visita `http://161.35.188.174` - Debe mostrar tu página principal
2. Visita `http://161.35.188.174/concejoguachucal` - Debe mostrar la aplicación del concejo

## Si hay problemas

Revisa los logs:
```bash
sudo tail -f /var/log/nginx/concejo_error.log
sudo tail -f /var/log/nginx/error.log
```




