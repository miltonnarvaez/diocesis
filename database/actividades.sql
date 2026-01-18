-- Tabla de Actividades para la Agenda Diocesana
CREATE TABLE IF NOT EXISTS actividades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME,
  lugar VARCHAR(255),
  tipo VARCHAR(50) DEFAULT 'general', -- general, misa, evento, reunion, formacion, otro
  categoria VARCHAR(100), -- liturgia, pastoral, formacion, caridad, otro
  responsable VARCHAR(255),
  contacto VARCHAR(255),
  imagen_url VARCHAR(500),
  color VARCHAR(7) DEFAULT '#4A90E2', -- Color para el calendario
  publicada BOOLEAN DEFAULT TRUE,
  destacada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha_inicio (fecha_inicio),
  INDEX idx_tipo (tipo),
  INDEX idx_publicada (publicada),
  INDEX idx_destacada (destacada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar algunas actividades de ejemplo
INSERT INTO actividades (titulo, descripcion, fecha_inicio, fecha_fin, lugar, tipo, categoria, responsable, publicada, destacada) VALUES
('Misa Dominical', 'Misa dominical para toda la comunidad', '2024-12-15 10:00:00', '2024-12-15 11:30:00', 'Catedral de Ipiales', 'misa', 'liturgia', 'Párroco', TRUE, TRUE),
('Reunión de Pastoral Juvenil', 'Reunión mensual del grupo de pastoral juvenil', '2024-12-18 18:00:00', '2024-12-18 20:00:00', 'Salón Parroquial', 'reunion', 'pastoral', 'Coordinador de Pastoral Juvenil', TRUE, FALSE),
('Formación de Catequistas', 'Curso de formación para nuevos catequistas', '2024-12-20 14:00:00', '2024-12-20 17:00:00', 'Centro de Formación', 'formacion', 'formacion', 'Director de Catequesis', TRUE, TRUE);
















