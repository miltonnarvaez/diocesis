const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function pregunta(pregunta) {
  return new Promise((resolve) => {
    rl.question(pregunta, (respuesta) => {
      resolve(respuesta);
    });
  });
}

async function configurarEmail() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  CONFIGURACIÓN DE EMAIL PARA PQRSD');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Este asistente te ayudará a configurar el envío de emails.\n');
  console.log('📋 ANTES DE CONTINUAR:');
  console.log('   1. Necesitas una cuenta de Gmail');
  console.log('   2. Debes tener activada la verificación en 2 pasos');
  console.log('   3. Debes generar una contraseña de aplicación\n');
  console.log('   Si aún no lo has hecho, ve a:');
  console.log('   https://myaccount.google.com/apppasswords\n');

  const continuar = await pregunta('¿Ya tienes tu contraseña de aplicación de Gmail? (s/n): ');
  
  if (continuar.toLowerCase() !== 's' && continuar.toLowerCase() !== 'si') {
    console.log('\n📝 Pasos para obtener tu contraseña de aplicación:');
    console.log('   1. Ve a: https://myaccount.google.com/apppasswords');
    console.log('   2. Selecciona "Correo" y "Otro (nombre personalizado)"');
    console.log('   3. Escribe: Concejo Guachucal');
    console.log('   4. Haz clic en "Generar"');
    console.log('   5. COPIA la contraseña de 16 caracteres\n');
    console.log('   Presiona Enter cuando tengas la contraseña...');
    await pregunta('');
  }

  console.log('\n───────────────────────────────────────────────────────────');
  console.log('  INFORMACIÓN REQUERIDA');
  console.log('───────────────────────────────────────────────────────────\n');

  const email = await pregunta('📧 Tu email de Gmail: ');
  const password = await pregunta('🔑 Contraseña de aplicación (16 caracteres, sin espacios): ');
  const nombreConcejo = await pregunta('🏛️  Nombre del Concejo [Concejo Municipal de Guachucal]: ') || 'Concejo Municipal de Guachucal';
  const emailContacto = await pregunta('📧 Email de contacto [contacto@concejo.guachucal.gov.co]: ') || 'contacto@concejo.guachucal.gov.co';
  const telefonoContacto = await pregunta('📞 Teléfono de contacto [+57 (2) XXX-XXXX]: ') || '+57 (2) XXX-XXXX';
  const frontendUrl = await pregunta('🌐 URL del frontend [http://localhost:3000]: ') || 'http://localhost:3000';

  // Leer archivo .env existente o crear uno nuevo
  const envPath = path.join(__dirname, '../.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('\n✅ Archivo .env encontrado, agregando configuración de email...\n');
  } else {
    console.log('\n📝 Creando nuevo archivo .env...\n');
    envContent = `# Configuración del servidor
PORT=5000
NODE_ENV=development

# Configuración de MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=diocesis

# Configuración de JWT
JWT_SECRET=diocesis_secret_key_cambiar_en_produccion
JWT_EXPIRE=7d

`;
  }

  // Eliminar configuración de email anterior si existe
  const lines = envContent.split('\n');
  const filteredLines = [];
  let skipEmailSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('# CONFIGURACIÓN DE EMAIL') || line.includes('# Configuración SMTP')) {
      skipEmailSection = true;
      continue;
    }
    
    if (skipEmailSection) {
      if (line.startsWith('#') && !line.includes('SMTP') && !line.includes('EMAIL') && !line.includes('FRONTEND')) {
        skipEmailSection = false;
        filteredLines.push(lines[i]);
      } else if (!line.includes('SMTP') && !line.includes('EMAIL_CONTACTO') && !line.includes('TELEFONO_CONTACTO') && !line.includes('NOMBRE_CONCEJO') && !line.includes('FRONTEND_URL')) {
        if (!skipEmailSection) {
          filteredLines.push(lines[i]);
        }
      }
    } else {
      filteredLines.push(lines[i]);
    }
  }

  // Agregar nueva configuración de email
  const emailConfig = `
# ============================================
# CONFIGURACIÓN DE EMAIL PARA PQRSD
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=${email}
SMTP_PASSWORD=${password}
SMTP_FROM=${nombreConcejo} <${email}>
FRONTEND_URL=${frontendUrl}
NOMBRE_CONCEJO=${nombreConcejo}
EMAIL_CONTACTO=${emailContacto}
TELEFONO_CONTACTO=${telefonoContacto}
`;

  const newEnvContent = filteredLines.join('\n') + emailConfig;

  // Guardar archivo
  fs.writeFileSync(envPath, newEnvContent, 'utf8');

  console.log('✅ Configuración guardada en server/.env\n');
  console.log('───────────────────────────────────────────────────────────');
  console.log('  CONFIGURACIÓN COMPLETADA');
  console.log('───────────────────────────────────────────────────────────\n');
  console.log('📧 Email configurado:', email);
  console.log('🏛️  Nombre del Concejo:', nombreConcejo);
  console.log('🌐 URL del Frontend:', frontendUrl);
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('   1. Reinicia el servidor backend');
  console.log('   2. Busca el mensaje: "✅ Servidor de email configurado correctamente"');
  console.log('   3. Prueba creando una PQRSD desde el formulario');
  console.log('   4. Revisa tu email (y spam) para ver la confirmación\n');

  rl.close();
}

configurarEmail().catch(err => {
  console.error('Error:', err);
  rl.close();
  process.exit(1);
});















