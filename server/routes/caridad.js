const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadNoticia } = require('../utils/upload');

const router = express.Router();

// Obtener proyectos de caridad
router.get('/proyectos', async (req, res) => {
  try {
    const { estado } = req.query;
    let query = 'SELECT * FROM proyectos_caridad WHERE publicada = TRUE';
    const params = [];
    
    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }
    
    query += ' ORDER BY fecha_inicio DESC';
    
    const [proyectos] = await pool.execute(query, params);
    res.json(proyectos);
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({ error: 'Error obteniendo proyectos' });
  }
});

// Obtener campañas de ayuda
router.get('/campañas', async (req, res) => {
  try {
    const { activa } = req.query;
    let query = 'SELECT * FROM campañas_ayuda WHERE publicada = TRUE';
    const params = [];
    
    if (activa === 'true') {
      query += ' AND activa = TRUE';
    }
    
    query += ' ORDER BY fecha_inicio DESC';
    
    const [campañas] = await pool.execute(query, params);
    res.json(campañas);
  } catch (error) {
    console.error('Error obteniendo campañas:', error);
    res.status(500).json({ error: 'Error obteniendo campañas' });
  }
});

// Registrar voluntario
router.post('/voluntarios', async (req, res) => {
  try {
    const { nombre_completo, documento, email, telefono, direccion, habilidades, disponibilidad, area_interes, proyecto_id } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO voluntarios (nombre_completo, documento, email, telefono, direccion, habilidades, disponibilidad, area_interes, proyecto_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre_completo, documento, email, telefono || null, direccion || null, habilidades || null, disponibilidad || null, area_interes || null, proyecto_id || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Registro de voluntario exitoso' });
  } catch (error) {
    console.error('Error registrando voluntario:', error);
    res.status(500).json({ error: 'Error registrando voluntario' });
  }
});

// CRUD para proyectos (admin)
router.post('/admin/proyectos', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, objetivo, beneficiarios, zona_impacto, fecha_inicio, fecha_fin, estado, presupuesto, fondos_recaudados, responsable, contacto, email, telefono, publicada, destacada } = req.body;
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO proyectos_caridad (titulo, descripcion, objetivo, beneficiarios, zona_impacto, fecha_inicio, fecha_fin, estado, presupuesto, fondos_recaudados, responsable, contacto, email, telefono, imagen_url, publicada, destacada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, objetivo || null, beneficiarios || null, zona_impacto || null, fecha_inicio || null, fecha_fin || null, estado || 'planificacion', presupuesto || null, fondos_recaudados || 0, responsable || null, contacto || null, email || null, telefono || null, imagen_url, publicada !== undefined ? publicada : true, destacada || false]
    );
    res.status(201).json({ id: result.insertId, message: 'Proyecto creado exitosamente' });
  } catch (error) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({ error: 'Error creando proyecto' });
  }
});

router.put('/admin/proyectos/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, objetivo, beneficiarios, zona_impacto, fecha_inicio, fecha_fin, estado, presupuesto, fondos_recaudados, responsable, contacto, email, telefono, publicada, destacada } = req.body;
    let query = `UPDATE proyectos_caridad SET titulo = ?, descripcion = ?, objetivo = ?, beneficiarios = ?, zona_impacto = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?, presupuesto = ?, fondos_recaudados = ?, responsable = ?, contacto = ?, email = ?, telefono = ?, publicada = ?, destacada = ?`;
    const params = [titulo, descripcion || null, objetivo || null, beneficiarios || null, zona_impacto || null, fecha_inicio || null, fecha_fin || null, estado || 'planificacion', presupuesto || null, fondos_recaudados || 0, responsable || null, contacto || null, email || null, telefono || null, publicada !== undefined ? publicada : true, destacada || false];
    
    if (req.file) {
      query += ', imagen_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ message: 'Proyecto actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({ error: 'Error actualizando proyecto' });
  }
});

router.delete('/admin/proyectos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM proyectos_caridad WHERE id = ?', [req.params.id]);
    res.json({ message: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ error: 'Error eliminando proyecto' });
  }
});

// CRUD para campañas (admin)
router.post('/admin/campañas', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, objetivo, fecha_inicio, fecha_fin, activa, publicada, destacada } = req.body;
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO campañas_ayuda (titulo, descripcion, objetivo, fecha_inicio, fecha_fin, activa, imagen_url, publicada, destacada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, objetivo || null, fecha_inicio || null, fecha_fin || null, activa !== undefined ? activa : true, imagen_url, publicada !== undefined ? publicada : true, destacada || false]
    );
    res.status(201).json({ id: result.insertId, message: 'Campaña creada exitosamente' });
  } catch (error) {
    console.error('Error creando campaña:', error);
    res.status(500).json({ error: 'Error creando campaña' });
  }
});

router.put('/admin/campañas/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, objetivo, fecha_inicio, fecha_fin, activa, publicada, destacada } = req.body;
    let query = `UPDATE campañas_ayuda SET titulo = ?, descripcion = ?, objetivo = ?, fecha_inicio = ?, fecha_fin = ?, activa = ?, publicada = ?, destacada = ?`;
    const params = [titulo, descripcion || null, objetivo || null, fecha_inicio || null, fecha_fin || null, activa !== undefined ? activa : true, publicada !== undefined ? publicada : true, destacada || false];
    
    if (req.file) {
      query += ', imagen_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ message: 'Campaña actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando campaña:', error);
    res.status(500).json({ error: 'Error actualizando campaña' });
  }
});

router.delete('/admin/campañas/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM campañas_ayuda WHERE id = ?', [req.params.id]);
    res.json({ message: 'Campaña eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando campaña:', error);
    res.status(500).json({ error: 'Error eliminando campaña' });
  }
});

// Obtener voluntarios (admin)
router.get('/voluntarios', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { proyecto_id } = req.query;
    let query = 'SELECT * FROM voluntarios WHERE 1=1';
    const params = [];
    
    if (proyecto_id) {
      query += ' AND proyecto_id = ?';
      params.push(proyecto_id);
    }
    
    query += ' ORDER BY nombre_completo ASC';
    
    const [voluntarios] = await pool.execute(query, params);
    res.json(voluntarios);
  } catch (error) {
    console.error('Error obteniendo voluntarios:', error);
    res.status(500).json({ error: 'Error obteniendo voluntarios' });
  }
});

// Actualizar voluntario (admin)
router.put('/voluntarios/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre_completo, documento, email, telefono, direccion, habilidades, disponibilidad, area_interes, proyecto_id, estado } = req.body;
    
    await pool.execute(
      `UPDATE voluntarios 
       SET nombre_completo = ?, documento = ?, email = ?, telefono = ?, direccion = ?, habilidades = ?, disponibilidad = ?, area_interes = ?, proyecto_id = ?, estado = ?
       WHERE id = ?`,
      [nombre_completo, documento, email, telefono || null, direccion || null, habilidades || null, disponibilidad || null, area_interes || null, proyecto_id || null, estado || 'pendiente', req.params.id]
    );
    res.json({ message: 'Voluntario actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando voluntario:', error);
    res.status(500).json({ error: 'Error actualizando voluntario' });
  }
});

// Eliminar voluntario (admin)
router.delete('/voluntarios/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM voluntarios WHERE id = ?', [req.params.id]);
    res.json({ message: 'Voluntario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando voluntario:', error);
    res.status(500).json({ error: 'Error eliminando voluntario' });
  }
});

module.exports = router;

