const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los trámites públicos
router.get('/', async (req, res) => {
  try {
    const { categoria, destacado } = req.query;
    
    let query = 'SELECT * FROM tramites WHERE activo = TRUE';
    const params = [];

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    if (destacado === 'true') {
      query += ' AND destacado = TRUE';
    }

    query += ' ORDER BY destacado DESC, orden ASC, nombre ASC';

    const [tramites] = await pool.execute(query, params);
    res.json(tramites);
  } catch (error) {
    console.error('Error obteniendo trámites:', error);
    res.status(500).json({ error: 'Error obteniendo trámites' });
  }
});

// Obtener trámite por ID
router.get('/:id', async (req, res) => {
  try {
    const [tramites] = await pool.execute(
      'SELECT * FROM tramites WHERE id = ? AND activo = TRUE',
      [req.params.id]
    );

    if (tramites.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }

    res.json(tramites[0]);
  } catch (error) {
    console.error('Error obteniendo trámite:', error);
    res.status(500).json({ error: 'Error obteniendo trámite' });
  }
});

// ========== RUTAS ADMIN ==========

// Obtener todos los trámites para admin
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [tramites] = await pool.execute(
      'SELECT * FROM tramites ORDER BY orden ASC, nombre ASC'
    );
    res.json(tramites);
  } catch (error) {
    console.error('Error obteniendo trámites (admin):', error);
    res.status(500).json({ error: 'Error obteniendo trámites' });
  }
});

// Crear nuevo trámite
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      requisitos,
      costo,
      tiempo_respuesta,
      documentos_necesarios,
      pasos,
      contacto_responsable,
      email_contacto,
      telefono_contacto,
      horario_atencion,
      activo,
      destacado,
      orden
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'Nombre es requerido' });
    }

    const requisitosJson = requisitos ? (typeof requisitos === 'string' ? JSON.parse(requisitos) : requisitos) : null;
    const documentosJson = documentos_necesarios ? (typeof documentos_necesarios === 'string' ? JSON.parse(documentos_necesarios) : documentos_necesarios) : null;
    const pasosJson = pasos ? (typeof pasos === 'string' ? JSON.parse(pasos) : pasos) : null;

    const [result] = await pool.execute(
      `INSERT INTO tramites 
       (nombre, descripcion, categoria, requisitos, costo, tiempo_respuesta,
        documentos_necesarios, pasos, contacto_responsable, email_contacto,
        telefono_contacto, horario_atencion, activo, destacado, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        descripcion || null,
        categoria || 'otros',
        requisitosJson ? JSON.stringify(requisitosJson) : null,
        costo || 0.00,
        tiempo_respuesta || null,
        documentosJson ? JSON.stringify(documentosJson) : null,
        pasosJson ? JSON.stringify(pasosJson) : null,
        contacto_responsable || null,
        email_contacto || null,
        telefono_contacto || null,
        horario_atencion || null,
        activo === 'true' || activo === true,
        destacado === 'true' || destacado === true,
        orden || 0
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Trámite creado exitosamente' });
  } catch (error) {
    console.error('Error creando trámite:', error);
    res.status(500).json({ error: 'Error creando trámite' });
  }
});

// Actualizar trámite
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      categoria,
      requisitos,
      costo,
      tiempo_respuesta,
      documentos_necesarios,
      pasos,
      contacto_responsable,
      email_contacto,
      telefono_contacto,
      horario_atencion,
      activo,
      destacado,
      orden
    } = req.body;

    // Obtener trámite actual
    const [tramites] = await pool.execute(
      'SELECT * FROM tramites WHERE id = ?',
      [id]
    );

    if (tramites.length === 0) {
      return res.status(404).json({ error: 'Trámite no encontrado' });
    }

    const tramiteActual = tramites[0];

    const requisitosJson = requisitos ? (typeof requisitos === 'string' ? JSON.parse(requisitos) : requisitos) : tramiteActual.requisitos;
    const documentosJson = documentos_necesarios ? (typeof documentos_necesarios === 'string' ? JSON.parse(documentos_necesarios) : documentos_necesarios) : tramiteActual.documentos_necesarios;
    const pasosJson = pasos ? (typeof pasos === 'string' ? JSON.parse(pasos) : pasos) : tramiteActual.pasos;

    await pool.execute(
      `UPDATE tramites 
       SET nombre = ?, descripcion = ?, categoria = ?, requisitos = ?, costo = ?,
           tiempo_respuesta = ?, documentos_necesarios = ?, pasos = ?,
           contacto_responsable = ?, email_contacto = ?, telefono_contacto = ?,
           horario_atencion = ?, activo = ?, destacado = ?, orden = ?
       WHERE id = ?`,
      [
        nombre || tramiteActual.nombre,
        descripcion !== undefined ? descripcion : tramiteActual.descripcion,
        categoria || tramiteActual.categoria,
        requisitosJson ? JSON.stringify(requisitosJson) : tramiteActual.requisitos,
        costo !== undefined ? costo : tramiteActual.costo,
        tiempo_respuesta || tramiteActual.tiempo_respuesta,
        documentosJson ? JSON.stringify(documentosJson) : tramiteActual.documentos_necesarios,
        pasosJson ? JSON.stringify(pasosJson) : tramiteActual.pasos,
        contacto_responsable || tramiteActual.contacto_responsable,
        email_contacto || tramiteActual.email_contacto,
        telefono_contacto || tramiteActual.telefono_contacto,
        horario_atencion || tramiteActual.horario_atencion,
        activo !== undefined ? (activo === 'true' || activo === true) : tramiteActual.activo,
        destacado !== undefined ? (destacado === 'true' || destacado === true) : tramiteActual.destacado,
        orden !== undefined ? orden : tramiteActual.orden,
        id
      ]
    );

    res.json({ message: 'Trámite actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando trámite:', error);
    res.status(500).json({ error: 'Error actualizando trámite' });
  }
});

// Eliminar trámite
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute('DELETE FROM tramites WHERE id = ?', [id]);

    res.json({ message: 'Trámite eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando trámite:', error);
    res.status(500).json({ error: 'Error eliminando trámite' });
  }
});

module.exports = router;















