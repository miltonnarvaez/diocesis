const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Crear opinión sobre un proyecto (público)
router.post('/', async (req, res) => {
  try {
    const { proyecto_id, nombre, documento, email, telefono, organizacion, tipo_organizacion, opinion, argumentos, sugerencias } = req.body;

    // Validaciones
    if (!proyecto_id || !nombre || !documento || !email || !opinion) {
      return res.status(400).json({ 
        error: 'Todos los campos obligatorios deben ser completados' 
      });
    }

    // Verificar que el proyecto existe y es de tipo 'proyecto'
    const [proyectos] = await pool.execute(
      'SELECT id, titulo, tipo FROM documentos_gaceta WHERE id = ? AND tipo = ?',
      [proyecto_id, 'proyecto']
    );

    if (proyectos.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    // Obtener IP del cliente
    const ipAddress = req.ip || req.connection.remoteAddress || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

    // Insertar opinión
    const [result] = await pool.execute(
      `INSERT INTO opiniones_proyectos 
       (proyecto_id, nombre, documento, email, telefono, organizacion, tipo_organizacion, opinion, argumentos, sugerencias, ip_address, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [proyecto_id, nombre, documento, email, telefono || null, organizacion || null, tipo_organizacion || 'ciudadano', opinion, argumentos || null, sugerencias || null, ipAddress]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Su opinión ha sido registrada y será revisada antes de su publicación.' 
    });
  } catch (error) {
    console.error('Error creando opinión:', error);
    res.status(500).json({ error: 'Error al registrar la opinión' });
  }
});

// Obtener opiniones de un proyecto (público - solo publicadas)
router.get('/proyecto/:proyecto_id', async (req, res) => {
  try {
    const { proyecto_id } = req.params;

    const [opiniones] = await pool.execute(
      `SELECT 
        id, nombre, organizacion, tipo_organizacion, opinion, argumentos, sugerencias,
        creado_en
       FROM opiniones_proyectos
       WHERE proyecto_id = ? AND estado = 'publicada'
       ORDER BY creado_en DESC`,
      [proyecto_id]
    );

    res.json(opiniones);
  } catch (error) {
    console.error('Error obteniendo opiniones:', error);
    res.status(500).json({ error: 'Error al obtener las opiniones' });
  }
});

// Obtener todas las opiniones (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { proyecto_id, estado, search } = req.query;
    
    let query = `
      SELECT 
        o.*,
        d.titulo as proyecto_titulo,
        d.numero as proyecto_numero,
        u.nombre as moderado_por_nombre
      FROM opiniones_proyectos o
      LEFT JOIN documentos_gaceta d ON o.proyecto_id = d.id
      LEFT JOIN usuarios u ON o.moderado_por_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (proyecto_id) {
      query += ' AND o.proyecto_id = ?';
      params.push(proyecto_id);
    }

    if (estado) {
      query += ' AND o.estado = ?';
      params.push(estado);
    }

    if (search) {
      query += ' AND (o.nombre LIKE ? OR o.email LIKE ? OR o.opinion LIKE ? OR d.titulo LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY o.creado_en DESC';

    const [opiniones] = await pool.execute(query, params);
    res.json(opiniones);
  } catch (error) {
    console.error('Error obteniendo opiniones:', error);
    res.status(500).json({ error: 'Error al obtener las opiniones' });
  }
});

// Obtener opinión por ID (admin)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [opiniones] = await pool.execute(
      `SELECT 
        o.*,
        d.titulo as proyecto_titulo,
        d.numero as proyecto_numero,
        d.tipo as proyecto_tipo,
        u.nombre as moderado_por_nombre
       FROM opiniones_proyectos o
       LEFT JOIN documentos_gaceta d ON o.proyecto_id = d.id
       LEFT JOIN usuarios u ON o.moderado_por_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (opiniones.length === 0) {
      return res.status(404).json({ error: 'Opinión no encontrada' });
    }

    res.json(opiniones[0]);
  } catch (error) {
    console.error('Error obteniendo opinión:', error);
    res.status(500).json({ error: 'Error al obtener la opinión' });
  }
});

// Actualizar estado de opinión (admin - moderación)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones_moderacion } = req.body;

    if (!estado || !['pendiente', 'revisada', 'publicada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    await pool.execute(
      `UPDATE opiniones_proyectos 
       SET estado = ?, 
           moderado_por_id = ?,
           fecha_moderacion = NOW(),
           observaciones_moderacion = ?
       WHERE id = ?`,
      [estado, req.user.id, observaciones_moderacion || null, id]
    );

    res.json({ message: 'Opinión actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando opinión:', error);
    res.status(500).json({ error: 'Error al actualizar la opinión' });
  }
});

// Eliminar opinión (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM opiniones_proyectos WHERE id = ?', [id]);

    res.json({ message: 'Opinión eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando opinión:', error);
    res.status(500).json({ error: 'Error al eliminar la opinión' });
  }
});

module.exports = router;














