# Solución: Error de Credenciales MySQL

## 🔍 Problema
```
Access denied for user 'concejo_user'@'localhost' (using password: YES)
```

**Causa**: El usuario `concejo_user` no existe en MySQL o las credenciales son incorrectas.

## ✅ Solución Paso a Paso

### 1. Verificar las Credenciales en .env

```bash
cd /var/www/concejoguachual/server
cat .env | grep DB_
```

**Deberías ver algo como:**
```
DB_HOST=127.0.0.1
DB_USER=concejo_user
DB_PASSWORD=tu_password_aqui
DB_NAME=concejo_guachucal
```

### 2. Conectarse a MySQL como root

```bash
mysql -u root -p
```

**Ingresa la contraseña de root cuando te la pida.**

### 3. Verificar si el usuario existe

Dentro de MySQL, ejecuta:
```sql
SELECT User, Host FROM mysql.user WHERE User = 'concejo_user';
```

**Si no devuelve resultados**, el usuario no existe y necesitas crearlo.

### 4. Opción A: Crear el Usuario (si no existe)

```sql
-- Crear el usuario con contraseña
CREATE USER 'concejo_user'@'localhost' IDENTIFIED BY 'TU_PASSWORD_AQUI';

-- Dar permisos completos sobre la base de datos
GRANT ALL PRIVILEGES ON concejo_guachucal.* TO 'concejo_user'@'localhost';

-- Aplicar los cambios
FLUSH PRIVILEGES;

-- Verificar
SELECT User, Host FROM mysql.user WHERE User = 'concejo_user';
```

**Salir de MySQL:**
```sql
EXIT;
```

### 5. Opción B: Usar el Usuario root (temporal)

Si prefieres usar root temporalmente mientras solucionas el problema:

```bash
cd /var/www/concejoguachual/server
nano .env
```

**Cambiar:**
```
DB_USER=root
DB_PASSWORD=tu_password_de_root
```

**Guardar:** `Ctrl+X`, luego `Y`, luego `Enter`

### 6. Opción C: Cambiar la Contraseña del Usuario Existente

Si el usuario existe pero la contraseña es incorrecta:

```sql
-- Conectarse como root
mysql -u root -p

-- Cambiar la contraseña
ALTER USER 'concejo_user'@'localhost' IDENTIFIED BY 'NUEVA_PASSWORD';

-- Aplicar cambios
FLUSH PRIVILEGES;

EXIT;
```

Luego actualiza el `.env` con la nueva contraseña.

### 7. Verificar que la Base de Datos Existe

```sql
-- Conectarse como root
mysql -u root -p

-- Ver bases de datos
SHOW DATABASES;

-- Si no existe concejo_guachucal, crearla
CREATE DATABASE IF NOT EXISTS concejo_guachucal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

EXIT;
```

### 8. Reiniciar el Backend

```bash
cd /var/www/concejoguachual/server
pm2 restart concejo-backend
pm2 logs concejo-backend --lines 20
```

**Deberías ver:**
```
✅ Conectado a MySQL
   Base de datos: concejo_guachucal
🚀 Servidor corriendo en http://localhost:5000
```

## 📋 Script de Verificación Rápida

```bash
#!/bin/bash
echo "=========================================="
echo "  Verificación de Usuario MySQL"
echo "=========================================="

echo -e "\n1. Credenciales en .env:"
cd /var/www/concejoguachual/server
grep "^DB_" .env | sed 's/PASSWORD=.*/PASSWORD=***/'

echo -e "\n2. Verificar usuario en MySQL:"
mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User = 'concejo_user';" 2>/dev/null || echo "⚠️  Ejecuta: mysql -u root -p"

echo -e "\n3. Verificar base de datos:"
mysql -u root -p -e "SHOW DATABASES LIKE 'concejo_guachucal';" 2>/dev/null || echo "⚠️  Ejecuta: mysql -u root -p"

echo -e "\n=========================================="
```

## ⚠️ Recomendación

**Opción más rápida**: Usar root temporalmente para verificar que todo funciona, luego crear el usuario específico:

```bash
# 1. Editar .env
cd /var/www/concejoguachual/server
nano .env

# Cambiar a:
DB_USER=root
DB_PASSWORD=tu_password_de_root

# 2. Reiniciar
pm2 restart concejo-backend
```

Luego, cuando tengas tiempo, crea el usuario específico con permisos limitados por seguridad.
