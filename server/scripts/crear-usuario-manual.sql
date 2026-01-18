-- Script SQL para crear el usuario administrador manualmente
-- Ejecuta este script en phpMyAdmin o en la línea de comandos de MySQL

-- Estructura de la tabla usuarios (para referencia):
-- CREATE TABLE IF NOT EXISTS usuarios (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     nombre VARCHAR(100) NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL,
--     password VARCHAR(255) NOT NULL,
--     rol ENUM('admin', 'editor') DEFAULT 'editor',
--     activo BOOLEAN DEFAULT TRUE,
--     creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar si la tabla usuarios existe
-- Si no existe, créala primero ejecutando: database/schema.sql

-- Opción 1: Crear el usuario si no existe (recomendado)
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

-- Opción 2: Si la opción 1 falla (por ejemplo, si ON DUPLICATE KEY no funciona), usa este UPDATE
-- Primero verifica si el usuario existe:
-- SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = 'admin@diocesis.gov.co';
--
-- Si existe, actualízalo:
-- UPDATE usuarios SET
--   nombre = 'Administrador',
--   password = '$2a$10$GMmWboMT5XQ0uGm20QsRiueSUyE4N3/rblcAx7xd.GU5ZnleWApYy',
--   rol = 'admin',
--   activo = 1
-- WHERE email = 'admin@diocesis.gov.co';
--
-- Si no existe, créalo:
-- INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (
--   'Administrador',
--   'admin@diocesis.gov.co',
--   '$2a$10$GMmWboMT5XQ0uGm20QsRiueSUyE4N3/rblcAx7xd.GU5ZnleWApYy',
--   'admin',
--   1
-- );

-- Verificar que el usuario se creó correctamente
SELECT id, nombre, email, rol, activo, creado_en FROM usuarios WHERE email = 'admin@diocesis.gov.co';
