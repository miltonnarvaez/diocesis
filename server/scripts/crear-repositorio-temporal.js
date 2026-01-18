const fs = require('fs');
const path = require('path');

// Directorio base del repositorio temporal
const repositorioBaseDir = path.join(__dirname, '../uploads/repositorio-temporal');

// Carpetas organizadas por categoría
const carpetas = [
  'acerca-de',
  'miembros',
  'historia',
  'gaceta',
  'sesiones',
  'transparencia',
  'documentos-oficiales',
  'documentos-generales',
  // Carpetas de Acerca de
  'acerca-mision',
  'acerca-vision',
  'acerca-estructura-jerarquica',
  'acerca-autoridades',
  'acerca-contacto',
  'acerca-simbolos',
  'plan-accion',
  // Carpetas de Documentos
  'documentos-gaceta-municipal',
  'documentos-acuerdos',
  'documentos-actas-sesion',
  'documentos-decretos',
  'documentos-proyectos',
  'documentos-manuales',
  'documentos-leyes',
  'documentos-politicas',
  // Carpetas de Transparencia
  'transparencia-presupuesto',
  'transparencia-contratacion-publica',
  'transparencia-plan-anual-compras',
  'transparencia-rendicion-cuentas',
  'transparencia-estados-financieros',
  'transparencia-control-interno',
  'transparencia-declaracion-renta',
  'transparencia-estructura-organizacional',
  'transparencia-plan-desarrollo',
  'transparencia-normatividad',
  'transparencia-servicios-ciudadanos',
  'transparencia-auditorias',
  'transparencia-bienes-inmuebles',
  'transparencia-personal'
];

console.log('📁 Creando estructura del repositorio temporal...\n');

// Crear directorio base si no existe
if (!fs.existsSync(repositorioBaseDir)) {
  fs.mkdirSync(repositorioBaseDir, { recursive: true });
  console.log('✓ Directorio base creado:', repositorioBaseDir);
}

// Crear carpetas
carpetas.forEach(carpeta => {
  const carpetaPath = path.join(repositorioBaseDir, carpeta);
  if (!fs.existsSync(carpetaPath)) {
    fs.mkdirSync(carpetaPath, { recursive: true });
    console.log(`✓ Carpeta creada: ${carpeta}`);
  } else {
    console.log(`- Carpeta ya existe: ${carpeta}`);
  }
});

console.log('\n✅ Estructura del repositorio temporal creada exitosamente');
console.log(`📂 Ubicación: ${repositorioBaseDir}`);


