-- Tabla de Calendario Litúrgico
CREATE TABLE IF NOT EXISTS calendario_liturgico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  tiempo_liturgico VARCHAR(100), -- Adviento, Cuaresma, Pascua, Tiempo Ordinario
  color_liturgico VARCHAR(50), -- Blanco, Verde, Rojo, Morado, Rosa
  solemnidad VARCHAR(255),
  fiesta VARCHAR(255),
  memoria VARCHAR(255),
  lectura_primera TEXT,
  salmo TEXT,
  lectura_segunda TEXT,
  evangelio TEXT,
  reflexion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_fecha (fecha),
  INDEX idx_fecha (fecha),
  INDEX idx_tiempo_liturgico (tiempo_liturgico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Horarios de Misa Generales (por tiempo litúrgico)
CREATE TABLE IF NOT EXISTS horarios_misa_liturgicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tiempo_liturgico VARCHAR(100),
  dia_semana ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') NOT NULL,
  hora TIME NOT NULL,
  tipo_misa VARCHAR(100),
  lugar VARCHAR(255),
  notas TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tiempo_liturgico (tiempo_liturgico),
  INDEX idx_dia_semana (dia_semana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
















