const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadNoticia } = require('../utils/upload');

const router = express.Router();

// Obtener actividades juveniles
router.get('/actividades', async (req, res) => {
  try {
    const { tipo, inscripcion_abierta } = req.query;
    let query = 'SELECT * FROM actividades_juventud WHERE publicada = TRUE';
    const params = [];
    
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    if (inscripcion_abierta === 'true') {
      query += ' AND inscripcion_abierta = TRUE';
    }
    
    query += ' ORDER BY fecha_inicio ASC';
    
    const [actividades] = await pool.execute(query, params);
    res.json(actividades);
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({ error: 'Error obteniendo actividades' });
  }
});

// Obtener grupos juveniles
router.get('/grupos', async (req, res) => {
  try {
    const { parroquia_id } = req.query;
    let query = 'SELECT g.*, p.nombre as parroquia_nombre FROM grupos_juveniles g LEFT JOIN parroquias p ON g.parroquia_id = p.id WHERE g.activo = TRUE';
    const params = [];
    
    if (parroquia_id) {
      query += ' AND g.parroquia_id = ?';
      params.push(parroquia_id);
    }
    
    query += ' ORDER BY g.nombre ASC';
    
    const [grupos] = await pool.execute(query, params);
    res.json(grupos);
  } catch (error) {
    console.error('Error obteniendo grupos:', error);
    res.status(500).json({ error: 'Error obteniendo grupos' });
  }
});

// CRUD para actividades (admin)
router.post('/actividades', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, tipo, fecha_inicio, fecha_fin, lugar, edad_minima, edad_maxima, cupos_maximos, costo, responsable, contacto, email, telefono, inscripcion_abierta, publicada, destacada } = req.body;
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO actividades_juventud (titulo, descripcion, tipo, fecha_inicio, fecha_fin, lugar, edad_minima, edad_maxima, cupos_maximos, cupos_disponibles, costo, responsable, contacto, email, telefono, imagen_url, inscripcion_abierta, publicada, destacada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, tipo || null, fecha_inicio || null, fecha_fin || null, lugar || null, edad_minima || 14, edad_maxima || 30, cupos_maximos || null, cupos_maximos || null, costo || 0, responsable || null, contacto || null, email || null, telefono || null, imagen_url, inscripcion_abierta !== undefined ? inscripcion_abierta : true, publicada !== undefined ? publicada : true, destacada || false]
    );
    res.status(201).json({ id: result.insertId, message: 'Actividad creada exitosamente' });
  } catch (error) {
    console.error('Error creando actividad:', error);
    res.status(500).json({ error: 'Error creando actividad' });
  }
});

router.put('/actividades/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, tipo, fecha_inicio, fecha_fin, lugar, edad_minima, edad_maxima, cupos_maximos, costo, responsable, contacto, email, telefono, inscripcion_abierta, publicada, destacada } = req.body;
    let query = `UPDATE actividades_juventud SET titulo = ?, descripcion = ?, tipo = ?, fecha_inicio = ?, fecha_fin = ?, lugar = ?, edad_minima = ?, edad_maxima = ?, cupos_maximos = ?, costo = ?, responsable = ?, contacto = ?, email = ?, telefono = ?, inscripcion_abierta = ?, publicada = ?, destacada = ?`;
    const params = [titulo, descripcion || null, tipo || null, fecha_inicio || null, fecha_fin || null, lugar || null, edad_minima || 14, edad_maxima || 30, cupos_maximos || null, costo || 0, responsable || null, contacto || null, email || null, telefono || null, inscripcion_abierta !== undefined ? inscripcion_abierta : true, publicada !== undefined ? publicada : true, destacada || false];
    
    if (req.file) {
      query += ', imagen_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ message: 'Actividad actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando actividad:', error);
    res.status(500).json({ error: 'Error actualizando actividad' });
  }
});

router.delete('/actividades/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM actividades_juventud WHERE id = ?', [req.params.id]);
    res.json({ message: 'Actividad eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    res.status(500).json({ error: 'Error eliminando actividad' });
  }
});

module.exports = router;

