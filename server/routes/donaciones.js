const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener todas las donaciones (admin) o propias (usuario)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.rol === 'admin') {
      query = 'SELECT * FROM donaciones ORDER BY fecha_donacion DESC, created_at DESC';
      params = [];
    } else {
      query = 'SELECT * FROM donaciones WHERE donante_email = ? ORDER BY fecha_donacion DESC';
      params = [req.user.email];
    }

    const [donaciones] = await pool.execute(query, params);
    res.json(donaciones);
  } catch (error) {
    console.error('Error obteniendo donaciones:', error);
    res.status(500).json({ error: 'Error al obtener las donaciones' });
  }
});

// Crear nueva donación (público)
router.post('/', async (req, res) => {
  try {
    const {
      donante_nombre,
      donante_email,
      donante_telefono,
      donante_documento,
      monto,
      tipo_donacion,
      destino,
      metodo_pago,
      referencia_pago,
      observaciones
    } = req.body;

    const query = `
      INSERT INTO donaciones 
      (donante_nombre, donante_email, donante_telefono, donante_documento, 
       monto, tipo_donacion, destino, metodo_pago, referencia_pago, 
       fecha_donacion, observaciones)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)
    `;

    const [result] = await pool.execute(query, [
      donante_nombre,
      donante_email || null,
      donante_telefono || null,
      donante_documento || null,
      monto,
      tipo_donacion || 'donacion_unica',
      destino || null,
      metodo_pago || null,
      referencia_pago || null,
      observaciones || null
    ]);

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Donación registrada exitosamente',
      recibo_id: result.insertId
    });
  } catch (error) {
    console.error('Error creando donación:', error);
    res.status(500).json({ error: 'Error al registrar la donación' });
  }
});

// Actualizar estado de donación (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, recibo_generado } = req.body;

    const query = `
      UPDATE donaciones 
      SET estado = ?, recibo_generado = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(query, [estado, recibo_generado || false, id]);
    res.json({ message: 'Donación actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando donación:', error);
    res.status(500).json({ error: 'Error al actualizar la donación' });
  }
});

// Obtener estadísticas de donaciones (admin)
router.get('/estadisticas/resumen', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_donaciones,
        SUM(CASE WHEN estado = 'completada' THEN monto ELSE 0 END) as total_recaudado,
        SUM(CASE WHEN tipo_donacion = 'diezmo' THEN monto ELSE 0 END) as total_diezmo,
        AVG(monto) as promedio_donacion
      FROM donaciones
      WHERE estado = 'completada'
    `);

    res.json(stats[0] || {});
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
