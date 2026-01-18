const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function crearTodasTablas() {
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

    // 1. Crear tabla usuarios primero (sin foreign keys)
    console.log('1. Creando tabla usuarios...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'editor', 'usuario') DEFAULT 'usuario',
        activo BOOLEAN DEFAULT TRUE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('   ✅ Tabla usuarios creada\n');

    // 2. Crear tablas sin foreign keys
    console.log('2. Creando tablas base...');
    const tablasBase = `
      CREATE TABLE IF NOT EXISTS noticias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT NOT NULL,
        resumen VARCHAR(500),
        imagen_url VARCHAR(255),
        categoria VARCHAR(50) DEFAULT 'Noticias',
        autor_id INT,
        publicada BOOLEAN DEFAULT FALSE,
        fecha_publicacion DATE,
        visitas INT DEFAULT 0,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        INDEX idx_publicada (publicada),
        INDEX idx_fecha (fecha_publicacion)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS documentos_gaceta (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipo ENUM('acuerdo', 'acta', 'decreto', 'proyecto', 'manual', 'ley', 'politica') NOT NULL,
        numero VARCHAR(50),
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        archivo_url VARCHAR(255),
        fecha DATE,
        publicada BOOLEAN DEFAULT FALSE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tipo (tipo),
        INDEX idx_publicada (publicada)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS documentos_transparencia (
        id INT AUTO_INCREMENT PRIMARY KEY,
        categoria VARCHAR(100) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        archivo_url VARCHAR(255),
        fecha DATE,
        publicada BOOLEAN DEFAULT FALSE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_categoria (categoria),
        INDEX idx_publicada (publicada)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE IF NOT EXISTS configuracion (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clave VARCHAR(100) UNIQUE NOT NULL,
        valor TEXT,
        tipo VARCHAR(50) DEFAULT 'texto',
        descripcion VARCHAR(255),
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await connection.query(tablasBase);
    console.log('   ✅ Tablas base creadas\n');

    // 3. Ejecutar scripts SQL restantes
    const scripts = [
      '../database/pqrsd.sql',
      '../database/sesiones_concejo.sql',
      '../database/usuarios_permisos.sql',
      '../database/agregar_imagen_documento.sql',
      '../database/transparencia_categorias.sql'
    ];

    for (const script of scripts) {
      try {
        const sqlPath = path.join(__dirname, script);
        if (fs.existsSync(sqlPath)) {
          let sql = fs.readFileSync(sqlPath, 'utf8');
          sql = sql.replace(/CREATE DATABASE.*?;/gi, '');
          sql = sql.replace(/USE\s+\w+;/gi, '');
          await connection.query(sql);
          console.log(`   ✅ ${path.basename(script)} ejecutado`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${path.basename(script)}: ${error.message.split('\n')[0]}`);
      }
    }

    console.log('\n✅ Proceso completado');
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

crearTodasTablas();







