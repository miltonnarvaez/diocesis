const mysql = require('mysql2/promise');
require('dotenv').config();

async function agregarGrupoInteres() {
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

    // Verificar si la columna ya existe
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'pqrsd' 
       AND COLUMN_NAME = 'grupo_interes'`,
      [process.env.DB_NAME || 'diocesis']
    );

    if (columns.length > 0) {
      console.log('La columna grupo_interes ya existe en la tabla pqrsd.');
      return;
    }

    // Agregar columna grupo_interes
    await connection.execute(`
      ALTER TABLE pqrsd 
      ADD COLUMN grupo_interes ENUM(
        'dupla_naranja',
        'adultos_mayores',
        'jovenes',
        'personas_discapacidad',
        'comunidades_etnicas',
        'empresarios',
        'general'
      ) DEFAULT 'general' AFTER tipo
    `);

    console.log('✓ Columna grupo_interes agregada a la tabla pqrsd.');

    // Agregar índice
    await connection.execute(`
      ALTER TABLE pqrsd 
      ADD INDEX idx_grupo_interes (grupo_interes)
    `);

    console.log('✓ Índice idx_grupo_interes agregado.');

    // Actualizar registros existentes a 'general'
    const [updateResult] = await connection.execute(
      `UPDATE pqrsd SET grupo_interes = 'general' WHERE grupo_interes IS NULL`
    );

    console.log(`✓ ${updateResult.affectedRows} registros actualizados con grupo_interes = 'general'.`);

    console.log('\n✅ Campo grupo_interes agregado exitosamente a la tabla pqrsd.');

  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('La columna grupo_interes ya existe.');
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

agregarGrupoInteres()
  .then(() => {
    console.log('Proceso completado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });














