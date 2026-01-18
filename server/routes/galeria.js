const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadGaleria } = require('../utils/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ========== RUTAS PÚBLICAS ==========

// Obtener todas las imágenes/videos públicas
router.get('/', async (req, res) => {
  try {
    const { categoria, tipo, destacada, fecha_desde, fecha_hasta } = req.query;
    
    let query = 'SELECT * FROM galeria_multimedia WHERE publicada = TRUE';
    const params = [];

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    if (destacada === 'true') {
      query += ' AND destacada = TRUE';
    }

    if (fecha_desde) {
      query += ' AND fecha_evento >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND fecha_evento <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY destacada DESC, orden ASC, fecha_evento DESC, creado_en DESC';

    const [items] = await pool.execute(query, params);
    res.json(items);
  } catch (error) {
    console.error('Error obteniendo galería:', error);
    res.status(500).json({ error: 'Error obteniendo galería multimedia' });
  }
});

// Obtener todas las categorías (ANTES de /:id)
router.get('/categorias/list', async (req, res) => {
  try {
    const [categorias] = await pool.execute(
      'SELECT * FROM galeria_categorias WHERE activa = TRUE ORDER BY orden ASC'
    );
    res.json(categorias);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
});

// ========== RUTAS ADMIN ==========

// Obtener todos los items para admin (ANTES de /:id)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [items] = await pool.execute(
      'SELECT * FROM galeria_multimedia ORDER BY creado_en DESC'
    );
    res.json(items);
  } catch (error) {
    console.error('Error obteniendo galería (admin):', error);
    console.error('Detalles del error:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ 
      error: 'Error obteniendo galería',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Obtener item por ID (AL FINAL, después de todas las rutas específicas)
router.get('/:id', async (req, res) => {
  try {
    const [items] = await pool.execute(
      'SELECT * FROM galeria_multimedia WHERE id = ? AND publicada = TRUE',
      [req.params.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    res.json(items[0]);
  } catch (error) {
    console.error('Error obteniendo item de galería:', error);
    res.status(500).json({ error: 'Error obteniendo item de galería' });
  }
});

// Crear nuevo item
router.post('/admin', authenticateToken, requireAdmin, uploadGaleria.fields([
  { name: 'archivo', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      tipo,
      categoria,
      fecha_evento,
      publicada,
      destacada,
      orden,
      tags
    } = req.body;

    if (!titulo || !tipo) {
      return res.status(400).json({ error: 'Título y tipo son requeridos' });
    }

    if (!req.files || !req.files.archivo || req.files.archivo.length === 0) {
      return res.status(400).json({ error: 'Archivo es requerido' });
    }

    const archivo = req.files.archivo[0];
    const thumbnail = req.files.thumbnail && req.files.thumbnail.length > 0 
      ? req.files.thumbnail[0] 
      : null;

    const archivoUrl = `/uploads/galeria/${archivo.filename}`;
    const thumbnailUrl = thumbnail ? `/uploads/galeria/${thumbnail.filename}` : null;

    // Si es una imagen y no hay thumbnail, usar la misma imagen
    const finalThumbnailUrl = thumbnailUrl || (tipo === 'foto' ? archivoUrl : null);

    const tagsJson = tags ? JSON.parse(tags) : null;

    const [result] = await pool.execute(
      `INSERT INTO galeria_multimedia 
       (titulo, descripcion, tipo, archivo_url, thumbnail_url, categoria, fecha_evento, publicada, destacada, orden, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descripcion || null,
        tipo,
        archivoUrl,
        finalThumbnailUrl,
        categoria || 'otros',
        fecha_evento || null,
        publicada === 'true' || publicada === true,
        destacada === 'true' || destacada === true,
        orden || 0,
        tagsJson ? JSON.stringify(tagsJson) : null
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Item creado exitosamente' });
  } catch (error) {
    console.error('Error creando item de galería:', error);
    res.status(500).json({ error: 'Error creando item de galería' });
  }
});

// Actualizar item
router.put('/admin/:id', authenticateToken, requireAdmin, uploadGaleria.fields([
  { name: 'archivo', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      tipo,
      categoria,
      fecha_evento,
      publicada,
      destacada,
      orden,
      tags
    } = req.body;

    // Obtener item actual
    const [items] = await pool.execute(
      'SELECT * FROM galeria_multimedia WHERE id = ?',
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const itemActual = items[0];

    // Manejar archivos
    let archivoUrl = itemActual.archivo_url;
    let thumbnailUrl = itemActual.thumbnail_url;

    if (req.files && req.files.archivo && req.files.archivo.length > 0) {
      // Eliminar archivo anterior si existe
      if (itemActual.archivo_url) {
        const oldPath = path.join(__dirname, '..', itemActual.archivo_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      archivoUrl = `/uploads/galeria/${req.files.archivo[0].filename}`;
    }

    if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
      // Eliminar thumbnail anterior si existe
      if (itemActual.thumbnail_url) {
        const oldPath = path.join(__dirname, '..', itemActual.thumbnail_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      thumbnailUrl = `/uploads/galeria/${req.files.thumbnail[0].filename}`;
    }

    const tagsJson = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : null;

    await pool.execute(
      `UPDATE galeria_multimedia 
       SET titulo = ?, descripcion = ?, tipo = ?, archivo_url = ?, thumbnail_url = ?,
           categoria = ?, fecha_evento = ?, publicada = ?, destacada = ?, orden = ?, tags = ?
       WHERE id = ?`,
      [
        titulo || itemActual.titulo,
        descripcion !== undefined ? descripcion : itemActual.descripcion,
        tipo || itemActual.tipo,
        archivoUrl,
        thumbnailUrl,
        categoria || itemActual.categoria,
        fecha_evento || itemActual.fecha_evento,
        publicada !== undefined ? (publicada === 'true' || publicada === true) : itemActual.publicada,
        destacada !== undefined ? (destacada === 'true' || destacada === true) : itemActual.destacada,
        orden !== undefined ? orden : itemActual.orden,
        tagsJson ? JSON.stringify(tagsJson) : itemActual.tags,
        id
      ]
    );

    res.json({ message: 'Item actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando item de galería:', error);
    res.status(500).json({ error: 'Error actualizando item de galería' });
  }
});

// Eliminar item
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener item para eliminar archivos
    const [items] = await pool.execute(
      'SELECT * FROM galeria_multimedia WHERE id = ?',
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const item = items[0];

    // Eliminar archivos físicos
    if (item.archivo_url) {
      const archivoPath = path.join(__dirname, '..', item.archivo_url);
      if (fs.existsSync(archivoPath)) {
        fs.unlinkSync(archivoPath);
      }
    }

    if (item.thumbnail_url && item.thumbnail_url !== item.archivo_url) {
      const thumbnailPath = path.join(__dirname, '..', item.thumbnail_url);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await pool.execute('DELETE FROM galeria_multimedia WHERE id = ?', [id]);

    res.json({ message: 'Item eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando item de galería:', error);
    res.status(500).json({ error: 'Error eliminando item de galería' });
  }
});

module.exports = router;

