const bcrypt = require('bcryptjs');

async function generarHash() {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('\n📋 Hash generado para la contraseña "admin123":');
  console.log(`\n${hashedPassword}\n`);
  
  console.log('📋 SQL para crear el usuario manualmente:');
  console.log('\n-- Opción 1: Si la tabla usuarios existe');
  console.log(`INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (`);
  console.log(`  'Administrador',`);
  console.log(`  'admin@diocesis.gov.co',`);
  console.log(`  '${hashedPassword}',`);
  console.log(`  'admin',`);
  console.log(`  1`);
  console.log(`);\n`);
  
  console.log('-- Opción 2: Si el usuario ya existe, actualizarlo');
  console.log(`UPDATE usuarios SET`);
  console.log(`  nombre = 'Administrador',`);
  console.log(`  password = '${hashedPassword}',`);
  console.log(`  rol = 'admin',`);
  console.log(`  activo = 1`);
  console.log(`WHERE email = 'admin@diocesis.gov.co';\n`);
  
  console.log('📋 Para usar este SQL:');
  console.log('1. Abre phpMyAdmin: http://localhost/phpmyadmin');
  console.log('2. Selecciona la base de datos "diocesis"');
  console.log('3. Ve a la pestaña "SQL"');
  console.log('4. Pega el SQL de arriba');
  console.log('5. Haz clic en "Continuar"\n');
  
  console.log('📋 Credenciales para iniciar sesión:');
  console.log('   Email: admin@diocesis.gov.co');
  console.log('   Contraseña: admin123\n');
}

generarHash();
