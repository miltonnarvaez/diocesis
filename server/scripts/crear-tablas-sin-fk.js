const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function crearTablasSinFK() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis',
      multipleStatements: true
    });

    console.log('✅ Conectado a MySQL\n');

    // Eliminar tablas problemáticas si existen
    console.log('Limpiando tablas existentes...');
    const tablasAEliminar = ['usuarios', 'noticias', 'documentos_gaceta', 'documentos_transparencia', 'configuracion', 'convocatorias'];
    for (const tabla of tablasAEliminar) {
      try {
        await connection.query(`DROP TABLE IF EXISTS ${tabla}`);
      } catch (e) {
        // Ignorar errores
      }
    }
    console.log('✅ Limpieza completada\n');

    // Leer y ejecutar schema.sql pero sin foreign keys
    const sqlPath = path.join(__dirname, '../../database/schema.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Remover CREATE DATABASE y USE
    sql = sql.replace(/CREATE DATABASE.*?;/gi, '');
    sql = sql.replace(/USE\s+\w+;/gi, '');
    
    // Remover todas las foreign keys temporalmente
    sql = sql.replace(/,\s*FOREIGN KEY[^,)]+\)/gi, '');
    sql = sql.replace(/FOREIGN KEY[^,)]+\)/gi, '');
    
    await connection.query(sql);
    console.log('✅ Tablas base creadas (sin foreign keys)\n');

    // Ahora ejecutar otros scripts
    const scripts = [
      '../database/pqrsd.sql',
      '../database/sesiones_concejo.sql',
      '../database/usuarios_permisos.sql'
    ];

    for (const script of scripts) {
      try {
        const sqlPath = path.join(__dirname, script);
        if (fs.existsSync(sqlPath)) {
          let sql = fs.readFileSync(sqlPath, 'utf8');
          sql = sql.replace(/CREATE DATABASE.*?;/gi, '');
          sql = sql.replace(/USE\s+\w+;/gi, '');
          // Remover foreign keys también
          sql = sql.replace(/,\s*FOREIGN KEY[^,)]+\)/gi, '');
          sql = sql.replace(/FOREIGN KEY[^,)]+\)/gi, '');
          
          await connection.query(sql);
          console.log(`✅ ${path.basename(script)} ejecutado`);
        }
      } catch (error) {
        console.log(`⚠️  ${path.basename(script)}: ${error.message.split('\n')[0]}`);
      }
    }

    // Verificar tablas creadas
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`\n✅ Total de tablas creadas: ${tables.length}`);
    tables.forEach(t => console.log(`   - ${Object.values(t)[0]}`));

    await connection.end();
    console.log('\n✅ Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

crearTablasSinFK();







