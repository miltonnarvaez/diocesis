# Solución: Error 404 al Mostrar Imágenes de Noticias

## 🔍 Problema
Al crear una noticia, la imagen se sube correctamente pero al intentar mostrarla aparece:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
noticia-1766153711083-862648227.png:1
```

**Causa**: Las URLs de las imágenes no incluyen el prefijo `/concejoguachucal` en producción.

## ✅ Solución Aplicada

### 1. Actualizado `getFileUrl` en `client/src/utils/fileUtils.js`
- Ahora agrega automáticamente el prefijo `/concejoguachucal` en producción
- Maneja correctamente las URLs absolutas y relativas

### 2. Actualizado `NoticiaImage` component
- Ahora usa `getFileUrl` internamente para procesar las URLs
- Todas las imágenes pasan por esta función automáticamente

### 3. Actualizado `NoticiaDetalle.js`
- Usa `getFileUrl` para el schema markup

## 🔧 Verificaciones en el Servidor

### 1. Verificar que los archivos se están guardando

```bash
# Verificar que existe el directorio de uploads
ls -la /var/www/concejoguachual/server/uploads/images/

# Verificar que hay imágenes
ls -la /var/www/concejoguachual/server/uploads/images/ | head -10
```

### 2. Verificar permisos del directorio

```bash
# Verificar permisos
ls -ld /var/www/concejoguachual/server/uploads/images/

# Si no tiene permisos correctos, corregirlos:
sudo chown -R www-data:www-data /var/www/concejoguachual/server/uploads
sudo chmod -R 755 /var/www/concejoguachual/server/uploads
```

### 3. Verificar configuración de Nginx

```bash
sudo grep -A 5 "location.*uploads" /etc/nginx/sites-available/milton
```

**Debería tener:**
```nginx
location /concejoguachucal/uploads {
    alias /var/www/concejoguachual/server/uploads;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 4. Probar acceso directo a una imagen

```bash
# Desde el servidor, verificar que el archivo existe
ls -la /var/www/concejoguachual/server/uploads/images/noticia-*.png | head -1

# Probar acceso a través de Nginx (desde el navegador)
# https://camsoft.com.co/concejoguachucal/uploads/images/NOMBRE_DEL_ARCHIVO.png
```

## 📝 Próximos Pasos

1. **Hacer build del frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Subir el build al servidor:**
   ```bash
   # Subir la carpeta build completa
   scp -r client/build/* usuario@servidor:/var/www/concejoguachual/client/build/
   ```

3. **Verificar permisos:**
   ```bash
   sudo chown -R www-data:www-data /var/www/concejoguachual/client/build
   sudo chmod -R 755 /var/www/concejoguachual/client/build
   ```

4. **Probar crear una noticia:**
   - Ve a: `https://camsoft.com.co/concejoguachucal/admin/noticias`
   - Crea una nueva noticia con imagen
   - Verifica que la imagen se muestra correctamente

## ⚠️ Si el Problema Persiste

1. **Verificar que el archivo existe físicamente:**
   ```bash
   # Buscar el archivo específico
   find /var/www/concejoguachual/server/uploads -name "noticia-1766153711083-862648227.png"
   ```

2. **Verificar logs de Nginx:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Verificar que Nginx puede leer el directorio:**
   ```bash
   sudo -u www-data ls /var/www/concejoguachual/server/uploads/images/
   ```
