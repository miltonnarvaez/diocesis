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
    
    await conn.query("UPDATE usuarios SET email = 'admin@diocesis.gov.co' WHERE id = 1");
    console.log('✅ Email actualizado a: admin@diocesis.gov.co');
    
    const [rows] = await conn.query('SELECT * FROM usuarios WHERE id = 1');
    if (rows.length > 0) {
      console.log('\n📋 Usuario actualizado:');
      console.log(`   Email: ${rows[0].email}`);
      console.log(`   Nombre: ${rows[0].nombre}`);
      console.log(`   Rol: ${rows[0].rol}`);
    }
    
    await conn.end();
  } catch (e) {
    console.log('Error:', e.message);
  }
})();







