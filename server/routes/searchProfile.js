const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Búsqueda de perfiles
router.get('/', async (req, res) => {
  try {
    const { q, tipo } = req.query;
    
    console.log('Búsqueda de perfiles recibida:', { q, tipo });
    
    if (!q || q.trim().length < 3) {
      return res.json({
        autoridades: [],
        misioneros: [],
        parrocos: [],
        voluntarios: [],
        total: 0
      });
    }

    const searchTerm = `%${q.trim()}%`;
    const results = {
      autoridades: [],
      misioneros: [],
      parrocos: [],
      voluntarios: [],
      total: 0
    };

    // Búsqueda en Autoridades
    if (!tipo || tipo === 'autoridad' || tipo === 'todos') {
      let autoridadesQuery = `
        SELECT 
          id, nombre, cargo, email, telefono, foto_url, biografia,
          'autoridad' as tipo_perfil
        FROM autoridades
        WHERE activo = TRUE
        AND (
          nombre LIKE ? OR 
          cargo LIKE ? OR 
          email LIKE ? OR
          telefono LIKE ? OR
          biografia LIKE ?
        )
        ORDER BY orden ASC, nombre ASC
        LIMIT 50
      `;
      const autoridadesParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

      const [autoridades] = await pool.execute(autoridadesQuery, autoridadesParams);
      results.autoridades = autoridades;
    }

    // Búsqueda en Misioneros
    if (!tipo || tipo === 'misionero' || tipo === 'todos') {
      let misionerosQuery = `
        SELECT 
          id, nombre_completo, tipo, biografia, email, telefono, imagen_url,
          'misionero' as tipo_perfil
        FROM misioneros
        WHERE activo = TRUE
        AND (
          nombre_completo LIKE ? OR 
          tipo LIKE ? OR 
          email LIKE ? OR
          telefono LIKE ? OR
          biografia LIKE ?
        )
        ORDER BY nombre_completo ASC
        LIMIT 50
      `;
      const misionerosParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

      const [misioneros] = await pool.execute(misionerosQuery, misionerosParams);
      results.misioneros = misioneros;
    }

    // Búsqueda en Párrocos (desde parroquias)
    if (!tipo || tipo === 'parroco' || tipo === 'todos') {
      let parrocosQuery = `
        SELECT 
          p.id,
          p.nombre as nombre_parroquia,
          p.parroco,
          p.vicario,
          p.direccion,
          p.telefono,
          p.email,
          'parroco' as tipo_perfil
        FROM parroquias p
        WHERE p.activa = TRUE
        AND (
          p.parroco LIKE ? OR 
          p.vicario LIKE ? OR 
          p.nombre LIKE ? OR
          p.email LIKE ? OR
          p.telefono LIKE ?
        )
        ORDER BY p.nombre ASC
        LIMIT 50
      `;
      const parrocosParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

      const [parrocos] = await pool.execute(parrocosQuery, parrocosParams);
      
      // Transformar resultados para incluir nombre del párroco
      results.parrocos = parrocos.map(parroco => ({
        ...parroco,
        nombre: parroco.parroco || parroco.vicario || parroco.nombre_parroquia
      }));
    }

    // Búsqueda en Voluntarios
    if (!tipo || tipo === 'voluntario' || tipo === 'todos') {
      let voluntariosQuery = `
        SELECT 
          id, nombre_completo, documento, email, telefono, direccion, 
          habilidades, area_interes,
          'voluntario' as tipo_perfil
        FROM voluntarios
        WHERE estado IN ('activo', 'pendiente')
        AND (
          nombre_completo LIKE ? OR 
          documento LIKE ? OR 
          email LIKE ? OR
          telefono LIKE ? OR
          area_interes LIKE ? OR
          habilidades LIKE ?
        )
        ORDER BY nombre_completo ASC
        LIMIT 50
      `;
      const voluntariosParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

      const [voluntarios] = await pool.execute(voluntariosQuery, voluntariosParams);
      results.voluntarios = voluntarios;
    }

    // Calcular total
    results.total = 
      results.autoridades.length +
      results.misioneros.length +
      results.parrocos.length +
      results.voluntarios.length;

    res.json(results);
  } catch (error) {
    console.error('Error en búsqueda de perfiles:', error);
    res.status(500).json({ error: 'Error en búsqueda de perfiles' });
  }
});

// Obtener un perfil específico por tipo e ID
router.get('/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    
    let perfil = null;
    let query = '';

    switch (tipo) {
      case 'autoridad':
        query = `
          SELECT 
            id, nombre, cargo, email, telefono, foto_url, biografia,
            'autoridad' as tipo_perfil
          FROM autoridades
          WHERE id = ? AND activo = TRUE
        `;
        break;
      
      case 'misionero':
        query = `
          SELECT 
            id, nombre_completo, tipo, biografia, email, telefono, imagen_url,
            experiencia, mision_actual_id, contacto,
            'misionero' as tipo_perfil
          FROM misioneros
          WHERE id = ? AND activo = TRUE
        `;
        break;
      
      case 'parroco':
        query = `
          SELECT 
            p.id,
            p.nombre as nombre_parroquia,
            p.parroco as nombre,
            p.vicario,
            p.direccion,
            p.telefono,
            p.email,
            'parroco' as tipo_perfil
          FROM parroquias p
          WHERE p.id = ? AND p.activa = TRUE
        `;
        break;
      
      case 'voluntario':
        query = `
          SELECT 
            id, nombre_completo, documento, email, telefono, direccion, 
            habilidades, area_interes, proyecto_id, fecha_registro,
            'voluntario' as tipo_perfil
          FROM voluntarios
          WHERE id = ? AND estado IN ('activo', 'pendiente')
        `;
        break;
      
      default:
        return res.status(400).json({ error: 'Tipo de perfil inválido' });
    }

    const [resultados] = await pool.execute(query, [id]);
    
    if (resultados.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    perfil = resultados[0];

    // Para párrocos, agregar el nombre del párroco como nombre
    if (tipo === 'parroco' && perfil.parroco) {
      perfil.nombre = perfil.parroco;
    }

    res.json(perfil);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error obteniendo perfil' });
  }
});

module.exports = router;

