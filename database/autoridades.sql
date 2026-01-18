-- Tabla para autoridades del concejo
CREATE TABLE IF NOT EXISTS autoridades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    orden INT DEFAULT 0,
    email VARCHAR(255),
    telefono VARCHAR(50),
    foto_url VARCHAR(500),
    biografia TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cargo (cargo),
    INDEX idx_orden (orden),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar cargos comunes del concejo
INSERT INTO autoridades (nombre, cargo, orden, activo) VALUES
('Por definir', 'Presidente del Concejo', 1, TRUE),
('Por definir', 'Vicepresidente del Concejo', 2, TRUE),
('Por definir', 'Secretario del Concejo', 3, TRUE)
ON DUPLICATE KEY UPDATE nombre=nombre;

















