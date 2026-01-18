const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function crearTablasAutoridades() {
  let connection;
  
  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../../database/autoridades.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis',
      multipleStatements: true
    });

    console.log('Conectado a la base de datos');
    console.log('Creando tabla de autoridades...');

    // Ejecutar el SQL
    await connection.query(sql);

    console.log('✅ Tabla de autoridades creada exitosamente');
    console.log('✅ Datos iniciales insertados');

  } catch (error) {
    console.error('❌ Error creando tabla de autoridades:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada');
    }
  }
}

crearTablasAutoridades();















