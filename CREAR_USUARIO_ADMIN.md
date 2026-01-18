# Crear Usuario Administrador

## 📋 Credenciales
- **Email**: `admin@concejo.guachucal.gov.co`
- **Contraseña**: `admin123`

## 🚀 Pasos para Crear el Usuario

### Opción 1: Usando el Script (Recomendado)

```bash
cd /var/www/concejoguachual/server
node scripts/crear-admin.js
```

**Deberías ver:**
```
✅ Conectado a MySQL
📋 Credenciales del Administrador:
   Email: admin@concejo.guachucal.gov.co
   Contraseña: admin123
🔄 Verificando si el usuario existe...
✅ Usuario administrador creado exitosamente
🎉 ¡Configuración completada!
```

### Opción 2: Directamente en MySQL

```bash
mysql -u concejo_user -pConcejo_2025*+- concejo_guachucal
```

Dentro de MySQL:
```sql
-- Verificar si existe
SELECT * FROM usuarios WHERE email = 'admin@concejo.guachucal.gov.co';

-- Si no existe, crear (necesitarás hashear la contraseña primero)
-- Es mejor usar el script de Node.js que hace el hash automáticamente
```

### Opción 3: Usando el Script de Reset

Si ya existe un script similar:
```bash
cd /var/www/concejoguachual/server
node scripts/reset-admin-password.js
```

## ✅ Verificar que Funciona

1. **Verificar en la base de datos:**
   ```bash
   mysql -u concejo_user -pConcejo_2025*+- concejo_guachucal -e "SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = 'admin@concejo.guachucal.gov.co';"
   ```

2. **Probar el login:**
   - Ve a: `https://camsoft.com.co/concejoguachucal/admin/login`
   - Email: `admin@concejo.guachucal.gov.co`
   - Contraseña: `admin123`

## 🔧 Si el Script No Funciona

1. **Verificar que las dependencias están instaladas:**
   ```bash
   cd /var/www/concejoguachual/server
   npm install bcrypt mysql2
   ```

2. **Verificar el archivo .env:**
   ```bash
   cat .env | grep DB_
   ```

3. **Verificar que la tabla usuarios existe:**
   ```bash
   mysql -u concejo_user -pConcejo_2025*+- concejo_guachucal -e "SHOW TABLES LIKE 'usuarios';"
   ```
