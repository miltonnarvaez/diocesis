const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadAutoridad } = require('../utils/upload');

const router = express.Router();

// Obtener todas las autoridades activas
router.get('/', async (req, res) => {
  try {
    const [autoridades] = await pool.execute(
      'SELECT * FROM autoridades WHERE activo = TRUE ORDER BY orden ASC, cargo ASC'
    );
    res.json(autoridades);
  } catch (error) {
    console.error('Error obteniendo autoridades:', error);
    res.status(500).json({ error: 'Error obteniendo autoridades' });
  }
});

// Obtener todas las autoridades para admin (incluyendo inactivas)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [autoridades] = await pool.execute(
      'SELECT * FROM autoridades ORDER BY orden ASC, cargo ASC'
    );
    res.json(autoridades);
  } catch (error) {
    console.error('Error obteniendo autoridades (admin):', error);
    res.status(500).json({ error: 'Error obteniendo autoridades' });
  }
});

// Crear autoridad (admin)
router.post('/', authenticateToken, requireAdmin, uploadAutoridad, async (req, res) => {
  try {
    const { nombre, cargo, orden, email, telefono, foto_url, biografia, activo } = req.body;

    // Procesar foto subida
    let fotoPath = foto_url || null;
    if (req.file) {
      fotoPath = `/uploads/images/${req.file.filename}`;
    }

    const [result] = await pool.execute(
      `INSERT INTO autoridades (nombre, cargo, orden, email, telefono, foto_url, biografia, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        cargo,
        orden || 0,
        email || null,
        telefono || null,
        fotoPath,
        biografia || null,
        activo !== undefined ? activo : true
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Autoridad creada exitosamente' });
  } catch (error) {
    console.error('Error creando autoridad:', error);
    res.status(500).json({ error: 'Error creando autoridad' });
  }
});

// Actualizar autoridad (admin)
router.put('/:id', authenticateToken, requireAdmin, uploadAutoridad, async (req, res) => {
  try {
    const { nombre, cargo, orden, email, telefono, foto_url, biografia, activo } = req.body;

    // Procesar foto subida
    let fotoPath = foto_url || null;
    if (req.file) {
      fotoPath = `/uploads/images/${req.file.filename}`;
    } else if (foto_url) {
      fotoPath = foto_url;
    }

    await pool.execute(
      `UPDATE autoridades 
       SET nombre = ?, cargo = ?, orden = ?, email = ?, telefono = ?, foto_url = ?, biografia = ?, activo = ? 
       WHERE id = ?`,
      [
        nombre,
        cargo,
        orden || 0,
        email || null,
        telefono || null,
        fotoPath,
        biografia || null,
        activo !== undefined ? activo : true,
        req.params.id
      ]
    );

    res.json({ message: 'Autoridad actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando autoridad:', error);
    res.status(500).json({ error: 'Error actualizando autoridad' });
  }
});

// Activar/Desactivar autoridad (admin)
router.patch('/:id/activar', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { activo } = req.body;
    await pool.execute(
      'UPDATE autoridades SET activo = ? WHERE id = ?',
      [activo, req.params.id]
    );
    res.json({ message: `Autoridad ${activo ? 'activada' : 'desactivada'} exitosamente` });
  } catch (error) {
    console.error('Error cambiando estado de autoridad:', error);
    res.status(500).json({ error: 'Error cambiando estado de autoridad' });
  }
});

// Eliminar autoridad (admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM autoridades WHERE id = ?', [req.params.id]);
    res.json({ message: 'Autoridad eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando autoridad:', error);
    res.status(500).json({ error: 'Error eliminando autoridad' });
  }
});

module.exports = router;

