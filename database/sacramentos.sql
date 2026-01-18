-- Tabla de Sacramentos
CREATE TABLE IF NOT EXISTS sacramentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  requisitos JSON, -- Array de requisitos
  documentos_necesarios JSON, -- Array de documentos
  costo DECIMAL(10, 2) DEFAULT 0.00,
  tiempo_preparacion VARCHAR(100), -- Ej: "3 meses", "6 sesiones"
  proceso TEXT, -- Descripción del proceso
  contacto_responsable VARCHAR(255),
  email_contacto VARCHAR(255),
  telefono_contacto VARCHAR(50),
  horario_atencion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_activo (activo),
  INDEX idx_destacado (destacado),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Solicitudes de Sacramentos
CREATE TABLE IF NOT EXISTS solicitudes_sacramentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sacramento_id INT NOT NULL,
  parroquia_id INT,
  nombre_solicitante VARCHAR(255) NOT NULL,
  documento VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  fecha_solicitud DATE NOT NULL,
  fecha_evento DATE,
  observaciones TEXT,
  estado ENUM('pendiente', 'en_proceso', 'aprobada', 'rechazada', 'completada') DEFAULT 'pendiente',
  respuesta TEXT,
  fecha_respuesta DATETIME,
  usuario_responde_id INT,
  documentos_adjuntos JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sacramento_id) REFERENCES sacramentos(id) ON DELETE CASCADE,
  FOREIGN KEY (parroquia_id) REFERENCES parroquias(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_responde_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_sacramento (sacramento_id),
  INDEX idx_parroquia (parroquia_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_solicitud (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar sacramentos básicos
INSERT INTO sacramentos (nombre, descripcion, requisitos, documentos_necesarios, proceso, activo, destacado, orden) VALUES
('Bautismo', 'El sacramento del Bautismo es el fundamento de toda la vida cristiana', 
 '["Ser hijo de padres católicos", "Tener padrinos bautizados y confirmados", "Asistir a charlas pre-bautismales"]',
 '["Partida de nacimiento", "Certificado de bautismo de los padrinos", "Certificado de matrimonio de los padres"]',
 '1. Solicitar en la parroquia\n2. Asistir a charlas pre-bautismales\n3. Presentar documentos\n4. Fijar fecha\n5. Celebración del sacramento',
 TRUE, TRUE, 1),
('Confirmación', 'El sacramento de la Confirmación completa la gracia bautismal',
 '["Haber recibido el Bautismo", "Tener edad apropiada (generalmente 14-16 años)", "Asistir a catequesis de confirmación"]',
 '["Certificado de bautismo", "Certificado de primera comunión", "Documento de identidad"]',
 '1. Inscripción en catequesis\n2. Asistir a sesiones de formación\n3. Presentar documentos\n4. Celebración del sacramento',
 TRUE, TRUE, 2),
('Matrimonio', 'El sacramento del Matrimonio une a un hombre y una mujer en una alianza de por vida',
 '["Ser bautizados", "Asistir a curso prematrimonial", "No tener impedimentos canónicos"]',
 '["Certificados de bautismo", "Certificados de confirmación", "Documentos de identidad", "Certificado de soltería"]',
 '1. Solicitar con 3 meses de anticipación\n2. Asistir a curso prematrimonial\n3. Presentar documentos\n4. Fijar fecha\n5. Celebración del matrimonio',
 TRUE, TRUE, 3),
('Primera Comunión', 'La Primera Comunión es la primera vez que se recibe el Cuerpo y la Sangre de Cristo',
 '["Haber recibido el Bautismo", "Tener edad apropiada (generalmente 7-12 años)", "Asistir a catequesis"]',
 '["Certificado de bautismo", "Documento de identidad del niño"]',
 '1. Inscripción en catequesis\n2. Asistir a sesiones de formación\n3. Presentar documentos\n4. Celebración de la Primera Comunión',
 TRUE, TRUE, 4),
('Reconciliación', 'El sacramento de la Reconciliación o Confesión ofrece el perdón de los pecados',
 '["Arrepentimiento sincero", "Propósito de enmienda", "Confesión de los pecados"]',
 '[]',
 '1. Preparación personal\n2. Acudir al confesionario\n3. Confesión de los pecados\n4. Absolución del sacerdote\n5. Cumplir la penitencia',
 TRUE, FALSE, 5),
('Unción de los Enfermos', 'El sacramento de la Unción de los Enfermos fortalece a quienes sufren enfermedad',
 '["Estar enfermo o en peligro de muerte", "Solicitar el sacramento"]',
 '[]',
 '1. Solicitar el sacramento\n2. El sacerdote visita al enfermo\n3. Celebración del sacramento\n4. Oración por la salud',
 TRUE, FALSE, 6),
('Orden Sacerdotal', 'El sacramento del Orden consagra a algunos fieles para el servicio de la comunidad',
 '["Vocación sacerdotal", "Formación en el seminario", "Aprobación del obispo"]',
 '["Documentos académicos", "Certificados de formación", "Aprobación del seminario"]',
 '1. Discernimiento vocacional\n2. Formación en seminario\n3. Ordenación diaconal\n4. Ordenación presbiteral\n5. Servicio a la comunidad',
 TRUE, FALSE, 7);
















