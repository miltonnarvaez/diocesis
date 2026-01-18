-- Tabla de Programas para Familias
CREATE TABLE IF NOT EXISTS programas_familias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(100), -- escuela_padres, encuentro_matrimonial, terapia_familiar, etc.
  objetivo TEXT,
  duracion VARCHAR(100),
  modalidad VARCHAR(50), -- presencial, virtual, mixto
  fecha_inicio DATE,
  fecha_fin DATE,
  horario TEXT,
  lugar VARCHAR(255),
  cupos_maximos INT,
  cupos_disponibles INT,
  costo DECIMAL(10, 2) DEFAULT 0.00,
  requisitos TEXT,
  contenido JSON,
  facilitador VARCHAR(255),
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

-- Tabla de Inscripciones a Programas Familiares
CREATE TABLE IF NOT EXISTS inscripciones_familias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  programa_id INT NOT NULL,
  nombre_familia VARCHAR(255) NOT NULL,
  nombre_contacto VARCHAR(255) NOT NULL,
  documento VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  numero_miembros INT DEFAULT 1,
  observaciones TEXT,
  estado ENUM('pendiente', 'aprobada', 'rechazada', 'completada') DEFAULT 'pendiente',
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_aprobacion DATETIME,
  usuario_aprueba_id INT,
  FOREIGN KEY (programa_id) REFERENCES programas_familias(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_aprueba_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_programa (programa_id),
  INDEX idx_estado (estado),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
















