const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupTransparenciaCategorias() {
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
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, '../../database/transparencia_categorias.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Ejecutando script SQL de categorías de transparencia...');
    
    // Ejecutar el script
    await connection.query(sql);
    
    console.log('✅ Categorías de transparencia agregadas como módulos');
    
    // Verificar módulos insertados
    const [modulos] = await connection.query(
      "SELECT COUNT(*) as count FROM diocesis.modulos WHERE nombre LIKE 'transparencia_%'"
    );
    
    console.log(`✅ Módulos de transparencia en la base de datos: ${modulos[0].count}`);

    console.log('\n🎉 ¡Configuración de categorías de transparencia completada!');
    console.log('\n📋 Ahora puedes asignar permisos específicos por categoría de transparencia');

  } catch (error) {
    console.error('❌ Error ejecutando el script:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('ℹ️  Algunos módulos ya existen, continuando...');
    } else {
      console.error('\n📋 Soluciones posibles:');
      console.error('   1. Verifica que MySQL esté instalado y corriendo');
      console.error('   2. Verifica las credenciales en server/.env');
      console.error('   3. Verifica que la base de datos "diocesis" exista');
      process.exit(1);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupTransparenciaCategorias();

















