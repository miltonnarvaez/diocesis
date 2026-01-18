const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, requireTransparenciaPermission } = require('../middleware/auth');
const { uploadTransparencia } = require('../utils/upload');

const router = express.Router();

// Obtener todos los documentos de transparencia públicos
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    let query = 'SELECT * FROM documentos_transparencia WHERE publicada = TRUE';
    const params = [];

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    query += ' ORDER BY fecha DESC, creado_en DESC';

    const [documentos] = await pool.execute(query, params);
    res.json(documentos);
  } catch (error) {
    console.error('Error obteniendo documentos de transparencia:', error);
    res.status(500).json({ error: 'Error obteniendo documentos de transparencia' });
  }
});

// Obtener todos los documentos para admin (incluyendo no publicados)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [documentos] = await pool.execute(
      'SELECT * FROM documentos_transparencia ORDER BY fecha DESC, creado_en DESC'
    );
    res.json(documentos);
  } catch (error) {
    console.error('Error obteniendo documentos de transparencia (admin):', error);
    res.status(500).json({ error: 'Error obteniendo documentos de transparencia' });
  }
});

// Obtener documento por ID
router.get('/:id', async (req, res) => {
  try {
    const [documentos] = await pool.execute(
      'SELECT * FROM documentos_transparencia WHERE id = ? AND publicada = TRUE',
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

// Crear documento (con permisos por categoría)
router.post('/', authenticateToken, uploadTransparencia, async (req, res, next) => {
  try {
    const { categoria, titulo, descripcion, archivo_url, fecha, publicada } = req.body;

    if (!categoria) {
      return res.status(400).json({ error: 'La categoría es requerida' });
    }

    // Procesar archivo subido
    let archivoPath = archivo_url || null;
    if (req.file) {
      archivoPath = `/uploads/documents/${req.file.filename}`;
    }

    // Verificar permisos para la categoría específica
    if (req.user.rol !== 'admin') {
      return requireTransparenciaPermission(categoria, 'crear')(req, res, async () => {
        try {
          const [result] = await pool.execute(
            'INSERT INTO documentos_transparencia (categoria, titulo, descripcion, archivo_url, fecha, publicada) VALUES (?, ?, ?, ?, ?, ?)',
            [categoria, titulo, descripcion || null, archivoPath, fecha || null, publicada || false]
          );

          res.status(201).json({ id: result.insertId, message: 'Documento creado exitosamente' });
        } catch (error) {
          console.error('Error creando documento:', error);
          res.status(500).json({ error: 'Error creando documento' });
        }
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO documentos_transparencia (categoria, titulo, descripcion, archivo_url, fecha, publicada) VALUES (?, ?, ?, ?, ?, ?)',
      [categoria, titulo, descripcion || null, archivoPath, fecha || null, publicada || false]
    );

    res.status(201).json({ id: result.insertId, message: 'Documento creado exitosamente' });
  } catch (error) {
    console.error('Error creando documento:', error);
    res.status(500).json({ error: 'Error creando documento' });
  }
});

// Actualizar documento (con permisos por categoría)
router.put('/:id', authenticateToken, uploadTransparencia, async (req, res) => {
  try {
    const { categoria, titulo, descripcion, archivo_url, fecha, publicada } = req.body;

    // Obtener la categoría del documento existente
    const [documentos] = await pool.execute(
      'SELECT categoria FROM documentos_transparencia WHERE id = ?',
      [req.params.id]
    );
    
    if (documentos.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const categoriaDocumento = categoria || documentos[0].categoria;

    // Procesar archivo subido
    let archivoPath = archivo_url || null;
    if (req.file) {
      archivoPath = `/uploads/documents/${req.file.filename}`;
    } else if (archivo_url) {
      archivoPath = archivo_url;
    }

    // Verificar permisos para la categoría específica
    if (req.user.rol !== 'admin') {
      return requireTransparenciaPermission(categoriaDocumento, 'editar')(req, res, async () => {
        try {
          await pool.execute(
            'UPDATE documentos_transparencia SET categoria = ?, titulo = ?, descripcion = ?, archivo_url = ?, fecha = ?, publicada = ? WHERE id = ?',
            [categoriaDocumento, titulo, descripcion || null, archivoPath, fecha || null, publicada || false, req.params.id]
          );

          res.json({ message: 'Documento actualizado exitosamente' });
        } catch (error) {
          console.error('Error actualizando documento:', error);
          res.status(500).json({ error: 'Error actualizando documento' });
        }
      });
    }

    await pool.execute(
      'UPDATE documentos_transparencia SET categoria = ?, titulo = ?, descripcion = ?, archivo_url = ?, fecha = ?, publicada = ? WHERE id = ?',
      [categoriaDocumento, titulo, descripcion || null, archivoPath, fecha || null, publicada || false, req.params.id]
    );

    res.json({ message: 'Documento actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando documento:', error);
    res.status(500).json({ error: 'Error actualizando documento' });
  }
});

// Publicar/Despublicar documento (admin)
router.patch('/:id/publicar', authenticateToken, async (req, res) => {
  try {
    const { publicada } = req.body;
    
    // Obtener la categoría del documento
    const [documentos] = await pool.execute(
      'SELECT categoria FROM documentos_transparencia WHERE id = ?',
      [req.params.id]
    );
    
    if (documentos.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const categoriaDocumento = documentos[0].categoria;

    // Verificar permisos
    if (req.user.rol !== 'admin') {
      return requireTransparenciaPermission(categoriaDocumento, 'publicar')(req, res, async () => {
        try {
          await pool.execute(
            'UPDATE documentos_transparencia SET publicada = ? WHERE id = ?',
            [publicada, req.params.id]
          );
          res.json({ message: `Documento ${publicada ? 'publicado' : 'despublicado'} exitosamente` });
        } catch (error) {
          console.error('Error cambiando estado de publicación:', error);
          res.status(500).json({ error: 'Error cambiando estado de publicación' });
        }
      });
    }

    await pool.execute(
      'UPDATE documentos_transparencia SET publicada = ? WHERE id = ?',
      [publicada, req.params.id]
    );
    res.json({ message: `Documento ${publicada ? 'publicado' : 'despublicado'} exitosamente` });
  } catch (error) {
    console.error('Error cambiando estado de publicación:', error);
    res.status(500).json({ error: 'Error cambiando estado de publicación' });
  }
});

// Eliminar documento (con permisos por categoría)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Obtener la categoría del documento
    const [documentos] = await pool.execute(
      'SELECT categoria FROM documentos_transparencia WHERE id = ?',
      [req.params.id]
    );
    
    if (documentos.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const categoriaDocumento = documentos[0].categoria;

    // Verificar permisos para la categoría específica
    if (req.user.rol !== 'admin') {
      return requireTransparenciaPermission(categoriaDocumento, 'eliminar')(req, res, async () => {
        try {
          await pool.execute('DELETE FROM documentos_transparencia WHERE id = ?', [req.params.id]);
          res.json({ message: 'Documento eliminado exitosamente' });
        } catch (error) {
          console.error('Error eliminando documento:', error);
          res.status(500).json({ error: 'Error eliminando documento' });
        }
      });
    }

    await pool.execute('DELETE FROM documentos_transparencia WHERE id = ?', [req.params.id]);
    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({ error: 'Error eliminando documento' });
  }
});

module.exports = router;


