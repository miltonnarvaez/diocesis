const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function crearTablasForos() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis',
      multipleStatements: true
    });

    console.log('Conectado a la base de datos...');

    const sqlPath = path.join(__dirname, '..', '..', 'database', 'foros.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await connection.query(sql);

    console.log('✅ Tablas de foros creadas exitosamente.');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('Las tablas ya existen.');
    } else {
      throw error;
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada.');
    }
  }
}

crearTablasForos()
  .then(() => {
    console.log('Proceso completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });














