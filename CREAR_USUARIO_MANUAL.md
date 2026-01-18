# Crear Usuario Administrador Manualmente

## Credenciales
- **Email:** `admin@diocesis.gov.co`
- **Contraseña:** `admin123`

## Opción 1: Usar el script SQL directamente

1. **Asegúrate de que MySQL esté corriendo en XAMPP**

2. **Ejecuta el script SQL:**
   ```bash
   cd server
   "C:\xampp\mysql\bin\mysql.exe" -u root < scripts/crear-usuario-sql.sql
   ```

   O ejecuta el archivo `.bat`:
   ```bash
   server\scripts\ejecutar-sql-xampp.bat
   ```

## Opción 2: Ejecutar SQL manualmente en MySQL

1. **Abre una terminal y ejecuta:**
   ```bash
   "C:\xampp\mysql\bin\mysql.exe" -u root
   ```

2. **Ejecuta estos comandos SQL:**
   ```sql
   USE diocesis;
   
   INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (
     'Administrador',
     'admin@diocesis.gov.co',
     '$2a$10$XUcgfUsHDBXwwA9fT0hP0efRLwzcIPtzcYBaThgzpJSsKmY7S6/ly',
     'admin',
     1
   )
   ON DUPLICATE KEY UPDATE
     nombre = 'Administrador',
     password = '$2a$10$XUcgfUsHDBXwwA9fT0hP0efRLwzcIPtzcYBaThgzpJSsKmY7S6/ly',
     rol = 'admin',
     activo = 1;
   ```

## Opción 3: Si la base de datos no existe

Si la base de datos "diocesis" no existe, créala primero:

```sql
CREATE DATABASE IF NOT EXISTS diocesis;
USE diocesis;
```

Luego ejecuta el script de creación de tablas o el INSERT del usuario.

## Verificar que funciona

Después de crear el usuario, intenta iniciar sesión en:
- URL: `http://localhost:3001/admin/login`
- Email: `admin@diocesis.gov.co`
- Contraseña: `admin123`
