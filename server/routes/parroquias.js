const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadNoticia } = require('../utils/upload');

const router = express.Router();

// Obtener todas las parroquias
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { zona_pastoral } = req.query;
    let query = 'SELECT * FROM parroquias WHERE 1=1';
    const params = [];

    if (!(req.user && req.user.rol === 'admin')) {
      query += ' AND activa = TRUE';
    }

    if (zona_pastoral) {
      query += ' AND zona_pastoral = ?';
      params.push(zona_pastoral);
    }

    query += ' ORDER BY orden ASC, nombre ASC';

    const [parroquias] = await pool.execute(query, params);
    
    // Obtener horarios de misa para cada parroquia
    for (let parroquia of parroquias) {
      const [horarios] = await pool.execute(
        'SELECT * FROM horarios_misa WHERE parroquia_id = ? AND activo = TRUE ORDER BY dia_semana, hora',
        [parroquia.id]
      );
      parroquia.horarios = horarios;
    }

    res.json(parroquias);
  } catch (error) {
    console.error('Error obteniendo parroquias:', error);
    res.status(500).json({ error: 'Error obteniendo parroquias' });
  }
});

// Obtener parroquia por ID
router.get('/:id', async (req, res) => {
  try {
    const [parroquias] = await pool.execute(
      'SELECT * FROM parroquias WHERE id = ? AND (activa = TRUE OR ? = TRUE)',
      [req.params.id, req.user && req.user.rol === 'admin']
    );

    if (parroquias.length === 0) {
      return res.status(404).json({ error: 'Parroquia no encontrada' });
    }

    const parroquia = parroquias[0];
    
    // Obtener horarios de misa
    const [horarios] = await pool.execute(
      'SELECT * FROM horarios_misa WHERE parroquia_id = ? AND activo = TRUE ORDER BY dia_semana, hora',
      [parroquia.id]
    );
    parroquia.horarios = horarios;

    res.json(parroquia);
  } catch (error) {
    console.error('Error obteniendo parroquia:', error);
    res.status(500).json({ error: 'Error obteniendo parroquia' });
  }
});

// Crear parroquia (admin)
router.post('/', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const {
      nombre, nombre_canonico, direccion, telefono, email, parroco, vicario,
      coordenadas_lat, coordenadas_lng, descripcion, fecha_fundacion, patrono,
      zona_pastoral, activa, destacada, orden
    } = req.body;

    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.execute(
      `INSERT INTO parroquias (nombre, nombre_canonico, direccion, telefono, email, parroco, vicario,
        coordenadas_lat, coordenadas_lng, imagen_url, descripcion, fecha_fundacion, patrono,
        zona_pastoral, activa, destacada, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, nombre_canonico || null, direccion || null, telefono || null, email || null,
       parroco || null, vicario || null, coordenadas_lat || null, coordenadas_lng || null,
       imagen_url, descripcion || null, fecha_fundacion || null, patrono || null,
       zona_pastoral || null, activa !== undefined ? activa : true, destacada || false, orden || 0]
    );

    res.status(201).json({ id: result.insertId, message: 'Parroquia creada exitosamente' });
  } catch (error) {
    console.error('Error creando parroquia:', error);
    res.status(500).json({ error: 'Error creando parroquia' });
  }
});

// Actualizar parroquia (admin)
router.put('/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const {
      nombre, nombre_canonico, direccion, telefono, email, parroco, vicario,
      coordenadas_lat, coordenadas_lng, descripcion, fecha_fundacion, patrono,
      zona_pastoral, activa, destacada, orden
    } = req.body;

    let query = `UPDATE parroquias SET nombre = ?, nombre_canonico = ?, direccion = ?, telefono = ?,
      email = ?, parroco = ?, vicario = ?, coordenadas_lat = ?, coordenadas_lng = ?,
      descripcion = ?, fecha_fundacion = ?, patrono = ?, zona_pastoral = ?, activa = ?,
      destacada = ?, orden = ?`;
    const params = [nombre, nombre_canonico || null, direccion || null, telefono || null,
      email || null, parroco || null, vicario || null, coordenadas_lat || null,
      coordenadas_lng || null, descripcion || null, fecha_fundacion || null, patrono || null,
      zona_pastoral || null, activa !== undefined ? activa : true, destacada || false, orden || 0];

    if (req.file) {
      query += ', imagen_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(req.params.id);

    await pool.execute(query, params);
    res.json({ message: 'Parroquia actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando parroquia:', error);
    res.status(500).json({ error: 'Error actualizando parroquia' });
  }
});

// Eliminar parroquia (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM parroquias WHERE id = ?', [req.params.id]);
    res.json({ message: 'Parroquia eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando parroquia:', error);
    res.status(500).json({ error: 'Error eliminando parroquia' });
  }
});

// Rutas para horarios de misa
router.post('/:id/horarios', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { dia_semana, hora, tipo_misa, idioma, notas } = req.body;
    
    await pool.execute(
      `INSERT INTO horarios_misa (parroquia_id, dia_semana, hora, tipo_misa, idioma, notas)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.id, dia_semana, hora, tipo_misa || null, idioma || 'español', notas || null]
    );

    res.status(201).json({ message: 'Horario agregado exitosamente' });
  } catch (error) {
    console.error('Error agregando horario:', error);
    res.status(500).json({ error: 'Error agregando horario' });
  }
});

router.put('/horarios/:horarioId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { dia_semana, hora, tipo_misa, idioma, notas, activo } = req.body;
    
    await pool.execute(
      `UPDATE horarios_misa SET dia_semana = ?, hora = ?, tipo_misa = ?, idioma = ?, notas = ?, activo = ?
       WHERE id = ?`,
      [dia_semana, hora, tipo_misa || null, idioma || 'español', notas || null, activo !== undefined ? activo : true, req.params.horarioId]
    );

    res.json({ message: 'Horario actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando horario:', error);
    res.status(500).json({ error: 'Error actualizando horario' });
  }
});

router.delete('/horarios/:horarioId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM horarios_misa WHERE id = ?', [req.params.horarioId]);
    res.json({ message: 'Horario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando horario:', error);
    res.status(500).json({ error: 'Error eliminando horario' });
  }
});

module.exports = router;
















