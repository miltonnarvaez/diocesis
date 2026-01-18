-- Script para verificar si las tablas de PQRSD existen
USE diocesis;

-- Verificar si la tabla pqrsd existe
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ La tabla pqrsd existe'
        ELSE '❌ La tabla pqrsd NO existe'
    END as estado_pqrsd
FROM information_schema.tables 
WHERE table_schema = 'diocesis' 
AND table_name = 'pqrsd';

-- Verificar si la tabla pqrsd_seguimiento existe
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ La tabla pqrsd_seguimiento existe'
        ELSE '❌ La tabla pqrsd_seguimiento NO existe'
    END as estado_seguimiento
FROM information_schema.tables 
WHERE table_schema = 'diocesis' 
AND table_name = 'pqrsd_seguimiento';

-- Mostrar estructura de la tabla si existe
SHOW TABLES LIKE 'pqrsd%';















