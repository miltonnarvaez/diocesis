const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function verificarAdmin() {
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis'
    });

    console.log('✅ Conectado a MySQL\n');

    // Verificar usuario admin
    const [users] = await connection.execute(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = ?',
      ['admin@concejo.guachucal.gov.co']
    );

    if (users.length === 0) {
      console.log('❌ Usuario administrador NO encontrado');
      console.log('   Ejecuta: npm run reset-admin');
      return;
    }

    const user = users[0];
    console.log('✅ Usuario encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nombre: ${user.nombre}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.rol}`);
    console.log(`   Activo: ${user.activo ? 'Sí ✅' : 'No ❌'}`);

    if (!user.activo) {
      console.log('\n⚠️  El usuario está INACTIVO. Activándolo...');
      await connection.execute(
        'UPDATE usuarios SET activo = TRUE WHERE email = ?',
        ['admin@concejo.guachucal.gov.co']
      );
      console.log('✅ Usuario activado');
    }

    // Verificar contraseña
    const [userWithPassword] = await connection.execute(
      'SELECT password FROM usuarios WHERE email = ?',
      ['admin@concejo.guachucal.gov.co']
    );
    
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, userWithPassword[0].password);
    
    console.log(`\n🔐 Verificación de contraseña: ${isValid ? '✅ Válida' : '❌ Inválida'}`);
    
    if (!isValid) {
      console.log('\n🔄 Restableciendo contraseña...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      await connection.execute(
        'UPDATE usuarios SET password = ? WHERE email = ?',
        [hashedPassword, 'admin@concejo.guachucal.gov.co']
      );
      console.log('✅ Contraseña restablecida');
    }

    // Verificar JWT_SECRET
    console.log('\n🔑 Verificación de configuración:');
    if (process.env.JWT_SECRET) {
      console.log('   JWT_SECRET: ✅ Configurado');
    } else {
      console.log('   JWT_SECRET: ❌ NO configurado');
      console.log('   ⚠️  Agrega JWT_SECRET a tu archivo .env');
    }

    console.log('\n📋 Credenciales para iniciar sesión:');
    console.log('   Email: admin@concejo.guachucal.gov.co');
    console.log('   Contraseña: admin123');
    console.log('   URL: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n📋 La base de datos no existe. Ejecuta:');
      console.error('   mysql -u root -p < database/schema.sql');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n📋 MySQL no está corriendo. Inicia el servicio MySQL.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

verificarAdmin();



