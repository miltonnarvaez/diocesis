const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadNoticia } = require('../utils/upload');
const path = require('path');

const router = express.Router();

// Obtener todas las noticias (admin puede ver todas, público solo publicadas)
router.get('/', optionalAuth, async (req, res) => {
  try {
    // Si está autenticado como admin, mostrar todas las noticias
    if (req.user && req.user.rol === 'admin') {
      const [noticias] = await pool.execute(
        'SELECT * FROM noticias ORDER BY fecha_publicacion DESC, creado_en DESC'
      );
      return res.json(noticias);
    }
    // Si no está autenticado o no es admin, solo mostrar publicadas
    const [noticias] = await pool.execute(
      'SELECT * FROM noticias WHERE publicada = TRUE ORDER BY fecha_publicacion DESC, creado_en DESC'
    );
    res.json(noticias);
  } catch (error) {
    console.error('Error obteniendo noticias:', error);
    res.status(500).json({ error: 'Error obteniendo noticias' });
  }
});

// Obtener noticia por ID
router.get('/:id', async (req, res) => {
  try {
    const [noticias] = await pool.execute(
      'SELECT * FROM noticias WHERE id = ? AND publicada = TRUE',
      [req.params.id]
    );

    if (noticias.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    // Incrementar visitas
    await pool.execute(
      'UPDATE noticias SET visitas = visitas + 1 WHERE id = ?',
      [req.params.id]
    );

    res.json(noticias[0]);
  } catch (error) {
    console.error('Error obteniendo noticia:', error);
    res.status(500).json({ error: 'Error obteniendo noticia' });
  }
});

// Crear noticia (admin) - con subida de archivos
router.post('/', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, contenido, resumen, categoria, fecha_publicacion, publicada } = req.body;

    // Procesar imagen subida
    let imagen_url = null;
    if (req.files && req.files.imagen && req.files.imagen.length > 0) {
      imagen_url = `/uploads/images/${req.files.imagen[0].filename}`;
    }

    // Procesar documentos adicionales
    let documentos_adicionales = null;
    if (req.files && req.files.documentos && req.files.documentos.length > 0) {
      documentos_adicionales = JSON.stringify(
        req.files.documentos.map(file => ({
          nombre: file.originalname,
          ruta: `/uploads/documents/${file.filename}`,
          tamaño: file.size,
          tipo: file.mimetype
        }))
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO noticias (titulo, contenido, resumen, imagen_url, categoria, autor_id, fecha_publicacion, publicada, documentos_adicionales) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [titulo, contenido, resumen || null, imagen_url, categoria || 'Noticias', req.user.id, fecha_publicacion || null, publicada === 'true' || publicada === true, documentos_adicionales]
    );

    res.status(201).json({ id: result.insertId, message: 'Noticia creada exitosamente' });
  } catch (error) {
    console.error('Error creando noticia:', error);
    res.status(500).json({ error: 'Error creando noticia: ' + error.message });
  }
});

// Actualizar noticia (admin) - con subida de archivos
router.put('/:id', authenticateToken, requireAdmin, uploadNoticia, async (req, res) => {
  try {
    const { titulo, contenido, resumen, imagen_url, categoria, fecha_publicacion, publicada, documentos_existentes } = req.body;

    // Obtener noticia actual
    const [noticias] = await pool.execute('SELECT imagen_url, documentos_adicionales FROM noticias WHERE id = ?', [req.params.id]);
    if (noticias.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    let imagenFinal = imagen_url || noticias[0].imagen_url;
    // Si se subió una nueva imagen, usar la nueva
    if (req.files && req.files.imagen && req.files.imagen.length > 0) {
      imagenFinal = `/uploads/images/${req.files.imagen[0].filename}`;
    }

    // Procesar documentos adicionales
    let documentos_adicionales = noticias[0].documentos_adicionales;
    
    // Si hay documentos existentes (JSON string), parsearlos
    let documentosArray = [];
    if (documentos_existentes) {
      try {
        documentosArray = JSON.parse(documentos_existentes);
      } catch (e) {
        documentosArray = [];
      }
    } else if (documentos_adicionales) {
      try {
        documentosArray = JSON.parse(documentos_adicionales);
      } catch (e) {
        documentosArray = [];
      }
    }

    // Agregar nuevos documentos subidos
    if (req.files && req.files.documentos && req.files.documentos.length > 0) {
      const nuevosDocumentos = req.files.documentos.map(file => ({
        nombre: file.originalname,
        ruta: `/uploads/documents/${file.filename}`,
        tamaño: file.size,
        tipo: file.mimetype
      }));
      documentosArray = [...documentosArray, ...nuevosDocumentos];
    }

    documentos_adicionales = documentosArray.length > 0 ? JSON.stringify(documentosArray) : null;

    await pool.execute(
      'UPDATE noticias SET titulo = ?, contenido = ?, resumen = ?, imagen_url = ?, categoria = ?, fecha_publicacion = ?, publicada = ?, documentos_adicionales = ? WHERE id = ?',
      [titulo, contenido, resumen || null, imagenFinal, categoria || 'Noticias', fecha_publicacion || null, publicada === 'true' || publicada === true, documentos_adicionales, req.params.id]
    );

    res.json({ message: 'Noticia actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando noticia:', error);
    res.status(500).json({ error: 'Error actualizando noticia: ' + error.message });
  }
});

// Cambiar estado de publicación (admin)
router.patch('/:id/publicar', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { publicada } = req.body;
    await pool.execute('UPDATE noticias SET publicada = ? WHERE id = ?', [publicada === true || publicada === 'true', req.params.id]);
    res.json({ message: `Noticia ${publicada ? 'publicada' : 'despublicada'} exitosamente` });
  } catch (error) {
    console.error('Error cambiando estado de publicación:', error);
    res.status(500).json({ error: 'Error cambiando estado de publicación' });
  }
});

// Eliminar noticia (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Obtener información de archivos antes de eliminar
    const [noticias] = await pool.execute('SELECT imagen_url, documentos_adicionales FROM noticias WHERE id = ?', [req.params.id]);
    
    await pool.execute('DELETE FROM noticias WHERE id = ?', [req.params.id]);
    
    // Opcional: Eliminar archivos físicos (comentado por seguridad)
    // const fs = require('fs');
    // if (noticias[0]?.imagen_url) {
    //   const imagePath = path.join(__dirname, '..', noticias[0].imagen_url);
    //   if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    // }
    
    res.json({ message: 'Noticia eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando noticia:', error);
    res.status(500).json({ error: 'Error eliminando noticia' });
  }
});

module.exports = router;


