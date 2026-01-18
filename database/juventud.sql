-- Tabla de Actividades Juveniles
CREATE TABLE IF NOT EXISTS actividades_juventud (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(100), -- encuentro, retiro, formación, servicio, recreativo, etc.
  fecha_inicio DATETIME,
  fecha_fin DATETIME,
  lugar VARCHAR(255),
  edad_minima INT DEFAULT 14,
  edad_maxima INT DEFAULT 30,
  cupos_maximos INT,
  cupos_disponibles INT,
  costo DECIMAL(10, 2) DEFAULT 0.00,
  responsable VARCHAR(255),
  contacto VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(50),
  imagen_url VARCHAR(500),
  inscripcion_abierta BOOLEAN DEFAULT TRUE,
  publicada BOOLEAN DEFAULT TRUE,
  destacada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_inscripcion_abierta (inscripcion_abierta),
  INDEX idx_publicada (publicada),
  INDEX idx_destacada (destacada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Grupos Juveniles
CREATE TABLE IF NOT EXISTS grupos_juveniles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  parroquia_id INT,
  coordinador VARCHAR(255),
  contacto VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(50),
  horario_reunion TEXT,
  lugar_reunion VARCHAR(255),
  edad_minima INT DEFAULT 14,
  edad_maxima INT DEFAULT 30,
  imagen_url VARCHAR(500),
  activo BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parroquia_id) REFERENCES parroquias(id) ON DELETE SET NULL,
  INDEX idx_parroquia (parroquia_id),
  INDEX idx_activo (activo),
  INDEX idx_destacado (destacado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
















