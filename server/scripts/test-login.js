const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
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

    const email = 'admin@concejo.guachucal.gov.co';
    const password = 'admin123';

    // Simular el proceso de login
    console.log('🔍 Simulando proceso de login...\n');

    // Paso 1: Buscar usuario
    const [users] = await connection.execute(
      'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
      [email]
    );

    if (users.length === 0) {
      console.log('❌ Usuario NO encontrado o INACTIVO');
      console.log('   Verificando si existe sin filtro de activo...');
      
      const [allUsers] = await connection.execute(
        'SELECT id, nombre, email, rol, activo FROM usuarios WHERE email = ?',
        [email]
      );
      
      if (allUsers.length > 0) {
        const user = allUsers[0];
        console.log(`   Usuario encontrado pero INACTIVO (activo = ${user.activo})`);
        console.log('   Activando usuario...');
        await connection.execute(
          'UPDATE usuarios SET activo = TRUE WHERE email = ?',
          [email]
        );
        console.log('   ✅ Usuario activado');
      } else {
        console.log('   ❌ Usuario no existe. Creándolo...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.execute(
          'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)',
          ['Administrador', email, hashedPassword, 'admin', true]
        );
        console.log('   ✅ Usuario creado');
      }
      return;
    }

    const user = users[0];
    console.log('✅ Usuario encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nombre: ${user.nombre}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.rol}`);
    console.log(`   Activo: ${user.activo ? 'Sí' : 'No'}`);

    // Paso 2: Verificar contraseña
    console.log('\n🔐 Verificando contraseña...');
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('❌ Contraseña INVÁLIDA');
      console.log('   Restableciendo contraseña...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.execute(
        'UPDATE usuarios SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );
      console.log('   ✅ Contraseña restablecida');
    } else {
      console.log('✅ Contraseña VÁLIDA');
    }

    // Paso 3: Verificar JWT_SECRET
    console.log('\n🔑 Verificando configuración:');
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET NO configurado');
      console.log('   ⚠️  Esto causará errores al generar el token');
      console.log('   Agrega JWT_SECRET a tu archivo server/.env');
    } else {
      console.log('✅ JWT_SECRET configurado');
    }

    // Verificar variables de entorno importantes
    console.log('\n📋 Configuración del servidor:');
    console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || 'diocesis'}`);
    console.log(`   PORT: ${process.env.PORT || '5000'}`);

    console.log('\n✅ Login debería funcionar correctamente');
    console.log('\n📋 Credenciales:');
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
    console.log(`   URL: http://localhost:3000/admin/login`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Código:', error.code);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n📋 La base de datos no existe.');
      console.error('   Ejecuta: mysql -u root -p < database/schema.sql');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n📋 MySQL no está corriendo.');
      console.error('   Inicia el servicio MySQL.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testLogin();



