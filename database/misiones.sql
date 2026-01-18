-- Tabla de Misiones
CREATE TABLE IF NOT EXISTS misiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(100), -- ad gentes, territorio, parroquial, etc.
  ubicacion VARCHAR(255),
  coordenadas_lat DECIMAL(10, 8),
  coordenadas_lng DECIMAL(11, 8),
  fecha_inicio DATE,
  fecha_fin DATE,
  misioneros JSON, -- Lista de misioneros asignados
  objetivos TEXT,
  actividades JSON,
  estado ENUM('planificacion', 'en_ejecucion', 'finalizada') DEFAULT 'planificacion',
  imagen_url VARCHAR(500),
  publicada BOOLEAN DEFAULT TRUE,
  destacada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_estado (estado),
  INDEX idx_publicada (publicada),
  INDEX idx_destacada (destacada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Misioneros
CREATE TABLE IF NOT EXISTS misioneros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  tipo VARCHAR(100), -- sacerdote, religioso, laico, etc.
  biografia TEXT,
  mision_actual_id INT,
  experiencia TEXT,
  contacto VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(50),
  imagen_url VARCHAR(500),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mision_actual_id) REFERENCES misiones(id) ON DELETE SET NULL,
  INDEX idx_tipo (tipo),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
















