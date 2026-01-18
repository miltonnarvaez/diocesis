-- Tabla de Comisiones de Pastoral
CREATE TABLE IF NOT EXISTS comisiones_pastoral (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  mision TEXT,
  objetivos JSON,
  coordinador VARCHAR(255),
  contacto VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(50),
  imagen_url VARCHAR(500),
  activa BOOLEAN DEFAULT TRUE,
  destacada BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_activa (activa),
  INDEX idx_destacada (destacada),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Grupos y Movimientos
CREATE TABLE IF NOT EXISTS grupos_movimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(100), -- grupo, movimiento, asociación, etc.
  descripcion TEXT,
  mision TEXT,
  parroquia_id INT,
  comision_id INT,
  coordinador VARCHAR(255),
  contacto VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(50),
  horario_reunion TEXT,
  lugar_reunion VARCHAR(255),
  imagen_url VARCHAR(500),
  activo BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parroquia_id) REFERENCES parroquias(id) ON DELETE SET NULL,
  FOREIGN KEY (comision_id) REFERENCES comisiones_pastoral(id) ON DELETE SET NULL,
  INDEX idx_tipo (tipo),
  INDEX idx_parroquia (parroquia_id),
  INDEX idx_comision (comision_id),
  INDEX idx_activo (activo),
  INDEX idx_destacado (destacado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Actividades Pastorales
CREATE TABLE IF NOT EXISTS actividades_pastorales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(100), -- retiro, encuentro, formación, servicio, etc.
  comision_id INT,
  grupo_id INT,
  fecha_inicio DATETIME,
  fecha_fin DATETIME,
  lugar VARCHAR(255),
  responsable VARCHAR(255),
  contacto VARCHAR(255),
  imagen_url VARCHAR(500),
  publicada BOOLEAN DEFAULT TRUE,
  destacada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (comision_id) REFERENCES comisiones_pastoral(id) ON DELETE SET NULL,
  FOREIGN KEY (grupo_id) REFERENCES grupos_movimientos(id) ON DELETE SET NULL,
  INDEX idx_tipo (tipo),
  INDEX idx_comision (comision_id),
  INDEX idx_grupo (grupo_id),
  INDEX idx_publicada (publicada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar comisiones de ejemplo
INSERT INTO comisiones_pastoral (nombre, descripcion, coordinador, activa, destacada, orden) VALUES
('Pastoral Social', 'Promueve la justicia social y la caridad', 'P. Carlos Mendoza', TRUE, TRUE, 1),
('Pastoral Juvenil', 'Acompaña a los jóvenes en su fe', 'P. María González', TRUE, TRUE, 2),
('Pastoral Familiar', 'Fortalece las familias cristianas', 'P. Juan Pérez', TRUE, TRUE, 3),
('Catequesis', 'Formación en la fe para niños y adultos', 'Hna. Ana Martínez', TRUE, FALSE, 4),
('Liturgia', 'Organiza las celebraciones litúrgicas', 'P. Luis Rodríguez', TRUE, FALSE, 5);
















