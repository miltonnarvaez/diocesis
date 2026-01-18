const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde server/.env
const envPath = path.join(__dirname, '../server/.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn('⚠️  Archivo .env no encontrado, usando valores por defecto');
}

async function crearTablasPQRSD() {
  let connection;
  
  try {
    // Conectar a MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis',
      multipleStatements: true
    });

    console.log('✅ Conectado a MySQL');
    console.log(`📋 Base de datos: ${process.env.DB_NAME || 'diocesis'}\n`);

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../database/pqrsd.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar el script SQL
    console.log('📝 Ejecutando script SQL...\n');
    await connection.query(sql);

    console.log('✅ Tablas de PQRSD creadas exitosamente!\n');

    // Verificar que las tablas se crearon
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'pqrsd%'"
    );

    console.log('📊 Tablas creadas:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    console.log('\n✅ Proceso completado exitosamente!');

  } catch (error) {
    console.error('\n❌ Error al crear las tablas:');
    console.error(`   Código: ${error.code || 'DESCONOCIDO'}`);
    console.error(`   Mensaje: ${error.message || 'Sin mensaje'}`);
    
    if (error.sqlMessage) {
      console.error(`   SQL: ${error.sqlMessage}`);
    }

    console.error('\n📋 Soluciones posibles:');
    console.error('   1. Verifica que MySQL esté corriendo');
    console.error('   2. Verifica las credenciales en server/.env');
    console.error('   3. Verifica que la base de datos exista');
    console.error('   4. Ejecuta manualmente: mysql -u root -p < database/pqrsd.sql');
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar
crearTablasPQRSD();

