# Solución: Pop-up de Acceso a Red Local

## Problema
El navegador Chrome está mostrando un pop-up que dice: "camsoft.com.co quiere: Buscar y conectarse a cualquier dispositivo de tu red local"

## Causa
Esto puede ocurrir por:
1. El uso de `navigator.mediaDevices.getUserMedia` para reconocimiento de voz
2. Alguna extensión del navegador
3. Configuración de WebRTC que intenta descubrir dispositivos

## Solución 1: Agregar Permissions-Policy en Nginx (RECOMENDADO)

Edita el archivo de configuración de Nginx:

```bash
sudo nano /etc/nginx/sites-available/milton
```

Dentro del bloque `server` para HTTPS (puerto 443), agrega este header:

```nginx
server {
    listen 443 ssl;
    server_name camsoft.com.co www.camsoft.com.co;
    
    # ... configuración SSL ...
    
    # Bloquear acceso a red local
    add_header Permissions-Policy "local-network=()";
    
    # ... resto de la configuración ...
}
```

Luego reinicia Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Solución 2: Ya implementada en el código

Ya agregué en `client/public/index.html`:

```html
<meta http-equiv="Permissions-Policy" content="local-network=()" />
```

## Solución 3: Verificar extensiones del navegador

Algunas extensiones de Chrome pueden causar este problema:
- Extensiones de impresoras
- Extensiones de dispositivos de red
- Extensiones de sincronización

Desactiva temporalmente las extensiones para verificar.

## Solución 4: Configurar Nginx con headers de seguridad completos

Agrega estos headers en el bloque HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name camsoft.com.co www.camsoft.com.co;
    
    # ... configuración SSL ...
    
    # Headers de seguridad
    add_header Permissions-Policy "local-network=(), microphone=(), camera=()";
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # ... resto de la configuración ...
}
```

## Verificar después de aplicar

1. Limpia la caché del navegador (Ctrl + Shift + Delete)
2. Recarga la página (Ctrl + F5)
3. El pop-up no debería aparecer

## Si el problema persiste

1. Verifica que el header se está enviando:
   ```bash
   curl -I https://camsoft.com.co | grep -i permissions
   ```

2. Revisa los logs de Nginx:
   ```bash
   sudo tail -f /var/log/nginx/milton_error.log
   ```

3. Verifica la configuración:
   ```bash
   sudo nginx -t
   cat /etc/nginx/sites-available/milton | grep -A 5 "listen 443"
   ```




