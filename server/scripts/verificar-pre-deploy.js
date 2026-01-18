const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const colores = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  rojo: '\x1b[31m',
  amarillo: '\x1b[33m',
  azul: '\x1b[34m',
  cian: '\x1b[36m'
};

function log(mensaje, color = 'reset') {
  console.log(`${colores[color]}${mensaje}${colores.reset}`);
}

async function verificarPreDeploy() {
  log('\n🔍 VERIFICACIÓN PRE-DEPLOY - Diócesis de Ipiales\n', 'cian');
  log('═══════════════════════════════════════════════════════════\n', 'cian');

  let errores = [];
  let advertencias = [];
  let exitos = [];

  // 1. Verificar archivo .env
  log('1️⃣  Verificando archivo .env...', 'azul');
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    errores.push('❌ Archivo .env no encontrado en server/.env');
  } else {
    exitos.push('✅ Archivo .env encontrado');
    
    // Leer y verificar variables críticas
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {
      'DB_HOST': false,
      'DB_USER': false,
      'DB_PASSWORD': false,
      'DB_NAME': false,
      'JWT_SECRET': false,
      'PORT': false,
      'NODE_ENV': false
    };

    for (const [key, value] of Object.entries(envVars)) {
      if (envContent.includes(`${key}=`)) {
        envVars[key] = true;
      }
    }

    // Verificar valores críticos
    if (envContent.includes('JWT_SECRET=diocesis_secret_key_cambiar_en_produccion')) {
      advertencias.push('⚠️  JWT_SECRET tiene el valor por defecto. CAMBIAR en producción');
    } else if (envVars.JWT_SECRET) {
      exitos.push('✅ JWT_SECRET configurado');
    }

    if (envContent.includes('NODE_ENV=development')) {
      advertencias.push('⚠️  NODE_ENV está en "development". Cambiar a "production"');
    } else if (envContent.includes('NODE_ENV=production')) {
      exitos.push('✅ NODE_ENV configurado como production');
    }

    if (envContent.includes('DB_PASSWORD=') && !envContent.includes('DB_PASSWORD=tu_password')) {
      exitos.push('✅ DB_PASSWORD configurado');
    } else {
      advertencias.push('⚠️  Verificar que DB_PASSWORD esté configurado correctamente');
    }

    if (envContent.includes('FRONTEND_URL=')) {
      exitos.push('✅ FRONTEND_URL configurado');
    } else {
      advertencias.push('⚠️  FRONTEND_URL no configurado (necesario para CORS)');
    }
  }

  // 2. Verificar conexión a MySQL
  log('\n2️⃣  Verificando conexión a MySQL...', 'azul');
  try {
    const dbHost = process.env.DB_HOST || 'localhost';
    const resolvedHost = dbHost === 'localhost' ? '127.0.0.1' : dbHost;
    
    const connection = await mysql.createConnection({
      host: resolvedHost,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'diocesis'
    });

    // Verificar que la base de datos existe
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === (process.env.DB_NAME || 'diocesis'));
    
    if (dbExists) {
      exitos.push('✅ Base de datos existe');
    } else {
      errores.push(`❌ Base de datos "${process.env.DB_NAME || 'diocesis'}" no existe`);
    }

    // Verificar tablas principales
    await connection.execute(`USE ${process.env.DB_NAME || 'diocesis'}`);
    const [tables] = await connection.execute('SHOW TABLES');
    const tablasEsperadas = ['usuarios', 'noticias', 'convocatorias', 'gaceta', 'pqrsd'];
    const tablasEncontradas = tables.map(t => Object.values(t)[0]);

    for (const tabla of tablasEsperadas) {
      if (tablasEncontradas.includes(tabla)) {
        exitos.push(`✅ Tabla "${tabla}" existe`);
      } else {
        advertencias.push(`⚠️  Tabla "${tabla}" no encontrada`);
      }
    }

    await connection.end();
    exitos.push('✅ Conexión a MySQL exitosa');
  } catch (error) {
    errores.push(`❌ Error conectando a MySQL: ${error.message}`);
  }

  // 3. Verificar carpetas de uploads
  log('\n3️⃣  Verificando carpetas de uploads...', 'azul');
  const uploadsPath = path.join(__dirname, '../uploads');
  const carpetasUploads = ['documents', 'galeria', 'images', 'repositorio-temporal'];

  if (!fs.existsSync(uploadsPath)) {
    errores.push('❌ Carpeta server/uploads no existe');
  } else {
    exitos.push('✅ Carpeta server/uploads existe');
    
    for (const carpeta of carpetasUploads) {
      const carpetaPath = path.join(uploadsPath, carpeta);
      if (!fs.existsSync(carpetaPath)) {
        advertencias.push(`⚠️  Carpeta server/uploads/${carpeta} no existe (se creará automáticamente)`);
      } else {
        exitos.push(`✅ Carpeta server/uploads/${carpeta} existe`);
      }
    }
  }

  // 4. Verificar build del cliente
  log('\n4️⃣  Verificando build del cliente...', 'azul');
  const buildPath = path.join(__dirname, '../../client/build');
  if (!fs.existsSync(buildPath)) {
    advertencias.push('⚠️  Carpeta client/build no existe. Ejecutar: cd client && npm run build');
  } else {
    exitos.push('✅ Carpeta client/build existe');
    
    const indexHtml = path.join(buildPath, 'index.html');
    if (!fs.existsSync(indexHtml)) {
      errores.push('❌ client/build/index.html no encontrado');
    } else {
      exitos.push('✅ client/build/index.html existe');
    }
  }

  // 5. Verificar dependencias
  log('\n5️⃣  Verificando dependencias...', 'azul');
  const serverPackageJson = path.join(__dirname, '../package.json');
  const clientPackageJson = path.join(__dirname, '../../client/package.json');

  if (fs.existsSync(serverPackageJson)) {
    exitos.push('✅ server/package.json existe');
  } else {
    errores.push('❌ server/package.json no encontrado');
  }

  if (fs.existsSync(clientPackageJson)) {
    exitos.push('✅ client/package.json existe');
  } else {
    errores.push('❌ client/package.json no encontrado');
  }

  // Resumen
  log('\n═══════════════════════════════════════════════════════════\n', 'cian');
  log('📊 RESUMEN DE VERIFICACIÓN\n', 'cian');

  if (exitos.length > 0) {
    log('\n✅ ÉXITOS:', 'verde');
    exitos.forEach(msg => log(`   ${msg}`, 'verde'));
  }

  if (advertencias.length > 0) {
    log('\n⚠️  ADVERTENCIAS:', 'amarillo');
    advertencias.forEach(msg => log(`   ${msg}`, 'amarillo'));
  }

  if (errores.length > 0) {
    log('\n❌ ERRORES:', 'rojo');
    errores.forEach(msg => log(`   ${msg}`, 'rojo'));
  }

  log('\n═══════════════════════════════════════════════════════════\n', 'cian');

  if (errores.length === 0) {
    log('✅ VERIFICACIÓN COMPLETA - Listo para deploy', 'verde');
    if (advertencias.length > 0) {
      log('⚠️  Revisa las advertencias antes de continuar\n', 'amarillo');
    }
    process.exit(0);
  } else {
    log('❌ HAY ERRORES QUE DEBEN CORREGIRSE ANTES DEL DEPLOY\n', 'rojo');
    process.exit(1);
  }
}

verificarPreDeploy().catch(error => {
  log(`\n❌ Error durante la verificación: ${error.message}`, 'rojo');
  process.exit(1);
});
