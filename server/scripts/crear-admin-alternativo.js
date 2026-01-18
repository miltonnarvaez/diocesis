const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function crearAdmin() {
  let connection;
  
  // Múltiples configuraciones para intentar
  const configs = [
    {
      host: '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis',
      connectTimeout: 5000
    },
    {
      host: 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis',
      connectTimeout: 5000
    },
    {
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'diocesis',
      connectTimeout: 5000
    },
    {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'diocesis',
      connectTimeout: 5000
    }
  ];

  console.log('🔄 Intentando múltiples formas de conexión a MySQL...\n');

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    try {
      console.log(`Intento ${i + 1}/${configs.length}:`);
      console.log(`   Host: ${config.host}`);
      console.log(`   Usuario: ${config.user}`);
      console.log(`   Base de datos: ${config.database}`);
      
      connection = await mysql.createConnection(config);
      console.log('✅ ¡Conexión exitosa!\n');
      break;
    } catch (error) {
      console.log(`❌ Falló: ${error.message}\n`);
      if (i === configs.length - 1) {
        console.error('\n❌ No se pudo conectar con ninguna configuración.\n');
        console.error('📋 SOLUCIÓN ALTERNATIVA:');
        console.error('\n1. Reparar MySQL en XAMPP:');
        console.error('   - Abre XAMPP Control Panel');
        console.error('   - Haz clic en "Config" junto a MySQL');
        console.error('   - Selecciona "my.ini"');
        console.error('   - Busca y elimina/comenta la línea con "--initialize-insecure"');
        console.error('   - Guarda y reinicia MySQL');
        console.error('\n2. O reinstala MySQL en XAMPP:');
        console.error('   - Descarga XAMPP nuevamente');
        console.error('   - Solo reinstala el componente MySQL');
        console.error('\n3. O usa estas credenciales si el usuario ya existe:');
        console.error('   Email: admin@diocesis.gov.co');
        console.error('   Contraseña: admin123');
        console.error('\n4. O crea el usuario manualmente en phpMyAdmin:');
        console.error('   - Abre phpMyAdmin (http://localhost/phpmyadmin)');
        console.error('   - Selecciona la base de datos "diocesis"');
        console.error('   - Ve a la tabla "usuarios"');
        console.error('   - Inserta un nuevo registro con:');
        console.error('     nombre: Administrador');
        console.error('     email: admin@diocesis.gov.co');
        console.error('     password: (hash bcrypt de "admin123")');
        console.error('     rol: admin');
        console.error('     activo: 1');
        process.exit(1);
      }
    }
  }

  try {
    // Credenciales del administrador
    const email = 'admin@diocesis.gov.co';
    const password = 'admin123';
    const nombre = 'Administrador';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('📋 Credenciales del Administrador:');
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
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n📋 La base de datos "diocesis" no existe.');
      console.error('   Créala primero en phpMyAdmin o ejecuta:');
      console.error('   CREATE DATABASE diocesis;');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

crearAdmin();
