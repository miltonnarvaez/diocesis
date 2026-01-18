const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupUsuarios() {
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Conectado a MySQL');

    // Leer el script SQL
    const sqlPath = path.join(__dirname, '../../database/usuarios_permisos.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando script SQL...');
    
    // Ejecutar el script
    await connection.query(sql);
    
    console.log('✅ Script SQL ejecutado correctamente');
    console.log('✅ Tablas creadas: modulos, usuarios_permisos');
    console.log('✅ Módulos insertados: 8 módulos');

    // Verificar que las tablas se crearon
    const [tables] = await connection.query(
      "SHOW TABLES FROM diocesis LIKE 'modulos'"
    );
    
    if (tables.length > 0) {
      console.log('✅ Verificación: Tabla modulos existe');
    }

    const [tables2] = await connection.query(
      "SHOW TABLES FROM diocesis LIKE 'usuarios_permisos'"
    );
    
    if (tables2.length > 0) {
      console.log('✅ Verificación: Tabla usuarios_permisos existe');
    }

    // Verificar módulos insertados
    const [modulos] = await connection.query(
      'SELECT COUNT(*) as count FROM diocesis.modulos'
    );
    
    console.log(`✅ Módulos en la base de datos: ${modulos[0].count}`);

    console.log('\n🎉 ¡Configuración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Inicia el servidor backend: cd server && npm start');
    console.log('   2. Inicia el cliente frontend: cd client && npm start');
    console.log('   3. Accede a http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error ejecutando el script:', error.message);
    console.error('\n📋 Soluciones posibles:');
    console.error('   1. Verifica que MySQL esté instalado y corriendo');
    console.error('   2. Verifica las credenciales en server/.env');
    console.error('   3. Verifica que la base de datos "diocesis" exista');
    console.error('   4. Ejecuta primero: mysql -u root -p < database/schema.sql');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupUsuarios();

















