const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Guardar el homepage original
const originalHomepage = packageJson.homepage;

try {
  console.log('Configurando homepage para producción...');
  // Cambiar homepage para producción
  packageJson.homepage = '/concejoguachucal';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  
  console.log('Ejecutando build de producción...');
  // Ejecutar el build
  execSync('cross-env NODE_OPTIONS=--max-old-space-size=4096 react-scripts build', {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('Build completado exitosamente!');
} catch (error) {
  console.error('Error durante el build:', error);
  process.exit(1);
} finally {
  // Restaurar el homepage original
  console.log('Restaurando configuración de desarrollo...');
  packageJson.homepage = originalHomepage;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}



