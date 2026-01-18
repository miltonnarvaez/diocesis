const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function crearAdmin() {
  let connection;
  
  try {
    // Conectar a MySQL usando la configuración del .env
    const dbHost = process.env.DB_HOST || 'localhost';
    const resolvedHost = dbHost === 'localhost' ? '127.0.0.1' : dbHost;
    
    console.log('🔄 Intentando conectar a MySQL...');
    console.log(`   Host: ${resolvedHost}`);
    console.log(`   Usuario: ${process.env.DB_USER || 'root'}`);
    console.log(`   Base de datos: ${process.env.DB_NAME || 'diocesis'}`);
    
    connection = await mysql.createConnection({
      host: resolvedHost,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis'
    });

    console.log('✅ Conectado a MySQL');

    // Credenciales del administrador
    const email = 'admin@diocesis.gov.co';
    const password = 'admin123';
    const nombre = 'Administrador';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('\n📋 Credenciales del Administrador:');
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
    console.log('\n🔄 Verificando si el usuario existe...');

    // Verificar si el usuario existe
    const [users] = await connection.execute(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Crear el usuario si no existe
      console.log('   Usuario no existe. Creándolo...');
      await connection.execute(
        'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)',
        [nombre, email, hashedPassword, 'admin', true]
      );
      console.log('✅ Usuario administrador creado exitosamente');
    } else {
      // Actualizar el usuario existente
      const user = users[0];
      console.log(`   Usuario encontrado (ID: ${user.id})`);
      console.log('   Actualizando credenciales...');
      
      await connection.execute(
        'UPDATE usuarios SET nombre = ?, password = ?, rol = ?, activo = ? WHERE email = ?',
        [nombre, hashedPassword, 'admin', true, email]
      );
      console.log('✅ Credenciales del administrador actualizadas');
    }

    // Verificar que se creó/actualizó correctamente
    const [verify] = await connection.execute(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = ?',
      [email]
    );

    if (verify.length > 0) {
      const user = verify[0];
      console.log('\n✅ Usuario verificado:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nombre: ${user.nombre}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol: ${user.rol}`);
      console.log(`   Activo: ${user.activo ? 'Sí' : 'No'}`);
    }

    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📋 Para acceder a la administración:');
    console.log(`   1. Ve a: http://localhost:3001/admin/login`);
    console.log(`   2. Email: ${email}`);
    console.log(`   3. Contraseña: ${password}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n📋 El usuario o contraseña de MySQL son incorrectos.');
      console.error('   Verifica el archivo server/.env y ajusta:');
      console.error('   - DB_USER');
      console.error('   - DB_PASSWORD');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n📋 MySQL no está corriendo o no está accesible.');
      console.error('   Soluciones posibles:');
      console.error('   1. Si usas XAMPP: Inicia MySQL desde el panel de control');
      console.error('   2. Si usas WAMP: Inicia MySQL desde el panel de control');
      console.error('   3. Verifica que MySQL esté instalado y corriendo');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n📋 La base de datos no existe.');
      console.error('   Crea la base de datos primero:');
      console.error('   CREATE DATABASE diocesis;');
    } else {
      console.error('\n📋 Detalles del error:');
      console.error(`   Código: ${error.code || 'DESCONOCIDO'}`);
      console.error(`   Mensaje: ${error.message}`);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

crearAdmin();
