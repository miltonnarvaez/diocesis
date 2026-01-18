const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Obtener todos los documentos (público con filtros)
router.get('/', async (req, res) => {
  try {
    const { tipo_documento, categoria, destacado, busqueda } = req.query;
    let query = 'SELECT * FROM biblioteca_digital WHERE activo = 1';
    const params = [];

    if (tipo_documento) {
      query += ' AND tipo_documento = ?';
      params.push(tipo_documento);
    }

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    if (destacado === 'true') {
      query += ' AND destacado = 1';
    }

    if (busqueda) {
      query += ' AND (titulo LIKE ? OR autor LIKE ? OR descripcion LIKE ?)';
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY destacado DESC, fecha_publicacion DESC, created_at DESC';

    const [documentos] = await pool.execute(query, params);
    res.json(documentos);
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({ error: 'Error al obtener los documentos' });
  }
});

// Obtener documento por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [documentos] = await pool.execute(
      'SELECT * FROM biblioteca_digital WHERE id = ? AND activo = 1',
      [id]
    );

    if (documentos.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(documentos[0]);
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({ error: 'Error al obtener el documento' });
  }
});

// Crear documento (admin)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      titulo,
      autor,
      tipo_documento,
      categoria,
      descripcion,
      archivo_url,
      imagen_portada,
      fecha_documento,
      fecha_publicacion,
      idioma,
      paginas,
      isbn,
      destacado
    } = req.body;

    const query = `
      INSERT INTO biblioteca_digital 
      (titulo, autor, tipo_documento, categoria, descripcion, archivo_url, imagen_portada,
       fecha_documento, fecha_publicacion, idioma, paginas, isbn, destacado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      titulo,
      autor || null,
      tipo_documento || 'otro',
      categoria || null,
      descripcion || null,
      archivo_url || null,
      imagen_portada || null,
      fecha_documento || null,
      fecha_publicacion || new Date().toISOString().split('T')[0],
      idioma || 'es',
      paginas || null,
      isbn || null,
      destacado || false
    ]);

    res.status(201).json({ id: result.insertId, message: 'Documento creado exitosamente' });
  } catch (error) {
    console.error('Error creando documento:', error);
    res.status(500).json({ error: 'Error al crear el documento' });
  }
});

// Actualizar documento (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      autor,
      tipo_documento,
      categoria,
      descripcion,
      archivo_url,
      imagen_portada,
      fecha_documento,
      fecha_publicacion,
      idioma,
      paginas,
      isbn,
      destacado,
      activo
    } = req.body;

    const query = `
      UPDATE biblioteca_digital 
      SET titulo = ?, autor = ?, tipo_documento = ?, categoria = ?, descripcion = ?,
          archivo_url = ?, imagen_portada = ?, fecha_documento = ?, fecha_publicacion = ?,
          idioma = ?, paginas = ?, isbn = ?, destacado = ?, activo = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await pool.execute(query, [
      titulo,
      autor || null,
      tipo_documento,
      categoria || null,
      descripcion || null,
      archivo_url || null,
      imagen_portada || null,
      fecha_documento || null,
      fecha_publicacion || null,
      idioma || 'es',
      paginas || null,
      isbn || null,
      destacado || false,
      activo !== undefined ? activo : true,
      id
    ]);

    res.json({ message: 'Documento actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando documento:', error);
    res.status(500).json({ error: 'Error al actualizar el documento' });
  }
});

// Eliminar documento (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE biblioteca_digital SET activo = 0 WHERE id = ?', [id]);
    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({ error: 'Error al eliminar el documento' });
  }
});

module.exports = router;
