# Comandos para Cambiar Permisos de la Carpeta Build

## 1. Navegar a la carpeta del proyecto en el servidor

```bash
cd /var/www/concejoguachucal
```

## 2. Cambiar el propietario de la carpeta build (si es necesario)

Si necesitas cambiar el propietario a `www-data` (usuario de Nginx):

```bash
sudo chown -R www-data:www-data client/build
```

O si prefieres mantener el propietario actual pero dar permisos al grupo:

```bash
sudo chown -R $USER:www-data client/build
```

## 3. Cambiar los permisos de la carpeta build

### Opción A: Permisos estándar (recomendado)
```bash
sudo chmod -R 755 client/build
```

### Opción B: Permisos más restrictivos (si tienes problemas)
```bash
sudo chmod -R 644 client/build
sudo find client/build -type d -exec chmod 755 {} \;
```

### Opción C: Permisos más permisivos (si hay problemas de acceso)
```bash
sudo chmod -R 755 client/build
sudo chmod -R 644 client/build/*
```

## 4. Verificar los permisos

```bash
ls -la client/build
```

Deberías ver algo como:
```
drwxr-xr-x  www-data www-data  build/
```

## 5. Verificar que Nginx puede leer los archivos

```bash
sudo -u www-data ls client/build
```

Si este comando funciona sin errores, los permisos están correctos.

## Notas importantes:

- **755** para directorios: permite lectura, escritura y ejecución al propietario, y lectura y ejecución a grupo y otros
- **644** para archivos: permite lectura y escritura al propietario, y solo lectura a grupo y otros
- El usuario `www-data` es el usuario típico de Nginx en sistemas Ubuntu/Debian
- Si usas otro servidor web (como Apache), el usuario podría ser `apache` o `httpd`

## Si tienes problemas:

1. Verifica qué usuario usa Nginx:
```bash
ps aux | grep nginx
```

2. Verifica los permisos actuales:
```bash
ls -la client/build | head -20
```

3. Si necesitas permisos más abiertos temporalmente para debug:
```bash
sudo chmod -R 777 client/build
```
⚠️ **ADVERTENCIA**: Esto da permisos completos a todos. Úsalo solo para debug y luego vuelve a permisos más restrictivos.
