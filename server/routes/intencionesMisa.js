const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener todas las intenciones (admin) o propias (usuario)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.rol === 'admin') {
      query = `
        SELECT im.*, p.nombre as parroquia_nombre 
        FROM intenciones_misa im
        LEFT JOIN parroquias p ON im.parroquia_id = p.id
        ORDER BY im.fecha_misa DESC, im.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT im.*, p.nombre as parroquia_nombre 
        FROM intenciones_misa im
        LEFT JOIN parroquias p ON im.parroquia_id = p.id
        WHERE im.email = ?
        ORDER BY im.fecha_misa DESC, im.created_at DESC
      `;
      params = [req.user.email];
    }

    const [intenciones] = await pool.execute(query, params);
    res.json(intenciones);
  } catch (error) {
    console.error('Error obteniendo intenciones:', error);
    res.status(500).json({ error: 'Error al obtener las intenciones de misa' });
  }
});

// Crear nueva intención de misa (público)
router.post('/', async (req, res) => {
  try {
    const {
      nombre_solicitante,
      documento,
      email,
      telefono,
      fecha_misa,
      parroquia_id,
      tipo_intencion,
      intencion_especifica,
      nombre_difunto,
      monto_donacion,
      observaciones
    } = req.body;

    const query = `
      INSERT INTO intenciones_misa 
      (nombre_solicitante, documento, email, telefono, fecha_misa, parroquia_id, 
       tipo_intencion, intencion_especifica, nombre_difunto, monto_donacion, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      nombre_solicitante,
      documento || null,
      email || null,
      telefono || null,
      fecha_misa,
      parroquia_id || null,
      tipo_intencion || 'otra',
      intencion_especifica || null,
      nombre_difunto || null,
      monto_donacion || 0,
      observaciones || null
    ]);

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Intención de misa registrada exitosamente' 
    });
  } catch (error) {
    console.error('Error creando intención:', error);
    res.status(500).json({ error: 'Error al registrar la intención de misa' });
  }
});

// Actualizar estado de intención (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;

    const query = `
      UPDATE intenciones_misa 
      SET estado = ?, observaciones = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(query, [estado, observaciones || null, id]);
    res.json({ message: 'Intención actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando intención:', error);
    res.status(500).json({ error: 'Error al actualizar la intención' });
  }
});

// Obtener intención por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [intenciones] = await pool.execute(
      `SELECT im.*, p.nombre as parroquia_nombre 
       FROM intenciones_misa im
       LEFT JOIN parroquias p ON im.parroquia_id = p.id
       WHERE im.id = ?`,
      [id]
    );

    if (intenciones.length === 0) {
      return res.status(404).json({ error: 'Intención no encontrada' });
    }

    res.json(intenciones[0]);
  } catch (error) {
    console.error('Error obteniendo intención:', error);
    res.status(500).json({ error: 'Error al obtener la intención' });
  }
});

module.exports = router;
