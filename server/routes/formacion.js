const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadNoticia } = require('../utils/upload');

const router = express.Router();

// Obtener cursos
router.get('/cursos', async (req, res) => {
  try {
    const { tipo, categoria, inscripcion_abierta } = req.query;
    let query = 'SELECT * FROM cursos_formacion WHERE publicada = TRUE';
    const params = [];
    
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }
    if (inscripcion_abierta === 'true') {
      query += ' AND inscripcion_abierta = TRUE';
    }
    
    query += ' ORDER BY fecha_inicio ASC';
    
    const [cursos] = await pool.execute(query, params);
    res.json(cursos);
  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    res.status(500).json({ error: 'Error obteniendo cursos' });
  }
});

// Crear curso (admin)
router.post('/cursos', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, tipo, categoria, duracion, modalidad, fecha_inicio, fecha_fin, horario, lugar, cupos_maximos, costo, requisitos, contenido, instructor, contacto, email, telefono, inscripcion_abierta, publicada, destacada } = req.body;
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO cursos_formacion (titulo, descripcion, tipo, categoria, duracion, modalidad, fecha_inicio, fecha_fin, horario, lugar, cupos_maximos, cupos_disponibles, costo, requisitos, contenido, instructor, contacto, email, telefono, imagen_url, inscripcion_abierta, publicada, destacada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, tipo || null, categoria || null, duracion || null, modalidad || null, fecha_inicio || null, fecha_fin || null, horario || null, lugar || null, cupos_maximos || null, cupos_maximos || null, costo || 0, requisitos || null, JSON.stringify(contenido || []), instructor || null, contacto || null, email || null, telefono || null, imagen_url, inscripcion_abierta !== undefined ? inscripcion_abierta : true, publicada !== undefined ? publicada : true, destacada || false]
    );
    res.status(201).json({ id: result.insertId, message: 'Curso creado exitosamente' });
  } catch (error) {
    console.error('Error creando curso:', error);
    res.status(500).json({ error: 'Error creando curso' });
  }
});

// Inscribirse a un curso
router.post('/inscripciones', async (req, res) => {
  try {
    const { curso_id, nombre_completo, documento, email, telefono, parroquia, observaciones } = req.body;
    
    // Verificar cupos disponibles
    const [curso] = await pool.execute('SELECT cupos_disponibles, inscripcion_abierta FROM cursos_formacion WHERE id = ?', [curso_id]);
    if (curso.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    if (!curso[0].inscripcion_abierta) {
      return res.status(400).json({ error: 'Las inscripciones están cerradas' });
    }
    if (curso[0].cupos_disponibles <= 0) {
      return res.status(400).json({ error: 'No hay cupos disponibles' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO inscripciones_cursos (curso_id, nombre_completo, documento, email, telefono, parroquia, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [curso_id, nombre_completo, documento, email, telefono || null, parroquia || null, observaciones || null]
    );
    
    // Actualizar cupos disponibles
    await pool.execute('UPDATE cursos_formacion SET cupos_disponibles = cupos_disponibles - 1 WHERE id = ?', [curso_id]);
    
    res.status(201).json({ id: result.insertId, message: 'Inscripción realizada exitosamente' });
  } catch (error) {
    console.error('Error creando inscripción:', error);
    res.status(500).json({ error: 'Error creando inscripción' });
  }
});

// Actualizar curso (admin)
router.put('/cursos/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, tipo, categoria, duracion, modalidad, fecha_inicio, fecha_fin, horario, lugar, cupos_maximos, costo, requisitos, contenido, instructor, contacto, email, telefono, inscripcion_abierta, publicada, destacada } = req.body;
    let query = `UPDATE cursos_formacion SET titulo = ?, descripcion = ?, tipo = ?, categoria = ?, duracion = ?, modalidad = ?, fecha_inicio = ?, fecha_fin = ?, horario = ?, lugar = ?, cupos_maximos = ?, costo = ?, requisitos = ?, contenido = ?, instructor = ?, contacto = ?, email = ?, telefono = ?, inscripcion_abierta = ?, publicada = ?, destacada = ?`;
    const params = [titulo, descripcion || null, tipo || null, categoria || null, duracion || null, modalidad || null, fecha_inicio || null, fecha_fin || null, horario || null, lugar || null, cupos_maximos || null, costo || 0, requisitos || null, JSON.stringify(contenido || []), instructor || null, contacto || null, email || null, telefono || null, inscripcion_abierta !== undefined ? inscripcion_abierta : true, publicada !== undefined ? publicada : true, destacada || false];
    
    if (req.file) {
      query += ', imagen_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ message: 'Curso actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando curso:', error);
    res.status(500).json({ error: 'Error actualizando curso' });
  }
});

// Eliminar curso (admin)
router.delete('/cursos/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM cursos_formacion WHERE id = ?', [req.params.id]);
    res.json({ message: 'Curso eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando curso:', error);
    res.status(500).json({ error: 'Error eliminando curso' });
  }
});

// Obtener inscripciones (admin)
router.get('/admin/inscripciones', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { curso_id, estado } = req.query;
    let query = 'SELECT i.*, c.titulo as curso_titulo FROM inscripciones_cursos i LEFT JOIN cursos_formacion c ON i.curso_id = c.id WHERE 1=1';
    const params = [];
    
    if (curso_id) {
      query += ' AND i.curso_id = ?';
      params.push(curso_id);
    }
    if (estado) {
      query += ' AND i.estado = ?';
      params.push(estado);
    }
    
    query += ' ORDER BY i.fecha_inscripcion DESC';
    
    const [inscripciones] = await pool.execute(query, params);
    res.json(inscripciones);
  } catch (error) {
    console.error('Error obteniendo inscripciones:', error);
    res.status(500).json({ error: 'Error obteniendo inscripciones' });
  }
});

module.exports = router;

