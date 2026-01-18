-- Tabla para opiniones sobre proyectos de acuerdo
CREATE TABLE IF NOT EXISTS opiniones_proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    documento VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    organizacion VARCHAR(255),
    tipo_organizacion ENUM('ciudadano', 'organizacion', 'empresa', 'ong', 'otro') DEFAULT 'ciudadano',
    opinion TEXT NOT NULL,
    argumentos TEXT,
    sugerencias TEXT,
    ip_address VARCHAR(45),
    estado ENUM('pendiente', 'revisada', 'publicada', 'rechazada') DEFAULT 'pendiente',
    moderado_por_id INT,
    fecha_moderacion DATETIME,
    observaciones_moderacion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES documentos_gaceta(id) ON DELETE CASCADE,
    FOREIGN KEY (moderado_por_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_proyecto_id (proyecto_id),
    INDEX idx_estado (estado),
    INDEX idx_email (email),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;














