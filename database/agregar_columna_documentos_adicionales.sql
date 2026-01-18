-- Agregar columna documentos_adicionales a la tabla noticias
-- Esta columna almacenará un JSON con la información de los documentos adicionales

USE diocesis;

-- Verificar si la columna ya existe antes de agregarla
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'diocesis' 
    AND TABLE_NAME = 'noticias' 
    AND COLUMN_NAME = 'documentos_adicionales'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE noticias ADD COLUMN documentos_adicionales TEXT NULL AFTER categoria',
    'SELECT "La columna documentos_adicionales ya existe" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar que se agregó correctamente
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'diocesis' 
AND TABLE_NAME = 'noticias' 
AND COLUMN_NAME = 'documentos_adicionales';


