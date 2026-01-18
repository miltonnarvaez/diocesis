const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener todas las oraciones (público con filtros)
router.get('/', async (req, res) => {
  try {
    const { categoria, intencion, destacada } = req.query;
    let query = 'SELECT * FROM oraciones WHERE activa = 1';
    const params = [];

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    if (intencion) {
      query += ' AND intencion = ?';
      params.push(intencion);
    }

    if (destacada === 'true') {
      query += ' AND destacada = 1';
    }

    query += ' ORDER BY destacada DESC, fecha_publicacion DESC, created_at DESC';

    const [oraciones] = await pool.execute(query, params);
    res.json(oraciones);
  } catch (error) {
    console.error('Error obteniendo oraciones:', error);
    res.status(500).json({ error: 'Error al obtener las oraciones' });
  }
});

// Obtener oración por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [oraciones] = await pool.execute(
      'SELECT * FROM oraciones WHERE id = ? AND activa = 1',
      [id]
    );

    if (oraciones.length === 0) {
      return res.status(404).json({ error: 'Oración no encontrada' });
    }

    res.json(oraciones[0]);
  } catch (error) {
    console.error('Error obteniendo oración:', error);
    res.status(500).json({ error: 'Error al obtener la oración' });
  }
});

// Crear oración (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      titulo,
      contenido,
      categoria,
      intencion,
      autor,
      imagen_url,
      audio_url,
      fecha_publicacion,
      destacada
    } = req.body;

    const query = `
      INSERT INTO oraciones 
      (titulo, contenido, categoria, intencion, autor, imagen_url, audio_url, fecha_publicacion, destacada)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      titulo,
      contenido,
      categoria || 'oracion_especial',
      intencion || null,
      autor || null,
      imagen_url || null,
      audio_url || null,
      fecha_publicacion || new Date().toISOString().split('T')[0],
      destacada || false
    ]);

    res.status(201).json({ id: result.insertId, message: 'Oración creada exitosamente' });
  } catch (error) {
    console.error('Error creando oración:', error);
    res.status(500).json({ error: 'Error al crear la oración' });
  }
});

// Actualizar oración (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      contenido,
      categoria,
      intencion,
      autor,
      imagen_url,
      audio_url,
      fecha_publicacion,
      destacada,
      activa
    } = req.body;

    const query = `
      UPDATE oraciones 
      SET titulo = ?, contenido = ?, categoria = ?, intencion = ?, autor = ?,
          imagen_url = ?, audio_url = ?, fecha_publicacion = ?, destacada = ?, activa = ?,
          updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(query, [
      titulo,
      contenido,
      categoria,
      intencion || null,
      autor || null,
      imagen_url || null,
      audio_url || null,
      fecha_publicacion || null,
      destacada || false,
      activa !== undefined ? activa : true,
      id
    ]);

    res.json({ message: 'Oración actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando oración:', error);
    res.status(500).json({ error: 'Error al actualizar la oración' });
  }
});

// Eliminar oración (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE oraciones SET activa = 0 WHERE id = ?', [id]);
    res.json({ message: 'Oración eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando oración:', error);
    res.status(500).json({ error: 'Error al eliminar la oración' });
  }
});

// NOVENAS
// Obtener todas las novenas
router.get('/novenas/todas', async (req, res) => {
  try {
    const [novenas] = await pool.execute(
      'SELECT * FROM novenas WHERE activa = 1 ORDER BY fecha_inicio DESC'
    );
    res.json(novenas);
  } catch (error) {
    console.error('Error obteniendo novenas:', error);
    res.status(500).json({ error: 'Error al obtener las novenas' });
  }
});

// Obtener novena por ID
router.get('/novenas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [novenas] = await pool.execute(
      'SELECT * FROM novenas WHERE id = ? AND activa = 1',
      [id]
    );

    if (novenas.length === 0) {
      return res.status(404).json({ error: 'Novena no encontrada' });
    }

    res.json(novenas[0]);
  } catch (error) {
    console.error('Error obteniendo novena:', error);
    res.status(500).json({ error: 'Error al obtener la novena' });
  }
});

// Crear/actualizar novena (admin)
router.post('/novenas', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      imagen_url,
      fecha_inicio,
      fecha_fin,
      oracion_dia_1,
      oracion_dia_2,
      oracion_dia_3,
      oracion_dia_4,
      oracion_dia_5,
      oracion_dia_6,
      oracion_dia_7,
      oracion_dia_8,
      oracion_dia_9
    } = req.body;

    const query = `
      INSERT INTO novenas 
      (titulo, descripcion, imagen_url, fecha_inicio, fecha_fin,
       oracion_dia_1, oracion_dia_2, oracion_dia_3, oracion_dia_4, oracion_dia_5,
       oracion_dia_6, oracion_dia_7, oracion_dia_8, oracion_dia_9)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      titulo,
      descripcion || null,
      imagen_url || null,
      fecha_inicio,
      fecha_fin,
      oracion_dia_1 || null,
      oracion_dia_2 || null,
      oracion_dia_3 || null,
      oracion_dia_4 || null,
      oracion_dia_5 || null,
      oracion_dia_6 || null,
      oracion_dia_7 || null,
      oracion_dia_8 || null,
      oracion_dia_9 || null
    ]);

    res.status(201).json({ id: result.insertId, message: 'Novena creada exitosamente' });
  } catch (error) {
    console.error('Error creando novena:', error);
    res.status(500).json({ error: 'Error al crear la novena' });
  }
});

module.exports = router;
