-- Tabla de Contenido Multimedia
CREATE TABLE IF NOT EXISTS contenido_multimedia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(100), -- audio, video, imagen, podcast, articulo, etc.
  categoria VARCHAR(100), -- radio, tv, redes_sociales, podcast, etc.
  url VARCHAR(500),
  url_embed TEXT, -- Para videos embebidos
  duracion VARCHAR(50), -- Para audio/video
  fecha_publicacion DATETIME,
  autor VARCHAR(255),
  tags JSON,
  imagen_miniatura VARCHAR(500),
  publicada BOOLEAN DEFAULT TRUE,
  destacada BOOLEAN DEFAULT FALSE,
  visitas INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_categoria (categoria),
  INDEX idx_publicada (publicada),
  INDEX idx_destacada (destacada),
  INDEX idx_fecha_publicacion (fecha_publicacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Canales de Comunicación
CREATE TABLE IF NOT EXISTS canales_comunicacion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(100), -- radio, tv, youtube, facebook, instagram, twitter, etc.
  descripcion TEXT,
  url VARCHAR(500),
  frecuencia VARCHAR(100), -- Para radio/TV
  horario TEXT,
  imagen_logo VARCHAR(500),
  activo BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo),
  INDEX idx_activo (activo),
  INDEX idx_destacado (destacado),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar canales de ejemplo
INSERT INTO canales_comunicacion (nombre, tipo, descripcion, url, activo, destacado, orden) VALUES
('Radio Diocesana', 'radio', 'Emisora oficial de la Diócesis de Ipiales', 'https://radiodiocesana.com', TRUE, TRUE, 1),
('TV Diocesana', 'tv', 'Canal de televisión diocesano', 'https://tvdiocesana.com', TRUE, TRUE, 2),
('Facebook Diócesis', 'facebook', 'Página oficial en Facebook', 'https://facebook.com/diocesisipiales', TRUE, TRUE, 3),
('Instagram Diócesis', 'instagram', 'Cuenta oficial en Instagram', 'https://instagram.com/diocesisipiales', TRUE, FALSE, 4),
('YouTube Diócesis', 'youtube', 'Canal oficial en YouTube', 'https://youtube.com/diocesisipiales', TRUE, FALSE, 5);
















