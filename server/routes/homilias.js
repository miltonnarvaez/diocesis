const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener todas las homilías (público con filtros)
router.get('/', async (req, res) => {
  try {
    const { tipo_homilia, autor, destacada, busqueda, fecha_desde, fecha_hasta } = req.query;
    let query = 'SELECT * FROM homilias WHERE activa = 1';
    const params = [];

    if (tipo_homilia) {
      query += ' AND tipo_homilia = ?';
      params.push(tipo_homilia);
    }

    if (autor) {
      query += ' AND autor LIKE ?';
      params.push(`%${autor}%`);
    }

    if (destacada === 'true') {
      query += ' AND destacada = 1';
    }

    if (fecha_desde) {
      query += ' AND fecha_homilia >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND fecha_homilia <= ?';
      params.push(fecha_hasta);
    }

    if (busqueda) {
      query += ' AND (titulo LIKE ? OR contenido LIKE ? OR tema LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY fecha_homilia DESC, destacada DESC';

    const [homilias] = await pool.execute(query, params);
    res.json(homilias);
  } catch (error) {
    console.error('Error obteniendo homilías:', error);
    res.status(500).json({ error: 'Error al obtener las homilías' });
  }
});

// Obtener homilía por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [homilias] = await pool.execute(
      'SELECT * FROM homilias WHERE id = ? AND activa = 1',
      [id]
    );

    if (homilias.length === 0) {
      return res.status(404).json({ error: 'Homilía no encontrada' });
    }

    res.json(homilias[0]);
  } catch (error) {
    console.error('Error obteniendo homilía:', error);
    res.status(500).json({ error: 'Error al obtener la homilía' });
  }
});

// Crear homilía (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      titulo,
      autor,
      tipo_autor,
      fecha_homilia,
      tipo_homilia,
      lectura_primera,
      salmo,
      lectura_segunda,
      evangelio,
      contenido,
      audio_url,
      video_url,
      tema,
      tags,
      destacada
    } = req.body;

    const query = `
      INSERT INTO homilias 
      (titulo, autor, tipo_autor, fecha_homilia, tipo_homilia,
       lectura_primera, salmo, lectura_segunda, evangelio, contenido,
       audio_url, video_url, tema, tags, destacada)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      titulo,
      autor,
      tipo_autor || 'sacerdote',
      fecha_homilia,
      tipo_homilia || 'dominical',
      lectura_primera || null,
      salmo || null,
      lectura_segunda || null,
      evangelio || null,
      contenido,
      audio_url || null,
      video_url || null,
      tema || null,
      tags || null,
      destacada || false
    ]);

    res.status(201).json({ id: result.insertId, message: 'Homilía creada exitosamente' });
  } catch (error) {
    console.error('Error creando homilía:', error);
    res.status(500).json({ error: 'Error al crear la homilía' });
  }
});

// Actualizar homilía (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      autor,
      tipo_autor,
      fecha_homilia,
      tipo_homilia,
      lectura_primera,
      salmo,
      lectura_segunda,
      evangelio,
      contenido,
      audio_url,
      video_url,
      tema,
      tags,
      destacada,
      activa
    } = req.body;

    const query = `
      UPDATE homilias 
      SET titulo = ?, autor = ?, tipo_autor = ?, fecha_homilia = ?, tipo_homilia = ?,
          lectura_primera = ?, salmo = ?, lectura_segunda = ?, evangelio = ?, contenido = ?,
          audio_url = ?, video_url = ?, tema = ?, tags = ?, destacada = ?, activa = ?,
          updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(query, [
      titulo,
      autor,
      tipo_autor,
      fecha_homilia,
      tipo_homilia,
      lectura_primera || null,
      salmo || null,
      lectura_segunda || null,
      evangelio || null,
      contenido,
      audio_url || null,
      video_url || null,
      tema || null,
      tags || null,
      destacada || false,
      activa !== undefined ? activa : true,
      id
    ]);

    res.json({ message: 'Homilía actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando homilía:', error);
    res.status(500).json({ error: 'Error al actualizar la homilía' });
  }
});

// Eliminar homilía (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE homilias SET activa = 0 WHERE id = ?', [id]);
    res.json({ message: 'Homilía eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando homilía:', error);
    res.status(500).json({ error: 'Error al eliminar la homilía' });
  }
});

module.exports = router;
