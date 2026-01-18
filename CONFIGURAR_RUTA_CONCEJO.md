# Configurar Ruta /concejoguachucal en Nginx

## Objetivo
Mantener la página principal en `161.35.188.174` y agregar la aplicación del concejo en `161.35.188.174/concejoguachucal`

## Pasos en el Servidor

### 1. Ver la configuración actual
```bash
cat /etc/nginx/sites-available/milton
```

### 2. Editar la configuración
```bash
sudo nano /etc/nginx/sites-available/milton
```

### 3. Agregar la nueva location
Agrega esta sección dentro del bloque `server` (después de las locations existentes):

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

## Nota Importante

Si la aplicación React usa rutas del lado del cliente (React Router), también necesitarás actualizar el `package.json` o crear un archivo de configuración para que las rutas funcionen correctamente con el prefijo `/concejoguachucal`.




