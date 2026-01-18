-- ============================================
-- MÓDULOS NUEVOS - DIÓCESIS DE IPIALES
-- ============================================

-- 1. SISTEMA DE INTENCIONES DE MISA
CREATE TABLE IF NOT EXISTS intenciones_misa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_solicitante VARCHAR(255) NOT NULL,
  documento VARCHAR(50),
  email VARCHAR(255),
  telefono VARCHAR(50),
  fecha_misa DATE NOT NULL,
  parroquia_id INT,
  tipo_intencion ENUM('difuntos', 'salud', 'accion_gracias', 'trabajo', 'familia', 'otra') DEFAULT 'otra',
  intencion_especifica TEXT,
  nombre_difunto VARCHAR(255),
  monto_donacion DECIMAL(10, 2) DEFAULT 0,
  estado ENUM('pendiente', 'confirmada', 'realizada', 'cancelada') DEFAULT 'pendiente',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha_misa (fecha_misa),
  INDEX idx_parroquia (parroquia_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SISTEMA DE DONACIONES ONLINE
CREATE TABLE IF NOT EXISTS donaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donante_nombre VARCHAR(255) NOT NULL,
  donante_email VARCHAR(255),
  donante_telefono VARCHAR(50),
  donante_documento VARCHAR(50),
  monto DECIMAL(10, 2) NOT NULL,
  tipo_donacion ENUM('diezmo', 'donacion_unica', 'donacion_recurrente', 'obra_social', 'seminario', 'mantenimiento', 'otra') DEFAULT 'donacion_unica',
  destino VARCHAR(255),
  metodo_pago VARCHAR(50),
  referencia_pago VARCHAR(255),
  estado ENUM('pendiente', 'procesando', 'completada', 'fallida', 'cancelada') DEFAULT 'pendiente',
  recibo_generado BOOLEAN DEFAULT FALSE,
  fecha_donacion DATE,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha_donacion (fecha_donacion),
  INDEX idx_estado (estado),
  INDEX idx_tipo (tipo_donacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ORACIONES Y DEVOCIONES
CREATE TABLE IF NOT EXISTS oraciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  categoria ENUM('oracion_dia', 'novena', 'rosario', 'letania', 'oracion_especial', 'oracion_intencion') DEFAULT 'oracion_especial',
  intencion VARCHAR(100),
  autor VARCHAR(255),
  imagen_url VARCHAR(500),
  audio_url VARCHAR(500),
  fecha_publicacion DATE,
  destacada BOOLEAN DEFAULT FALSE,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categoria (categoria),
  INDEX idx_destacada (destacada),
  INDEX idx_activa (activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. NOVENAS
CREATE TABLE IF NOT EXISTS novenas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen_url VARCHAR(500),
  fecha_inicio DATE,
  fecha_fin DATE,
  oracion_dia_1 TEXT,
  oracion_dia_2 TEXT,
  oracion_dia_3 TEXT,
  oracion_dia_4 TEXT,
  oracion_dia_5 TEXT,
  oracion_dia_6 TEXT,
  oracion_dia_7 TEXT,
  oracion_dia_8 TEXT,
  oracion_dia_9 TEXT,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha_inicio (fecha_inicio),
  INDEX idx_activa (activa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. BIBLIOTECA DIGITAL / ARCHIVO HISTÓRICO
CREATE TABLE IF NOT EXISTS biblioteca_digital (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255),
  tipo_documento ENUM('enciclica', 'documento_vaticano', 'historia_diocesana', 'carta_pastoral_antigua', 'libro', 'articulo', 'otro') DEFAULT 'otro',
  categoria VARCHAR(100),
  descripcion TEXT,
  archivo_url VARCHAR(500),
  imagen_portada VARCHAR(500),
  fecha_documento DATE,
  fecha_publicacion DATE,
  idioma VARCHAR(50) DEFAULT 'es',
  paginas INT,
  isbn VARCHAR(50),
  destacado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo_documento),
  INDEX idx_destacado (destacado),
  INDEX idx_activo (activo),
  FULLTEXT idx_busqueda (titulo, autor, descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ARCHIVO DE HOMILÍAS
CREATE TABLE IF NOT EXISTS homilias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  tipo_autor ENUM('obispo', 'sacerdote', 'diacono', 'otro') DEFAULT 'sacerdote',
  fecha_homilia DATE NOT NULL,
  tipo_homilia ENUM('dominical', 'festiva', 'retiro', 'especial', 'otra') DEFAULT 'dominical',
  lectura_primera TEXT,
  salmo TEXT,
  lectura_segunda TEXT,
  evangelio TEXT,
  contenido TEXT NOT NULL,
  audio_url VARCHAR(500),
  video_url VARCHAR(500),
  tema VARCHAR(255),
  tags VARCHAR(500),
  destacada BOOLEAN DEFAULT FALSE,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha (fecha_homilia),
  INDEX idx_autor (autor),
  INDEX idx_tipo (tipo_homilia),
  INDEX idx_destacada (destacada),
  FULLTEXT idx_busqueda (titulo, contenido, tema)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TESTIMONIOS DE FE
CREATE TABLE IF NOT EXISTS testimonios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_autor VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  titulo VARCHAR(255) NOT NULL,
  testimonio TEXT NOT NULL,
  categoria ENUM('conversion', 'milagro', 'vocacion', 'caridad', 'sanacion', 'otra') DEFAULT 'otra',
  imagen_url VARCHAR(500),
  aprobado BOOLEAN DEFAULT FALSE,
  destacado BOOLEAN DEFAULT FALSE,
  fecha_publicacion DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_aprobado (aprobado),
  INDEX idx_categoria (categoria),
  INDEX idx_destacado (destacado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. EVENTOS ESPECIALES / PEREGRINACIONES
CREATE TABLE IF NOT EXISTS eventos_especiales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_evento ENUM('retiro', 'peregrinacion', 'celebracion', 'conferencia', 'taller', 'otro') DEFAULT 'otro',
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  hora_inicio TIME,
  hora_fin TIME,
  lugar VARCHAR(255),
  direccion TEXT,
  imagen_url VARCHAR(500),
  costo DECIMAL(10, 2),
  cupos_maximos INT,
  cupos_disponibles INT,
  requiere_inscripcion BOOLEAN DEFAULT TRUE,
  inscripcion_abierta BOOLEAN DEFAULT TRUE,
  formulario_inscripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha_inicio (fecha_inicio),
  INDEX idx_tipo (tipo_evento),
  INDEX idx_activo (activo),
  INDEX idx_destacado (destacado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. INSCRIPCIONES A EVENTOS ESPECIALES
CREATE TABLE IF NOT EXISTS inscripciones_eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  documento VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  edad INT,
  parroquia VARCHAR(255),
  observaciones TEXT,
  estado ENUM('pendiente', 'confirmada', 'cancelada') DEFAULT 'pendiente',
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos_especiales(id) ON DELETE CASCADE,
  INDEX idx_evento (evento_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. SISTEMA DE RESERVAS
CREATE TABLE IF NOT EXISTS espacios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo_espacio ENUM('salon', 'auditorio', 'capilla', 'patio', 'cocina', 'otro') DEFAULT 'salon',
  capacidad INT,
  ubicacion VARCHAR(255),
  imagen_url VARCHAR(500),
  equipamiento TEXT,
  costo_hora DECIMAL(10, 2) DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tipo (tipo_espacio),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  espacio_id INT NOT NULL,
  nombre_solicitante VARCHAR(255) NOT NULL,
  documento VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  fecha_reserva DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  motivo VARCHAR(255),
  descripcion_evento TEXT,
  numero_personas INT,
  requiere_equipamiento BOOLEAN DEFAULT FALSE,
  equipamiento_solicitado TEXT,
  estado ENUM('pendiente', 'aprobada', 'rechazada', 'cancelada', 'completada') DEFAULT 'pendiente',
  observaciones_admin TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (espacio_id) REFERENCES espacios(id) ON DELETE CASCADE,
  INDEX idx_espacio (espacio_id),
  INDEX idx_fecha (fecha_reserva),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. CATEQUESIS ONLINE
CREATE TABLE IF NOT EXISTS catequesis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  nivel ENUM('primera_comunion', 'confirmacion', 'bautismo', 'matrimonio', 'adultos', 'jovenes', 'general') DEFAULT 'general',
  categoria VARCHAR(100),
  contenido TEXT,
  material_descargable VARCHAR(500),
  video_url VARCHAR(500),
  imagen_url VARCHAR(500),
  orden INT DEFAULT 0,
  activa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nivel (nivel),
  INDEX idx_activa (activa),
  INDEX idx_orden (orden),
  FULLTEXT idx_busqueda (titulo, descripcion, contenido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de prueba
-- Intenciones de Misa
INSERT INTO intenciones_misa (nombre_solicitante, email, telefono, fecha_misa, tipo_intencion, intencion_especifica, estado) VALUES
('María González', 'maria@email.com', '3151234567', '2024-02-15', 'difuntos', 'Por el eterno descanso de mi madre', 'confirmada'),
('Juan Pérez', 'juan@email.com', '3152345678', '2024-02-16', 'salud', 'Por la salud de mi esposa', 'pendiente'),
('Ana Martínez', 'ana@email.com', '3153456789', '2024-02-17', 'accion_gracias', 'Acción de gracias por mi trabajo', 'confirmada');

-- Donaciones
INSERT INTO donaciones (donante_nombre, donante_email, monto, tipo_donacion, destino, estado) VALUES
('Carlos Rodríguez', 'carlos@email.com', 50000, 'diezmo', 'Obras sociales', 'completada'),
('Laura Sánchez', 'laura@email.com', 100000, 'donacion_unica', 'Seminario', 'completada'),
('Pedro López', 'pedro@email.com', 25000, 'obra_social', 'Caridad', 'pendiente');

-- Oraciones
INSERT INTO oraciones (titulo, contenido, categoria, intencion, destacada) VALUES
('Oración del Día', 'Padre nuestro que estás en el cielo, santificado sea tu nombre...', 'oracion_dia', NULL, TRUE),
('Novenas a la Divina Misericordia', 'Oh Jesús, que dijiste: "Pedid y recibiréis, buscad y hallaréis, llamad y se os abrirá"...', 'novena', 'misericordia', TRUE),
('Oración por la Salud', 'Señor, te pido por la salud de [nombre], que tu mano sanadora lo toque...', 'oracion_intencion', 'salud', FALSE),
('Oración por el Trabajo', 'Dios providente, te pido que me ayudes a encontrar un trabajo digno...', 'oracion_intencion', 'trabajo', FALSE);

-- Novenas
INSERT INTO novenas (titulo, descripcion, fecha_inicio, fecha_fin, activa) VALUES
('Novenas a la Divina Misericordia', 'Novenas especiales pidiendo la misericordia de Dios', '2024-04-14', '2024-04-22', TRUE),
('Novenas al Sagrado Corazón', 'Novenas de consagración al Sagrado Corazón de Jesús', '2024-06-01', '2024-06-09', TRUE);

-- Biblioteca Digital
INSERT INTO biblioteca_digital (titulo, autor, tipo_documento, descripcion, fecha_documento, destacado) VALUES
('Laudato Si', 'Papa Francisco', 'enciclica', 'Encíclica sobre el cuidado de la casa común', '2015-05-24', TRUE),
('Evangelii Gaudium', 'Papa Francisco', 'enciclica', 'La alegría del Evangelio', '2013-11-24', TRUE),
('Historia de la Diócesis de Ipiales', 'Monseñor', 'historia_diocesana', 'Historia completa de nuestra Diócesis desde su fundación', '2020-01-01', TRUE);

-- Homilías
INSERT INTO homilias (titulo, autor, tipo_autor, fecha_homilia, tipo_homilia, evangelio, contenido, destacada) VALUES
('El amor de Dios nos transforma', 'Monseñor', 'obispo', '2024-01-14', 'dominical', 'Juan 3:16-21', 'Queridos hermanos, hoy el Evangelio nos habla del amor infinito de Dios...', TRUE),
('La fe que mueve montañas', 'P. Juan', 'sacerdote', '2024-01-21', 'dominical', 'Mateo 17:20', 'La fe es un don de Dios que debemos cultivar cada día...', FALSE);

-- Testimonios
INSERT INTO testimonios (nombre_autor, titulo, testimonio, categoria, aprobado, destacado) VALUES
('María Elena', 'Mi conversión', 'Hace cinco años mi vida cambió completamente cuando conocí a Jesús...', 'conversion', TRUE, TRUE),
('José Luis', 'Un milagro de sanación', 'Después de años de enfermedad, Dios me sanó de manera milagrosa...', 'milagro', TRUE, FALSE);

-- Eventos Especiales
INSERT INTO eventos_especiales (titulo, descripcion, tipo_evento, fecha_inicio, fecha_fin, lugar, requiere_inscripcion, cupos_maximos, cupos_disponibles) VALUES
('Retiro Espiritual de Cuaresma', 'Retiro de tres días para prepararnos para la Pascua', 'retiro', '2024-03-15', '2024-03-17', 'Casa de Encuentros Guapiuy', TRUE, 50, 35),
('Peregrinación a Las Lajas', 'Peregrinación anual al Santuario de Las Lajas', 'peregrinacion', '2024-09-15', '2024-09-15', 'Santuario de Las Lajas', TRUE, 200, 150);

-- Espacios
INSERT INTO espacios (nombre, descripcion, tipo_espacio, capacidad, ubicacion, costo_hora) VALUES
('Salón Parroquial', 'Salón amplio para eventos y reuniones', 'salon', 100, 'Casa Cural', 50000),
('Auditorio Diocesano', 'Auditorio con capacidad para conferencias', 'auditorio', 300, 'Curia Episcopal', 100000),
('Capilla San José', 'Capilla para celebraciones íntimas', 'capilla', 50, 'Seminario', 30000);

-- Catequesis
INSERT INTO catequesis (titulo, descripcion, nivel, categoria, contenido, activa) VALUES
('Introducción a la Fe', 'Curso básico para conocer los fundamentos de nuestra fe', 'general', 'doctrina', 'La fe es la respuesta del hombre a Dios que se revela...', TRUE),
('Preparación para la Primera Comunión', 'Material completo para catequistas de Primera Comunión', 'primera_comunion', 'sacramentos', 'Este curso prepara a los niños para recibir la Eucaristía...', TRUE);
