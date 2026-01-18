# Cómo Reiniciar el Servidor sin PM2

## Opción 1: Instalar PM2 (Recomendado)

PM2 es muy útil para gestionar procesos Node.js. Instálalo así:

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar el servidor con PM2
cd /var/www/concejoguachual/server
pm2 start index.js --name concejo-backend

# Guardar la configuración para que se inicie automáticamente
pm2 save
pm2 startup
```

Luego puedes reiniciar con:
```bash
pm2 restart concejo-backend
```

## Opción 2: Reiniciar Manualmente (Sin PM2)

### Paso 1: Encontrar el proceso actual

```bash
# Ver qué procesos de Node están corriendo
ps aux | grep node

# O más específico:
ps aux | grep "index.js"
```

Deberías ver algo como:
```
root  12345  ... node index.js
```

### Paso 2: Detener el proceso

```bash
# Usando el PID que encontraste (ejemplo: 12345)
kill 12345

# O si no se detiene:
kill -9 12345

# O matar todos los procesos de Node (cuidado con esto):
pkill -f "node index.js"
```

### Paso 3: Iniciar el servidor de nuevo

```bash
cd /var/www/concejoguachual/server

# Opción A: En segundo plano
nohup node index.js > server.log 2>&1 &

# Opción B: Con screen (si está instalado)
screen -S concejo
node index.js
# Presiona Ctrl+A luego D para desconectarte

# Opción C: Con tmux (si está instalado)
tmux new -s concejo
node index.js
# Presiona Ctrl+B luego D para desconectarte
```

## Opción 3: Usar systemd (Servicio del Sistema)

Si tienes un servicio systemd configurado:

```bash
# Ver si existe el servicio
sudo systemctl status concejo-backend

# Si existe, reiniciar:
sudo systemctl restart concejo-backend

# Si no existe, puedes crearlo (ver abajo)
```

### Crear un servicio systemd (Opcional)

```bash
# Crear el archivo de servicio
sudo nano /etc/systemd/system/concejo-backend.service
```

Contenido del archivo:
```ini
[Unit]
Description=Concejo Backend Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/concejoguachual/server
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=concejo-backend

[Install]
WantedBy=multi-user.target
```

Luego:
```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar el servicio
sudo systemctl enable concejo-backend

# Iniciar el servicio
sudo systemctl start concejo-backend

# Verificar estado
sudo systemctl status concejo-backend
```

## Verificar que el Servidor Está Corriendo

```bash
# Verificar que está escuchando en el puerto 5000
netstat -tulpn | grep 5000
# O
ss -tulpn | grep 5000

# Probar el endpoint
curl http://localhost:5000/api/repositorio/categorias
```

## Recomendación

**Te recomiendo instalar PM2** porque:
- ✅ Reinicia automáticamente si el servidor se cae
- ✅ Fácil de gestionar (start, stop, restart, logs)
- ✅ Se inicia automáticamente al reiniciar el servidor
- ✅ Muy usado en producción

Para instalarlo:
```bash
sudo npm install -g pm2
cd /var/www/concejoguachual/server
pm2 start index.js --name concejo-backend
pm2 save
pm2 startup
```
