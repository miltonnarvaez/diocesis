# Sistema de Usuarios y Permisos

## Descripción

Se ha implementado un sistema completo de gestión de usuarios con permisos por módulo. Este sistema permite:

- Crear y gestionar usuarios
- Asignar roles (admin, editor, usuario)
- Asignar permisos específicos por módulo (crear, editar, eliminar, publicar)
- Control de acceso granular a cada módulo del sistema

## Módulos Disponibles

1. **noticias** - Gestión de noticias y publicaciones
2. **convocatorias** - Gestión de convocatorias y anuncios
3. **gaceta** - Gestión de documentos de gaceta
4. **transparencia** - Gestión de documentos de transparencia
5. **sesiones** - Gestión de sesiones del concejo
6. **autoridades** - Gestión de autoridades del concejo
7. **configuracion** - Configuración general del sitio
8. **usuarios** - Gestión de usuarios y permisos

## Instalación

### 1. Ejecutar Script SQL

Ejecuta el script SQL para crear las tablas necesarias:

```bash
mysql -u tu_usuario -p concejo_guachucal < database/usuarios_permisos.sql
```

O desde MySQL:

```sql
SOURCE database/usuarios_permisos.sql;
```

### 2. Verificar Instalación

Verifica que las tablas se hayan creado correctamente:

```sql
SHOW TABLES;
-- Deberías ver: modulos y usuarios_permisos

SELECT * FROM modulos;
-- Deberías ver 8 módulos registrados
```

## Roles y Permisos

### Roles

- **admin**: Tiene acceso completo a todos los módulos. No necesita permisos específicos.
- **editor**: Usuario con permisos específicos asignados por módulo.
- **usuario**: Usuario básico, requiere permisos específicos para cada acción.

### Permisos por Módulo

Para usuarios no-admin, se pueden asignar los siguientes permisos por módulo:

- **puede_crear**: Crear nuevos registros
- **puede_editar**: Editar registros existentes
- **puede_eliminar**: Eliminar registros
- **puede_publicar**: Publicar/despublicar contenido

## Uso del Sistema

### Acceso a la Administración de Usuarios

1. Inicia sesión como administrador
2. Ve al Dashboard de Administración
3. Haz clic en "👤 Usuarios"

### Crear un Nuevo Usuario

1. Haz clic en "Nuevo Usuario"
2. Completa el formulario:
   - Nombre
   - Email
   - Contraseña
   - Rol (admin, editor, usuario)
   - Estado (activo/inactivo)
3. Si el rol no es "admin", asigna permisos por módulo
4. Haz clic en "Crear Usuario"

### Editar Usuario

1. En la lista de usuarios, haz clic en "Editar"
2. Modifica los campos necesarios
3. Para cambiar la contraseña, ingresa una nueva (dejar vacío para mantener la actual)
4. Actualiza los permisos si es necesario
5. Haz clic en "Actualizar Usuario"

### Asignar Permisos

Para usuarios no-admin:

1. Selecciona el módulo
2. Marca las acciones permitidas:
   - ✅ Crear
   - ✅ Editar
   - ✅ Eliminar
   - ✅ Publicar
3. Los permisos se guardan automáticamente al crear/actualizar el usuario

## Uso del Middleware de Permisos

En las rutas del backend, puedes usar el middleware `requirePermission`:

```javascript
const { requirePermission } = require('../middleware/auth');

// Requiere permiso de editar en el módulo de noticias
router.post('/noticias', 
  authenticateToken, 
  requirePermission('noticias', 'crear'), 
  async (req, res) => {
    // ...
  }
);

// Requiere permiso de eliminar en el módulo de convocatorias
router.delete('/convocatorias/:id', 
  authenticateToken, 
  requirePermission('convocatorias', 'eliminar'), 
  async (req, res) => {
    // ...
  }
);
```

## API Endpoints

### Usuarios

- `GET /api/usuarios` - Listar todos los usuarios (solo admin)
- `GET /api/usuarios/:id` - Obtener un usuario (solo admin)
- `POST /api/usuarios` - Crear usuario (solo admin)
- `PUT /api/usuarios/:id` - Actualizar usuario (solo admin)
- `DELETE /api/usuarios/:id` - Eliminar usuario (solo admin)
- `GET /api/usuarios/modulos/list` - Listar módulos disponibles (solo admin)

## Notas Importantes

1. **Los administradores tienen todos los permisos automáticamente** - No necesitan permisos específicos asignados.

2. **No puedes eliminar tu propio usuario** - El sistema previene que elimines tu propia cuenta.

3. **Los permisos se verifican en el backend** - Aunque el frontend puede ocultar opciones, la seguridad real está en el backend.

4. **Los usuarios inactivos no pueden iniciar sesión** - Aunque existan en la base de datos.

## Próximos Pasos

Ahora puedes continuar creando las páginas de administración para:
- Convocatorias
- Transparencias
- Autoridades
- Sesiones

Cada una de estas páginas puede usar el middleware `requirePermission` para controlar el acceso según los permisos asignados.















