# Solución: Archivos No Se Guardan en el Repositorio

## Problema
Los archivos dicen "subido con éxito" pero no aparecen en las carpetas. Error 500 en `/api/configuracion`.

## Diagnóstico en el Servidor

Ejecuta estos comandos en el servidor:

### Paso 1: Ver los Logs del Servidor

```bash
# Ver los logs de PM2 para ver errores al subir archivos
pm2 logs concejo-backend --lines 50

# Ver los logs de error específicos
pm2 logs concejo-backend --err --lines 30
```

### Paso 2: Verificar que las Carpetas Existen

```bash
# Verificar que existe el directorio base
ls -la /var/www/concejoguachual/server/uploads/repositorio-temporal

# Verificar que existen las carpetas
ls -la /var/www/concejoguachual/server/uploads/repositorio-temporal/ | head -20
```

### Paso 3: Verificar Permisos

```bash
# Ver permisos actuales
ls -la /var/www/concejoguachual/server/uploads/repositorio-temporal

# Asegurar permisos correctos (el usuario que corre Node debe poder escribir)
chown -R root:root /var/www/concejoguachual/server/uploads/repositorio-temporal
chmod -R 755 /var/www/concejoguachual/server/uploads/repositorio-temporal
```

### Paso 4: Probar Subir un Archivo Manualmente

```bash
# Crear un archivo de prueba
echo "test" > /var/www/concejoguachual/server/uploads/repositorio-temporal/documentos-generales/test.txt

# Verificar que se creó
ls -la /var/www/concejoguachual/server/uploads/repositorio-temporal/documentos-generales/
```

### Paso 5: Verificar el Error de Configuración

El error 500 en `/api/configuracion` puede estar causando problemas. Verifica:

```bash
# Ver los logs cuando se accede a /api/configuracion
pm2 logs concejo-backend | grep configuracion
```

## Soluciones Comunes

### Solución 1: Permisos Incorrectos

Si el usuario que corre Node.js no puede escribir en la carpeta:

```bash
# Ver qué usuario corre Node (normalmente root o www-data)
ps aux | grep "node index.js"

# Ajustar permisos según el usuario
# Si es root:
chown -R root:root /var/www/concejoguachual/server/uploads/repositorio-temporal
chmod -R 755 /var/www/concejoguachual/server/uploads/repositorio-temporal

# Si es otro usuario, reemplaza 'usuario' con el usuario real:
chown -R usuario:usuario /var/www/concejoguachual/server/uploads/repositorio-temporal
```

### Solución 2: Carpeta No Existe

Si la carpeta no existe, créala:

```bash
# Crear la carpeta base
mkdir -p /var/www/concejoguachual/server/uploads/repositorio-temporal

# Ejecutar el script para crear todas las carpetas
cd /var/www/concejoguachual/server
node scripts/crear-repositorio-temporal.js
```

### Solución 3: Verificar el Código de Subida

El error puede estar en el código. Verifica los logs para ver el error exacto.

## Verificar que Funciona

Después de corregir, prueba:

1. Sube un archivo desde la interfaz web
2. Verifica que aparece en la carpeta:
```bash
ls -la /var/www/concejoguachual/server/uploads/repositorio-temporal/documentos-generales/
```

3. Verifica que aparece en la interfaz web al recargar
