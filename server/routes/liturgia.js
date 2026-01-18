const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Obtener calendario litúrgico por fecha
router.get('/calendario', async (req, res) => {
  try {
    const { fecha } = req.query;
    let query = 'SELECT * FROM calendario_liturgico WHERE 1=1';
    const params = [];
    
    if (fecha) {
      query += ' AND fecha = ?';
      params.push(fecha);
    } else {
      // Si no hay fecha, obtener la de hoy
      const today = new Date().toISOString().split('T')[0];
      query += ' AND fecha = ?';
      params.push(today);
    }
    
    const [calendario] = await pool.execute(query, params);
    res.json(calendario[0] || null);
  } catch (error) {
    console.error('Error obteniendo calendario litúrgico:', error);
    res.status(500).json({ error: 'Error obteniendo calendario litúrgico' });
  }
});

// Obtener calendario por rango de fechas
router.get('/calendario/rango', async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    if (!inicio || !fin) {
      return res.status(400).json({ error: 'Se requieren parámetros inicio y fin' });
    }
    
    const [calendario] = await pool.execute(
      'SELECT * FROM calendario_liturgico WHERE fecha >= ? AND fecha <= ? ORDER BY fecha ASC',
      [inicio, fin]
    );
    res.json(calendario);
  } catch (error) {
    console.error('Error obteniendo calendario:', error);
    res.status(500).json({ error: 'Error obteniendo calendario' });
  }
});

// Crear/actualizar entrada de calendario (admin)
router.post('/calendario', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fecha, tiempo_liturgico, color_liturgico, solemnidad, fiesta, memoria, lectura_primera, salmo, lectura_segunda, evangelio, reflexion } = req.body;
    
    await pool.execute(
      `INSERT INTO calendario_liturgico (fecha, tiempo_liturgico, color_liturgico, solemnidad, fiesta, memoria, lectura_primera, salmo, lectura_segunda, evangelio, reflexion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE tiempo_liturgico = VALUES(tiempo_liturgico), color_liturgico = VALUES(color_liturgico), solemnidad = VALUES(solemnidad), fiesta = VALUES(fiesta), memoria = VALUES(memoria), lectura_primera = VALUES(lectura_primera), salmo = VALUES(salmo), lectura_segunda = VALUES(lectura_segunda), evangelio = VALUES(evangelio), reflexion = VALUES(reflexion)`,
      [fecha, tiempo_liturgico || null, color_liturgico || null, solemnidad || null, fiesta || null, memoria || null, lectura_primera || null, salmo || null, lectura_segunda || null, evangelio || null, reflexion || null]
    );
    res.json({ message: 'Entrada de calendario guardada exitosamente' });
  } catch (error) {
    console.error('Error guardando calendario:', error);
    res.status(500).json({ error: 'Error guardando calendario' });
  }
});

// Obtener horarios litúrgicos
router.get('/horarios', async (req, res) => {
  try {
    const { tiempo_liturgico } = req.query;
    let query = 'SELECT * FROM horarios_misa_liturgicos WHERE activo = TRUE';
    const params = [];
    
    if (tiempo_liturgico) {
      query += ' AND tiempo_liturgico = ?';
      params.push(tiempo_liturgico);
    }
    
    query += ' ORDER BY dia_semana, hora';
    
    const [horarios] = await pool.execute(query, params);
    res.json(horarios);
  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    res.status(500).json({ error: 'Error obteniendo horarios' });
  }
});

module.exports = router;
















