const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadSesion } = require('../utils/upload');

const router = express.Router();

// Obtener todas las sesiones públicas
router.get('/', async (req, res) => {
  try {
    const { tipo, destacada } = req.query;
    let query = 'SELECT * FROM sesiones_concejo WHERE publicada = TRUE';
    const params = [];

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    if (destacada === 'true') {
      query += ' AND destacada = TRUE';
    }

    query += ' ORDER BY fecha DESC, hora DESC';

    const [sesiones] = await pool.execute(query, params);
    res.json(sesiones);
  } catch (error) {
    console.error('Error obteniendo sesiones:', error);
    // Si la tabla no existe, retornar array vacío en lugar de error 500
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes('doesn\'t exist')) {
      console.warn('Tabla sesiones_concejo no existe, retornando array vacío');
      return res.json([]);
    }
    res.status(500).json({ error: 'Error obteniendo sesiones' });
  }
});

// Obtener sesión por ID con documentos y asistentes
router.get('/:id', async (req, res) => {
  try {
    const [sesiones] = await pool.execute(
      'SELECT * FROM sesiones_concejo WHERE id = ? AND publicada = TRUE',
      [req.params.id]
    );

    if (sesiones.length === 0) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    const sesion = sesiones[0];

    // Obtener documentos de la sesión
    const [documentos] = await pool.execute(
      'SELECT * FROM documentos_sesion WHERE sesion_id = ?',
      [req.params.id]
    );

    // Obtener asistentes
    const [asistentes] = await pool.execute(
      'SELECT * FROM asistentes_sesion WHERE sesion_id = ?',
      [req.params.id]
    );

    res.json({
      ...sesion,
      documentos,
      asistentes
    });
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    res.status(500).json({ error: 'Error obteniendo sesión' });
  }
});

// Obtener todas las sesiones para admin (incluyendo no publicadas)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [sesiones] = await pool.execute(
      'SELECT * FROM sesiones_concejo ORDER BY fecha DESC, hora DESC'
    );
    res.json(sesiones);
  } catch (error) {
    console.error('Error obteniendo sesiones (admin):', error);
    res.status(500).json({ error: 'Error obteniendo sesiones' });
  }
});

// Crear sesión (admin)
router.post('/', authenticateToken, requireAdmin, uploadSesion, async (req, res) => {
  try {
    const {
      numero_sesion,
      tipo,
      fecha,
      hora,
      lugar,
      orden_dia,
      acta_url,
      video_url,
      video_embed_code,
      resumen,
      publicada,
      destacada
    } = req.body;

    // Procesar acta subida
    let actaPath = acta_url || null;
    if (req.file) {
      actaPath = `/uploads/documents/${req.file.filename}`;
    }

    const [result] = await pool.execute(
      `INSERT INTO sesiones_concejo 
       (numero_sesion, tipo, fecha, hora, lugar, orden_dia, acta_url, video_url, video_embed_code, resumen, publicada, destacada) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_sesion,
        tipo || 'ordinaria',
        fecha,
        hora || null,
        lugar || 'Sala de Sesiones del Concejo Municipal',
        orden_dia || null,
        actaPath,
        video_url || null,
        video_embed_code || null,
        resumen || null,
        publicada || false,
        destacada || false
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Sesión creada exitosamente' });
  } catch (error) {
    console.error('Error creando sesión:', error);
    res.status(500).json({ error: 'Error creando sesión' });
  }
});

// Actualizar sesión (admin)
router.put('/:id', authenticateToken, requireAdmin, uploadSesion, async (req, res) => {
  try {
    const {
      numero_sesion,
      tipo,
      fecha,
      hora,
      lugar,
      orden_dia,
      acta_url,
      video_url,
      video_embed_code,
      resumen,
      publicada,
      destacada
    } = req.body;

    // Procesar acta subida
    let actaPath = acta_url || null;
    if (req.file) {
      actaPath = `/uploads/documents/${req.file.filename}`;
    } else if (acta_url) {
      actaPath = acta_url;
    }

    await pool.execute(
      `UPDATE sesiones_concejo 
       SET numero_sesion = ?, tipo = ?, fecha = ?, hora = ?, lugar = ?, 
           orden_dia = ?, acta_url = ?, video_url = ?, video_embed_code = ?, 
           resumen = ?, publicada = ?, destacada = ? 
       WHERE id = ?`,
      [
        numero_sesion,
        tipo,
        fecha,
        hora || null,
        lugar,
        orden_dia || null,
        actaPath,
        video_url || null,
        video_embed_code || null,
        resumen || null,
        publicada || false,
        destacada || false,
        req.params.id
      ]
    );

    res.json({ message: 'Sesión actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando sesión:', error);
    res.status(500).json({ error: 'Error actualizando sesión' });
  }
});

// Publicar/Despublicar sesión (admin)
router.patch('/:id/publicar', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { publicada } = req.body;
    await pool.execute(
      'UPDATE sesiones_concejo SET publicada = ? WHERE id = ?',
      [publicada, req.params.id]
    );
    res.json({ message: `Sesión ${publicada ? 'publicada' : 'despublicada'} exitosamente` });
  } catch (error) {
    console.error('Error cambiando estado de publicación:', error);
    res.status(500).json({ error: 'Error cambiando estado de publicación' });
  }
});

// Eliminar sesión (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM sesiones_concejo WHERE id = ?', [req.params.id]);
    res.json({ message: 'Sesión eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando sesión:', error);
    res.status(500).json({ error: 'Error eliminando sesión' });
  }
});

module.exports = router;

