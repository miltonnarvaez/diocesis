const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdminPassword() {
  let connection;
  
  try {
    // Conectar a MySQL (forzar IPv4 si se usa 'localhost')
    const dbHost = process.env.DB_HOST || 'localhost';
    const resolvedHost = dbHost === 'localhost' ? '127.0.0.1' : dbHost;
    
    connection = await mysql.createConnection({
      host: resolvedHost,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis'
    });

    console.log('✅ Conectado a MySQL');

    // Contraseña por defecto
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('\n📋 Credenciales del Administrador:');
    console.log('   Email: admin@concejo.guachucal.gov.co');
    console.log('   Contraseña: admin123');
    console.log('\n🔄 Actualizando contraseña en la base de datos...');

    // Verificar si el usuario existe
    const [users] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      ['admin@concejo.guachucal.gov.co']
    );

    if (users.length === 0) {
      // Crear el usuario si no existe
      await connection.execute(
        'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)',
        ['Administrador', 'admin@concejo.guachucal.gov.co', hashedPassword, 'admin', true]
      );
      console.log('✅ Usuario administrador creado');
    } else {
      // Actualizar la contraseña
      await connection.execute(
        'UPDATE usuarios SET password = ?, rol = ?, activo = ? WHERE email = ?',
        [hashedPassword, 'admin', true, 'admin@concejo.guachucal.gov.co']
      );
      console.log('✅ Contraseña del administrador actualizada');
    }

    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📋 Para acceder a la administración:');
    console.log('   1. Ve a: http://localhost:3000/admin/login');
    console.log('   2. Email: admin@concejo.guachucal.gov.co');
    console.log('   3. Contraseña: admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetAdminPassword();



