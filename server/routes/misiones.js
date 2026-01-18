const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadNoticia } = require('../utils/upload');

const router = express.Router();

// Obtener misiones
router.get('/', async (req, res) => {
  try {
    const { tipo, estado } = req.query;
    let query = 'SELECT * FROM misiones WHERE publicada = TRUE';
    const params = [];
    
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }
    
    query += ' ORDER BY fecha_inicio DESC';
    
    const [misiones] = await pool.execute(query, params);
    res.json(misiones);
  } catch (error) {
    console.error('Error obteniendo misiones:', error);
    res.status(500).json({ error: 'Error obteniendo misiones' });
  }
});

// Obtener misioneros
router.get('/misioneros', async (req, res) => {
  try {
    const { tipo, activo } = req.query;
    let query = 'SELECT m.*, mi.nombre as mision_nombre FROM misioneros m LEFT JOIN misiones mi ON m.mision_actual_id = mi.id WHERE 1=1';
    const params = [];
    
    if (tipo) {
      query += ' AND m.tipo = ?';
      params.push(tipo);
    }
    if (activo === 'true') {
      query += ' AND m.activo = TRUE';
    }
    
    query += ' ORDER BY m.nombre_completo ASC';
    
    const [misioneros] = await pool.execute(query, params);
    res.json(misioneros);
  } catch (error) {
    console.error('Error obteniendo misioneros:', error);
    res.status(500).json({ error: 'Error obteniendo misioneros' });
  }
});

// CRUD para misiones (admin)
router.post('/', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { nombre, descripcion, tipo, ubicacion, coordenadas_lat, coordenadas_lng, fecha_inicio, fecha_fin, misioneros, objetivos, actividades, estado, publicada, destacada } = req.body;
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO misiones (nombre, descripcion, tipo, ubicacion, coordenadas_lat, coordenadas_lng, fecha_inicio, fecha_fin, misioneros, objetivos, actividades, estado, imagen_url, publicada, destacada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, tipo || null, ubicacion || null, coordenadas_lat || null, coordenadas_lng || null, fecha_inicio || null, fecha_fin || null, JSON.stringify(misioneros || []), objetivos || null, JSON.stringify(actividades || []), estado || 'planificacion', imagen_url, publicada !== undefined ? publicada : true, destacada || false]
    );
    res.status(201).json({ id: result.insertId, message: 'Misión creada exitosamente' });
  } catch (error) {
    console.error('Error creando misión:', error);
    res.status(500).json({ error: 'Error creando misión' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { nombre, descripcion, tipo, ubicacion, coordenadas_lat, coordenadas_lng, fecha_inicio, fecha_fin, misioneros, objetivos, actividades, estado, publicada, destacada } = req.body;
    let query = `UPDATE misiones SET nombre = ?, descripcion = ?, tipo = ?, ubicacion = ?, coordenadas_lat = ?, coordenadas_lng = ?, fecha_inicio = ?, fecha_fin = ?, misioneros = ?, objetivos = ?, actividades = ?, estado = ?, publicada = ?, destacada = ?`;
    const params = [nombre, descripcion || null, tipo || null, ubicacion || null, coordenadas_lat || null, coordenadas_lng || null, fecha_inicio || null, fecha_fin || null, JSON.stringify(misioneros || []), objetivos || null, JSON.stringify(actividades || []), estado || 'planificacion', publicada !== undefined ? publicada : true, destacada || false];
    
    if (req.file) {
      query += ', imagen_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ message: 'Misión actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando misión:', error);
    res.status(500).json({ error: 'Error actualizando misión' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM misiones WHERE id = ?', [req.params.id]);
    res.json({ message: 'Misión eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando misión:', error);
    res.status(500).json({ error: 'Error eliminando misión' });
  }
});

// CRUD para misioneros (admin)
router.post('/misioneros', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { nombre_completo, tipo, biografia, email, telefono, contacto, experiencia, mision_actual_id, activo } = req.body;
    const imagen_url = req.file ? `/uploads/images/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO misioneros (nombre_completo, tipo, biografia, email, telefono, contacto, experiencia, imagen_url, mision_actual_id, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre_completo, tipo || null, biografia || null, email || null, telefono || null, contacto || null, experiencia || null, imagen_url, mision_actual_id || null, activo !== undefined ? activo : true]
    );
    res.status(201).json({ id: result.insertId, message: 'Misionero creado exitosamente' });
  } catch (error) {
    console.error('Error creando misionero:', error);
    res.status(500).json({ error: 'Error creando misionero' });
  }
});

router.put('/misioneros/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { nombre_completo, tipo, biografia, email, telefono, contacto, experiencia, mision_actual_id, activo } = req.body;
    let query = `UPDATE misioneros SET nombre_completo = ?, tipo = ?, biografia = ?, email = ?, telefono = ?, contacto = ?, experiencia = ?, mision_actual_id = ?, activo = ?`;
    const params = [nombre_completo, tipo || null, biografia || null, email || null, telefono || null, contacto || null, experiencia || null, mision_actual_id || null, activo !== undefined ? activo : true];
    
    if (req.file) {
      query += ', imagen_url = ?';
      params.push(`/uploads/images/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ message: 'Misionero actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando misionero:', error);
    res.status(500).json({ error: 'Error actualizando misionero' });
  }
});

router.delete('/misioneros/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM misioneros WHERE id = ?', [req.params.id]);
    res.json({ message: 'Misionero eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando misionero:', error);
    res.status(500).json({ error: 'Error eliminando misionero' });
  }
});

module.exports = router;

