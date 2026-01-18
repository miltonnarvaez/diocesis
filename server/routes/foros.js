const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Lista de palabras prohibidas (básico)
const palabrasProhibidas = ['spam', 'estafa', 'fraude']; // Expandir según necesidad

// Función para verificar contenido inapropiado
const contienePalabrasProhibidas = (texto) => {
  const textoLower = texto.toLowerCase();
  return palabrasProhibidas.some(palabra => textoLower.includes(palabra));
};

// Obtener foros activos (público)
router.get('/', async (req, res) => {
  try {
    const { categoria } = req.query;
    
    let query = `
      SELECT 
        f.*,
        u.nombre as creado_por_nombre,
        COUNT(DISTINCT c.id) as total_comentarios,
        COUNT(DISTINCT CASE WHEN c.aprobado = TRUE THEN c.id END) as comentarios_aprobados
      FROM foros f
      LEFT JOIN usuarios u ON f.creado_por_id = u.id
      LEFT JOIN foro_comentarios c ON f.id = c.foro_id
      WHERE f.activo = TRUE
      AND (f.fecha_fin IS NULL OR f.fecha_fin >= CURDATE())
    `;
    const params = [];

    if (categoria) {
      query += ' AND f.categoria = ?';
      params.push(categoria);
    }

    query += ' GROUP BY f.id ORDER BY f.destacado DESC, f.fecha_inicio DESC';

    const [foros] = await pool.execute(query, params);
    res.json(foros);
  } catch (error) {
    console.error('Error obteniendo foros:', error);
    res.status(500).json({ error: 'Error al obtener los foros' });
  }
});

// Obtener foro por ID con comentarios aprobados (público)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener foro
    const [foros] = await pool.execute(
      `SELECT 
        f.*,
        u.nombre as creado_por_nombre
       FROM foros f
       LEFT JOIN usuarios u ON f.creado_por_id = u.id
       WHERE f.id = ? AND f.activo = TRUE`,
      [id]
    );

    if (foros.length === 0) {
      return res.status(404).json({ error: 'Foro no encontrado' });
    }

    const foro = foros[0];

    // Obtener comentarios aprobados (solo comentarios principales, no respuestas)
    const [comentarios] = await pool.execute(
      `SELECT 
        c.*,
        COUNT(DISTINCT v.id) as total_likes,
        COUNT(DISTINCT CASE WHEN v.tipo = 'dislike' THEN v.id END) as total_dislikes
       FROM foro_comentarios c
       LEFT JOIN foro_votos v ON c.id = v.comentario_id
       WHERE c.foro_id = ? 
       AND c.comentario_padre_id IS NULL
       AND c.aprobado = TRUE
       GROUP BY c.id
       ORDER BY c.creado_en DESC`,
      [id]
    );

    // Obtener respuestas para cada comentario
    for (const comentario of comentarios) {
      const [respuestas] = await pool.execute(
        `SELECT 
          c.*,
          COUNT(DISTINCT v.id) as total_likes,
          COUNT(DISTINCT CASE WHEN v.tipo = 'dislike' THEN v.id END) as total_dislikes
         FROM foro_comentarios c
         LEFT JOIN foro_votos v ON c.id = v.comentario_id
         WHERE c.comentario_padre_id = ?
         AND c.aprobado = TRUE
         GROUP BY c.id
         ORDER BY c.creado_en ASC`,
        [comentario.id]
      );
      comentario.respuestas = respuestas;
    }

    res.json({ ...foro, comentarios });
  } catch (error) {
    console.error('Error obteniendo foro:', error);
    res.status(500).json({ error: 'Error al obtener el foro' });
  }
});

// Crear comentario en foro (público)
router.post('/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_nombre, email, comentario, comentario_padre_id } = req.body;

    // Validaciones
    if (!usuario_nombre || !email || !comentario) {
      return res.status(400).json({ 
        error: 'Todos los campos obligatorios deben ser completados' 
      });
    }

    // Verificar que el foro existe y está activo
    const [foros] = await pool.execute(
      'SELECT id, permite_comentarios, requiere_moderacion FROM foros WHERE id = ? AND activo = TRUE',
      [id]
    );

    if (foros.length === 0) {
      return res.status(404).json({ error: 'Foro no encontrado o inactivo' });
    }

    const foro = foros[0];

    if (!foro.permite_comentarios) {
      return res.status(403).json({ error: 'Este foro no permite comentarios' });
    }

    // Verificar contenido inapropiado
    if (contienePalabrasProhibidas(comentario)) {
      return res.status(400).json({ 
        error: 'El comentario contiene palabras no permitidas' 
      });
    }

    // Obtener IP del cliente
    const ipAddress = req.ip || req.connection.remoteAddress || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

    // Verificar límite de comentarios por IP (máximo 5 por hora)
    const [comentariosRecientes] = await pool.execute(
      `SELECT COUNT(*) as total 
       FROM foro_comentarios 
       WHERE foro_id = ? 
       AND ip_address = ? 
       AND creado_en >= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [id, ipAddress]
    );

    if (comentariosRecientes[0].total >= 5) {
      return res.status(429).json({ 
        error: 'Ha excedido el límite de comentarios. Por favor, intente más tarde.' 
      });
    }

    // Determinar si requiere moderación
    const requiereModeracion = foro.requiere_moderacion;
    const aprobado = !requiereModeracion; // Si no requiere moderación, se aprueba automáticamente

    // Insertar comentario
    const [result] = await pool.execute(
      `INSERT INTO foro_comentarios 
       (foro_id, comentario_padre_id, usuario_nombre, email, comentario, ip_address, moderado, aprobado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, comentario_padre_id || null, usuario_nombre, email, comentario, ipAddress, requiereModeracion, aprobado]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: requiereModeracion 
        ? 'Su comentario ha sido enviado y será revisado antes de su publicación.' 
        : 'Su comentario ha sido publicado exitosamente.',
      aprobado
    });
  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({ error: 'Error al crear el comentario' });
  }
});

// Votar en comentario (público)
router.post('/comentarios/:id/voto', async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;

    if (!tipo || !['like', 'dislike'].includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de voto inválido' });
    }

    // Obtener IP del cliente
    const ipAddress = req.ip || req.connection.remoteAddress || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

    // Verificar si ya votó
    const [votosExistentes] = await pool.execute(
      'SELECT id, tipo FROM foro_votos WHERE comentario_id = ? AND ip_address = ?',
      [id, ipAddress]
    );

    if (votosExistentes.length > 0) {
      // Actualizar voto existente
      await pool.execute(
        'UPDATE foro_votos SET tipo = ? WHERE comentario_id = ? AND ip_address = ?',
        [tipo, id, ipAddress]
      );
    } else {
      // Crear nuevo voto
      await pool.execute(
        'INSERT INTO foro_votos (comentario_id, tipo, ip_address) VALUES (?, ?, ?)',
        [id, tipo, ipAddress]
      );
    }

    res.json({ message: 'Voto registrado exitosamente' });
  } catch (error) {
    console.error('Error registrando voto:', error);
    res.status(500).json({ error: 'Error al registrar el voto' });
  }
});

// ========== RUTAS ADMIN ==========

// Obtener todos los foros (admin)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [foros] = await pool.execute(
      `SELECT 
        f.*,
        u.nombre as creado_por_nombre,
        COUNT(DISTINCT c.id) as total_comentarios,
        COUNT(DISTINCT CASE WHEN c.aprobado = FALSE AND c.moderado = TRUE THEN c.id END) as comentarios_pendientes
       FROM foros f
       LEFT JOIN usuarios u ON f.creado_por_id = u.id
       LEFT JOIN foro_comentarios c ON f.id = c.foro_id
       GROUP BY f.id
       ORDER BY f.creado_en DESC`
    );
    res.json(foros);
  } catch (error) {
    console.error('Error obteniendo foros (admin):', error);
    res.status(500).json({ error: 'Error al obtener los foros' });
  }
});

// Crear foro (admin)
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titulo, descripcion, categoria, fecha_inicio, fecha_fin, activo, destacado, permite_comentarios, requiere_moderacion } = req.body;

    if (!titulo || !descripcion || !fecha_inicio) {
      return res.status(400).json({ error: 'Título, descripción y fecha de inicio son obligatorios' });
    }

    const [result] = await pool.execute(
      `INSERT INTO foros 
       (titulo, descripcion, categoria, fecha_inicio, fecha_fin, activo, destacado, permite_comentarios, requiere_moderacion, creado_por_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, descripcion, categoria || 'General', fecha_inicio, fecha_fin || null, activo !== false, destacado === true, permite_comentarios !== false, requiere_moderacion !== false, req.user.id]
    );

    res.status(201).json({ id: result.insertId, message: 'Foro creado exitosamente' });
  } catch (error) {
    console.error('Error creando foro:', error);
    res.status(500).json({ error: 'Error al crear el foro' });
  }
});

// Actualizar foro (admin)
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, categoria, fecha_inicio, fecha_fin, activo, destacado, permite_comentarios, requiere_moderacion } = req.body;

    await pool.execute(
      `UPDATE foros 
       SET titulo = ?, descripcion = ?, categoria = ?, fecha_inicio = ?, fecha_fin = ?, 
           activo = ?, destacado = ?, permite_comentarios = ?, requiere_moderacion = ?
       WHERE id = ?`,
      [titulo, descripcion, categoria, fecha_inicio, fecha_fin || null, activo !== false, destacado === true, permite_comentarios !== false, requiere_moderacion !== false, id]
    );

    res.json({ message: 'Foro actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando foro:', error);
    res.status(500).json({ error: 'Error al actualizar el foro' });
  }
});

// Eliminar foro (admin)
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM foros WHERE id = ?', [id]);
    res.json({ message: 'Foro eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando foro:', error);
    res.status(500).json({ error: 'Error al eliminar el foro' });
  }
});

// Obtener comentarios pendientes de moderación (admin)
router.get('/admin/comentarios/pendientes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [comentarios] = await pool.execute(
      `SELECT 
        c.*,
        f.titulo as foro_titulo,
        u.nombre as moderado_por_nombre
       FROM foro_comentarios c
       LEFT JOIN foros f ON c.foro_id = f.id
       LEFT JOIN usuarios u ON c.moderado_por_id = u.id
       WHERE c.moderado = TRUE AND c.aprobado = FALSE
       ORDER BY c.creado_en DESC`
    );
    res.json(comentarios);
  } catch (error) {
    console.error('Error obteniendo comentarios pendientes:', error);
    res.status(500).json({ error: 'Error al obtener los comentarios' });
  }
});

// Moderar comentario (admin)
router.put('/admin/comentarios/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { aprobado, observaciones_moderacion } = req.body;

    await pool.execute(
      `UPDATE foro_comentarios 
       SET aprobado = ?,
           moderado_por_id = ?,
           fecha_moderacion = NOW(),
           observaciones_moderacion = ?
       WHERE id = ?`,
      [aprobado === true, req.user.id, observaciones_moderacion || null, id]
    );

    res.json({ message: 'Comentario moderado exitosamente' });
  } catch (error) {
    console.error('Error moderando comentario:', error);
    res.status(500).json({ error: 'Error al moderar el comentario' });
  }
});

// Eliminar comentario (admin)
router.delete('/admin/comentarios/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM foro_comentarios WHERE id = ?', [id]);
    res.json({ message: 'Comentario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando comentario:', error);
    res.status(500).json({ error: 'Error al eliminar el comentario' });
  }
});

module.exports = router;














