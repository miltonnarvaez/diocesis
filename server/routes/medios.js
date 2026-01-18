const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadNoticia } = require('../utils/upload');

const router = express.Router();

// Obtener contenido multimedia
router.get('/contenido', async (req, res) => {
  try {
    const { tipo, categoria } = req.query;
    let query = 'SELECT * FROM contenido_multimedia WHERE publicada = TRUE';
    const params = [];
    
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }
    
    query += ' ORDER BY fecha_publicacion DESC';
    
    const [contenido] = await pool.execute(query, params);
    res.json(contenido);
  } catch (error) {
    console.error('Error obteniendo contenido:', error);
    res.status(500).json({ error: 'Error obteniendo contenido' });
  }
});

// Obtener canales de comunicación
router.get('/canales', async (req, res) => {
  try {
    const { tipo, activo } = req.query;
    let query = 'SELECT * FROM canales_comunicacion WHERE 1=1';
    const params = [];
    
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    if (activo === 'true') {
      query += ' AND activo = TRUE';
    }
    
    query += ' ORDER BY orden ASC, nombre ASC';
    
    const [canales] = await pool.execute(query, params);
    res.json(canales);
  } catch (error) {
    console.error('Error obteniendo canales:', error);
    res.status(500).json({ error: 'Error obteniendo canales' });
  }
});

// CRUD para contenido (admin)
router.post('/contenido', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, tipo, categoria, url, url_embed, duracion, fecha_publicacion, autor, tags, publicada, destacada } = req.body;
    const imagen_miniatura = req.file ? `/uploads/${req.file.filename}` : null;
    
    const [result] = await pool.execute(
      `INSERT INTO contenido_multimedia (titulo, descripcion, tipo, categoria, url, url_embed, duracion, fecha_publicacion, autor, tags, imagen_miniatura, publicada, destacada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion || null, tipo || null, categoria || null, url || null, url_embed || null, duracion || null, fecha_publicacion || new Date(), autor || null, JSON.stringify(tags || []), imagen_miniatura, publicada !== undefined ? publicada : true, destacada || false]
    );
    res.status(201).json({ id: result.insertId, message: 'Contenido creado exitosamente' });
  } catch (error) {
    console.error('Error creando contenido:', error);
    res.status(500).json({ error: 'Error creando contenido' });
  }
});

router.put('/contenido/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, descripcion, tipo, categoria, url, url_embed, duracion, fecha_publicacion, autor, tags, publicada, destacada } = req.body;
    let query = `UPDATE contenido_multimedia SET titulo = ?, descripcion = ?, tipo = ?, categoria = ?, url = ?, url_embed = ?, duracion = ?, fecha_publicacion = ?, autor = ?, tags = ?, publicada = ?, destacada = ?`;
    const params = [titulo, descripcion || null, tipo || null, categoria || null, url || null, url_embed || null, duracion || null, fecha_publicacion || new Date(), autor || null, JSON.stringify(tags || []), publicada !== undefined ? publicada : true, destacada || false];
    
    if (req.file) {
      query += ', imagen_miniatura = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    
    query += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.execute(query, params);
    res.json({ message: 'Contenido actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando contenido:', error);
    res.status(500).json({ error: 'Error actualizando contenido' });
  }
});

router.delete('/contenido/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM contenido_multimedia WHERE id = ?', [req.params.id]);
    res.json({ message: 'Contenido eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando contenido:', error);
    res.status(500).json({ error: 'Error eliminando contenido' });
  }
});

// CRUD para canales (admin)
router.post('/canales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, tipo, url, descripcion, orden, activo } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO canales_comunicacion (nombre, tipo, url, descripcion, orden, activo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, tipo || null, url || null, descripcion || null, orden || 0, activo !== undefined ? activo : true]
    );
    res.status(201).json({ id: result.insertId, message: 'Canal creado exitosamente' });
  } catch (error) {
    console.error('Error creando canal:', error);
    res.status(500).json({ error: 'Error creando canal' });
  }
});

router.put('/canales/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, tipo, url, descripcion, orden, activo } = req.body;
    
    await pool.execute(
      `UPDATE canales_comunicacion SET nombre = ?, tipo = ?, url = ?, descripcion = ?, orden = ?, activo = ? WHERE id = ?`,
      [nombre, tipo || null, url || null, descripcion || null, orden || 0, activo !== undefined ? activo : true, req.params.id]
    );
    res.json({ message: 'Canal actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando canal:', error);
    res.status(500).json({ error: 'Error actualizando canal' });
  }
});

router.delete('/canales/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM canales_comunicacion WHERE id = ?', [req.params.id]);
    res.json({ message: 'Canal eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando canal:', error);
    res.status(500).json({ error: 'Error eliminando canal' });
  }
});

module.exports = router;

