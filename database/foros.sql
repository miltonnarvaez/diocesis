-- Tabla para foros de discusión
CREATE TABLE IF NOT EXISTS foros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(100) DEFAULT 'General',
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    permite_comentarios BOOLEAN DEFAULT TRUE,
    requiere_moderacion BOOLEAN DEFAULT TRUE,
    creado_por_id INT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_activo (activo),
    INDEX idx_categoria (categoria),
    INDEX idx_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para comentarios en foros
CREATE TABLE IF NOT EXISTS foro_comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    foro_id INT NOT NULL,
    comentario_padre_id INT NULL,
    usuario_nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    comentario TEXT NOT NULL,
    ip_address VARCHAR(45),
    moderado BOOLEAN DEFAULT FALSE,
    aprobado BOOLEAN DEFAULT FALSE,
    moderado_por_id INT,
    fecha_moderacion DATETIME,
    observaciones_moderacion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (foro_id) REFERENCES foros(id) ON DELETE CASCADE,
    FOREIGN KEY (comentario_padre_id) REFERENCES foro_comentarios(id) ON DELETE CASCADE,
    FOREIGN KEY (moderado_por_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_foro_id (foro_id),
    INDEX idx_aprobado (aprobado),
    INDEX idx_moderado (moderado),
    INDEX idx_creado_en (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para votos en comentarios (opcional)
CREATE TABLE IF NOT EXISTS foro_votos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comentario_id INT NOT NULL,
    tipo ENUM('like', 'dislike') NOT NULL,
    ip_address VARCHAR(45),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comentario_id) REFERENCES foro_comentarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_voto (comentario_id, ip_address),
    INDEX idx_comentario_id (comentario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;














