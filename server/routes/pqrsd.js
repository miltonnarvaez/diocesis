const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { enviarConfirmacionPQRSD, enviarRespuestaPQRSD } = require('../utils/email');

const router = express.Router();

// Función para generar número de radicado
const generarNumeroRadicado = () => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4);
  return `CMG-${año}${mes}${dia}-${timestamp}`;
};

// Crear nueva solicitud PQRSD (público)
router.post('/', async (req, res) => {
  try {
    const { tipo, grupo_interes, nombre, documento, email, telefono, asunto, descripcion } = req.body;

    // Validaciones
    if (!tipo || !nombre || !documento || !email || !asunto || !descripcion) {
      return res.status(400).json({ 
        error: 'Todos los campos obligatorios deben ser completados' 
      });
    }

    // Validar tipo
    const tiposValidos = ['peticion', 'queja', 'reclamo', 'sugerencia', 'denuncia'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de solicitud inválido' });
    }

    // Generar número de radicado único
    let numeroRadicado;
    let existe = true;
    while (existe) {
      numeroRadicado = generarNumeroRadicado();
      const [existentes] = await pool.execute(
        'SELECT id FROM pqrsd WHERE numero_radicado = ?',
        [numeroRadicado]
      );
      existe = existentes.length > 0;
    }

    // Obtener IP del cliente
    const ipAddress = req.ip || req.connection.remoteAddress || 
                     req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';

    // Insertar solicitud
    const grupoInteres = grupo_interes || 'general';
    const [result] = await pool.execute(
      `INSERT INTO pqrsd 
       (numero_radicado, tipo, grupo_interes, nombre, documento, email, telefono, asunto, descripcion, ip_address, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
      [numeroRadicado, tipo, grupoInteres, nombre, documento, email, telefono || null, asunto, descripcion, ipAddress]
    );

    // Registrar en historial
    await pool.execute(
      `INSERT INTO pqrsd_seguimiento (pqrsd_id, estado_nuevo, observaciones)
       VALUES (?, 'pendiente', 'Solicitud creada')`,
      [result.insertId]
    );

    // Enviar email de confirmación (no bloquea la respuesta si falla)
    enviarConfirmacionPQRSD({
      numeroRadicado,
      tipo,
      nombre,
      email,
      asunto,
      fechaCreacion: new Date().toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }).catch(err => {
      console.error('Error al enviar email de confirmación (no crítico):', err);
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud recibida correctamente',
      numero_radicado: numeroRadicado,
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creando PQRSD:', error);
    console.error('Detalles del error:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    
    // Mensaje más descriptivo según el tipo de error
    let mensajeError = 'Error al procesar la solicitud';
    if (error.code === 'ER_NO_SUCH_TABLE') {
      mensajeError = 'Error: La tabla PQRSD no existe en la base de datos. Ejecute el script database/pqrsd.sql';
    } else if (error.code === 'ER_DUP_ENTRY') {
      mensajeError = 'Error: Ya existe una solicitud con ese número de radicado';
    } else if (error.sqlMessage) {
      mensajeError = `Error de base de datos: ${error.sqlMessage}`;
    }
    
    res.status(500).json({ 
      error: mensajeError,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Consultar estado por número de radicado (público)
router.get('/consulta/:numeroRadicado', async (req, res) => {
  try {
    const { numeroRadicado } = req.params;

    const [solicitudes] = await pool.execute(
      `SELECT 
        id, numero_radicado, tipo, asunto, estado, 
        fecha_respuesta, respuesta, creado_en
       FROM pqrsd 
       WHERE numero_radicado = ?`,
      [numeroRadicado]
    );

    if (solicitudes.length === 0) {
      return res.status(404).json({ error: 'No se encontró la solicitud' });
    }

    const solicitud = solicitudes[0];

    // Obtener historial de seguimiento
    const [historial] = await pool.execute(
      `SELECT estado_anterior, estado_nuevo, observaciones, creado_en
       FROM pqrsd_seguimiento
       WHERE pqrsd_id = ?
       ORDER BY creado_en ASC`,
      [solicitud.id]
    );

    res.json({
      ...solicitud,
      historial
    });
  } catch (error) {
    console.error('Error consultando PQRSD:', error);
    res.status(500).json({ error: 'Error al consultar la solicitud' });
  }
});

// Obtener estadísticas públicas de PQRSD (sin autenticación)
router.get('/estadisticas', async (req, res) => {
  try {
    // Estadísticas generales
    const [general] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resuelto,
        SUM(CASE WHEN estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendiente,
        SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerrado
      FROM pqrsd
    `);

    // Datos mensuales (últimos 12 meses)
    const [mensuales] = await pool.execute(`
      SELECT 
        DATE_FORMAT(creado_en, '%Y-%m') as mes,
        COUNT(*) as count
      FROM pqrsd
      GROUP BY DATE_FORMAT(creado_en, '%Y-%m')
      ORDER BY mes DESC
      LIMIT 12
    `);

    res.json({
      estadisticas: general[0] || {
        total: 0,
        resuelto: 0,
        en_proceso: 0,
        pendiente: 0,
        cerrado: 0
      },
      datosMensuales: mensuales.map(row => ({
        mes: row.mes,
        count: parseInt(row.count)
      }))
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas PQRSD:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas' });
  }
});

// Listar todas las solicitudes (admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { tipo, estado, grupo_interes, fecha_desde, fecha_hasta, search } = req.query;
    
    let query = `
      SELECT 
        p.*,
        u.nombre as usuario_responde_nombre
      FROM pqrsd p
      LEFT JOIN usuarios u ON p.usuario_responde_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (tipo) {
      query += ' AND p.tipo = ?';
      params.push(tipo);
    }

    if (estado) {
      query += ' AND p.estado = ?';
      params.push(estado);
    }

    if (grupo_interes) {
      query += ' AND p.grupo_interes = ?';
      params.push(grupo_interes);
    }

    if (fecha_desde) {
      query += ' AND DATE(p.creado_en) >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND DATE(p.creado_en) <= ?';
      params.push(fecha_hasta);
    }

    if (search) {
      query += ' AND (p.nombre LIKE ? OR p.email LIKE ? OR p.numero_radicado LIKE ? OR p.asunto LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY p.creado_en DESC';

    const [solicitudes] = await pool.execute(query, params);

    res.json(solicitudes);
  } catch (error) {
    console.error('Error listando PQRSD:', error);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
});

// Obtener una solicitud por ID (admin)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [solicitudes] = await pool.execute(
      `SELECT 
        p.*,
        u.nombre as usuario_responde_nombre
       FROM pqrsd p
       LEFT JOIN usuarios u ON p.usuario_responde_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (solicitudes.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    // Obtener historial
    const [historial] = await pool.execute(
      `SELECT 
        s.*,
        u.nombre as usuario_nombre
       FROM pqrsd_seguimiento s
       LEFT JOIN usuarios u ON s.usuario_id = u.id
       WHERE s.pqrsd_id = ?
       ORDER BY s.creado_en ASC`,
      [id]
    );

    res.json({
      ...solicitudes[0],
      historial
    });
  } catch (error) {
    console.error('Error obteniendo PQRSD:', error);
    res.status(500).json({ error: 'Error al obtener la solicitud' });
  }
});

// Actualizar solicitud (admin)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;

    // Obtener estado actual
    const [solicitudes] = await pool.execute(
      'SELECT estado FROM pqrsd WHERE id = ?',
      [id]
    );

    if (solicitudes.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const estadoAnterior = solicitudes[0].estado;
    const estadoNuevo = estado || estadoAnterior;

    // Validar estado
    const estadosValidos = ['pendiente', 'en_proceso', 'resuelto', 'cerrado'];
    if (!estadosValidos.includes(estadoNuevo)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Actualizar solicitud
    const fechaRespuesta = estadoNuevo === 'resuelto' && respuesta ? new Date() : null;

    await pool.execute(
      `UPDATE pqrsd 
       SET estado = ?, 
           respuesta = ?,
           fecha_respuesta = ?,
           usuario_responde_id = ?,
           actualizado_en = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [estadoNuevo, respuesta || null, fechaRespuesta, req.user.id, id]
    );

    // Registrar cambio en historial si cambió el estado
    if (estadoAnterior !== estadoNuevo) {
      await pool.execute(
        `INSERT INTO pqrsd_seguimiento 
         (pqrsd_id, estado_anterior, estado_nuevo, observaciones, usuario_id)
         VALUES (?, ?, ?, ?, ?)`,
        [id, estadoAnterior, estadoNuevo, respuesta || 'Estado actualizado', req.user.id]
      );
    }

    // Si se marcó como resuelto y hay respuesta, enviar email
    if (estadoNuevo === 'resuelto' && respuesta) {
      // Obtener datos completos de la solicitud para el email
      const [solicitudesCompletas] = await pool.execute(
        'SELECT numero_radicado, nombre, email, tipo FROM pqrsd WHERE id = ?',
        [id]
      );
      
      if (solicitudesCompletas.length > 0) {
        const solicitud = solicitudesCompletas[0];
        enviarRespuestaPQRSD({
          numeroRadicado: solicitud.numero_radicado,
          nombre: solicitud.nombre,
          email: solicitud.email,
          tipo: solicitud.tipo,
          respuesta,
          fechaRespuesta: new Date(fechaRespuesta).toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }).catch(err => {
          console.error('Error al enviar email de respuesta (no crítico):', err);
        });
      }
    }

    res.json({ 
      success: true, 
      message: 'Solicitud actualizada correctamente' 
    });
  } catch (error) {
    console.error('Error actualizando PQRSD:', error);
    res.status(500).json({ error: 'Error al actualizar la solicitud' });
  }
});

// Estadísticas (admin)
router.get('/admin/estadisticas', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [estadisticas] = await pool.execute(`
      SELECT 
        estado,
        COUNT(*) as cantidad
      FROM pqrsd
      GROUP BY estado
    `);

    const [porTipo] = await pool.execute(`
      SELECT 
        tipo,
        COUNT(*) as cantidad
      FROM pqrsd
      GROUP BY tipo
    `);

    const [total] = await pool.execute('SELECT COUNT(*) as total FROM pqrsd');
    const [pendientes] = await pool.execute(
      "SELECT COUNT(*) as total FROM pqrsd WHERE estado = 'pendiente'"
    );

    res.json({
      por_estado: estadisticas,
      por_tipo: porTipo,
      total: total[0].total,
      pendientes: pendientes[0].total
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;

