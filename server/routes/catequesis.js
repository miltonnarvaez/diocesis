const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener materiales de catequesis (público)
router.get('/', async (req, res) => {
  try {
    const { nivel, categoria, busqueda } = req.query;
    let query = 'SELECT * FROM catequesis WHERE activa = 1';
    const params = [];

    if (nivel) {
      query += ' AND nivel = ?';
      params.push(nivel);
    }

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    if (busqueda) {
      query += ' AND (titulo LIKE ? OR descripcion LIKE ? OR contenido LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY orden ASC, nivel ASC, created_at DESC';

    const [materiales] = await pool.execute(query, params);
    res.json(materiales);
  } catch (error) {
    console.error('Error obteniendo materiales:', error);
    res.status(500).json({ error: 'Error al obtener los materiales' });
  }
});

// Obtener material por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [materiales] = await pool.execute(
      'SELECT * FROM catequesis WHERE id = ? AND activa = 1',
      [id]
    );

    if (materiales.length === 0) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    res.json(materiales[0]);
  } catch (error) {
    console.error('Error obteniendo material:', error);
    res.status(500).json({ error: 'Error al obtener el material' });
  }
});

// Crear material (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      nivel,
      categoria,
      contenido,
      material_descargable,
      video_url,
      imagen_url,
      orden
    } = req.body;

    const query = `
      INSERT INTO catequesis 
      (titulo, descripcion, nivel, categoria, contenido, material_descargable, video_url, imagen_url, orden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      titulo,
      descripcion || null,
      nivel || 'general',
      categoria || null,
      contenido || null,
      material_descargable || null,
      video_url || null,
      imagen_url || null,
      orden || 0
    ]);

    res.status(201).json({ id: result.insertId, message: 'Material creado exitosamente' });
  } catch (error) {
    console.error('Error creando material:', error);
    res.status(500).json({ error: 'Error al crear el material' });
  }
});

// Actualizar material (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      nivel,
      categoria,
      contenido,
      material_descargable,
      video_url,
      imagen_url,
      orden,
      activa
    } = req.body;

    const query = `
      UPDATE catequesis 
      SET titulo = ?, descripcion = ?, nivel = ?, categoria = ?, contenido = ?,
          material_descargable = ?, video_url = ?, imagen_url = ?, orden = ?, activa = ?,
          updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(query, [
      titulo,
      descripcion || null,
      nivel,
      categoria || null,
      contenido || null,
      material_descargable || null,
      video_url || null,
      imagen_url || null,
      orden || 0,
      activa !== undefined ? activa : true,
      id
    ]);

    res.json({ message: 'Material actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando material:', error);
    res.status(500).json({ error: 'Error al actualizar el material' });
  }
});

// Eliminar material (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE catequesis SET activa = 0 WHERE id = ?', [id]);
    res.json({ message: 'Material eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando material:', error);
    res.status(500).json({ error: 'Error al eliminar el material' });
  }
});

module.exports = router;
