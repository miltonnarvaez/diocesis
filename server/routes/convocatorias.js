const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadConvocatoria } = require('../utils/upload');

const router = express.Router();

// Obtener todas las convocatorias activas (público)
router.get('/', async (req, res) => {
  try {
    const [convocatorias] = await pool.execute(
      'SELECT * FROM convocatorias WHERE activa = TRUE ORDER BY destacada DESC, fecha_inicio DESC'
    );
    res.json(convocatorias);
  } catch (error) {
    console.error('Error obteniendo convocatorias:', error);
    res.status(500).json({ error: 'Error obteniendo convocatorias' });
  }
});

// Obtener todas las convocatorias para admin (incluyendo inactivas)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [convocatorias] = await pool.execute(
      'SELECT * FROM convocatorias ORDER BY fecha_inicio DESC, creado_en DESC'
    );
    res.json(convocatorias);
  } catch (error) {
    console.error('Error obteniendo convocatorias (admin):', error);
    res.status(500).json({ error: 'Error obteniendo convocatorias' });
  }
});

// Obtener convocatoria por ID
router.get('/:id', async (req, res) => {
  try {
    const [convocatorias] = await pool.execute(
      'SELECT * FROM convocatorias WHERE id = ? AND activa = TRUE',
      [req.params.id]
    );

    if (convocatorias.length === 0) {
      return res.status(404).json({ error: 'Convocatoria no encontrada' });
    }

    res.json(convocatorias[0]);
  } catch (error) {
    console.error('Error obteniendo convocatoria:', error);
    res.status(500).json({ error: 'Error obteniendo convocatoria' });
  }
});

// Crear convocatoria (admin)
router.post('/', authenticateToken, requireAdmin, uploadConvocatoria, async (req, res) => {
  try {
    const { titulo, descripcion, imagen_url, fecha_inicio, fecha_fin, activa, destacada } = req.body;

    // Procesar imagen subida
    let imagenPath = imagen_url || null;
    if (req.file) {
      imagenPath = `/uploads/images/${req.file.filename}`;
    }

    const [result] = await pool.execute(
      'INSERT INTO convocatorias (titulo, descripcion, imagen_url, fecha_inicio, fecha_fin, activa, destacada) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titulo, descripcion, imagenPath, fecha_inicio, fecha_fin, activa !== undefined ? activa : true, destacada || false]
    );

    res.status(201).json({ id: result.insertId, message: 'Convocatoria creada exitosamente' });
  } catch (error) {
    console.error('Error creando convocatoria:', error);
    res.status(500).json({ error: 'Error creando convocatoria' });
  }
});

// Actualizar convocatoria (admin)
router.put('/:id', authenticateToken, requireAdmin, uploadConvocatoria, async (req, res) => {
  try {
    const { titulo, descripcion, imagen_url, fecha_inicio, fecha_fin, activa, destacada } = req.body;

    // Procesar imagen subida
    let imagenPath = imagen_url || null;
    if (req.file) {
      imagenPath = `/uploads/images/${req.file.filename}`;
    } else if (imagen_url) {
      imagenPath = imagen_url;
    }

    await pool.execute(
      'UPDATE convocatorias SET titulo = ?, descripcion = ?, imagen_url = ?, fecha_inicio = ?, fecha_fin = ?, activa = ?, destacada = ? WHERE id = ?',
      [titulo, descripcion, imagenPath, fecha_inicio, fecha_fin, activa !== undefined ? activa : true, destacada || false, req.params.id]
    );

    res.json({ message: 'Convocatoria actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando convocatoria:', error);
    res.status(500).json({ error: 'Error actualizando convocatoria' });
  }
});

// Publicar/Despublicar convocatoria (admin)
router.patch('/:id/activar', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { activa } = req.body;
    await pool.execute(
      'UPDATE convocatorias SET activa = ? WHERE id = ?',
      [activa, req.params.id]
    );
    res.json({ message: `Convocatoria ${activa ? 'activada' : 'desactivada'} exitosamente` });
  } catch (error) {
    console.error('Error cambiando estado de convocatoria:', error);
    res.status(500).json({ error: 'Error cambiando estado de convocatoria' });
  }
});

// Eliminar convocatoria (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM convocatorias WHERE id = ?', [req.params.id]);
    res.json({ message: 'Convocatoria eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando convocatoria:', error);
    res.status(500).json({ error: 'Error eliminando convocatoria' });
  }
});

module.exports = router;


