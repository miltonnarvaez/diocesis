-- Tabla para PQRSD (Peticiones, Quejas, Reclamos, Sugerencias y Denuncias)
CREATE TABLE IF NOT EXISTS pqrsd (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_radicado VARCHAR(50) UNIQUE NOT NULL,
    tipo ENUM('peticion', 'queja', 'reclamo', 'sugerencia', 'denuncia') NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    documento VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    asunto VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    estado ENUM('pendiente', 'en_proceso', 'resuelto', 'cerrado') DEFAULT 'pendiente',
    respuesta TEXT,
    fecha_respuesta DATETIME,
    usuario_responde_id INT,
    ip_address VARCHAR(45),
    archivos_adjuntos JSON,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_responde_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_numero_radicado (numero_radicado),
    INDEX idx_tipo (tipo),
    INDEX idx_estado (estado),
    INDEX idx_email (email),
    INDEX idx_documento (documento),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para historial de seguimiento de PQRSD
CREATE TABLE IF NOT EXISTS pqrsd_seguimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pqrsd_id INT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50) NOT NULL,
    observaciones TEXT,
    usuario_id INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pqrsd_id) REFERENCES pqrsd(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_pqrsd_id (pqrsd_id),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;















