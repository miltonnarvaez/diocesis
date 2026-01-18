const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener eventos activos (público)
router.get('/', async (req, res) => {
  try {
    const { tipo_evento, destacado, fecha_desde, fecha_hasta } = req.query;
    let query = 'SELECT * FROM eventos_especiales WHERE activo = 1';
    const params = [];

    if (tipo_evento) {
      query += ' AND tipo_evento = ?';
      params.push(tipo_evento);
    }

    if (destacado === 'true') {
      query += ' AND destacado = 1';
    }

    if (fecha_desde) {
      query += ' AND fecha_inicio >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND fecha_inicio <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY fecha_inicio ASC, destacado DESC';

    const [eventos] = await pool.execute(query, params);
    res.json(eventos);
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res.status(500).json({ error: 'Error al obtener los eventos' });
  }
});

// Obtener evento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [eventos] = await pool.execute(
      'SELECT * FROM eventos_especiales WHERE id = ? AND activo = 1',
      [id]
    );

    if (eventos.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Obtener inscripciones si requiere inscripción
    const evento = eventos[0];
    if (evento.requiere_inscripcion) {
      const [inscripciones] = await pool.execute(
        'SELECT COUNT(*) as total FROM inscripciones_eventos WHERE evento_id = ? AND estado = "confirmada"',
        [id]
      );
      evento.inscritos = inscripciones[0].total;
    }

    res.json(evento);
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    res.status(500).json({ error: 'Error al obtener el evento' });
  }
});

// Inscribirse a evento (público)
router.post('/:id/inscribirse', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_completo,
      documento,
      email,
      telefono,
      edad,
      parroquia,
      observaciones
    } = req.body;

    // Verificar que el evento existe y tiene cupos
    const [eventos] = await pool.execute(
      'SELECT * FROM eventos_especiales WHERE id = ? AND activo = 1 AND inscripcion_abierta = 1',
      [id]
    );

    if (eventos.length === 0) {
      return res.status(404).json({ error: 'Evento no encontrado o inscripciones cerradas' });
    }

    const evento = eventos[0];
    if (evento.cupos_disponibles <= 0) {
      return res.status(400).json({ error: 'No hay cupos disponibles' });
    }

    // Crear inscripción
    const [result] = await pool.execute(
      `INSERT INTO inscripciones_eventos 
       (evento_id, nombre_completo, documento, email, telefono, edad, parroquia, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nombre_completo, documento || null, email, telefono || null, edad || null, parroquia || null, observaciones || null]
    );

    // Actualizar cupos disponibles
    await pool.execute(
      'UPDATE eventos_especiales SET cupos_disponibles = cupos_disponibles - 1 WHERE id = ?',
      [id]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Inscripción realizada exitosamente' 
    });
  } catch (error) {
    console.error('Error inscribiéndose:', error);
    res.status(500).json({ error: 'Error al realizar la inscripción' });
  }
});

// Crear evento (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      tipo_evento,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      lugar,
      direccion,
      imagen_url,
      costo,
      cupos_maximos,
      requiere_inscripcion,
      inscripcion_abierta,
      formulario_inscripcion,
      destacado
    } = req.body;

    const cupos_disponibles = cupos_maximos || 0;

    const query = `
      INSERT INTO eventos_especiales 
      (titulo, descripcion, tipo_evento, fecha_inicio, fecha_fin, hora_inicio, hora_fin,
       lugar, direccion, imagen_url, costo, cupos_maximos, cupos_disponibles,
       requiere_inscripcion, inscripcion_abierta, formulario_inscripcion, destacado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      titulo,
      descripcion || null,
      tipo_evento || 'otro',
      fecha_inicio,
      fecha_fin || null,
      hora_inicio || null,
      hora_fin || null,
      lugar || null,
      direccion || null,
      imagen_url || null,
      costo || 0,
      cupos_maximos || 0,
      cupos_disponibles,
      requiere_inscripcion !== undefined ? requiere_inscripcion : true,
      inscripcion_abierta !== undefined ? inscripcion_abierta : true,
      formulario_inscripcion || null,
      destacado || false
    ]);

    res.status(201).json({ id: result.insertId, message: 'Evento creado exitosamente' });
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({ error: 'Error al crear el evento' });
  }
});

// Actualizar evento (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      tipo_evento,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      lugar,
      direccion,
      imagen_url,
      costo,
      cupos_maximos,
      requiere_inscripcion,
      inscripcion_abierta,
      formulario_inscripcion,
      destacado,
      activo
    } = req.body;

    const query = `
      UPDATE eventos_especiales 
      SET titulo = ?, descripcion = ?, tipo_evento = ?, fecha_inicio = ?, fecha_fin = ?,
          hora_inicio = ?, hora_fin = ?, lugar = ?, direccion = ?, imagen_url = ?,
          costo = ?, cupos_maximos = ?, requiere_inscripcion = ?, inscripcion_abierta = ?,
          formulario_inscripcion = ?, destacado = ?, activo = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(query, [
      titulo,
      descripcion || null,
      tipo_evento,
      fecha_inicio,
      fecha_fin || null,
      hora_inicio || null,
      hora_fin || null,
      lugar || null,
      direccion || null,
      imagen_url || null,
      costo || 0,
      cupos_maximos || 0,
      requiere_inscripcion !== undefined ? requiere_inscripcion : true,
      inscripcion_abierta !== undefined ? inscripcion_abierta : true,
      formulario_inscripcion || null,
      destacado || false,
      activo !== undefined ? activo : true,
      id
    ]);

    res.json({ message: 'Evento actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando evento:', error);
    res.status(500).json({ error: 'Error al actualizar el evento' });
  }
});

// Obtener inscripciones de un evento (admin)
router.get('/:id/inscripciones', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [inscripciones] = await pool.execute(
      'SELECT * FROM inscripciones_eventos WHERE evento_id = ? ORDER BY fecha_inscripcion DESC',
      [id]
    );
    res.json(inscripciones);
  } catch (error) {
    console.error('Error obteniendo inscripciones:', error);
    res.status(500).json({ error: 'Error al obtener las inscripciones' });
  }
});

module.exports = router;
