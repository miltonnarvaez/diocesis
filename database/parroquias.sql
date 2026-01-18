-- Tabla de Parroquias
CREATE TABLE IF NOT EXISTS parroquias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  nombre_canonico VARCHAR(255),
  direccion TEXT,
  telefono VARCHAR(50),
  email VARCHAR(255),
  parroco VARCHAR(255),
  vicario VARCHAR(255),
  coordenadas_lat DECIMAL(10, 8),
  coordenadas_lng DECIMAL(11, 8),
  imagen_url VARCHAR(500),
  descripcion TEXT,
  fecha_fundacion DATE,
  patrono VARCHAR(255),
  zona_pastoral VARCHAR(100),
  activa BOOLEAN DEFAULT TRUE,
  destacada BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_zona_pastoral (zona_pastoral),
  INDEX idx_activa (activa),
  INDEX idx_destacada (destacada),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Horarios de Misa por Parroquia
CREATE TABLE IF NOT EXISTS horarios_misa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parroquia_id INT NOT NULL,
  dia_semana ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') NOT NULL,
  hora TIME NOT NULL,
  tipo_misa VARCHAR(100), -- ordinaria, extraordinaria, especial, etc.
  idioma VARCHAR(50) DEFAULT 'español',
  notas TEXT,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (parroquia_id) REFERENCES parroquias(id) ON DELETE CASCADE,
  INDEX idx_parroquia (parroquia_id),
  INDEX idx_dia_semana (dia_semana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar algunas parroquias de ejemplo
INSERT INTO parroquias (nombre, direccion, telefono, parroco, zona_pastoral, activa, destacada) VALUES
('Catedral Nuestra Señora de las Lajas', 'Carrera 6 No. 7-01, Ipiales', '3151234567', 'Mons. Luis Alberto Corral', 'Zona Centro', TRUE, TRUE),
('Parroquia San Pedro', 'Calle 10 No. 5-20, Ipiales', '3152345678', 'P. Juan Pérez', 'Zona Norte', TRUE, FALSE),
('Parroquia San José', 'Carrera 3 No. 8-15, Ipiales', '3153456789', 'P. María González', 'Zona Sur', TRUE, FALSE);
















