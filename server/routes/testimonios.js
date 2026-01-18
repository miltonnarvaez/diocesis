const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener testimonios aprobados (público)
router.get('/', async (req, res) => {
  try {
    const { categoria, destacado } = req.query;
    let query = 'SELECT * FROM testimonios WHERE aprobado = 1';
    const params = [];

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    if (destacado === 'true') {
      query += ' AND destacado = 1';
    }

    query += ' ORDER BY destacado DESC, fecha_publicacion DESC, created_at DESC';

    const [testimonios] = await pool.execute(query, params);
    res.json(testimonios);
  } catch (error) {
    console.error('Error obteniendo testimonios:', error);
    res.status(500).json({ error: 'Error al obtener los testimonios' });
  }
});

// Obtener todos los testimonios incluyendo pendientes (admin)
router.get('/admin/todos', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { estado } = req.query;
    let query = 'SELECT * FROM testimonios WHERE 1=1';
    const params = [];

    if (estado === 'pendiente') {
      query += ' AND aprobado = 0';
    } else if (estado === 'aprobado') {
      query += ' AND aprobado = 1';
    }

    query += ' ORDER BY aprobado ASC, created_at DESC';

    const [testimonios] = await pool.execute(query, params);
    res.json(testimonios);
  } catch (error) {
    console.error('Error obteniendo testimonios:', error);
    res.status(500).json({ error: 'Error al obtener los testimonios' });
  }
});

// Obtener testimonio por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [testimonios] = await pool.execute(
      'SELECT * FROM testimonios WHERE id = ? AND aprobado = 1',
      [id]
    );

    if (testimonios.length === 0) {
      return res.status(404).json({ error: 'Testimonio no encontrado' });
    }

    res.json(testimonios[0]);
  } catch (error) {
    console.error('Error obteniendo testimonio:', error);
    res.status(500).json({ error: 'Error al obtener el testimonio' });
  }
});

// Crear testimonio (público)
router.post('/', async (req, res) => {
  try {
    const {
      nombre_autor,
      email,
      telefono,
      titulo,
      testimonio,
      categoria,
      imagen_url
    } = req.body;

    const query = `
      INSERT INTO testimonios 
      (nombre_autor, email, telefono, titulo, testimonio, categoria, imagen_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      nombre_autor,
      email || null,
      telefono || null,
      titulo,
      testimonio,
      categoria || 'otra',
      imagen_url || null
    ]);

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Testimonio enviado exitosamente. Será revisado antes de publicarse.' 
    });
  } catch (error) {
    console.error('Error creando testimonio:', error);
    res.status(500).json({ error: 'Error al enviar el testimonio' });
  }
});

// Aprobar/rechazar testimonio (admin)
router.put('/:id/aprobar', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobado, destacado, fecha_publicacion } = req.body;

    const query = `
      UPDATE testimonios 
      SET aprobado = ?, destacado = ?, fecha_publicacion = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(query, [
      aprobado !== undefined ? aprobado : true,
      destacado || false,
      fecha_publicacion || new Date().toISOString().split('T')[0],
      id
    ]);

    res.json({ message: 'Testimonio actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando testimonio:', error);
    res.status(500).json({ error: 'Error al actualizar el testimonio' });
  }
});

// Eliminar testimonio (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM testimonios WHERE id = ?', [id]);
    res.json({ message: 'Testimonio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando testimonio:', error);
    res.status(500).json({ error: 'Error al eliminar el testimonio' });
  }
});

module.exports = router;
