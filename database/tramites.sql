-- Tabla para trámites del Concejo
CREATE TABLE IF NOT EXISTS tramites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) DEFAULT 'otros',
    requisitos JSON,
    costo DECIMAL(10, 2) DEFAULT 0.00,
    tiempo_respuesta VARCHAR(100),
    documentos_necesarios JSON,
    pasos JSON,
    contacto_responsable VARCHAR(255),
    email_contacto VARCHAR(255),
    telefono_contacto VARCHAR(50),
    horario_atencion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_activo (activo),
    INDEX idx_destacado (destacado),
    INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;















