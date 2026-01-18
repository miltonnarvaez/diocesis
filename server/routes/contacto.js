const express = require('express');
const { enviarEmailContacto } = require('../utils/email');

const router = express.Router();

// Enviar mensaje de contacto (público)
router.post('/', async (req, res) => {
  try {
    const { nombre, email, telefono, asunto, mensaje } = req.body;

    // Validaciones
    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({ 
        error: 'Todos los campos obligatorios deben ser completados' 
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Obtener IP del cliente
    const ipAddress = req.ip || req.connection.remoteAddress || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

    // Enviar email
    const resultadoEmail = await enviarEmailContacto({
      nombre,
      email,
      telefono: telefono || 'No proporcionado',
      asunto,
      mensaje,
      ipAddress,
      fecha: new Date().toLocaleString('es-CO', { 
        timeZone: 'America/Bogota',
        dateStyle: 'long',
        timeStyle: 'short'
      })
    });

    if (!resultadoEmail.enviado) {
      console.log('⚠️  Email de contacto no enviado:', resultadoEmail.motivo);
      // Aún así respondemos éxito porque el mensaje fue recibido
    }

    res.json({
      success: true,
      message: 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.'
    });

  } catch (error) {
    console.error('Error procesando contacto:', error);
    res.status(500).json({
      error: 'Error al procesar el mensaje. Por favor, intente nuevamente.'
    });
  }
});

module.exports = router;






