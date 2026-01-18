-- Tabla para galería multimedia
CREATE TABLE IF NOT EXISTS galeria_multimedia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo ENUM('foto', 'video') NOT NULL,
    archivo_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    categoria VARCHAR(100) DEFAULT 'otros',
    fecha_evento DATE,
    fecha_publicacion DATE DEFAULT (CURRENT_DATE),
    publicada BOOLEAN DEFAULT TRUE,
    destacada BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0,
    tags JSON,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo (tipo),
    INDEX idx_categoria (categoria),
    INDEX idx_publicada (publicada),
    INDEX idx_destacada (destacada),
    INDEX idx_fecha_evento (fecha_evento),
    INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para categorías de galería (opcional, para categorías personalizables)
CREATE TABLE IF NOT EXISTS galeria_categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    orden INT DEFAULT 0,
    activa BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activa (activa),
    INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar categorías por defecto
INSERT INTO galeria_categorias (nombre, descripcion, icono, orden) VALUES
('sesiones', 'Sesiones del Concejo', '📋', 1),
('eventos', 'Eventos y actividades', '🎉', 2),
('autoridades', 'Autoridades del Concejo', '👥', 3),
('actividades', 'Actividades comunitarias', '🏛️', 4),
('otros', 'Otros', '📸', 5)
ON DUPLICATE KEY UPDATE nombre=nombre;















