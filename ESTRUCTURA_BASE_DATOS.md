# Estructura de la Base de Datos - Diócesis

## Base de Datos Principal
- **Nombre**: `diocesis`
- **Charset**: `utf8mb4`
- **Collation**: `utf8mb4_unicode_ci`

## Tabla: usuarios

### Estructura
```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'editor') DEFAULT 'editor',
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Campos
- **id**: Identificador único (auto-incremental)
- **nombre**: Nombre completo del usuario (máximo 100 caracteres)
- **email**: Correo electrónico único (máximo 100 caracteres, UNIQUE)
- **password**: Hash bcrypt de la contraseña (máximo 255 caracteres)
- **rol**: Rol del usuario (`'admin'` o `'editor'`, por defecto `'editor'`)
- **activo**: Estado del usuario (BOOLEAN, por defecto `TRUE`)
- **creado_en**: Fecha y hora de creación (automático)
- **actualizado_en**: Fecha y hora de última actualización (automático)

### Índices
- **PRIMARY KEY**: `id`
- **UNIQUE**: `email`

## Otras Tablas Principales

### noticias
- Gestión de noticias y publicaciones
- Relación con `usuarios` (autor_id)

### convocatorias
- Gestión de convocatorias y anuncios

### documentos_gaceta
- Documentos de gaceta (acuerdos, actas, decretos, etc.)

### documentos_transparencia
- Documentos de transparencia por categorías

### configuracion
- Configuración general del sitio

### modulos
- Módulos/permisos disponibles del sistema

### usuarios_permisos
- Relación muchos a muchos entre usuarios y módulos
- Permisos específicos por módulo (crear, editar, eliminar, publicar)

## Scripts de Base de Datos

### Archivos principales:
1. **database/schema.sql**: Estructura principal de la base de datos
2. **database/usuarios_permisos.sql**: Sistema de permisos por módulo
3. **database/inicializar_mysql_sistema.sql**: Script de inicialización

### Otros scripts:
- `actividades.sql`
- `autoridades.sql`
- `caridad.sql`
- `encuestas.sql`
- `familias.sql`
- `formacion.sql`
- `foros.sql`
- `galeria_multimedia.sql`
- `historia_concejo.sql`
- `juventud.sql`
- `liturgia.sql`
- `medios_comunicacion.sql`
- `misiones.sql`
- `noticias_archivos.sql`
- `opiniones_proyectos.sql`
- `parroquias.sql`
- `pastoral.sql`
- `pqrsd.sql`
- `sacramentos.sql`
- `sesiones_concejo.sql`
- `tramites.sql`
- `transparencia_categorias.sql`
- `verificar_pqrsd.sql`

## Crear Usuario Administrador

### Hash de contraseña para "admin123":
```
$2a$10$GMmWboMT5XQ0uGm20QsRiueSUyE4N3/rblcAx7xd.GU5ZnleWApYy
```

### SQL para crear usuario:
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

### Credenciales de acceso:
- **Email**: `admin@diocesis.gov.co`
- **Contraseña**: `admin123`
- **Rol**: `admin`

## Verificar Usuario

```sql
SELECT id, nombre, email, rol, activo, creado_en 
FROM usuarios 
WHERE email = 'admin@diocesis.gov.co';
```

## Notas Importantes

1. **Password**: Debe ser un hash bcrypt válido (60 caracteres)
2. **Email**: Debe ser único en la tabla
3. **Rol**: Solo acepta `'admin'` o `'editor'`
4. **Activo**: Debe ser `1` (TRUE) para que el usuario pueda iniciar sesión
5. **Charset**: Usa `utf8mb4` para soportar emojis y caracteres especiales
