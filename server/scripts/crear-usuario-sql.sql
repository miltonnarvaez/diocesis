-- Script SQL para crear el usuario administrador
-- Ejecutar directamente en MySQL

USE diocesis;

-- Verificar si el usuario existe
SELECT * FROM usuarios WHERE email = 'admin@diocesis.gov.co';

-- Si no existe, crear el usuario
INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (
  'Administrador',
  'admin@diocesis.gov.co',
  '$2a$10$XUcgfUsHDBXwwA9fT0hP0efRLwzcIPtzcYBaThgzpJSsKmY7S6/ly',
  'admin',
  1
)
ON DUPLICATE KEY UPDATE
  nombre = 'Administrador',
  password = '$2a$10$XUcgfUsHDBXwwA9fT0hP0efRLwzcIPtzcYBaThgzpJSsKmY7S6/ly',
  rol = 'admin',
  activo = 1;

-- Verificar que se creó correctamente
SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = 'admin@diocesis.gov.co';
