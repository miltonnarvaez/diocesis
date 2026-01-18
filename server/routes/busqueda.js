const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Búsqueda global avanzada
router.get('/', async (req, res) => {
  try {
    const { q, tipo, categoria, fecha_desde, fecha_hasta } = req.query;
    
    console.log('Búsqueda recibida:', { q, tipo, categoria, fecha_desde, fecha_hasta });
    
    if (!q || q.trim() === '') {
      return res.json({
        noticias: [],
        transparencia: [],
        gaceta: [],
        sesiones: [],
        convocatorias: [],
        total: 0
      });
    }

    const searchTerm = `%${q.trim()}%`;
    const results = {
      noticias: [],
      transparencia: [],
      gaceta: [],
      sesiones: [],
      convocatorias: [],
      total: 0
    };

    // Búsqueda en Noticias
    if (!tipo || tipo === 'noticias' || tipo === 'todos') {
      let noticiasQuery = `
        SELECT 
          id, titulo, resumen, contenido, categoria, 
          fecha_publicacion, creado_en, imagen_url,
          'noticia' as tipo_resultado
        FROM noticias
        WHERE publicada = TRUE
        AND (
          titulo LIKE ? OR 
          resumen LIKE ? OR 
          contenido LIKE ? OR
          categoria LIKE ?
        )
      `;
      const noticiasParams = [searchTerm, searchTerm, searchTerm, searchTerm];

      if (fecha_desde) {
        noticiasQuery += ' AND DATE(fecha_publicacion) >= ?';
        noticiasParams.push(fecha_desde);
      }

      if (fecha_hasta) {
        noticiasQuery += ' AND DATE(fecha_publicacion) <= ?';
        noticiasParams.push(fecha_hasta);
      }

      noticiasQuery += ' ORDER BY COALESCE(fecha_publicacion, creado_en) DESC LIMIT 20';

      const [noticias] = await pool.execute(noticiasQuery, noticiasParams);
      results.noticias = noticias;
    }

    // Búsqueda en Transparencia
    if (!tipo || tipo === 'transparencia' || tipo === 'todos') {
      let transparenciaQuery = `
        SELECT 
          id, titulo, descripcion, categoria, 
          fecha as fecha_publicacion, creado_en, archivo_url,
          'transparencia' as tipo_resultado
        FROM documentos_transparencia
        WHERE publicada = TRUE
        AND (
          titulo LIKE ? OR 
          descripcion LIKE ? OR
          categoria LIKE ?
        )
      `;
      const transparenciaParams = [searchTerm, searchTerm, searchTerm];

      if (categoria && categoria !== 'todas') {
        transparenciaQuery += ' AND categoria = ?';
        transparenciaParams.push(categoria);
      }

      if (fecha_desde) {
        transparenciaQuery += ' AND DATE(COALESCE(fecha, creado_en)) >= ?';
        transparenciaParams.push(fecha_desde);
      }

      if (fecha_hasta) {
        transparenciaQuery += ' AND DATE(COALESCE(fecha, creado_en)) <= ?';
        transparenciaParams.push(fecha_hasta);
      }

      transparenciaQuery += ' ORDER BY COALESCE(fecha, creado_en) DESC LIMIT 20';

      const [transparencia] = await pool.execute(transparenciaQuery, transparenciaParams);
      results.transparencia = transparencia;
    }

    // Búsqueda en Gaceta
    if (!tipo || tipo === 'gaceta' || tipo === 'todos') {
      let gacetaQuery = `
        SELECT 
          id, numero, titulo, descripcion, tipo, 
          fecha as fecha_publicacion, creado_en, archivo_url,
          'gaceta' as tipo_resultado
        FROM documentos_gaceta
        WHERE publicada = TRUE
        AND (
          numero LIKE ? OR
          titulo LIKE ? OR 
          descripcion LIKE ? OR
          tipo LIKE ?
        )
      `;
      const gacetaParams = [searchTerm, searchTerm, searchTerm, searchTerm];

      if (fecha_desde) {
        gacetaQuery += ' AND DATE(COALESCE(fecha, creado_en)) >= ?';
        gacetaParams.push(fecha_desde);
      }

      if (fecha_hasta) {
        gacetaQuery += ' AND DATE(COALESCE(fecha, creado_en)) <= ?';
        gacetaParams.push(fecha_hasta);
      }

      gacetaQuery += ' ORDER BY COALESCE(fecha, creado_en) DESC LIMIT 20';

      const [gaceta] = await pool.execute(gacetaQuery, gacetaParams);
      results.gaceta = gaceta;
    }

    // Búsqueda en Sesiones
    if (!tipo || tipo === 'sesiones' || tipo === 'todos') {
      let sesionesQuery = `
        SELECT 
          id, numero_sesion, tipo_sesion, resumen, orden_dia, 
          fecha as fecha_sesion, creado_en,
          'sesion' as tipo_resultado
        FROM sesiones_concejo
        WHERE publicada = TRUE
        AND (
          numero_sesion LIKE ? OR
          resumen LIKE ? OR 
          orden_dia LIKE ? OR
          tipo_sesion LIKE ?
        )
      `;
      const sesionesParams = [searchTerm, searchTerm, searchTerm, searchTerm];

      if (fecha_desde) {
        sesionesQuery += ' AND DATE(COALESCE(fecha, creado_en)) >= ?';
        sesionesParams.push(fecha_desde);
      }

      if (fecha_hasta) {
        sesionesQuery += ' AND DATE(COALESCE(fecha, creado_en)) <= ?';
        sesionesParams.push(fecha_hasta);
      }

      sesionesQuery += ' ORDER BY COALESCE(fecha, creado_en) DESC LIMIT 20';

      const [sesiones] = await pool.execute(sesionesQuery, sesionesParams);
      results.sesiones = sesiones;
    }

    // Búsqueda en Convocatorias
    if (!tipo || tipo === 'convocatorias' || tipo === 'todos') {
      let convocatoriasQuery = `
        SELECT 
          id, titulo, descripcion, tipo, 
          fecha_inicio, fecha_fin, creado_en, imagen_url,
          'convocatoria' as tipo_resultado
        FROM convocatorias
        WHERE activa = TRUE
        AND (
          titulo LIKE ? OR 
          descripcion LIKE ? OR
          tipo LIKE ?
        )
      `;
      const convocatoriasParams = [searchTerm, searchTerm, searchTerm];

      if (fecha_desde) {
        convocatoriasQuery += ' AND DATE(fecha_inicio) >= ?';
        convocatoriasParams.push(fecha_desde);
      }

      if (fecha_hasta) {
        convocatoriasQuery += ' AND DATE(fecha_fin) <= ?';
        convocatoriasParams.push(fecha_hasta);
      }

      convocatoriasQuery += ' ORDER BY fecha_inicio DESC LIMIT 20';

      const [convocatorias] = await pool.execute(convocatoriasQuery, convocatoriasParams);
      results.convocatorias = convocatorias;
    }

    // Calcular total
    results.total = 
      results.noticias.length +
      results.transparencia.length +
      results.gaceta.length +
      results.sesiones.length +
      results.convocatorias.length;

    res.json(results);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error al realizar la búsqueda' });
  }
});

// Endpoint para autocompletado
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '' || q.length < 2) {
      return res.json([]);
    }

    const searchTerm = `%${q.trim()}%`;
    const suggestions = [];

    // Obtener sugerencias de títulos de diferentes tablas
    const queries = [
      {
        query: `SELECT DISTINCT titulo as texto, 'noticia' as tipo FROM noticias WHERE publicada = TRUE AND titulo LIKE ? LIMIT 5`,
        params: [searchTerm]
      },
      {
        query: `SELECT DISTINCT titulo as texto, 'transparencia' as tipo FROM documentos_transparencia WHERE publicada = TRUE AND titulo LIKE ? LIMIT 5`,
        params: [searchTerm]
      },
      {
        query: `SELECT DISTINCT titulo as texto, 'gaceta' as tipo FROM documentos_gaceta WHERE publicada = TRUE AND titulo LIKE ? LIMIT 5`,
        params: [searchTerm]
      },
      {
        query: `SELECT DISTINCT CONCAT('Sesión ', numero_sesion, ' - ', tipo_sesion) as texto, 'sesion' as tipo FROM sesiones_concejo WHERE publicada = TRUE AND (numero_sesion LIKE ? OR tipo_sesion LIKE ?) LIMIT 5`,
        params: [searchTerm, searchTerm]
      },
      {
        query: `SELECT DISTINCT titulo as texto, 'convocatoria' as tipo FROM convocatorias WHERE activa = TRUE AND titulo LIKE ? LIMIT 5`,
        params: [searchTerm]
      }
    ];

    for (const { query, params } of queries) {
      try {
        const [results] = await pool.execute(query, params);
        suggestions.push(...results);
      } catch (error) {
        console.error('Error en sugerencia:', error);
      }
    }

    // Limitar y ordenar sugerencias
    const uniqueSuggestions = suggestions
      .slice(0, 8)
      .map(s => ({ texto: s.texto, tipo: s.tipo }));

    res.json(uniqueSuggestions);
  } catch (error) {
    console.error('Error en autocompletado:', error);
    res.status(500).json({ error: 'Error al obtener sugerencias' });
  }
});

module.exports = router;

