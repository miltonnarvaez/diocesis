# Guía para Probar el Sistema de Usuarios

## Paso 1: Ejecutar el Script SQL

Primero, necesitas ejecutar el script SQL para crear las tablas de permisos:

### Opción A: Desde la línea de comandos

```bash
mysql -u tu_usuario -p concejo_guachucal < database/usuarios_permisos.sql
```

### Opción B: Desde MySQL Workbench o cliente MySQL

1. Abre tu cliente MySQL
2. Conéctate a la base de datos `concejo_guachucal`
3. Ejecuta el contenido del archivo `database/usuarios_permisos.sql`

### Opción C: Desde la terminal MySQL

```sql
USE concejo_guachucal;
SOURCE database/usuarios_permisos.sql;
```

### Verificar que se crearon las tablas

```sql
SHOW TABLES;
-- Deberías ver: modulos y usuarios_permisos

SELECT * FROM modulos;
-- Deberías ver 8 módulos registrados
```

## Paso 2: Iniciar el Servidor Backend

Abre una terminal en la carpeta `server` y ejecuta:

```bash
cd server
npm install  # Si no has instalado las dependencias
npm start
```

O si usas nodemon:

```bash
npm run dev
```

El servidor debería iniciar en `http://localhost:5000`

## Paso 3: Iniciar el Cliente Frontend

Abre otra terminal en la carpeta `client` y ejecuta:

```bash
cd client
npm install  # Si no has instalado las dependencias
npm start
```

El cliente debería iniciar en `http://localhost:3000`

## Paso 4: Iniciar Sesión como Administrador

1. Ve a `http://localhost:3000/admin/login`
2. Inicia sesión con las credenciales del administrador:
   - Email: `admin@concejo.guachucal.gov.co`
   - Contraseña: `admin123` (o la que hayas configurado)

## Paso 5: Acceder a la Gestión de Usuarios

1. Una vez iniciada sesión, serás redirigido al Dashboard
2. Haz clic en la tarjeta **"👤 Usuarios"** o ve directamente a `/admin/usuarios`

## Paso 6: Probar la Creación de Usuarios

### Crear un Usuario Editor

1. Haz clic en **"+ Nuevo Usuario"**
2. Completa el formulario:
   - **Nombre**: `Editor de Noticias`
   - **Email**: `editor@concejo.guachucal.gov.co`
   - **Contraseña**: `editor123`
   - **Rol**: `Editor`
   - **Estado**: Activo ✅
3. En la sección **"Permisos por Módulo"**:
   - Marca **Noticias**: ✅ Crear, ✅ Editar, ✅ Publicar
   - Marca **Convocatorias**: ✅ Crear, ✅ Editar
4. Haz clic en **"Crear Usuario"**

### Crear un Usuario Regular

1. Haz clic en **"+ Nuevo Usuario"**
2. Completa el formulario:
   - **Nombre**: `Usuario Regular`
   - **Email**: `usuario@concejo.guachucal.gov.co`
   - **Contraseña**: `usuario123`
   - **Rol**: `Usuario`
   - **Estado**: Activo ✅
3. Asigna permisos limitados:
   - **Gaceta**: ✅ Editar (solo editar, no crear ni eliminar)
4. Haz clic en **"Crear Usuario"**

## Paso 7: Probar la Edición de Usuarios

1. En la lista de usuarios, encuentra el usuario que acabas de crear
2. Haz clic en **"Editar"**
3. Modifica algunos campos:
   - Cambia el nombre
   - Agrega o quita permisos
4. Haz clic en **"Actualizar Usuario"**
5. Verifica que los cambios se reflejen en la lista

## Paso 8: Probar los Permisos

### Probar como Administrador

1. Cierra sesión
2. Inicia sesión como administrador
3. Deberías poder acceder a todos los módulos sin restricciones

### Probar como Editor

1. Cierra sesión
2. Inicia sesión con el usuario editor que creaste:
   - Email: `editor@concejo.guachucal.gov.co`
   - Contraseña: `editor123`
3. Intenta acceder a diferentes módulos:
   - ✅ Deberías poder crear/editar noticias
   - ✅ Deberías poder crear/editar convocatorias
   - ❌ No deberías poder eliminar (si no se asignó ese permiso)
   - ❌ No deberías poder acceder a usuarios (solo admin)

### Probar como Usuario Regular

1. Cierra sesión
2. Inicia sesión con el usuario regular:
   - Email: `usuario@concejo.guachucal.gov.co`
   - Contraseña: `usuario123`
3. Intenta acceder a diferentes módulos:
   - ✅ Deberías poder editar gaceta (si se asignó ese permiso)
   - ❌ No deberías poder crear o eliminar
   - ❌ No deberías poder acceder a módulos sin permisos

## Paso 9: Probar la Eliminación de Usuarios

1. Inicia sesión como administrador
2. Ve a la gestión de usuarios
3. Intenta eliminar un usuario (no tu propio usuario)
4. Confirma la eliminación
5. Verifica que el usuario ya no aparezca en la lista

## Paso 10: Verificar en la Base de Datos

Puedes verificar directamente en la base de datos:

```sql
-- Ver todos los usuarios
SELECT id, nombre, email, rol, activo FROM usuarios;

-- Ver permisos de un usuario específico
SELECT u.nombre, u.email, m.nombre as modulo, 
       up.puede_crear, up.puede_editar, up.puede_eliminar, up.puede_publicar
FROM usuarios u
LEFT JOIN usuarios_permisos up ON u.id = up.usuario_id
LEFT JOIN modulos m ON up.modulo_id = m.id
WHERE u.email = 'editor@concejo.guachucal.gov.co';
```

## Solución de Problemas

### Error: "No tienes permisos para acceder al módulo"

- Verifica que el usuario tenga el rol correcto
- Si no es admin, verifica que tenga permisos asignados en la tabla `usuarios_permisos`

### Error: "Token inválido o expirado"

- Cierra sesión y vuelve a iniciar sesión
- Verifica que el token se esté enviando correctamente en las peticiones

### Error: "El email ya está registrado"

- El email debe ser único
- Usa un email diferente o elimina el usuario existente

### Las tablas no se crean

- Verifica que estés usando la base de datos correcta
- Verifica que el usuario de MySQL tenga permisos de CREATE TABLE
- Revisa los mensajes de error en MySQL

## Próximos Pasos

Una vez que hayas probado el sistema de usuarios, puedes:

1. Crear usuarios reales para tu equipo
2. Asignar permisos específicos según las responsabilidades
3. Continuar con la implementación de las páginas de administración para:
   - Convocatorias
   - Transparencias
   - Autoridades
   - Sesiones

¡Listo para probar! 🚀















