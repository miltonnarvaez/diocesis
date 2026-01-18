const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function crearTablasHistoria() {
  let connection;

  try {
    // Crear conexión
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis',
      multipleStatements: true
    });

    console.log('✅ Conectado a la base de datos');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../../database/historia_concejo.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el script SQL
    await connection.query(sql);
    console.log('✅ Tabla de historia creada exitosamente');

    console.log('\n📋 Tabla creada:');
    console.log('   - historia_concejo');

  } catch (error) {
    console.error('❌ Error creando tabla:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexión cerrada');
    }
  }
}

crearTablasHistoria();















