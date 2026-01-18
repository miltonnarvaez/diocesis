const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadNoticia } = require('../utils/upload');
const path = require('path');

const router = express.Router();

// Obtener todas las actividades (admin puede ver todas, público solo publicadas)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, tipo, categoria } = req.query;
    let query = 'SELECT * FROM actividades WHERE 1=1';
    const params = [];

    // Si está autenticado como admin, mostrar todas las actividades
    if (!(req.user && req.user.rol === 'admin')) {
      query += ' AND publicada = TRUE';
    }

    // Filtros opcionales
    if (fecha_inicio) {
      query += ' AND fecha_inicio >= ?';
      params.push(fecha_inicio);
    }
    if (fecha_fin) {
      query += ' AND fecha_inicio <= ?';
      params.push(fecha_fin);
    }
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    query += ' ORDER BY fecha_inicio ASC, fecha_fin ASC';

    const [actividades] = await pool.execute(query, params);
    res.json(actividades);
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({ error: 'Error obteniendo actividades' });
  }
});

// Obtener actividad por ID
router.get('/:id', async (req, res) => {
  try {
    const [actividades] = await pool.execute(
      'SELECT * FROM actividades WHERE id = ? AND (publicada = TRUE OR ? = TRUE)',
      [req.params.id, req.user && req.user.rol === 'admin']
    );

    if (actividades.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.json(actividades[0]);
  } catch (error) {
    console.error('Error obteniendo actividad:', error);
    res.status(500).json({ error: 'Error obteniendo actividad' });
  }
});

// Obtener actividades por rango de fechas (para el calendario)
router.get('/calendario/rango', async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    
    if (!inicio || !fin) {
      return res.status(400).json({ error: 'Se requieren parámetros inicio y fin' });
    }

    const [actividades] = await pool.execute(
      `SELECT * FROM actividades 
       WHERE publicada = TRUE 
       AND fecha_inicio >= ? 
       AND fecha_inicio <= ?
       ORDER BY fecha_inicio ASC`,
      [inicio, fin]
    );

    res.json(actividades);
  } catch (error) {
    console.error('Error obteniendo actividades del calendario:', error);
    res.status(500).json({ error: 'Error obteniendo actividades del calendario' });
  }
});

// Crear actividad (admin)
router.post('/', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { 
      titulo, 
      descripcion, 
      fecha_inicio, 
      fecha_fin, 
      lugar, 
      tipo, 
      categoria, 
      responsable, 
      contacto, 
      color, 
      publicada, 
      destacada 
    } = req.body;

    // Procesar imagen subida
    let imagen_url = null;
    if (req.files && req.files.imagen && req.files.imagen.length > 0) {
      imagen_url = `/uploads/images/${req.files.imagen[0].filename}`;
    }

    const [result] = await pool.execute(
      `INSERT INTO actividades 
       (titulo, descripcion, fecha_inicio, fecha_fin, lugar, tipo, categoria, responsable, contacto, imagen_url, color, publicada, destacada) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descripcion || null,
        fecha_inicio,
        fecha_fin || null,
        lugar || null,
        tipo || 'general',
        categoria || null,
        responsable || null,
        contacto || null,
        imagen_url,
        color || '#4A90E2',
        publicada !== undefined ? publicada : true,
        destacada !== undefined ? destacada : false
      ]
    );

    const [nuevaActividad] = await pool.execute(
      'SELECT * FROM actividades WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(nuevaActividad[0]);
  } catch (error) {
    console.error('Error creando actividad:', error);
    res.status(500).json({ error: 'Error creando actividad' });
  }
});

// Actualizar actividad (admin)
router.put('/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { 
      titulo, 
      descripcion, 
      fecha_inicio, 
      fecha_fin, 
      lugar, 
      tipo, 
      categoria, 
      responsable, 
      contacto, 
      color, 
      publicada, 
      destacada 
    } = req.body;

    // Verificar que la actividad existe
    const [actividades] = await pool.execute(
      'SELECT * FROM actividades WHERE id = ?',
      [req.params.id]
    );

    if (actividades.length === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    // Procesar imagen subida (si hay nueva imagen)
    let imagen_url = actividades[0].imagen_url;
    if (req.files && req.files.imagen && req.files.imagen.length > 0) {
      imagen_url = `/uploads/images/${req.files.imagen[0].filename}`;
    }

    await pool.execute(
      `UPDATE actividades SET 
       titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, lugar = ?, 
       tipo = ?, categoria = ?, responsable = ?, contacto = ?, imagen_url = ?, 
       color = ?, publicada = ?, destacada = ?
       WHERE id = ?`,
      [
        titulo,
        descripcion || null,
        fecha_inicio,
        fecha_fin || null,
        lugar || null,
        tipo || 'general',
        categoria || null,
        responsable || null,
        contacto || null,
        imagen_url,
        color || '#4A90E2',
        publicada !== undefined ? publicada : true,
        destacada !== undefined ? destacada : false,
        req.params.id
      ]
    );

    const [actividadActualizada] = await pool.execute(
      'SELECT * FROM actividades WHERE id = ?',
      [req.params.id]
    );

    res.json(actividadActualizada[0]);
  } catch (error) {
    console.error('Error actualizando actividad:', error);
    res.status(500).json({ error: 'Error actualizando actividad' });
  }
});

// Eliminar actividad (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM actividades WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.json({ message: 'Actividad eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando actividad:', error);
    res.status(500).json({ error: 'Error eliminando actividad' });
  }
});

module.exports = router;
















