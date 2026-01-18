-- Tabla para sesiones del concejo
CREATE TABLE IF NOT EXISTS sesiones_concejo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_sesion VARCHAR(50) NOT NULL,
    tipo ENUM('ordinaria', 'extraordinaria', 'especial') DEFAULT 'ordinaria',
    fecha DATE NOT NULL,
    hora TIME,
    lugar VARCHAR(255) DEFAULT 'Sala de Sesiones del Concejo Municipal',
    orden_dia TEXT,
    acta_url VARCHAR(500),
    video_url VARCHAR(500),
    video_embed_code TEXT,
    resumen TEXT,
    publicada BOOLEAN DEFAULT FALSE,
    destacada BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fecha (fecha),
    INDEX idx_tipo (tipo),
    INDEX idx_publicada (publicada),
    INDEX idx_destacada (destacada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para documentos de sesiones (acuerdos, proyectos, etc. relacionados)
CREATE TABLE IF NOT EXISTS documentos_sesion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id INT NOT NULL,
    tipo ENUM('acuerdo', 'proyecto', 'decreto', 'resolucion', 'otro') NOT NULL,
    numero VARCHAR(50),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    archivo_url VARCHAR(500),
    votacion_a_favor INT DEFAULT 0,
    votacion_en_contra INT DEFAULT 0,
    votacion_abstencion INT DEFAULT 0,
    aprobado BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sesion_id) REFERENCES sesiones_concejo(id) ON DELETE CASCADE,
    INDEX idx_sesion (sesion_id),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para asistentes a sesiones
CREATE TABLE IF NOT EXISTS asistentes_sesion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sesion_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    asistio BOOLEAN DEFAULT TRUE,
    justificacion TEXT,
    FOREIGN KEY (sesion_id) REFERENCES sesiones_concejo(id) ON DELETE CASCADE,
    INDEX idx_sesion (sesion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

















