-- Agregar campo para documentos adicionales en noticias
-- Ejecutar después de schema.sql

USE diocesis;

-- Agregar campo para almacenar JSON de documentos adicionales
-- Verificar si la columna existe antes de agregarla
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'diocesis' 
    AND TABLE_NAME = 'noticias' 
    AND COLUMN_NAME = 'documentos_adicionales'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE noticias ADD COLUMN documentos_adicionales TEXT NULL COMMENT ''JSON array con información de documentos adicionales'' AFTER categoria',
    'SELECT ''La columna documentos_adicionales ya existe'' AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Nota: El campo imagen_url seguirá existiendo pero ahora almacenará la ruta del archivo subido
-- Ejemplo: /uploads/images/noticia-1234567890.jpg

















