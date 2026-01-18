const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener espacios disponibles (público)
router.get('/espacios', async (req, res) => {
  try {
    const { tipo_espacio } = req.query;
    let query = 'SELECT * FROM espacios WHERE activo = 1';
    const params = [];

    if (tipo_espacio) {
      query += ' AND tipo_espacio = ?';
      params.push(tipo_espacio);
    }

    query += ' ORDER BY nombre ASC';

    const [espacios] = await pool.execute(query, params);
    res.json(espacios);
  } catch (error) {
    console.error('Error obteniendo espacios:', error);
    res.status(500).json({ error: 'Error al obtener los espacios' });
  }
});

// Obtener disponibilidad de un espacio
router.get('/espacios/:id/disponibilidad', async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ error: 'Fecha es requerida' });
    }

    // Obtener reservas confirmadas para esa fecha
    const [reservas] = await pool.execute(
      `SELECT hora_inicio, hora_fin 
       FROM reservas 
       WHERE espacio_id = ? AND fecha_reserva = ? AND estado IN ('aprobada', 'pendiente')`,
      [id, fecha]
    );

    res.json({ reservas });
  } catch (error) {
    console.error('Error obteniendo disponibilidad:', error);
    res.status(500).json({ error: 'Error al obtener la disponibilidad' });
  }
});

// Crear reserva (público)
router.post('/', async (req, res) => {
  try {
    const {
      espacio_id,
      nombre_solicitante,
      documento,
      email,
      telefono,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      motivo,
      descripcion_evento,
      numero_personas,
      requiere_equipamiento,
      equipamiento_solicitado
    } = req.body;

    // Verificar disponibilidad
    const [conflictos] = await pool.execute(
      `SELECT id FROM reservas 
       WHERE espacio_id = ? AND fecha_reserva = ? 
       AND estado IN ('aprobada', 'pendiente')
       AND (
         (hora_inicio <= ? AND hora_fin > ?) OR
         (hora_inicio < ? AND hora_fin >= ?) OR
         (hora_inicio >= ? AND hora_fin <= ?)
       )`,
      [espacio_id, fecha_reserva, hora_inicio, hora_inicio, hora_fin, hora_fin, hora_inicio, hora_fin]
    );

    if (conflictos.length > 0) {
      return res.status(400).json({ error: 'El espacio no está disponible en ese horario' });
    }

    const query = `
      INSERT INTO reservas 
      (espacio_id, nombre_solicitante, documento, email, telefono, fecha_reserva,
       hora_inicio, hora_fin, motivo, descripcion_evento, numero_personas,
       requiere_equipamiento, equipamiento_solicitado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      espacio_id,
      nombre_solicitante,
      documento || null,
      email,
      telefono || null,
      fecha_reserva,
      hora_inicio,
      hora_fin,
      motivo || null,
      descripcion_evento || null,
      numero_personas || null,
      requiere_equipamiento || false,
      equipamiento_solicitado || null
    ]);

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Reserva solicitada exitosamente. Será revisada y confirmada.' 
    });
  } catch (error) {
    console.error('Error creando reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
});

// Obtener reservas (admin o propias)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.rol === 'admin') {
      query = `
        SELECT r.*, e.nombre as espacio_nombre, e.tipo_espacio 
        FROM reservas r
        JOIN espacios e ON r.espacio_id = e.id
        ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC
      `;
      params = [];
    } else {
      query = `
        SELECT r.*, e.nombre as espacio_nombre, e.tipo_espacio 
        FROM reservas r
        JOIN espacios e ON r.espacio_id = e.id
        WHERE r.email = ?
        ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC
      `;
      params = [req.user.email];
    }

    const [reservas] = await pool.execute(query, params);
    res.json(reservas);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
});

// Actualizar estado de reserva (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones_admin } = req.body;

    const query = `
      UPDATE reservas 
      SET estado = ?, observaciones_admin = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(query, [estado, observaciones_admin || null, id]);
    res.json({ message: 'Reserva actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando reserva:', error);
    res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
});

// Gestionar espacios (admin)
router.post('/espacios', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      tipo_espacio,
      capacidad,
      ubicacion,
      imagen_url,
      equipamiento,
      costo_hora
    } = req.body;

    const query = `
      INSERT INTO espacios 
      (nombre, descripcion, tipo_espacio, capacidad, ubicacion, imagen_url, equipamiento, costo_hora)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      nombre,
      descripcion || null,
      tipo_espacio || 'salon',
      capacidad || null,
      ubicacion || null,
      imagen_url || null,
      equipamiento || null,
      costo_hora || 0
    ]);

    res.status(201).json({ id: result.insertId, message: 'Espacio creado exitosamente' });
  } catch (error) {
    console.error('Error creando espacio:', error);
    res.status(500).json({ error: 'Error al crear el espacio' });
  }
});

module.exports = router;
