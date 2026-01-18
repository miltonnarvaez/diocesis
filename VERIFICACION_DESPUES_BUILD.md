# Verificación Después de Subir el Build

## ✅ Pasos Completados:
1. ✅ Build generado localmente
2. ✅ Build subido al servidor
3. ✅ Permisos cambiados

## 🔍 Verificaciones Adicionales:

### 1. Verificar que Nginx está sirviendo los archivos correctamente

```bash
# Verificar que los archivos existen
ls -la /var/www/concejoguachucal/client/build

# Verificar que Nginx puede leerlos
sudo -u www-data ls /var/www/concejoguachucal/client/build
```

### 2. Verificar la configuración de Nginx

```bash
# Verificar que la configuración de Nginx está correcta
sudo nginx -t

# Si hay errores, revisar la configuración
sudo nano /etc/nginx/sites-available/concejoguachucal
# o el archivo de configuración que uses
```

### 3. Reiniciar Nginx (si es necesario)

```bash
# Recargar la configuración de Nginx (sin interrumpir el servicio)
sudo systemctl reload nginx

# O reiniciar completamente si hay problemas
sudo systemctl restart nginx

# Verificar el estado
sudo systemctl status nginx
```

### 4. Verificar que el sitio carga correctamente

- Abre el navegador en modo incógnito o limpia la caché
- Visita: `https://camsoft.com.co/concejoguachucal`
- Verifica que:
  - La página carga correctamente
  - Los estilos se aplican (CSS)
  - Los scripts funcionan (JavaScript)
  - Las imágenes se muestran

### 5. Verificar los logs de Nginx (si hay problemas)

```bash
# Ver logs de acceso
sudo tail -f /var/log/nginx/access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/error.log
```

### 6. Limpiar caché del navegador (si no ves los cambios)

- **Chrome/Edge**: `Ctrl + Shift + Delete` → Limpiar caché
- **Firefox**: `Ctrl + Shift + Delete` → Limpiar caché
- O usar modo incógnito: `Ctrl + Shift + N`

### 7. Verificar que el backend sigue funcionando

```bash
# Verificar que el servidor Node.js está corriendo
pm2 status

# Ver logs del backend
pm2 logs concejo-backend --lines 50
```

## 🎯 Checklist Final:

- [ ] Permisos de la carpeta build correctos
- [ ] Nginx puede leer los archivos
- [ ] Configuración de Nginx sin errores
- [ ] Nginx recargado/reiniciado
- [ ] Sitio carga correctamente en el navegador
- [ ] Estilos y scripts funcionan
- [ ] Backend sigue funcionando
- [ ] No hay errores en los logs

## ⚠️ Si hay problemas:

1. **Error 404**: Verifica la ruta en la configuración de Nginx
2. **Error 403**: Verifica los permisos de la carpeta
3. **Página en blanco**: Revisa la consola del navegador (F12)
4. **Estilos no cargan**: Verifica que los archivos CSS están en build/static/css/
5. **JavaScript no funciona**: Verifica que los archivos JS están en build/static/js/

## 📝 Comandos Rápidos (Todo en uno):

```bash
# Verificar y recargar Nginx
cd /var/www/concejoguachucal
sudo chown -R www-data:www-data client/build
sudo chmod -R 755 client/build
sudo find client/build -type f -exec chmod 644 {} \;
sudo nginx -t && sudo systemctl reload nginx
pm2 status
```
