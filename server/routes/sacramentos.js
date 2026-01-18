const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los sacramentos
router.get('/', async (req, res) => {
  try {
    const [sacramentos] = await pool.execute(
      'SELECT * FROM sacramentos WHERE activo = TRUE ORDER BY orden ASC, nombre ASC'
    );
    res.json(sacramentos);
  } catch (error) {
    console.error('Error obteniendo sacramentos:', error);
    res.status(500).json({ error: 'Error obteniendo sacramentos' });
  }
});

// Obtener sacramento por ID
router.get('/:id', async (req, res) => {
  try {
    const [sacramentos] = await pool.execute(
      'SELECT * FROM sacramentos WHERE id = ? AND activo = TRUE',
      [req.params.id]
    );
    if (sacramentos.length === 0) {
      return res.status(404).json({ error: 'Sacramento no encontrado' });
    }
    res.json(sacramentos[0]);
  } catch (error) {
    console.error('Error obteniendo sacramento:', error);
    res.status(500).json({ error: 'Error obteniendo sacramento' });
  }
});

// Crear sacramento (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, requisitos, documentos_necesarios, costo, tiempo_preparacion, proceso, contacto_responsable, email_contacto, telefono_contacto, horario_atencion, activo, destacado, orden } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO sacramentos (nombre, descripcion, requisitos, documentos_necesarios, costo, tiempo_preparacion, proceso, contacto_responsable, email_contacto, telefono_contacto, horario_atencion, activo, destacado, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, JSON.stringify(requisitos || []), JSON.stringify(documentos_necesarios || []), costo || 0, tiempo_preparacion || null, proceso || null, contacto_responsable || null, email_contacto || null, telefono_contacto || null, horario_atencion || null, activo !== undefined ? activo : true, destacado || false, orden || 0]
    );
    res.status(201).json({ id: result.insertId, message: 'Sacramento creado exitosamente' });
  } catch (error) {
    console.error('Error creando sacramento:', error);
    res.status(500).json({ error: 'Error creando sacramento' });
  }
});

// Actualizar sacramento (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, requisitos, documentos_necesarios, costo, tiempo_preparacion, proceso, contacto_responsable, email_contacto, telefono_contacto, horario_atencion, activo, destacado, orden } = req.body;
    
    await pool.execute(
      `UPDATE sacramentos SET nombre = ?, descripcion = ?, requisitos = ?, documentos_necesarios = ?, costo = ?, tiempo_preparacion = ?, proceso = ?, contacto_responsable = ?, email_contacto = ?, telefono_contacto = ?, horario_atencion = ?, activo = ?, destacado = ?, orden = ? WHERE id = ?`,
      [nombre, descripcion || null, JSON.stringify(requisitos || []), JSON.stringify(documentos_necesarios || []), costo || 0, tiempo_preparacion || null, proceso || null, contacto_responsable || null, email_contacto || null, telefono_contacto || null, horario_atencion || null, activo !== undefined ? activo : true, destacado || false, orden || 0, req.params.id]
    );
    res.json({ message: 'Sacramento actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando sacramento:', error);
    res.status(500).json({ error: 'Error actualizando sacramento' });
  }
});

// Eliminar sacramento (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM sacramentos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Sacramento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando sacramento:', error);
    res.status(500).json({ error: 'Error eliminando sacramento' });
  }
});

// Rutas para solicitudes de sacramentos
router.post('/solicitudes', async (req, res) => {
  try {
    const { sacramento_id, parroquia_id, nombre_solicitante, documento, email, telefono, fecha_solicitud, fecha_evento, observaciones, documentos_adjuntos } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO solicitudes_sacramentos (sacramento_id, parroquia_id, nombre_solicitante, documento, email, telefono, fecha_solicitud, fecha_evento, observaciones, documentos_adjuntos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sacramento_id, parroquia_id || null, nombre_solicitante, documento, email, telefono || null, fecha_solicitud || new Date(), fecha_evento || null, observaciones || null, JSON.stringify(documentos_adjuntos || [])]
    );
    res.status(201).json({ id: result.insertId, message: 'Solicitud enviada exitosamente' });
  } catch (error) {
    console.error('Error creando solicitud:', error);
    res.status(500).json({ error: 'Error creando solicitud' });
  }
});

// Obtener solicitudes (admin)
router.get('/admin/solicitudes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { estado } = req.query;
    let query = 'SELECT s.*, sc.nombre as sacramento_nombre FROM solicitudes_sacramentos s LEFT JOIN sacramentos sc ON s.sacramento_id = sc.id WHERE 1=1';
    const params = [];
    
    if (estado) {
      query += ' AND s.estado = ?';
      params.push(estado);
    }
    
    query += ' ORDER BY s.fecha_solicitud DESC';
    
    const [solicitudes] = await pool.execute(query, params);
    res.json(solicitudes);
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({ error: 'Error obteniendo solicitudes' });
  }
});

module.exports = router;
















