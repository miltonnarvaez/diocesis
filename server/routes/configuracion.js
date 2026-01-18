const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar multer para documentos PDF
const documentsDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'documento-institucional-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadDocumento = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
}).single('documentos');

const router = express.Router();

// Obtener toda la configuración
router.get('/', async (req, res) => {
  try {
    const [config] = await pool.execute('SELECT * FROM configuracion');
    const configObj = {};
    config.forEach(item => {
      configObj[item.clave] = item.valor;
    });
    res.json(configObj);
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ error: 'Error obteniendo configuración' });
  }
});

// Obtener valor de configuración por clave
router.get('/:clave', async (req, res) => {
  try {
    const [config] = await pool.execute(
      'SELECT * FROM configuracion WHERE clave = ?',
      [req.params.clave]
    );

    if (config.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    res.json({ clave: config[0].clave, valor: config[0].valor });
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ error: 'Error obteniendo configuración' });
  }
});

// Actualizar configuración (admin)
router.put('/:clave', authenticateToken, requireAdmin, (req, res, next) => {
  // Solo usar multer si es para documento_institucional_url
  if (req.params.clave === 'documento_institucional_url') {
    uploadDocumento(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  try {
    let { valor } = req.body;

    // Si se subió un archivo para documento_institucional_url, usar la ruta del archivo
    if (req.params.clave === 'documento_institucional_url' && req.file) {
      valor = `/uploads/documents/${req.file.filename}`;
    }

    // Verificar si la clave existe
    const [existing] = await pool.execute(
      'SELECT * FROM configuracion WHERE clave = ?',
      [req.params.clave]
    );

    if (existing.length === 0) {
      // Si no existe, crear el registro
      await pool.execute(
        'INSERT INTO configuracion (clave, valor) VALUES (?, ?)',
        [req.params.clave, valor]
      );
    } else {
      // Si existe, actualizar
      await pool.execute(
        'UPDATE configuracion SET valor = ? WHERE clave = ?',
        [valor, req.params.clave]
      );
    }

    res.json({ message: 'Configuración actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({ error: 'Error actualizando configuración' });
  }
});

module.exports = router;




