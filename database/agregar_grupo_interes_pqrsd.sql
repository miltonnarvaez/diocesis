-- Agregar campo grupo_interes a la tabla pqrsd
ALTER TABLE pqrsd 
ADD COLUMN grupo_interes ENUM(
  'dupla_naranja',
  'adultos_mayores',
  'jovenes',
  'personas_discapacidad',
  'comunidades_etnicas',
  'empresarios',
  'general'
) DEFAULT 'general' AFTER tipo;

-- Agregar índice para búsquedas por grupo de interés
ALTER TABLE pqrsd 
ADD INDEX idx_grupo_interes (grupo_interes);














