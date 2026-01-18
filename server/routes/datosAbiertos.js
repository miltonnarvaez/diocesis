const express = require('express');
const pool = require('../config/database');
const { exportToCSV, exportToJSON, exportToXML, generateDCATMetadata, cleanupTempFiles } = require('../utils/dataExporter');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Directorio temporal para archivos de exportación
const tempDir = path.join(__dirname, '../temp/exports');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Limpiar archivos temporales al iniciar
cleanupTempFiles(tempDir);

/**
 * Obtener catálogo de datasets disponibles
 */
router.get('/catalogo', async (req, res) => {
  try {
    const datasets = [
      {
        id: 'transparencia',
        nombre: 'Documentos de Transparencia',
        descripcion: 'Documentos públicos de transparencia y acceso a la información',
        categoria: 'transparencia',
        formatos: ['csv', 'json', 'xml'],
        frecuencia: 'Mensual',
        ultimaActualizacion: new Date().toISOString()
      },
      {
        id: 'gaceta',
        nombre: 'Gaceta Municipal',
        descripcion: 'Acuerdos, actas, decretos y documentos normativos',
        categoria: 'normatividad',
        formatos: ['csv', 'json', 'xml'],
        frecuencia: 'Semanal',
        ultimaActualizacion: new Date().toISOString()
      },
      {
        id: 'noticias',
        nombre: 'Noticias',
        descripcion: 'Noticias y comunicados del Concejo Municipal',
        categoria: 'comunicacion',
        formatos: ['csv', 'json', 'xml'],
        frecuencia: 'Diaria',
        ultimaActualizacion: new Date().toISOString()
      },
      {
        id: 'convocatorias',
        nombre: 'Convocatorias',
        descripcion: 'Convocatorias públicas y procesos de selección',
        categoria: 'convocatorias',
        formatos: ['csv', 'json', 'xml'],
        frecuencia: 'Según disponibilidad',
        ultimaActualizacion: new Date().toISOString()
      }
    ];

    res.json(datasets);
  } catch (error) {
    console.error('Error obteniendo catálogo:', error);
    res.status(500).json({ error: 'Error obteniendo catálogo de datos' });
  }
});

/**
 * Exportar datos de transparencia
 */
router.get('/exportar/transparencia', async (req, res) => {
  try {
    const { formato = 'json', categoria, fecha_desde, fecha_hasta } = req.query;

    let query = 'SELECT * FROM documentos_transparencia WHERE publicada = TRUE';
    const params = [];

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    if (fecha_desde) {
      query += ' AND fecha >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND fecha <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY fecha DESC';

    const [documentos] = await pool.execute(query, params);

    // Preparar datos para exportación
    const data = documentos.map(doc => ({
      id: doc.id,
      titulo: doc.titulo,
      descripcion: doc.descripcion || '',
      categoria: doc.categoria,
      fecha: doc.fecha ? new Date(doc.fecha).toISOString().split('T')[0] : '',
      archivo_url: doc.archivo_url || '',
      creado_en: doc.creado_en ? new Date(doc.creado_en).toISOString() : '',
      actualizado_en: doc.actualizado_en ? new Date(doc.actualizado_en).toISOString() : ''
    }));

    const metadata = generateDCATMetadata(
      'Documentos de Transparencia',
      'Documentos públicos de transparencia y acceso a la información del Concejo Municipal de Guachucal',
      'transparencia'
    );

    const timestamp = Date.now();
    let filePath;
    let fileName;
    let contentType;

    if (formato === 'csv') {
      fileName = `transparencia_${timestamp}.csv`;
      filePath = path.join(tempDir, fileName);
      const headers = [
        { key: 'id', label: 'ID' },
        { key: 'titulo', label: 'Título' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'archivo_url', label: 'URL Archivo' },
        { key: 'creado_en', label: 'Fecha Creación' },
        { key: 'actualizado_en', label: 'Última Actualización' }
      ];
      await exportToCSV(data, headers, filePath);
      contentType = 'text/csv';
    } else if (formato === 'xml') {
      fileName = `transparencia_${timestamp}.xml`;
      filePath = path.join(tempDir, fileName);
      exportToXML(data, metadata, filePath);
      contentType = 'application/xml';
    } else {
      fileName = `transparencia_${timestamp}.json`;
      filePath = path.join(tempDir, fileName);
      exportToJSON(data, metadata, filePath);
      contentType = 'application/json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error enviando archivo:', err);
      } else {
        // Eliminar archivo después de enviarlo (después de 5 segundos)
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      }
    });
  } catch (error) {
    console.error('Error exportando datos de transparencia:', error);
    res.status(500).json({ error: 'Error exportando datos' });
  }
});

/**
 * Exportar datos de gaceta
 */
router.get('/exportar/gaceta', async (req, res) => {
  try {
    const { formato = 'json', tipo, fecha_desde, fecha_hasta } = req.query;

    let query = 'SELECT * FROM documentos_gaceta WHERE publicada = TRUE';
    const params = [];

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    if (fecha_desde) {
      query += ' AND fecha >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND fecha <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY fecha DESC';

    const [documentos] = await pool.execute(query, params);

    const data = documentos.map(doc => ({
      id: doc.id,
      titulo: doc.titulo,
      descripcion: doc.descripcion || '',
      tipo: doc.tipo,
      numero: doc.numero || '',
      fecha: doc.fecha ? new Date(doc.fecha).toISOString().split('T')[0] : '',
      archivo_url: doc.archivo_url || '',
      creado_en: doc.creado_en ? new Date(doc.creado_en).toISOString() : '',
      actualizado_en: doc.actualizado_en ? new Date(doc.actualizado_en).toISOString() : ''
    }));

    const metadata = generateDCATMetadata(
      'Gaceta Municipal',
      'Acuerdos, actas, decretos y documentos normativos del Concejo Municipal de Guachucal',
      'normatividad'
    );

    const timestamp = Date.now();
    let filePath;
    let fileName;
    let contentType;

    if (formato === 'csv') {
      fileName = `gaceta_${timestamp}.csv`;
      filePath = path.join(tempDir, fileName);
      const headers = [
        { key: 'id', label: 'ID' },
        { key: 'titulo', label: 'Título' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'numero', label: 'Número' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'archivo_url', label: 'URL Archivo' },
        { key: 'creado_en', label: 'Fecha Creación' },
        { key: 'actualizado_en', label: 'Última Actualización' }
      ];
      await exportToCSV(data, headers, filePath);
      contentType = 'text/csv';
    } else if (formato === 'xml') {
      fileName = `gaceta_${timestamp}.xml`;
      filePath = path.join(tempDir, fileName);
      exportToXML(data, metadata, filePath);
      contentType = 'application/xml';
    } else {
      fileName = `gaceta_${timestamp}.json`;
      filePath = path.join(tempDir, fileName);
      exportToJSON(data, metadata, filePath);
      contentType = 'application/json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error enviando archivo:', err);
      } else {
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      }
    });
  } catch (error) {
    console.error('Error exportando datos de gaceta:', error);
    res.status(500).json({ error: 'Error exportando datos' });
  }
});

/**
 * Exportar noticias
 */
router.get('/exportar/noticias', async (req, res) => {
  try {
    const { formato = 'json', fecha_desde, fecha_hasta } = req.query;

    let query = 'SELECT * FROM noticias WHERE publicada = TRUE';
    const params = [];

    if (fecha_desde) {
      query += ' AND fecha_publicacion >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND fecha_publicacion <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY fecha_publicacion DESC';

    const [noticias] = await pool.execute(query, params);

    const data = noticias.map(noticia => ({
      id: noticia.id,
      titulo: noticia.titulo,
      resumen: noticia.resumen || '',
      contenido: noticia.contenido ? noticia.contenido.replace(/<[^>]*>/g, '').substring(0, 500) : '',
      categoria: noticia.categoria || '',
      fecha_publicacion: noticia.fecha_publicacion ? new Date(noticia.fecha_publicacion).toISOString() : '',
      imagen_url: noticia.imagen_url || '',
      creado_en: noticia.creado_en ? new Date(noticia.creado_en).toISOString() : '',
      actualizado_en: noticia.actualizado_en ? new Date(noticia.actualizado_en).toISOString() : ''
    }));

    const metadata = generateDCATMetadata(
      'Noticias del Concejo Municipal',
      'Noticias y comunicados oficiales del Concejo Municipal de Guachucal',
      'comunicacion'
    );

    const timestamp = Date.now();
    let filePath;
    let fileName;
    let contentType;

    if (formato === 'csv') {
      fileName = `noticias_${timestamp}.csv`;
      filePath = path.join(tempDir, fileName);
      const headers = [
        { key: 'id', label: 'ID' },
        { key: 'titulo', label: 'Título' },
        { key: 'resumen', label: 'Resumen' },
        { key: 'categoria', label: 'Categoría' },
        { key: 'fecha_publicacion', label: 'Fecha Publicación' },
        { key: 'imagen_url', label: 'URL Imagen' },
        { key: 'creado_en', label: 'Fecha Creación' },
        { key: 'actualizado_en', label: 'Última Actualización' }
      ];
      await exportToCSV(data, headers, filePath);
      contentType = 'text/csv';
    } else if (formato === 'xml') {
      fileName = `noticias_${timestamp}.xml`;
      filePath = path.join(tempDir, fileName);
      exportToXML(data, metadata, filePath);
      contentType = 'application/xml';
    } else {
      fileName = `noticias_${timestamp}.json`;
      filePath = path.join(tempDir, fileName);
      exportToJSON(data, metadata, filePath);
      contentType = 'application/json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error enviando archivo:', err);
      } else {
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      }
    });
  } catch (error) {
    console.error('Error exportando noticias:', error);
    res.status(500).json({ error: 'Error exportando datos' });
  }
});

/**
 * Exportar convocatorias
 */
router.get('/exportar/convocatorias', async (req, res) => {
  try {
    const { formato = 'json', fecha_desde, fecha_hasta } = req.query;

    let query = 'SELECT * FROM convocatorias WHERE publicada = TRUE';
    const params = [];

    if (fecha_desde) {
      query += ' AND fecha_inicio >= ?';
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ' AND fecha_fin <= ?';
      params.push(fecha_hasta);
    }

    query += ' ORDER BY fecha_inicio DESC';

    const [convocatorias] = await pool.execute(query, params);

    const data = convocatorias.map(conv => ({
      id: conv.id,
      titulo: conv.titulo,
      descripcion: conv.descripcion ? conv.descripcion.replace(/<[^>]*>/g, '').substring(0, 500) : '',
      fecha_inicio: conv.fecha_inicio ? new Date(conv.fecha_inicio).toISOString().split('T')[0] : '',
      fecha_fin: conv.fecha_fin ? new Date(conv.fecha_fin).toISOString().split('T')[0] : '',
      destacada: conv.destacada ? 'Sí' : 'No',
      imagen_url: conv.imagen_url || '',
      creado_en: conv.creado_en ? new Date(conv.creado_en).toISOString() : '',
      actualizado_en: conv.actualizado_en ? new Date(conv.actualizado_en).toISOString() : ''
    }));

    const metadata = generateDCATMetadata(
      'Convocatorias Públicas',
      'Convocatorias públicas y procesos de selección del Concejo Municipal de Guachucal',
      'convocatorias'
    );

    const timestamp = Date.now();
    let filePath;
    let fileName;
    let contentType;

    if (formato === 'csv') {
      fileName = `convocatorias_${timestamp}.csv`;
      filePath = path.join(tempDir, fileName);
      const headers = [
        { key: 'id', label: 'ID' },
        { key: 'titulo', label: 'Título' },
        { key: 'descripcion', label: 'Descripción' },
        { key: 'fecha_inicio', label: 'Fecha Inicio' },
        { key: 'fecha_fin', label: 'Fecha Fin' },
        { key: 'destacada', label: 'Destacada' },
        { key: 'imagen_url', label: 'URL Imagen' },
        { key: 'creado_en', label: 'Fecha Creación' },
        { key: 'actualizado_en', label: 'Última Actualización' }
      ];
      await exportToCSV(data, headers, filePath);
      contentType = 'text/csv';
    } else if (formato === 'xml') {
      fileName = `convocatorias_${timestamp}.xml`;
      filePath = path.join(tempDir, fileName);
      exportToXML(data, metadata, filePath);
      contentType = 'application/xml';
    } else {
      fileName = `convocatorias_${timestamp}.json`;
      filePath = path.join(tempDir, fileName);
      exportToJSON(data, metadata, filePath);
      contentType = 'application/json';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error enviando archivo:', err);
      } else {
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      }
    });
  } catch (error) {
    console.error('Error exportando convocatorias:', error);
    res.status(500).json({ error: 'Error exportando datos' });
  }
});

module.exports = router;















