# Crear Usuario Administrador Manualmente

## Método 1: Usando phpMyAdmin (Recomendado)

### Paso 1: Abrir phpMyAdmin
1. Abre tu navegador web
2. Ve a: `http://localhost/phpmyadmin`
3. Si te pide credenciales:
   - Usuario: `root`
   - Contraseña: (déjala vacía si usas XAMPP con configuración por defecto)

### Paso 2: Seleccionar la base de datos
1. En el panel izquierdo, haz clic en la base de datos `diocesis`
2. Si no existe la base de datos, créala primero:
   - Haz clic en "Nueva" en el panel izquierdo
   - Nombre: `diocesis`
   - Cotejamiento: `utf8mb4_general_ci`
   - Haz clic en "Crear"

### Paso 3: Verificar que existe la tabla `usuarios`
1. En el panel izquierdo, expande la base de datos `diocesis`
2. Busca la tabla `usuarios`
3. Si no existe, necesitas ejecutar el `schema.sql` primero

### Paso 4: Ejecutar el SQL
1. Haz clic en la pestaña "SQL" en la parte superior
2. Copia y pega el siguiente SQL:

```sql
-- Crear o actualizar el usuario administrador
INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (
  'Administrador',
  'admin@diocesis.gov.co',
  '$2a$10$GMmWboMT5XQ0uGm20QsRiueSUyE4N3/rblcAx7xd.GU5ZnleWApYy',
  'admin',
  1
)
ON DUPLICATE KEY UPDATE
  nombre = 'Administrador',
  password = '$2a$10$GMmWboMT5XQ0uGm20QsRiueSUyE4N3/rblcAx7xd.GU5ZnleWApYy',
  rol = 'admin',
  activo = 1;
```

3. Haz clic en "Continuar" o presiona `Ctrl + Enter`

### Paso 5: Verificar
1. Deberías ver un mensaje de éxito
2. Para verificar, ejecuta este SQL:

```sql
SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = 'admin@diocesis.gov.co';
```

3. Deberías ver una fila con los datos del administrador

---

## Método 2: Usando la línea de comandos de MySQL (XAMPP)

### Paso 1: Abrir la línea de comandos
1. Abre PowerShell o CMD
2. Navega a la carpeta de MySQL de XAMPP:

```powershell
cd C:\xampp\mysql\bin
```

### Paso 2: Conectar a MySQL
```powershell
.\mysql.exe -u root diocesis
```

Si te pide contraseña (normalmente está vacía en XAMPP):
```powershell
.\mysql.exe -u root -p diocesis
```
(Presiona Enter cuando te pida la contraseña)

### Paso 3: Ejecutar el SQL
Copia y pega el siguiente SQL:

```sql
INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (
  'Administrador',
  'admin@diocesis.gov.co',
  '$2a$10$GMmWboMT5XQ0uGm20QsRiueSUyE4N3/rblcAx7xd.GU5ZnleWApYy',
  'admin',
  1
)
ON DUPLICATE KEY UPDATE
  nombre = 'Administrador',
  password = '$2a$10$GMmWboMT5XQ0uGm20QsRiueSUyE4N3/rblcAx7xd.GU5ZnleWApYy',
  rol = 'admin',
  activo = 1;
```

Presiona Enter para ejecutar.

### Paso 4: Verificar
```sql
SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = 'admin@diocesis.gov.co';
```

---

## Método 3: Usando el script SQL directamente

Si tienes el archivo `server/scripts/crear-usuario-manual.sql`:

### Opción A: Desde PowerShell
```powershell
cd C:\xampp\mysql\bin
.\mysql.exe -u root diocesis < "C:\Users\Milton Narvaez\Documents\cursor\diocesis\server\scripts\crear-usuario-manual.sql"
```

### Opción B: Desde phpMyAdmin
1. Abre phpMyAdmin: `http://localhost/phpmyadmin`
2. Selecciona la base de datos `diocesis`
3. Ve a la pestaña "Importar"
4. Haz clic en "Elegir archivo" y selecciona `crear-usuario-manual.sql`
5. Haz clic en "Continuar"

---

## Credenciales de Acceso

Una vez creado el usuario, puedes iniciar sesión en el panel de administración:

- **URL**: `http://localhost:3001/admin/login`
- **Email**: `admin@diocesis.gov.co`
- **Contraseña**: `admin123`

---

## Solución de Problemas

### Error: "Table 'diocesis.usuarios' doesn't exist"
**Solución**: Necesitas crear las tablas primero. Ejecuta el archivo `database/schema.sql` en phpMyAdmin o desde la línea de comandos.

### Error: "Access denied for user 'root'@'localhost'"
**Solución**: 
- Verifica que MySQL esté corriendo en XAMPP
- Intenta con contraseña vacía: `-u root` (sin `-p`)
- Si tienes contraseña, úsala: `-u root -p`

### Error: "Can't connect to MySQL server"
**Solución**:
1. Abre el Panel de Control de XAMPP
2. Verifica que MySQL esté corriendo (debe estar en verde)
3. Si no está corriendo, haz clic en "Start" junto a MySQL

### El usuario se crea pero no puedo iniciar sesión
**Solución**:
1. Verifica que el hash de la contraseña sea correcto
2. Asegúrate de que el campo `activo` sea `1` (true)
3. Verifica que el campo `rol` sea `'admin'`
