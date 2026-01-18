# Solución para Problemas de MySQL en XAMPP

## Problema Actual
MySQL en XAMPP se inicia pero se detiene inmediatamente con el error:
- `unknown option '--initialize-insecure'`
- Archivos de InnoDB corruptos o faltantes

## Soluciones

### Solución 1: Reparar MySQL (Recomendado)

1. **Detener MySQL en XAMPP**
   - Abre XAMPP Control Panel
   - Haz clic en "Stop" en MySQL

2. **Editar my.ini**
   - Haz clic en "Config" junto a MySQL
   - Selecciona "my.ini"
   - Busca la línea que contenga `--initialize-insecure`
   - Elimínala o coméntala con `#`
   - Guarda el archivo

3. **Reiniciar MySQL**
   - Haz clic en "Start" en MySQL
   - Espera a que el estado cambie a verde

### Solución 2: Reinstalar MySQL en XAMPP

1. **Hacer backup de datos**
   ```powershell
   # Copiar la carpeta data
   Copy-Item "C:\xampp\mysql\data" "C:\xampp\mysql\data_backup" -Recurse
   ```

2. **Reinstalar MySQL**
   - Descarga XAMPP nuevamente
   - Ejecuta el instalador
   - Selecciona solo "MySQL" para reinstalar
   - Restaura los datos desde el backup

### Solución 3: Crear Usuario Manualmente en phpMyAdmin

Si MySQL funciona pero no puedes crear el usuario desde el script:

1. **Abrir phpMyAdmin**
   - Ve a: http://localhost/phpmyadmin

2. **Seleccionar base de datos**
   - Selecciona la base de datos "diocesis"

3. **Insertar usuario en la tabla usuarios**
   ```sql
   INSERT INTO usuarios (nombre, email, password, rol, activo) 
   VALUES (
     'Administrador', 
     'admin@diocesis.gov.co', 
     '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 
     'admin', 
     1
   );
   ```

   **Nota:** El hash de la contraseña "admin123" es:
   ```
   $2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq
   ```

### Solución 4: Usar MySQL Standalone

Si XAMPP sigue dando problemas:

1. **Instalar MySQL directamente**
   - Descarga MySQL Community Server
   - Instálalo como servicio de Windows
   - Configura el puerto 3306

2. **Actualizar .env**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña_mysql
   DB_NAME=diocesis
   ```

## Credenciales del Administrador

Una vez que MySQL esté funcionando, las credenciales son:

- **Email:** `admin@diocesis.gov.co`
- **Contraseña:** `admin123`

## Verificar que Funciona

Después de aplicar cualquier solución:

```bash
cd server
node scripts/crear-admin-alternativo.js
```

Este script intentará múltiples formas de conectarse a MySQL.
