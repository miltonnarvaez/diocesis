-- Agregar campos de imagen y documento a todas las tablas
-- Ejecutar después de schema.sql

USE diocesis;

-- Agregar imagen_url a documentos_transparencia
ALTER TABLE documentos_transparencia 
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(255) DEFAULT NULL COMMENT 'URL de imagen para mostrar';

-- Agregar imagen_url a documentos_gaceta
ALTER TABLE documentos_gaceta 
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(255) DEFAULT NULL COMMENT 'URL de imagen para mostrar';

-- Agregar imagen_url a sesiones_concejo
ALTER TABLE sesiones_concejo 
ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(255) DEFAULT NULL COMMENT 'URL de imagen para mostrar';

-- Agregar documento_url a convocatorias
ALTER TABLE convocatorias 
ADD COLUMN IF NOT EXISTS documento_url VARCHAR(255) DEFAULT NULL COMMENT 'URL de documento adicional';

-- Agregar documento_url a autoridades
ALTER TABLE autoridades 
ADD COLUMN IF NOT EXISTS documento_url VARCHAR(255) DEFAULT NULL COMMENT 'URL de documento adicional';

















