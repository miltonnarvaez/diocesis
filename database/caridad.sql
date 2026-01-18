-- Tabla de Proyectos Sociales
CREATE TABLE IF NOT EXISTS proyectos_caridad (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  objetivo TEXT,
  beneficiarios VARCHAR(255),
  zona_impacto VARCHAR(255),
  fecha_inicio DATE,
  fecha_fin DATE,
  estado ENUM('planificacion', 'en_ejecucion', 'finalizado', 'suspendido') DEFAULT 'planificacion',
  presupuesto DECIMAL(12, 2),
  fondos_recaudados DECIMAL(12, 2) DEFAULT 0.00,
  responsable VARCHAR(255),
  contacto VARCHAR(255),
  email VARCHAR(255),
  telefono VARCHAR(50),
  imagen_url VARCHAR(500),
  publicada BOOLEAN DEFAULT TRUE,
  destacada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado (estado),
  INDEX idx_publicada (publicada),
  INDEX idx_destacada (destacada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Campañas de Ayuda
CREATE TABLE IF NOT EXISTS campañas_ayuda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(100), -- alimentos, ropa, medicinas, dinero, etc.
  objetivo DECIMAL(12, 2),
  recaudado DECIMAL(12, 2) DEFAULT 0.00,
  fecha_inicio DATE,
  fecha_fin DATE,
  activa BOOLEAN DEFAULT TRUE,
  publicada BOOLEAN DEFAULT TRUE,
  destacada BOOLEAN DEFAULT FALSE,
  imagen_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_activa (activa),
  INDEX idx_publicada (publicada),
  INDEX idx_destacada (destacada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Voluntarios
CREATE TABLE IF NOT EXISTS voluntarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  documento VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  direccion TEXT,
  habilidades TEXT,
  disponibilidad TEXT,
  area_interes VARCHAR(255),
  proyecto_id INT,
  estado ENUM('pendiente', 'activo', 'inactivo') DEFAULT 'pendiente',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos_caridad(id) ON DELETE SET NULL,
  INDEX idx_estado (estado),
  INDEX idx_proyecto (proyecto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
















