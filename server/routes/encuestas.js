const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Obtener encuestas activas y publicadas
router.get('/', async (req, res) => {
  try {
    const fechaActual = new Date().toISOString().split('T')[0];
    
    const [encuestas] = await pool.execute(
      `SELECT * FROM encuestas 
       WHERE activa = TRUE 
       AND publicada = TRUE 
       AND fecha_inicio <= ? 
       AND fecha_fin >= ?
       ORDER BY fecha_inicio DESC`,
      [fechaActual, fechaActual]
    );

    // Obtener preguntas para cada encuesta
    for (let encuesta of encuestas) {
      const [preguntas] = await pool.execute(
        'SELECT * FROM encuesta_preguntas WHERE encuesta_id = ? ORDER BY orden ASC',
        [encuesta.id]
      );
      encuesta.preguntas = preguntas;
    }

    res.json(encuestas);
  } catch (error) {
    console.error('Error obteniendo encuestas:', error);
    res.status(500).json({ error: 'Error obteniendo encuestas' });
  }
});

// Obtener encuesta por ID
router.get('/:id', async (req, res) => {
  try {
    const fechaActual = new Date().toISOString().split('T')[0];
    
    const [encuestas] = await pool.execute(
      `SELECT * FROM encuestas 
       WHERE id = ? 
       AND activa = TRUE 
       AND publicada = TRUE 
       AND fecha_inicio <= ? 
       AND fecha_fin >= ?`,
      [req.params.id, fechaActual, fechaActual]
    );

    if (encuestas.length === 0) {
      return res.status(404).json({ error: 'Encuesta no encontrada o no disponible' });
    }

    const encuesta = encuestas[0];

    // Obtener preguntas
    const [preguntas] = await pool.execute(
      'SELECT * FROM encuesta_preguntas WHERE encuesta_id = ? ORDER BY orden ASC',
      [encuesta.id]
    );
    encuesta.preguntas = preguntas;

    res.json(encuesta);
  } catch (error) {
    console.error('Error obteniendo encuesta:', error);
    res.status(500).json({ error: 'Error obteniendo encuesta' });
  }
});

// Enviar respuesta a encuesta
router.post('/:id/respuestas', async (req, res) => {
  try {
    const { id } = req.params;
    const { respuestas, ip_address } = req.body;

    // Verificar que la encuesta esté activa
    const fechaActual = new Date().toISOString().split('T')[0];
    const [encuestas] = await pool.execute(
      `SELECT * FROM encuestas 
       WHERE id = ? 
       AND activa = TRUE 
       AND publicada = TRUE 
       AND fecha_inicio <= ? 
       AND fecha_fin >= ?`,
      [id, fechaActual, fechaActual]
    );

    if (encuestas.length === 0) {
      return res.status(404).json({ error: 'Encuesta no encontrada o no disponible' });
    }

    // Verificar que no haya respondido desde esta IP (opcional, puede comentarse)
    // const [respuestasPrevias] = await pool.execute(
    //   'SELECT * FROM encuesta_respuestas WHERE encuesta_id = ? AND ip_address = ?',
    //   [id, ip_address]
    // );
    // if (respuestasPrevias.length > 0) {
    //   return res.status(400).json({ error: 'Ya has respondido esta encuesta' });
    // }

    // Guardar respuestas
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const respuesta of respuestas) {
        await connection.execute(
          'INSERT INTO encuesta_respuestas (encuesta_id, pregunta_id, respuesta, ip_address) VALUES (?, ?, ?, ?)',
          [id, respuesta.pregunta_id, JSON.stringify(respuesta.respuesta), ip_address || req.ip]
        );
      }

      await connection.commit();
      res.json({ message: 'Respuestas guardadas exitosamente' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error guardando respuestas:', error);
    res.status(500).json({ error: 'Error guardando respuestas' });
  }
});

// Obtener resultados de encuesta (si son públicos)
router.get('/:id/resultados', async (req, res) => {
  try {
    const { id } = req.params;

    const [encuestas] = await pool.execute(
      'SELECT * FROM encuestas WHERE id = ?',
      [id]
    );

    if (encuestas.length === 0) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }

    const encuesta = encuestas[0];

    if (!encuesta.resultados_publicos) {
      return res.status(403).json({ error: 'Los resultados de esta encuesta no son públicos' });
    }

    // Obtener preguntas
    const [preguntas] = await pool.execute(
      'SELECT * FROM encuesta_preguntas WHERE encuesta_id = ? ORDER BY orden ASC',
      [id]
    );

    // Obtener respuestas y calcular estadísticas
    const resultados = [];
    for (const pregunta of preguntas) {
      const [respuestas] = await pool.execute(
        'SELECT respuesta FROM encuesta_respuestas WHERE pregunta_id = ?',
        [pregunta.id]
      );

      let estadisticas = {};
      
      if (pregunta.tipo === 'opcion_multiple') {
        const opciones = JSON.parse(pregunta.opciones || '[]');
        const conteo = {};
        opciones.forEach(op => conteo[op] = 0);
        
        respuestas.forEach(resp => {
          const valor = JSON.parse(resp.respuesta);
          if (Array.isArray(valor)) {
            valor.forEach(v => {
              if (conteo[v] !== undefined) conteo[v]++;
            });
          } else if (conteo[valor] !== undefined) {
            conteo[valor]++;
          }
        });

        estadisticas = {
          tipo: 'opcion_multiple',
          opciones: opciones.map(op => ({
            opcion: op,
            cantidad: conteo[op] || 0,
            porcentaje: respuestas.length > 0 ? ((conteo[op] || 0) / respuestas.length * 100).toFixed(2) : 0
          })),
          total: respuestas.length
        };
      } else if (pregunta.tipo === 'escala') {
        const valores = respuestas.map(r => parseInt(JSON.parse(r.respuesta))).filter(v => !isNaN(v));
        const suma = valores.reduce((a, b) => a + b, 0);
        const promedio = valores.length > 0 ? (suma / valores.length).toFixed(2) : 0;
        
        estadisticas = {
          tipo: 'escala',
          promedio: parseFloat(promedio),
          total: valores.length,
          distribucion: {}
        };

        // Distribución por valor
        valores.forEach(v => {
          estadisticas.distribucion[v] = (estadisticas.distribucion[v] || 0) + 1;
        });
      } else {
        estadisticas = {
          tipo: 'texto',
          total: respuestas.length,
          respuestas: respuestas.map(r => JSON.parse(r.respuesta)).slice(0, 100) // Limitar a 100 para no sobrecargar
        };
      }

      resultados.push({
        pregunta: pregunta.pregunta,
        tipo: pregunta.tipo,
        estadisticas
      });
    }

    res.json({
      encuesta: {
        id: encuesta.id,
        titulo: encuesta.titulo,
        descripcion: encuesta.descripcion
      },
      resultados
    });
  } catch (error) {
    console.error('Error obteniendo resultados:', error);
    res.status(500).json({ error: 'Error obteniendo resultados' });
  }
});

// ========== RUTAS ADMIN ==========

// Obtener todas las encuestas (admin)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [encuestas] = await pool.execute(
      'SELECT * FROM encuestas ORDER BY creado_en DESC'
    );

    for (let encuesta of encuestas) {
      const [preguntas] = await pool.execute(
        'SELECT * FROM encuesta_preguntas WHERE encuesta_id = ? ORDER BY orden ASC',
        [encuesta.id]
      );
      encuesta.preguntas = preguntas;

      // Contar respuestas
      const [count] = await pool.execute(
        'SELECT COUNT(DISTINCT ip_address) as total FROM encuesta_respuestas WHERE encuesta_id = ?',
        [encuesta.id]
      );
      encuesta.total_respuestas = count[0]?.total || 0;
    }

    res.json(encuestas);
  } catch (error) {
    console.error('Error obteniendo encuestas (admin):', error);
    res.status(500).json({ error: 'Error obteniendo encuestas' });
  }
});

// Obtener encuesta por ID (admin)
router.get('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [encuestas] = await pool.execute(
      'SELECT * FROM encuestas WHERE id = ?',
      [req.params.id]
    );

    if (encuestas.length === 0) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }

    const encuesta = encuestas[0];

    const [preguntas] = await pool.execute(
      'SELECT * FROM encuesta_preguntas WHERE encuesta_id = ? ORDER BY orden ASC',
      [encuesta.id]
    );
    encuesta.preguntas = preguntas;

    res.json(encuesta);
  } catch (error) {
    console.error('Error obteniendo encuesta (admin):', error);
    res.status(500).json({ error: 'Error obteniendo encuesta' });
  }
});

// Crear encuesta (admin)
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      activa,
      publicada,
      tipo,
      resultados_publicos,
      preguntas
    } = req.body;

    if (!titulo || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Título, fecha de inicio y fecha de fin son requeridos' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.execute(
        `INSERT INTO encuestas 
         (titulo, descripcion, fecha_inicio, fecha_fin, activa, publicada, tipo, resultados_publicos)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          titulo,
          descripcion || null,
          fecha_inicio,
          fecha_fin,
          activa !== undefined ? activa : true,
          publicada !== undefined ? publicada : true,
          tipo || 'multiple_choice',
          resultados_publicos !== undefined ? resultados_publicos : true
        ]
      );

      const encuestaId = result.insertId;

      // Insertar preguntas
      if (preguntas && Array.isArray(preguntas)) {
        for (const pregunta of preguntas) {
          await connection.execute(
            `INSERT INTO encuesta_preguntas 
             (encuesta_id, pregunta, tipo, opciones, orden, requerida)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              encuestaId,
              pregunta.pregunta,
              pregunta.tipo,
              pregunta.opciones ? JSON.stringify(pregunta.opciones) : null,
              pregunta.orden || 0,
              pregunta.requerida !== undefined ? pregunta.requerida : true
            ]
          );
        }
      }

      await connection.commit();
      res.status(201).json({ id: encuestaId, message: 'Encuesta creada exitosamente' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creando encuesta:', error);
    res.status(500).json({ error: 'Error creando encuesta' });
  }
});

// Actualizar encuesta (admin)
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      fecha_inicio,
      fecha_fin,
      activa,
      publicada,
      tipo,
      resultados_publicos,
      preguntas
    } = req.body;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Actualizar encuesta
      await connection.execute(
        `UPDATE encuestas 
         SET titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, 
             activa = ?, publicada = ?, tipo = ?, resultados_publicos = ?
         WHERE id = ?`,
        [
          titulo,
          descripcion,
          fecha_inicio,
          fecha_fin,
          activa,
          publicada,
          tipo,
          resultados_publicos,
          id
        ]
      );

      // Si se proporcionan preguntas, actualizarlas
      if (preguntas && Array.isArray(preguntas)) {
        // Eliminar preguntas existentes
        await connection.execute(
          'DELETE FROM encuesta_preguntas WHERE encuesta_id = ?',
          [id]
        );

        // Insertar nuevas preguntas
        for (const pregunta of preguntas) {
          await connection.execute(
            `INSERT INTO encuesta_preguntas 
             (encuesta_id, pregunta, tipo, opciones, orden, requerida)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              id,
              pregunta.pregunta,
              pregunta.tipo,
              pregunta.opciones ? JSON.stringify(pregunta.opciones) : null,
              pregunta.orden || 0,
              pregunta.requerida !== undefined ? pregunta.requerida : true
            ]
          );
        }
      }

      await connection.commit();
      res.json({ message: 'Encuesta actualizada exitosamente' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error actualizando encuesta:', error);
    res.status(500).json({ error: 'Error actualizando encuesta' });
  }
});

// Eliminar encuesta (admin)
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Las respuestas se eliminan automáticamente por CASCADE
    // Las preguntas también se eliminan automáticamente por CASCADE
    await pool.execute('DELETE FROM encuestas WHERE id = ?', [id]);

    res.json({ message: 'Encuesta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando encuesta:', error);
    res.status(500).json({ error: 'Error eliminando encuesta' });
  }
});

// Obtener resultados detallados (admin)
router.get('/admin/:id/resultados', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [encuestas] = await pool.execute(
      'SELECT * FROM encuestas WHERE id = ?',
      [id]
    );

    if (encuestas.length === 0) {
      return res.status(404).json({ error: 'Encuesta no encontrada' });
    }

    const encuesta = encuestas[0];

    // Obtener preguntas
    const [preguntas] = await pool.execute(
      'SELECT * FROM encuesta_preguntas WHERE encuesta_id = ? ORDER BY orden ASC',
      [id]
    );

    // Obtener todas las respuestas
    const [respuestas] = await pool.execute(
      `SELECT er.*, ep.pregunta, ep.tipo as pregunta_tipo 
       FROM encuesta_respuestas er
       JOIN encuesta_preguntas ep ON er.pregunta_id = ep.id
       WHERE er.encuesta_id = ?
       ORDER BY er.fecha_respuesta DESC`,
      [id]
    );

    // Calcular estadísticas
    const resultados = [];
    for (const pregunta of preguntas) {
      const respuestasPregunta = respuestas.filter(r => r.pregunta_id === pregunta.id);
      
      let estadisticas = {};
      
      if (pregunta.tipo === 'opcion_multiple') {
        const opciones = JSON.parse(pregunta.opciones || '[]');
        const conteo = {};
        opciones.forEach(op => conteo[op] = 0);
        
        respuestasPregunta.forEach(resp => {
          const valor = JSON.parse(resp.respuesta);
          if (Array.isArray(valor)) {
            valor.forEach(v => {
              if (conteo[v] !== undefined) conteo[v]++;
            });
          } else if (conteo[valor] !== undefined) {
            conteo[valor]++;
          }
        });

        estadisticas = {
          tipo: 'opcion_multiple',
          opciones: opciones.map(op => ({
            opcion: op,
            cantidad: conteo[op] || 0,
            porcentaje: respuestasPregunta.length > 0 ? ((conteo[op] || 0) / respuestasPregunta.length * 100).toFixed(2) : 0
          })),
          total: respuestasPregunta.length
        };
      } else if (pregunta.tipo === 'escala') {
        const valores = respuestasPregunta.map(r => parseInt(JSON.parse(r.respuesta))).filter(v => !isNaN(v));
        const suma = valores.reduce((a, b) => a + b, 0);
        const promedio = valores.length > 0 ? (suma / valores.length).toFixed(2) : 0;
        
        estadisticas = {
          tipo: 'escala',
          promedio: parseFloat(promedio),
          total: valores.length,
          distribucion: {}
        };

        valores.forEach(v => {
          estadisticas.distribucion[v] = (estadisticas.distribucion[v] || 0) + 1;
        });
      } else {
        estadisticas = {
          tipo: 'texto',
          total: respuestasPregunta.length,
          respuestas: respuestasPregunta.map(r => ({
            respuesta: JSON.parse(r.respuesta),
            fecha: r.fecha_respuesta,
            ip: r.ip_address
          }))
        };
      }

      resultados.push({
        pregunta: pregunta.pregunta,
        tipo: pregunta.tipo,
        estadisticas
      });
    }

    // Estadísticas generales
    const [totalRespuestas] = await pool.execute(
      'SELECT COUNT(DISTINCT ip_address) as total FROM encuesta_respuestas WHERE encuesta_id = ?',
      [id]
    );

    res.json({
      encuesta,
      total_respuestas: totalRespuestas[0]?.total || 0,
      resultados
    });
  } catch (error) {
    console.error('Error obteniendo resultados (admin):', error);
    res.status(500).json({ error: 'Error obteniendo resultados' });
  }
});

module.exports = router;















