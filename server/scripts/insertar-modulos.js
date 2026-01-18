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
    
    await conn.query(`
      INSERT INTO modulos (nombre, descripcion) VALUES
      ('noticias', 'Gestión de noticias y publicaciones'),
      ('convocatorias', 'Gestión de convocatorias y anuncios'),
      ('gaceta', 'Gestión de documentos de gaceta'),
      ('transparencia', 'Gestión de documentos de transparencia'),
      ('sesiones', 'Gestión de sesiones del concejo'),
      ('autoridades', 'Gestión de autoridades del concejo'),
      ('configuracion', 'Configuración general del sitio'),
      ('usuarios', 'Gestión de usuarios y permisos')
      ON DUPLICATE KEY UPDATE descripcion=VALUES(descripcion)
    `);
    
    await conn.query(`
      ALTER TABLE usuarios 
      MODIFY COLUMN rol ENUM('admin', 'editor', 'usuario') DEFAULT 'usuario'
    `);
    
    console.log('✅ Módulos insertados y tabla usuarios actualizada');
    await conn.end();
  } catch (e) {
    console.log('Error:', e.message);
  }
})();







