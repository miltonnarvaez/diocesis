# Guía Paso a Paso: Configurar SSL para camsoft.com.co

## ⚠️ IMPORTANTE: Antes de comenzar

Asegúrate de que:
1. Tienes acceso SSH a tu servidor como root o con sudo
2. El dominio `camsoft.com.co` apunta a la IP de tu servidor (verifica con `dig camsoft.com.co`)
3. Puedes acceder al sitio en `http://camsoft.com.co` (sin HTTPS)

---

## PASO 1: Conectarte al servidor

```bash
ssh root@TU_IP_SERVIDOR
# O si usas otro usuario:
ssh usuario@TU_IP_SERVIDOR
```

---

## PASO 2: Verificar qué archivos de configuración de Nginx tienes

Ejecuta estos comandos para ver qué configuración tienes:

```bash
# Ver archivos disponibles
ls -la /etc/nginx/sites-available/

# Ver archivos habilitados
ls -la /etc/nginx/sites-enabled/

# Ver qué server_name está configurado
grep -r "server_name" /etc/nginx/sites-enabled/
```

**Anota el nombre del archivo** que estás usando (probablemente `milton`, `default`, o `camsoft`).

---

## PASO 3: Ver la configuración actual

```bash
# Reemplaza 'milton' con el nombre de tu archivo
cat /etc/nginx/sites-available/milton
```

O si no sabes cuál es, ejecuta:

```bash
# Ver todos los archivos habilitados
for file in /etc/nginx/sites-enabled/*; do
    echo "=== $file ==="
    cat "$file"
    echo ""
done
```

---

## PASO 4: Editar la configuración de Nginx

Edita el archivo que maneja tu dominio:

```bash
# Reemplaza 'milton' con el nombre de tu archivo
sudo nano /etc/nginx/sites-available/milton
```

**Busca la línea que dice `server_name`** y cámbiala a:

```nginx
server_name camsoft.com.co www.camsoft.com.co;
```

**Ejemplo completo** de cómo debería verse el bloque `server`:

```nginx
server {
    listen 80;
    server_name camsoft.com.co www.camsoft.com.co;  # ← CAMBIA ESTA LÍNEA

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

    # ... resto de tu configuración ...
}
```

**Para guardar en nano:**
- Presiona `Ctrl + O` (guardar)
- Presiona `Enter` (confirmar)
- Presiona `Ctrl + X` (salir)

---

## PASO 5: Verificar que la configuración es correcta

```bash
sudo nginx -t
```

**Si ves esto, está bien:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Si hay errores**, vuelve al PASO 4 y corrígelos.

---

## PASO 6: Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

Verifica que Nginx esté corriendo:

```bash
sudo systemctl status nginx
```

Deberías ver `active (running)` en verde.

---

## PASO 7: Verificar que el dominio apunta al servidor

```bash
# Verificar DNS
dig camsoft.com.co +short

# Deberías ver la IP de tu servidor
```

Si no ves la IP correcta, necesitas configurar el DNS en tu proveedor de dominio.

---

## PASO 8: Verificar que el sitio funciona en HTTP

```bash
# Probar desde el servidor
curl -I http://camsoft.com.co

# Deberías ver algo como:
# HTTP/1.1 200 OK
```

Si no funciona, revisa los logs:

```bash
sudo tail -20 /var/log/nginx/error.log
```

---

## PASO 9: Instalar Certbot (si no lo tienes)

```bash
# Actualizar paquetes
sudo apt update

# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y
```

---

## PASO 10: Obtener el certificado SSL

**IMPORTANTE**: Usa `--nginx` (no `install --cert-name`):

```bash
sudo certbot --nginx -d camsoft.com.co -d www.camsoft.com.co
```

Certbot te hará algunas preguntas:

1. **Email**: Ingresa tu email (para notificaciones de renovación)
2. **Términos de servicio**: Presiona `A` para aceptar
3. **Compartir email**: Presiona `Y` o `N` (tu elección)
4. **Redirección HTTP a HTTPS**: Presiona `2` para redirigir automáticamente

**Si todo sale bien**, verás algo como:

```
Congratulations! You have successfully enabled https://camsoft.com.co
...
Your certificate and chain have been saved at:
/etc/letsencrypt/live/camsoft.com.co/fullchain.pem
...
```

---

## PASO 11: Verificar que SSL funciona

```bash
# Ver certificados instalados
sudo certbot certificates

# Probar renovación (solo prueba, no renueva realmente)
sudo certbot renew --dry-run
```

---

## PASO 12: Probar en el navegador

Abre tu navegador y visita:

1. **`https://camsoft.com.co`** - Debería cargar con el candado verde 🔒
2. **`http://camsoft.com.co`** - Debería redirigir automáticamente a HTTPS

---

## ✅ ¡Listo!

Tu sitio ahora tiene SSL configurado. El certificado se renovará automáticamente cada 90 días.

---

## 🔧 Solución de Problemas

### Error: "Could not automatically find a matching server block"

**Solución:**
1. Verifica que el `server_name` en Nginx coincida exactamente:
   ```bash
   grep -r "server_name" /etc/nginx/sites-enabled/
   ```
2. Asegúrate de que el dominio en Certbot sea exactamente el mismo:
   ```bash
   sudo certbot --nginx -d camsoft.com.co -d www.camsoft.com.co
   ```

### Error: "The domain name does not point to this server"

**Solución:**
1. Verifica el DNS:
   ```bash
   dig camsoft.com.co
   ```
2. Si el DNS no apunta al servidor, ve a tu proveedor de dominio y configura un registro A que apunte a la IP de tu servidor.

### Error: "Failed to connect"

**Solución:**
1. Verifica que el puerto 80 esté abierto:
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Si necesitas ver los logs de Certbot

```bash
sudo tail -50 /var/log/letsencrypt/letsencrypt.log
```

### Si necesitas ver los logs de Nginx

```bash
sudo tail -50 /var/log/nginx/error.log
```

---

## 📝 Comandos de Referencia Rápida

```bash
# Ver configuración
cat /etc/nginx/sites-available/milton

# Editar configuración
sudo nano /etc/nginx/sites-available/milton

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Obtener certificado SSL
sudo certbot --nginx -d camsoft.com.co -d www.camsoft.com.co

# Ver certificados
sudo certbot certificates

# Probar renovación
sudo certbot renew --dry-run
```

---

## 🆘 ¿Necesitas ayuda?

Si algo no funciona, comparte:
1. El error exacto que ves
2. El resultado de `sudo nginx -t`
3. El resultado de `grep -r "server_name" /etc/nginx/sites-enabled/`
4. El resultado de `dig camsoft.com.co`




