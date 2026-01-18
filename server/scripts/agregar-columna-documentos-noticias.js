const mysql = require('mysql2/promise');
require('dotenv').config();

async function agregarColumnaDocumentos() {
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

    // Verificar si la columna ya existe
    const [columns] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'noticias' 
      AND COLUMN_NAME = 'documentos_adicionales'
    `, [process.env.DB_NAME || 'diocesis']);

    if (columns[0].count > 0) {
      console.log('✅ La columna documentos_adicionales ya existe');
    } else {
      console.log('🔄 Agregando columna documentos_adicionales...');
      
      await connection.execute(`
        ALTER TABLE noticias 
        ADD COLUMN documentos_adicionales TEXT NULL 
        AFTER categoria
      `);
      
      console.log('✅ Columna documentos_adicionales agregada exitosamente');
    }

    // Verificar la estructura de la tabla
    const [tableStructure] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'noticias'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'diocesis']);

    console.log('\n📋 Estructura de la tabla noticias:');
    tableStructure.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}, ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

    console.log('\n🎉 ¡Configuración completada!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n📋 Soluciones posibles:');
      console.error('   1. Verifica las credenciales de MySQL en server/.env');
      console.error('   2. Verifica que el usuario de MySQL tenga permisos ALTER');
      console.error('   3. Verifica que la base de datos existe');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

agregarColumnaDocumentos();


