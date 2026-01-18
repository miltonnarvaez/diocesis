-- Tabla para historia del Concejo
CREATE TABLE IF NOT EXISTS historia_concejo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    fecha_evento DATE,
    imagen_url VARCHAR(500),
    categoria ENUM('fundacion', 'hitos', 'autoridades_historicas', 'reformas', 'logros', 'otros') DEFAULT 'otros',
    orden INT DEFAULT 0,
    publicada BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_fecha_evento (fecha_evento),
    INDEX idx_orden (orden),
    INDEX idx_publicada (publicada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;















