# Cómo Verificar qué Servidor Web Tienes Instalado

## Opción 1: Usar el Script Automático

1. Sube el archivo `verificar-servidor-web.sh` a tu Droplet:
   ```bash
   scp verificar-servidor-web.sh root@TU_IP_DEL_DROPLET:/root/
   ```

2. Conéctate al Droplet y ejecuta:
   ```bash
   ssh root@TU_IP_DEL_DROPLET
   chmod +x verificar-servidor-web.sh
   ./verificar-servidor-web.sh
   ```

## Opción 2: Comandos Manuales

Ejecuta estos comandos directamente en tu Droplet:

### Verificar Nginx
```bash
nginx -v
systemctl status nginx
```

### Verificar Apache
```bash
# Para Ubuntu/Debian
apache2 -v
systemctl status apache2

# Para CentOS/RHEL
httpd -v
systemctl status httpd
```

### Ver qué Servicios Están Corriendo
```bash
# Ver servicios en puertos web comunes
sudo netstat -tlnp | grep -E ':(80|443|5000|3000)'

# O con ss (más moderno)
sudo ss -tlnp | grep -E ':(80|443|5000|3000)'
```

### Ver Todos los Servicios Web Instalados
```bash
# Verificar qué paquetes están instalados
dpkg -l | grep -E 'nginx|apache'  # Ubuntu/Debian
rpm -qa | grep -E 'nginx|apache'  # CentOS/RHEL
```

## Opción 3: Verificar desde el Panel de DigitalOcean

1. Ve a tu Droplet en https://cloud.digitalocean.com/
2. Haz clic en "Access" o "Console"
3. Ejecuta los comandos de verificación

## Interpretación de Resultados

- **Nginx instalado**: Usarás Nginx como proxy reverso
- **Apache instalado**: Usarás Apache como proxy reverso
- **Ninguno instalado**: Puedes instalar Nginx (recomendado) o usar solo Node.js directamente

## Recomendación

Si no tienes ningún servidor web instalado, te recomiendo instalar **Nginx** porque:
- Es más ligero y rápido
- Mejor para aplicaciones Node.js
- Más fácil de configurar
- Mejor rendimiento con SSL

### Instalar Nginx (si no lo tienes)
```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```








