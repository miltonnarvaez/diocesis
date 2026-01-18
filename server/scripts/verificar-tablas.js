const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis'
    });
    
    const [tables] = await conn.query('SHOW TABLES');
    console.log('\n✅ BASE DE DATOS CONFIGURADA CORRECTAMENTE');
    console.log(`📊 Total de tablas: ${tables.length}\n`);
    tables.forEach(t => console.log(`   ✓ ${Object.values(t)[0]}`));
    
    await conn.end();
  } catch (e) {
    console.log('Error:', e.message);
  }
})();







