const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupCompleto() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis',
      multipleStatements: true
    });

    console.log('✅ Conectado a MySQL');
    console.log(`📋 Base de datos: ${process.env.DB_NAME || 'diocesis'}\n`);

    const scripts = [
      '../database/schema.sql',
      '../database/usuarios_permisos.sql',
      '../database/sesiones_concejo.sql',
      '../database/agregar_imagen_documento.sql',
      '../database/transparencia_categorias.sql'
    ];

    for (const script of scripts) {
      try {
        const sqlPath = path.join(__dirname, script);
        if (fs.existsSync(sqlPath)) {
          let sql = fs.readFileSync(sqlPath, 'utf8');
          // Remover CREATE DATABASE y USE
          sql = sql.replace(/CREATE DATABASE.*?;/gi, '');
          sql = sql.replace(/USE\s+\w+;/gi, '');
          
          await connection.query(sql);
          console.log(`✅ ${path.basename(script)} ejecutado`);
        }
      } catch (error) {
        console.log(`⚠️  ${path.basename(script)}: ${error.message}`);
      }
    }

    console.log('\n✅ Setup completo finalizado');
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

setupCompleto();







