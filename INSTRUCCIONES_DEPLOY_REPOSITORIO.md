# Instrucciones para Desplegar el Repositorio en el Servidor

## Paso 1: Conectarse al Servidor

Conéctate al servidor usando SSH:
```bash
ssh root@TU_IP_DEL_SERVIDOR
# O si usas un usuario específico:
ssh usuario@TU_IP_DEL_SERVIDOR
```

## Paso 2: Actualizar el Código del Servidor

### Opción A: Si usas Git en el servidor

1. Ve al directorio del proyecto:
```bash
cd /var/www/concejoguachucal
# O la ruta donde tengas el proyecto
```

2. Actualiza el código desde GitHub:
```bash
git pull origin 2025-12-16-x7ce
# O si estás en main:
git pull origin main
```

### Opción B: Si subes archivos manualmente

Necesitas subir estos archivos nuevos al servidor:
- `server/routes/repositorio.js` → `/var/www/concejoguachucal/server/routes/repositorio.js`
- `server/scripts/crear-repositorio-temporal.js` → `/var/www/concejoguachucal/server/scripts/crear-repositorio-temporal.js`

Y actualizar:
- `server/index.js` (debe tener la línea: `app.use('/api/repositorio', require('./routes/repositorio'));`)

## Paso 3: Instalar Dependencias (si es necesario)

Si hay nuevas dependencias, instálalas:
```bash
cd /var/www/concejoguachucal/server
npm install
```

## Paso 4: Crear las Carpetas del Repositorio

Ejecuta el script para crear todas las carpetas:
```bash
cd /var/www/concejoguachucal/server
node scripts/crear-repositorio-temporal.js
```

Deberías ver un mensaje como:
```
📁 Creando estructura del repositorio temporal...
✓ Carpeta creada: acerca-mision
✓ Carpeta creada: acerca-vision
...
✅ Estructura del repositorio temporal creada exitosamente
```

## Paso 5: Verificar que el Servidor Backend Tiene la Ruta

Verifica que `server/index.js` tenga esta línea (alrededor de la línea 76):
```javascript
app.use('/api/repositorio', require('./routes/repositorio'));
```

Si no la tiene, agrégala después de las otras rutas.

## Paso 6: Reiniciar el Servidor Backend

### Si usas PM2 (recomendado):
```bash
pm2 restart concejo-backend
# O el nombre que tengas configurado
pm2 restart all
```

### Si usas systemd:
```bash
sudo systemctl restart concejo-backend
# O el nombre de tu servicio
```

### Si lo ejecutas manualmente:
1. Detén el proceso actual (Ctrl+C o kill)
2. Inicia de nuevo:
```bash
cd /var/www/concejoguachucal/server
npm start
# O si usas nodemon:
npm run dev
```

## Paso 7: Verificar que Funciona

Prueba que el endpoint esté disponible:
```bash
curl http://localhost:5000/api/repositorio/categorias
```

Deberías ver un JSON con todas las categorías (37 carpetas).

## Paso 8: Subir el Build del Frontend

1. Desde tu computadora local, sube la carpeta `build`:
```bash
# Usando SCP (desde tu computadora local)
scp -r client/build/* usuario@TU_IP:/var/www/concejoguachucal/client/build/

# O usando rsync (mejor para actualizaciones)
rsync -avz client/build/ usuario@TU_IP:/var/www/concejoguachucal/client/build/
```

2. Asegúrate de que los permisos sean correctos:
```bash
# En el servidor
chown -R www-data:www-data /var/www/concejoguachucal/client/build
chmod -R 755 /var/www/concejoguachucal/client/build
```

## Paso 9: Reiniciar Nginx (si es necesario)

```bash
sudo systemctl restart nginx
# O
sudo service nginx restart
```

## Verificación Final

1. Abre tu navegador y ve a: `https://tu-dominio.com/concejoguachucal/repositorio-upload`
2. Deberías ver todas las carpetas disponibles
3. Prueba subir un archivo de prueba

## Solución de Problemas

### Si el endpoint no funciona:
```bash
# Verifica los logs del servidor
pm2 logs concejo-backend
# O
tail -f /var/log/concejo-backend.log
```

### Si las carpetas no se crean:
```bash
# Verifica que el directorio base existe
ls -la /var/www/concejoguachucal/server/uploads/repositorio-temporal

# Si no existe, créalo manualmente:
mkdir -p /var/www/concejoguachucal/server/uploads/repositorio-temporal
chmod -R 755 /var/www/concejoguachucal/server/uploads/repositorio-temporal
```

### Si hay errores de permisos:
```bash
# Asegura permisos correctos
chown -R usuario:usuario /var/www/concejoguachucal/server/uploads/repositorio-temporal
chmod -R 755 /var/www/concejoguachucal/server/uploads/repositorio-temporal
```
