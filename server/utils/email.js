const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar transporter de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verificar configuración de email
if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
  transporter.verify(function (error, success) {
    if (error) {
      console.log('⚠️  Configuración de email no válida:', error.message);
      console.log('   Los emails no se enviarán hasta que se configure correctamente.');
    } else {
      console.log('✅ Servidor de email configurado correctamente');
    }
  });
} else {
  console.log('⚠️  SMTP_USER y SMTP_PASSWORD no configurados en .env');
  console.log('   Los emails no se enviarán hasta que se configure el servicio de email.');
}

/**
 * Enviar email de confirmación de PQRSD recibida
 */
async function enviarConfirmacionPQRSD(datos) {
  const { numeroRadicado, tipo, nombre, email, asunto, fechaCreacion } = datos;

  // Si no hay configuración de email, no intentar enviar
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('⚠️  Email no enviado: configuración SMTP no disponible');
    return { enviado: false, motivo: 'Configuración SMTP no disponible' };
  }

  const tipoLabel = {
    peticion: 'Petición',
    queja: 'Queja',
    reclamo: 'Reclamo',
    sugerencia: 'Sugerencia',
    denuncia: 'Denuncia'
  }[tipo] || tipo;

  const emailFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
  const nombreConcejo = process.env.NOMBRE_CONCEJO || 'Concejo Municipal de Guachucal';
  const emailContacto = process.env.EMAIL_CONTACTO || 'contacto@concejo.guachucal.gov.co';
  const telefonoContacto = process.env.TELEFONO_CONTACTO || '+57 (2) XXX-XXXX';

  const mailOptions = {
    from: `"${nombreConcejo}" <${emailFrom}>`,
    to: email,
    subject: `Confirmación de Recepción - PQRSD ${numeroRadicado}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Recepción</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #155724 0%, #28a745 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${nombreConcejo}</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Confirmación de Recepción</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; margin-top: 0;">Estimado/a <strong>${nombre}</strong>,</p>
          
          <p>Le informamos que hemos recibido su solicitud de tipo <strong>${tipoLabel}</strong> correctamente.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Número de Radicado:</strong></p>
            <p style="font-size: 24px; font-weight: bold; color: #155724; margin: 0;">${numeroRadicado}</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Asunto:</strong></p>
            <p style="margin: 0;">${asunto}</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Fecha de Recepción:</strong></p>
            <p style="margin: 0;">${fechaCreacion}</p>
          </div>
          
          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #004085;">📋 Plazos de Respuesta según Ley 1712 de 2014:</p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #004085;">
              <li><strong>Peticiones:</strong> 15 días hábiles</li>
              <li><strong>Quejas y Reclamos:</strong> 15 días hábiles</li>
              <li><strong>Sugerencias:</strong> Respuesta según corresponda</li>
              <li><strong>Denuncias:</strong> Según la naturaleza del caso</li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Importante:</strong> Guarde este número de radicado para consultar el estado de su solicitud en cualquier momento.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/pqrsd/consulta/${numeroRadicado}" 
               style="background: #155724; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Consultar Estado de mi Solicitud
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #666; margin-bottom: 5px;">
            <strong>Información de Contacto:</strong>
          </p>
          <p style="font-size: 14px; color: #666; margin: 5px 0;">
            📧 Email: <a href="mailto:${emailContacto}" style="color: #155724;">${emailContacto}</a><br>
            📞 Teléfono: ${telefonoContacto}
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            Este es un email automático, por favor no responda a este mensaje.<br>
            Si tiene alguna consulta, utilice los canales de contacto oficiales.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
${nombreConcejo}
Confirmación de Recepción

Estimado/a ${nombre},

Le informamos que hemos recibido su solicitud de tipo ${tipoLabel} correctamente.

Número de Radicado: ${numeroRadicado}
Asunto: ${asunto}
Fecha de Recepción: ${fechaCreacion}

Plazos de Respuesta según Ley 1712 de 2014:
- Peticiones: 15 días hábiles
- Quejas y Reclamos: 15 días hábiles
- Sugerencias: Respuesta según corresponda
- Denuncias: Según la naturaleza del caso

IMPORTANTE: Guarde este número de radicado para consultar el estado de su solicitud.

Consultar estado: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/pqrsd/consulta/${numeroRadicado}

Información de Contacto:
Email: ${emailContacto}
Teléfono: ${telefonoContacto}

Este es un email automático, por favor no responda a este mensaje.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmación enviado a:', email);
    console.log('   Número de radicado:', numeroRadicado);
    return { enviado: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error.message);
    // No lanzar error para que la solicitud se guarde aunque falle el email
    return { enviado: false, error: error.message };
  }
}

/**
 * Enviar email cuando se responde una PQRSD
 */
async function enviarRespuestaPQRSD(datos) {
  const { numeroRadicado, nombre, email, respuesta, fechaRespuesta, tipo } = datos;

  // Si no hay configuración de email, no intentar enviar
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('⚠️  Email no enviado: configuración SMTP no disponible');
    return { enviado: false, motivo: 'Configuración SMTP no disponible' };
  }

  const tipoLabel = {
    peticion: 'Petición',
    queja: 'Queja',
    reclamo: 'Reclamo',
    sugerencia: 'Sugerencia',
    denuncia: 'Denuncia'
  }[tipo] || tipo;

  const emailFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
  const nombreConcejo = process.env.NOMBRE_CONCEJO || 'Concejo Municipal de Guachucal';

  const mailOptions = {
    from: `"${nombreConcejo}" <${emailFrom}>`,
    to: email,
    subject: `Respuesta a su ${tipoLabel} - ${numeroRadicado}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Respuesta a su Solicitud</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #155724 0%, #28a745 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${nombreConcejo}</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Respuesta a su Solicitud</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <p style="font-size: 16px; margin-top: 0;">Estimado/a <strong>${nombre}</strong>,</p>
          
          <p>Le informamos que su solicitud <strong>${tipoLabel}</strong> con número de radicado <strong>${numeroRadicado}</strong> ha sido respondida.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0;">
            <p style="margin: 0 0 15px 0; font-weight: bold; color: #004085;">Respuesta:</p>
            <div style="white-space: pre-wrap; color: #333;">${respuesta}</div>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Fecha de respuesta: ${fechaRespuesta}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/pqrsd/consulta/${numeroRadicado}" 
               style="background: #155724; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Ver Detalles Completos
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            Este es un email automático, por favor no responda a este mensaje.<br>
            Si tiene alguna consulta adicional, puede presentar una nueva solicitud a través de nuestro portal.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
${nombreConcejo}
Respuesta a su Solicitud

Estimado/a ${nombre},

Le informamos que su solicitud ${tipoLabel} con número de radicado ${numeroRadicado} ha sido respondida.

Respuesta:
${respuesta}

Fecha de respuesta: ${fechaRespuesta}

Ver detalles completos: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/pqrsd/consulta/${numeroRadicado}

Este es un email automático, por favor no responda a este mensaje.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de respuesta enviado a:', email);
    console.log('   Número de radicado:', numeroRadicado);
    return { enviado: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email de respuesta:', error.message);
    return { enviado: false, error: error.message };
  }
}

/**
 * Enviar email de contacto general
 */
async function enviarEmailContacto(datos) {
  const { nombre, email, telefono, asunto, mensaje, ipAddress, fecha } = datos;

  // Si no hay configuración de email, no intentar enviar
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('⚠️  Email no enviado: configuración SMTP no disponible');
    return { enviado: false, motivo: 'Configuración SMTP no disponible' };
  }

  const emailFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
  const emailContacto = process.env.EMAIL_CONTACTO || process.env.SMTP_USER;
  const nombreConcejo = process.env.NOMBRE_CONCEJO || 'Concejo Municipal de Guachucal';

  const mailOptions = {
    from: `"${nombreConcejo}" <${emailFrom}>`,
    to: emailContacto,
    replyTo: email,
    subject: `Nuevo mensaje de contacto: ${asunto}`,
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nuevo Mensaje de Contacto</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #155724 0%, #28a745 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${nombreConcejo}</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Nuevo Mensaje de Contacto</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin-top: 0; color: #155724;">Información del Remitente</h2>
            <p style="margin: 10px 0;"><strong>Nombre:</strong> ${nombre}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 10px 0;"><strong>Teléfono:</strong> ${telefono}</p>
            <p style="margin: 10px 0;"><strong>Fecha:</strong> ${fecha}</p>
            <p style="margin: 10px 0;"><strong>IP:</strong> ${ipAddress}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff;">
            <h3 style="margin-top: 0; color: #004085;">Asunto:</h3>
            <p style="font-size: 18px; font-weight: bold; color: #333;">${asunto}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #004085;">Mensaje:</h3>
            <div style="white-space: pre-wrap; color: #333; line-height: 1.8;">${mensaje}</div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${email}" 
               style="background: #155724; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Responder a ${nombre}
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
            Este es un email automático generado desde el formulario de contacto del sitio web.
          </p>
        </div>
      </body>
      </html>
    `,
    text: `
${nombreConcejo}
Nuevo Mensaje de Contacto

Información del Remitente:
Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefono}
Fecha: ${fecha}
IP: ${ipAddress}

Asunto: ${asunto}

Mensaje:
${mensaje}

---
Responder a: ${email}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de contacto enviado desde:', email);
    console.log('   Asunto:', asunto);
    return { enviado: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email de contacto:', error.message);
    return { enviado: false, error: error.message };
  }
}

module.exports = {
  enviarConfirmacionPQRSD,
  enviarRespuestaPQRSD,
  enviarEmailContacto
};















