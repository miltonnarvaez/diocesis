const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadNoticia } = require('../utils/upload');

const router = express.Router();

// Obtener programas para familias
router.get('/programas', async (req, res) => {
  try {
    const { tipo, inscripcion_abierta } = req.query;
    let query = 'SELECT * FROM programas_familias WHERE publicada = TRUE';
    const params = [];
    
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    if (inscripcion_abierta === 'true') {
      query += ' AND inscripcion_abierta = TRUE';
    }
    
    query += ' ORDER BY fecha_inicio ASC';
    
    const [programas] = await pool.execute(query, params);
    res.json(programas);
  } catch (error) {
    console.error('Error obteniendo programas:', error);
    res.status(500).json({ error: 'Error obteniendo programas' });
  }
});

// Inscribirse a un programa
router.post('/inscripciones', async (req, res) => {
  try {
    const { programa_id, nombre_familia, nombre_contacto, documento, email, telefono, numero_miembros, observaciones } = req.body;
    
    // Verificar cupos disponibles
    const [programa] = await pool.execute('SELECT cupos_disponibles, inscripcion_abierta FROM programas_familias WHERE id = ?', [programa_id]);
    if (programa.length === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }
    if (!programa[0].inscripcion_abierta) {
      return res.status(400).json({ error: 'Las inscripciones están cerradas' });
    }
    if (programa[0].cupos_disponibles <= 0) {
      return res.status(400).json({ error: 'No hay cupos disponibles' });
    }
    
    const [result] = await pool.execute(
      `INSERT INTO inscripciones_familias (programa_id, nombre_familia, nombre_contacto, documento, email, telefono, numero_miembros, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [programa_id, nombre_familia, nombre_contacto, documento, email, telefono || null, numero_miembros || 1, observaciones || null]
    );
    
    // Actualizar cupos disponibles
    await pool.execute('UPDATE programas_familias SET cupos_disponibles = cupos_disponibles - 1 WHERE id = ?', [programa_id]);
    
    res.status(201).json({ id: result.insertId, message: 'Inscripción realizada exitosamente' });
  } catch (error) {
    console.error('Error creando inscripción:', error);
    res.status(500).json({ error: 'Error creando inscripción' });
  }
});

// CRUD para programas (admin)
router.post('/admin/programas', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, tipo, objetivo, duracion, modalidad, fecha_inicio, fecha_fin, horario, lugar, cupos_maximos, costo, requisitos, contenido, facilitador, contacto, email, telefono, inscripcion_abierta, publicada, destacada } = req.body;
    const imagen_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO programas_familias (titulo, descripcion, tipo, objetivo, duracion, modalidad, fecha_inicio, fecha_fin, horario, lugar, cupos_maximos, cupos_disponibles, costo, requisitos, contenido, facilitador, contacto, email, telefono, imagen_url, inscripcion_abierta, publicada, destacada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, tipo || null, objetivo || null, duracion || null, modalidad || null, fecha_inicio || null, fecha_fin || null, horario || null, lugar || null, cupos_maximos || null, cupos_maximos || null, costo || 0, requisitos || null, JSON.stringify(contenido || []), facilitador || null, contacto || null, email || null, telefono || null, imagen_url, inscripcion_abierta !== undefined ? inscripcion_abierta : true, publicada !== undefined ? publicada : true, destacada || false]
    );
    res.status(201).json({ id: result.insertId, message: 'Programa creado exitosamente' });
  } catch (error) {
    console.error('Error creando programa:', error);
    res.status(500).json({ error: 'Error creando programa' });
  }
});

router.put('/admin/programas/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, tipo, objetivo, duracion, modalidad, fecha_inicio, fecha_fin, horario, lugar, cupos_maximos, costo, requisitos, contenido, facilitador, contacto, email, telefono, inscripcion_abierta, publicada, destacada } = req.body;
    let query = `UPDATE programas_familias SET titulo = ?, descripcion = ?, tipo = ?, objetivo = ?, duracion = ?, modalidad = ?, fecha_inicio = ?, fecha_fin = ?, horario = ?, lugar = ?, cupos_maximos = ?, costo = ?, requisitos = ?, contenido = ?, facilitador = ?, contacto = ?, email = ?, telefono = ?, inscripcion_abierta = ?, publicada = ?, destacada = ?`;
    const params = [titulo, descripcion || null, tipo || null, objetivo || null, duracion || null, modalidad || null, fecha_inicio || null, fecha_fin || null, horario || null, lugar || null, cupos_maximos || null, costo || 0, requisitos || null, JSON.stringify(contenido || []), facilitador || null, contacto || null, email || null, telefono || null, inscripcion_abierta !== undefined ? inscripcion_abierta : true, publicada !== undefined ? publicada : true, destacada || false];
    
    if (req.file) {
      query += ', imagen_url = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ message: 'Programa actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando programa:', error);
    res.status(500).json({ error: 'Error actualizando programa' });
  }
});

router.delete('/admin/programas/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM programas_familias WHERE id = ?', [req.params.id]);
    res.json({ message: 'Programa eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando programa:', error);
    res.status(500).json({ error: 'Error eliminando programa' });
  }
});

// Obtener inscripciones (admin)
router.get('/admin/inscripciones', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { programa_id } = req.query;
    let query = 'SELECT i.*, p.titulo as programa_titulo FROM inscripciones_familias i LEFT JOIN programas_familias p ON i.programa_id = p.id WHERE 1=1';
    const params = [];
    
    if (programa_id) {
      query += ' AND i.programa_id = ?';
      params.push(programa_id);
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

