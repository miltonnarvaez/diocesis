-- Sistema de usuarios y permisos por módulo
-- Ejecutar después de schema.sql

USE diocesis;

-- Tabla de módulos/permisos disponibles
CREATE TABLE IF NOT EXISTS modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de relación usuarios-permisos (muchos a muchos)
CREATE TABLE IF NOT EXISTS usuarios_permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    modulo_id INT NOT NULL,
    puede_crear BOOLEAN DEFAULT FALSE,
    puede_editar BOOLEAN DEFAULT FALSE,
    puede_eliminar BOOLEAN DEFAULT FALSE,
    puede_publicar BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_modulo (usuario_id, modulo_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_modulo (modulo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar módulos disponibles
INSERT INTO modulos (nombre, descripcion) VALUES
('noticias', 'Gestión de noticias y publicaciones'),
('convocatorias', 'Gestión de convocatorias y anuncios'),
('gaceta', 'Gestión de documentos de gaceta'),
('transparencia', 'Gestión de documentos de transparencia'),
('sesiones', 'Gestión de sesiones del concejo'),
('autoridades', 'Gestión de autoridades del concejo'),
('configuracion', 'Configuración general del sitio'),
('usuarios', 'Gestión de usuarios y permisos')
ON DUPLICATE KEY UPDATE descripcion=VALUES(descripcion);

-- Actualizar tabla usuarios para tener más flexibilidad
-- Agregar campo de rol más específico si no existe
ALTER TABLE usuarios 
MODIFY COLUMN rol ENUM('admin', 'editor', 'usuario') DEFAULT 'usuario';

-- Si el usuario es admin, tiene todos los permisos automáticamente
-- Los permisos específicos se asignan a usuarios no-admin

















