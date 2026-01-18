-- Base de datos para Diócesis
CREATE DATABASE IF NOT EXISTS diocesis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE diocesis;

-- Tabla de usuarios (administradores)
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

-- Tabla de noticias
CREATE TABLE IF NOT EXISTS noticias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    resumen VARCHAR(500),
    imagen_url VARCHAR(255),
    categoria VARCHAR(50) DEFAULT 'Noticias',
    autor_id INT,
    publicada BOOLEAN DEFAULT FALSE,
    fecha_publicacion DATE,
    visitas INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_publicada (publicada),
    INDEX idx_fecha (fecha_publicacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de convocatorias
CREATE TABLE IF NOT EXISTS convocatorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    imagen_url VARCHAR(255),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    destacada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activa (activa),
    INDEX idx_destacada (destacada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de documentos de gaceta
CREATE TABLE IF NOT EXISTS documentos_gaceta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('acuerdo', 'acta', 'decreto', 'proyecto', 'manual', 'ley', 'politica') NOT NULL,
    numero VARCHAR(50),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    archivo_url VARCHAR(255),
    fecha DATE,
    publicada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_publicada (publicada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de documentos de transparencia
CREATE TABLE IF NOT EXISTS documentos_transparencia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(100) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    archivo_url VARCHAR(255),
    fecha DATE,
    publicada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_publicada (publicada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de configuración del sitio
CREATE TABLE IF NOT EXISTS configuracion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(50) DEFAULT 'texto',
    descripcion VARCHAR(255),
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario administrador por defecto (password: admin123)
-- La contraseña es el hash bcrypt de "admin123"
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@concejo.guachucal.gov.co', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'admin')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
('nombre_concejo', 'Concejo Municipal de Guachucal', 'texto', 'Nombre oficial del concejo'),
('direccion', 'Calle Principal, Guachucal, Nariño', 'texto', 'Dirección del concejo'),
('telefono', '+57 (2) XXX-XXXX', 'texto', 'Teléfono de contacto'),
('email', 'contacto@concejo.guachucal.gov.co', 'texto', 'Email de contacto'),
('horario_atencion', 'Lunes a Viernes: 8:00 AM - 12:00 PM y 2:00 PM - 6:00 PM', 'texto', 'Horario de atención'),
('facebook_url', 'https://www.facebook.com/p/Concejo-Municipal-de-Guachucal-61555825801735/?locale=es_LA', 'texto', 'URL de la página de Facebook')
ON DUPLICATE KEY UPDATE valor=valor;

-- Ejecutar también los scripts de sesiones y autoridades:
-- SOURCE database/sesiones_concejo.sql;
-- SOURCE database/autoridades.sql;


