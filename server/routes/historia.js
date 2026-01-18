const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadImage } = require('../utils/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ========== RUTAS ADMIN (deben ir antes de las rutas genéricas) ==========

// Obtener todos los eventos para admin
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [eventos] = await pool.execute(
      'SELECT * FROM historia_concejo ORDER BY fecha_evento ASC, orden ASC, creado_en DESC'
    );
    res.json(eventos);
  } catch (error) {
    console.error('Error obteniendo historia (admin):', error);
    res.status(500).json({ error: 'Error obteniendo historia' });
  }
});

// Crear nuevo evento
router.post('/admin', authenticateToken, requireAdmin, uploadImage, async (req, res) => {
  try {
    const {
      titulo,
      contenido,
      fecha_evento,
      categoria,
      orden,
      publicada
    } = req.body;

    if (!titulo || !contenido) {
      return res.status(400).json({ error: 'Título y contenido son requeridos' });
    }

    const imagenUrl = req.file ? `/uploads/images/${req.file.filename}` : null;

    const [result] = await pool.execute(
      `INSERT INTO historia_concejo 
       (titulo, contenido, fecha_evento, imagen_url, categoria, orden, publicada)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        contenido,
        fecha_evento || null,
        imagenUrl,
        categoria || 'otros',
        orden || 0,
        publicada === 'true' || publicada === true
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Evento histórico creado exitosamente' });
  } catch (error) {
    console.error('Error creando evento histórico:', error);
    res.status(500).json({ error: 'Error creando evento histórico' });
  }
});

// Actualizar evento
router.put('/admin/:id', authenticateToken, requireAdmin, uploadImage, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      contenido,
      fecha_evento,
      categoria,
      orden,
      publicada
    } = req.body;

    // Obtener evento actual
    const [eventos] = await pool.execute(
      'SELECT * FROM historia_concejo WHERE id = ?',
      [id]
    );

    if (eventos.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const eventoActual = eventos[0];

    // Manejar imagen
    let imagenUrl = eventoActual.imagen_url;
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (eventoActual.imagen_url) {
        const oldPath = path.join(__dirname, '..', eventoActual.imagen_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      imagenUrl = `/uploads/images/${req.file.filename}`;
    }

    await pool.execute(
      `UPDATE historia_concejo 
       SET titulo = ?, contenido = ?, fecha_evento = ?, imagen_url = ?,
           categoria = ?, orden = ?, publicada = ?
       WHERE id = ?`,
      [
        titulo || eventoActual.titulo,
        contenido || eventoActual.contenido,
        fecha_evento || eventoActual.fecha_evento,
        imagenUrl,
        categoria || eventoActual.categoria,
        orden !== undefined ? orden : eventoActual.orden,
        publicada !== undefined ? (publicada === 'true' || publicada === true) : eventoActual.publicada,
        id
      ]
    );

    res.json({ message: 'Evento histórico actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando evento histórico:', error);
    res.status(500).json({ error: 'Error actualizando evento histórico' });
  }
});

// Eliminar evento
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener evento para eliminar imagen
    const [eventos] = await pool.execute(
      'SELECT * FROM historia_concejo WHERE id = ?',
      [id]
    );

    if (eventos.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const evento = eventos[0];

    // Eliminar imagen si existe
    if (evento.imagen_url) {
      const imagenPath = path.join(__dirname, '..', evento.imagen_url);
      if (fs.existsSync(imagenPath)) {
        fs.unlinkSync(imagenPath);
      }
    }

    await pool.execute('DELETE FROM historia_concejo WHERE id = ?', [id]);

    res.json({ message: 'Evento histórico eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando evento histórico:', error);
    res.status(500).json({ error: 'Error eliminando evento histórico' });
  }
});

// ========== RUTAS PÚBLICAS ==========

// Obtener todos los eventos históricos públicos
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    
    let query = 'SELECT * FROM historia_concejo WHERE publicada = TRUE';
    const params = [];

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    query += ' ORDER BY fecha_evento ASC, orden ASC, creado_en DESC';

    const [eventos] = await pool.execute(query, params);
    res.json(eventos);
  } catch (error) {
    console.error('Error obteniendo historia:', error);
    res.status(500).json({ error: 'Error obteniendo historia del Concejo' });
  }
});

// Obtener evento por ID (debe ir al final, después de todas las rutas específicas)
router.get('/:id', async (req, res) => {
  try {
    const [eventos] = await pool.execute(
      'SELECT * FROM historia_concejo WHERE id = ? AND publicada = TRUE',
      [req.params.id]
    );

    if (eventos.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(eventos[0]);
  } catch (error) {
    console.error('Error obteniendo evento histórico:', error);
    res.status(500).json({ error: 'Error obteniendo evento histórico' });
  }
});

module.exports = router;
