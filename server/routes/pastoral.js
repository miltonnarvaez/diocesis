const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadNoticia } = require('../utils/upload');

const router = express.Router();

// Obtener comisiones de pastoral
router.get('/comisiones', async (req, res) => {
  try {
    const [comisiones] = await pool.execute(
      'SELECT * FROM comisiones_pastoral WHERE activa = TRUE ORDER BY orden ASC, nombre ASC'
    );
    res.json(comisiones);
  } catch (error) {
    console.error('Error obteniendo comisiones:', error);
    res.status(500).json({ error: 'Error obteniendo comisiones' });
  }
});

// Obtener grupos y movimientos
router.get('/grupos', async (req, res) => {
  try {
    const { tipo, parroquia_id, comision_id } = req.query;
    let query = 'SELECT g.*, p.nombre as parroquia_nombre, c.nombre as comision_nombre FROM grupos_movimientos g LEFT JOIN parroquias p ON g.parroquia_id = p.id LEFT JOIN comisiones_pastoral c ON g.comision_id = c.id WHERE g.activo = TRUE';
    const params = [];
    
    if (tipo) {
      query += ' AND g.tipo = ?';
      params.push(tipo);
    }
    if (parroquia_id) {
      query += ' AND g.parroquia_id = ?';
      params.push(parroquia_id);
    }
    if (comision_id) {
      query += ' AND g.comision_id = ?';
      params.push(comision_id);
    }
    
    query += ' ORDER BY g.orden ASC, g.nombre ASC';
    
    const [grupos] = await pool.execute(query, params);
    res.json(grupos);
  } catch (error) {
    console.error('Error obteniendo grupos:', error);
    res.status(500).json({ error: 'Error obteniendo grupos' });
  }
});

// Obtener actividades pastorales
router.get('/actividades', async (req, res) => {
  try {
    const { tipo, comision_id, grupo_id } = req.query;
    let query = 'SELECT * FROM actividades_pastorales WHERE publicada = TRUE';
    const params = [];
    
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    if (comision_id) {
      query += ' AND comision_id = ?';
      params.push(comision_id);
    }
    if (grupo_id) {
      query += ' AND grupo_id = ?';
      params.push(grupo_id);
    }
    
    query += ' ORDER BY fecha_inicio DESC';
    
    const [actividades] = await pool.execute(query, params);
    res.json(actividades);
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({ error: 'Error obteniendo actividades' });
  }
});

// CRUD para comisiones (admin)
router.post('/comisiones', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { nombre, descripcion, mision, objetivos, coordinador, contacto, email, telefono, activa, destacada, orden } = req.body;
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO comisiones_pastoral (nombre, descripcion, mision, objetivos, coordinador, contacto, email, telefono, imagen_url, activa, destacada, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, mision || null, JSON.stringify(objetivos || []), coordinador || null, contacto || null, email || null, telefono || null, imagen_url, activa !== undefined ? activa : true, destacada || false, orden || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Comisión creada exitosamente' });
  } catch (error) {
    console.error('Error creando comisión:', error);
    res.status(500).json({ error: 'Error creando comisión' });
  }
});

router.put('/comisiones/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { nombre, descripcion, mision, objetivos, coordinador, contacto, email, telefono, activa, destacada, orden } = req.body;
    let query = `UPDATE comisiones_pastoral SET nombre = ?, descripcion = ?, mision = ?, objetivos = ?, coordinador = ?, contacto = ?, email = ?, telefono = ?, activa = ?, destacada = ?, orden = ?`;
    const params = [nombre, descripcion || null, mision || null, JSON.stringify(objetivos || []), coordinador || null, contacto || null, email || null, telefono || null, activa !== undefined ? activa : true, destacada || false, orden || 0];
    
    if (req.file) {
      query += ', imagen_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ message: 'Comisión actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando comisión:', error);
    res.status(500).json({ error: 'Error actualizando comisión' });
  }
});

router.delete('/comisiones/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM comisiones_pastoral WHERE id = ?', [req.params.id]);
    res.json({ message: 'Comisión eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando comisión:', error);
    res.status(500).json({ error: 'Error eliminando comisión' });
  }
});

module.exports = router;
















