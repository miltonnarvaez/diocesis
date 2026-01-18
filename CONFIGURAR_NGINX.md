# Configurar Nginx para el Concejo Municipal

## Pasos para Configurar Nginx

### 1. Copiar el archivo de configuración

```bash
# En tu Droplet
sudo cp nginx-concejo.conf /etc/nginx/sites-available/concejo
```

### 2. Editar la configuración

```bash
sudo nano /etc/nginx/sites-available/concejo
```

**Importante**: Reemplaza `TU_DOMINIO_O_IP` con:
- Tu dominio (ej: `concejo.guachucal.gov.co`) si tienes uno
- O la IP de tu Droplet (ej: `123.456.789.0`)

### 3. Activar el sitio

```bash
sudo ln -s /etc/nginx/sites-available/concejo /etc/nginx/sites-enabled/
```

### 4. Verificar la configuración

```bash
sudo nginx -t
```

Si todo está bien, verás: `nginx: configuration file /etc/nginx/nginx.conf test is successful`

### 5. Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

### 6. Verificar que Nginx esté corriendo

```bash
sudo systemctl status nginx
```

## Si tienes un dominio

### Configurar SSL con Let's Encrypt (Recomendado)

```bash
# Instalar Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# El certificado se renovará automáticamente
```

## Verificar que todo funciona

1. **Frontend**: Visita `http://TU_IP_O_DOMINIO` - deberías ver la página principal
2. **Backend**: Visita `http://TU_IP_O_DOMINIO/api/configuracion` - debería devolver JSON

## Solución de Problemas

### Si Nginx no inicia:
```bash
sudo nginx -t  # Ver errores de configuración
sudo tail -f /var/log/nginx/error.log  # Ver logs de errores
```

### Si el frontend no carga:
- Verifica que el build de React esté en `/var/www/concejoguachual/client/build`
- Verifica permisos: `sudo chown -R www-data:www-data /var/www/concejoguachual`

### Si la API no responde:
- Verifica que el backend esté corriendo: `pm2 list`
- Verifica el puerto: `sudo netstat -tlnp | grep 5000`








