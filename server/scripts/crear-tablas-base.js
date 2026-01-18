const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function crearTablasBase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis',
      multipleStatements: true
    });

    console.log('✅ Conectado a la base de datos');

    // Leer schema.sql y ejecutar solo las tablas que faltan
    const sqlPath = path.join(__dirname, '../../database/schema.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Remover CREATE DATABASE y USE
    sql = sql.replace(/CREATE DATABASE.*?;/gi, '');
    sql = sql.replace(/USE\s+\w+;/gi, '');
    
    // Ejecutar
    await connection.query(sql);
    console.log('✅ Tablas base creadas desde schema.sql');

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

crearTablasBase();







