const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadGaceta } = require('../utils/upload');

const router = express.Router();

// Obtener todos los documentos de gaceta públicos
router.get('/', async (req, res) => {
  try {
    const { tipo } = req.query;
    let query = 'SELECT * FROM documentos_gaceta WHERE publicada = TRUE';
    const params = [];

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    query += ' ORDER BY fecha DESC, creado_en DESC';

    const [documentos] = await pool.execute(query, params);
    res.json(documentos);
  } catch (error) {
    console.error('Error obteniendo documentos de gaceta:', error);
    res.status(500).json({ error: 'Error obteniendo documentos de gaceta' });
  }
});

// Obtener todos los documentos para admin (incluyendo no publicados)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [documentos] = await pool.execute(
      'SELECT * FROM documentos_gaceta ORDER BY fecha DESC, creado_en DESC'
    );
    res.json(documentos);
  } catch (error) {
    console.error('Error obteniendo documentos de gaceta (admin):', error);
    res.status(500).json({ error: 'Error obteniendo documentos de gaceta' });
  }
});

// Obtener documento por ID
router.get('/:id', async (req, res) => {
  try {
    const [documentos] = await pool.execute(
      'SELECT * FROM documentos_gaceta WHERE id = ? AND publicada = TRUE',
      [req.params.id]
    );

    if (documentos.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(documentos[0]);
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({ error: 'Error obteniendo documento' });
  }
});

// Crear documento (admin)
router.post('/', authenticateToken, requireAdmin, uploadGaceta, async (req, res) => {
  try {
    const { tipo, numero, titulo, descripcion, archivo_url, fecha, publicada } = req.body;

    // Procesar archivo subido
    let archivoPath = archivo_url || null;
    if (req.file) {
      archivoPath = `/uploads/documents/${req.file.filename}`;
    }

    const [result] = await pool.execute(
      'INSERT INTO documentos_gaceta (tipo, numero, titulo, descripcion, archivo_url, fecha, publicada) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [tipo, numero || null, titulo, descripcion || null, archivoPath, fecha || null, publicada || false]
    );

    res.status(201).json({ id: result.insertId, message: 'Documento creado exitosamente' });
  } catch (error) {
    console.error('Error creando documento:', error);
    res.status(500).json({ error: 'Error creando documento' });
  }
});

// Actualizar documento (admin)
router.put('/:id', authenticateToken, requireAdmin, uploadGaceta, async (req, res) => {
  try {
    const { tipo, numero, titulo, descripcion, archivo_url, fecha, publicada } = req.body;

    // Procesar archivo subido
    let archivoPath = archivo_url || null;
    if (req.file) {
      archivoPath = `/uploads/documents/${req.file.filename}`;
    } else if (archivo_url) {
      archivoPath = archivo_url;
    }

    await pool.execute(
      'UPDATE documentos_gaceta SET tipo = ?, numero = ?, titulo = ?, descripcion = ?, archivo_url = ?, fecha = ?, publicada = ? WHERE id = ?',
      [tipo, numero || null, titulo, descripcion || null, archivoPath, fecha || null, publicada || false, req.params.id]
    );

    res.json({ message: 'Documento actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando documento:', error);
    res.status(500).json({ error: 'Error actualizando documento' });
  }
});

// Publicar/Despublicar documento (admin)
router.patch('/:id/publicar', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { publicada } = req.body;
    await pool.execute(
      'UPDATE documentos_gaceta SET publicada = ? WHERE id = ?',
      [publicada, req.params.id]
    );
    res.json({ message: `Documento ${publicada ? 'publicado' : 'despublicado'} exitosamente` });
  } catch (error) {
    console.error('Error cambiando estado de publicación:', error);
    res.status(500).json({ error: 'Error cambiando estado de publicación' });
  }
});

// Eliminar documento (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM documentos_gaceta WHERE id = ?', [req.params.id]);
    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({ error: 'Error eliminando documento' });
  }
});

module.exports = router;


