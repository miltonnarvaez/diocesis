-- Agregar categorías de transparencia como módulos independientes
-- Ejecutar después de usuarios_permisos.sql

USE diocesis;

-- Insertar categorías de transparencia como módulos
INSERT INTO modulos (nombre, descripcion) VALUES
('transparencia_presupuesto', 'Transparencia - Presupuesto: Presupuesto general, ejecución presupuestal y modificaciones'),
('transparencia_contratacion', 'Transparencia - Contratación Pública: Procesos de contratación, licitaciones y adjudicaciones'),
('transparencia_plan_compras', 'Transparencia - Plan Anual de Compras: Plan anual de adquisiciones y compras'),
('transparencia_rendicion_cuentas', 'Transparencia - Rendición de Cuentas: Informes de gestión y rendición de cuentas'),
('transparencia_estados_financieros', 'Transparencia - Estados Financieros: Estados financieros, balances y reportes contables'),
('transparencia_control_interno', 'Transparencia - Control Interno: Informes de control interno y auditorías'),
('transparencia_declaracion_renta', 'Transparencia - Declaración de Renta: Declaraciones de renta y bienes'),
('transparencia_estructura_organizacional', 'Transparencia - Estructura Organizacional: Organigrama, manual de funciones y estructura'),
('transparencia_plan_desarrollo', 'Transparencia - Plan de Desarrollo: Plan de desarrollo municipal y seguimiento'),
('transparencia_normatividad', 'Transparencia - Normatividad: Normas, reglamentos y disposiciones aplicables'),
('transparencia_servicios_ciudadanos', 'Transparencia - Servicios Ciudadanos: Información sobre servicios y trámites')
ON DUPLICATE KEY UPDATE descripcion=VALUES(descripcion);

-- Nota: El módulo 'transparencia' general sigue existiendo para permisos globales
-- Las categorías específicas permiten control granular por categoría

















