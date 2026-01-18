-- Tabla de Cursos y Talleres
CREATE TABLE IF NOT EXISTS cursos_formacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(100), -- curso, taller, seminario, diplomado, etc.
  categoria VARCHAR(100), -- catequesis, teología, pastoral, biblia, etc.
  duracion VARCHAR(100), -- Ej: "40 horas", "8 semanas"
  modalidad VARCHAR(50), -- presencial, virtual, mixto
  fecha_inicio DATE,
  fecha_fin DATE,
  horario TEXT,
  lugar VARCHAR(255),
  cupos_maximos INT,
  cupos_disponibles INT,
  costo DECIMAL(10, 2) DEFAULT 0.00,
  requisitos TEXT,
  contenido JSON, -- Temas del curso
  instructor VARCHAR(255),
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
  INDEX idx_categoria (categoria),
  INDEX idx_inscripcion_abierta (inscripcion_abierta),
  INDEX idx_publicada (publicada),
  INDEX idx_destacada (destacada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Inscripciones a Cursos
CREATE TABLE IF NOT EXISTS inscripciones_cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  documento VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  parroquia VARCHAR(255),
  observaciones TEXT,
  estado ENUM('pendiente', 'aprobada', 'rechazada', 'completada') DEFAULT 'pendiente',
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_aprobacion DATETIME,
  usuario_aprueba_id INT,
  FOREIGN KEY (curso_id) REFERENCES cursos_formacion(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_aprueba_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_curso (curso_id),
  INDEX idx_estado (estado),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
















