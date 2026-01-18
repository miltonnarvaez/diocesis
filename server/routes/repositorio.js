const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Directorio base del repositorio temporal
const repositorioBaseDir = path.join(__dirname, '../uploads/repositorio-temporal');

// Carpetas organizadas por categoría
const carpetas = {
  'acerca-de': 'Acerca del Concejo',
  'miembros': 'Miembros del Concejo',
  'historia': 'Historia',
  'gaceta': 'Gaceta',
  'sesiones': 'Sesiones',
  'transparencia': 'Transparencia',
  'documentos-oficiales': 'Documentos Oficiales',
  'documentos-generales': 'Documentos Generales',
  // Carpetas de Acerca de
  'acerca-mision': 'Acerca - Misión',
  'acerca-vision': 'Acerca - Visión',
  'acerca-estructura-jerarquica': 'Acerca - Estructura Jerárquica',
  'acerca-autoridades': 'Acerca - Autoridades',
  'acerca-contacto': 'Acerca - Contacto',
  'acerca-simbolos': 'Acerca - Símbolos',
  'plan-accion': 'Plan de Acción 2025',
  // Carpetas de Documentos
  'documentos-gaceta-municipal': 'Documentos - Gaceta Municipal',
  'documentos-acuerdos': 'Documentos - Acuerdos',
  'documentos-actas-sesion': 'Documentos - Actas de Sesión',
  'documentos-decretos': 'Documentos - Decretos',
  'documentos-proyectos': 'Documentos - Proyectos',
  'documentos-manuales': 'Documentos - Manuales',
  'documentos-leyes': 'Documentos - Leyes',
  'documentos-politicas': 'Documentos - Políticas',
  // Carpetas de Transparencia
  'transparencia-presupuesto': 'Transparencia - Presupuesto',
  'transparencia-contratacion-publica': 'Transparencia - Contratación Pública',
  'transparencia-plan-anual-compras': 'Transparencia - Plan Anual de Compras',
  'transparencia-rendicion-cuentas': 'Transparencia - Rendición de Cuentas',
  'transparencia-estados-financieros': 'Transparencia - Estados Financieros',
  'transparencia-control-interno': 'Transparencia - Control Interno',
  'transparencia-declaracion-renta': 'Transparencia - Declaración de Renta',
  'transparencia-estructura-organizacional': 'Transparencia - Estructura Organizacional',
  'transparencia-plan-desarrollo': 'Transparencia - Plan de Desarrollo',
  'transparencia-normatividad': 'Transparencia - Normatividad',
  'transparencia-servicios-ciudadanos': 'Transparencia - Servicios Ciudadanos',
  'transparencia-auditorias': 'Transparencia - Auditorías',
  'transparencia-bienes-inmuebles': 'Transparencia - Bienes Inmuebles',
  'transparencia-personal': 'Transparencia - Personal'
};

// Crear carpetas si no existen
Object.keys(carpetas).forEach(carpeta => {
  const carpetaPath = path.join(repositorioBaseDir, carpeta);
  if (!fs.existsSync(carpetaPath)) {
    fs.mkdirSync(carpetaPath, { recursive: true });
  }
});

// Configuración de multer para el repositorio
const repositorioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const categoria = req.body.categoria || 'documentos-generales';
    const carpetaPath = path.join(repositorioBaseDir, categoria);
    
    // Asegurar que la carpeta existe
    if (!fs.existsSync(carpetaPath)) {
      fs.mkdirSync(carpetaPath, { recursive: true });
    }
    
    cb(null, carpetaPath);
  },
  filename: (req, file, cb) => {
    // Mantener el nombre original con timestamp para evitar conflictos
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${originalName}`);
  }
});

// Filtro de archivos - aceptar casi cualquier tipo
const repositorioFilter = (req, file, cb) => {
  // Permitir imágenes, documentos, hojas de cálculo, presentaciones, texto, etc.
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|json|xml|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Formatos aceptados: imágenes, documentos, hojas de cálculo, presentaciones, texto, CSV, JSON, XML, ZIP, RAR'));
  }
};

const uploadRepositorio = multer({
  storage: repositorioStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB máximo
  fileFilter: repositorioFilter
});

// Función para cargar metadatos de una carpeta
const cargarMetadatos = (categoria) => {
  const metadataPath = path.join(repositorioBaseDir, categoria, 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    try {
      const metadataContent = fs.readFileSync(metadataPath, 'utf8');
      return JSON.parse(metadataContent);
    } catch (error) {
      console.error('Error cargando metadatos:', error);
      return {};
    }
  }
  return {};
};

// Función para guardar metadatos de una carpeta
const guardarMetadatos = (categoria, metadata) => {
  const metadataPath = path.join(repositorioBaseDir, categoria, 'metadata.json');
  try {
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  } catch (error) {
    console.error('Error guardando metadatos:', error);
  }
};

// Función auxiliar para obtener información de archivos
const getFileInfo = (filePath, categoria, nota = null) => {
  const stats = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const fileSize = stats.size;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  const fechaSubida = stats.birthtime;
  
  // Cargar metadatos si existen
  const metadata = cargarMetadatos(categoria);
  const notaArchivo = nota || metadata[fileName]?.nota || null;
  
  return {
    nombre: fileName,
    nombreOriginal: fileName.replace(/^\d+-/, ''), // Remover timestamp del inicio
    ruta: filePath,
    rutaRelativa: path.relative(repositorioBaseDir, filePath),
    categoria: categoria,
    tamaño: fileSize,
    tamañoMB: fileSizeMB,
    fechaSubida: fechaSubida,
    extension: path.extname(fileName).toLowerCase(),
    nota: notaArchivo
  };
};

// Función para listar archivos en una carpeta
const listarArchivosCarpeta = (carpeta) => {
  const carpetaPath = path.join(repositorioBaseDir, carpeta);
  
  if (!fs.existsSync(carpetaPath)) {
    return [];
  }
  
  const archivos = fs.readdirSync(carpetaPath);
  return archivos
    .filter(archivo => {
      const archivoPath = path.join(carpetaPath, archivo);
      // Excluir el archivo metadata.json
      return fs.statSync(archivoPath).isFile() && archivo !== 'metadata.json';
    })
    .map(archivo => {
      const archivoPath = path.join(carpetaPath, archivo);
      return getFileInfo(archivoPath, carpeta);
    })
    .sort((a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida)); // Más recientes primero
};

// ============================================
// RUTAS PÚBLICAS (para que el concejo suba archivos)
// ============================================

// Listar categorías disponibles
router.get('/categorias', (req, res) => {
  try {
    const categorias = Object.keys(carpetas).map(key => ({
      id: key,
      nombre: carpetas[key],
      cantidadArchivos: listarArchivosCarpeta(key).length
    }));
    
    console.log('📁 Categorías disponibles:', categorias);
    res.json(categorias);
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
});

// Listar archivos de una categoría (público - sin autenticación)
router.get('/listar/:categoria?', (req, res) => {
  try {
    const categoria = req.params.categoria;
    
    if (categoria && carpetas[categoria]) {
      // Listar archivos de una categoría específica
      const archivos = listarArchivosCarpeta(categoria);
      res.json({
        categoria: categoria,
        nombreCategoria: carpetas[categoria],
        archivos: archivos,
        total: archivos.length
      });
    } else {
      // Listar todas las categorías con sus archivos
      const todasLasCategorias = {};
      let totalArchivos = 0;
      
      Object.keys(carpetas).forEach(cat => {
        const archivos = listarArchivosCarpeta(cat);
        todasLasCategorias[cat] = {
          nombre: carpetas[cat],
          archivos: archivos,
          total: archivos.length
        };
        totalArchivos += archivos.length;
      });
      
      res.json({
        categorias: todasLasCategorias,
        totalArchivos: totalArchivos
      });
    }
  } catch (error) {
    console.error('Error listando archivos:', error);
    res.status(500).json({ error: 'Error listando archivos' });
  }
});

// Subir archivo (sin autenticación - acceso público con token simple)
router.post('/upload', uploadRepositorio.single('archivo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const categoria = req.body.categoria || 'documentos-generales';
    
    if (!carpetas[categoria]) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }

    const fileInfo = getFileInfo(req.file.path, categoria);

    res.json({
      mensaje: 'Archivo subido exitosamente',
      archivo: fileInfo
    });
  } catch (error) {
    console.error('Error subiendo archivo:', error);
    res.status(500).json({ error: error.message || 'Error subiendo archivo' });
  }
});

// Subir múltiples archivos
router.post('/upload-multiple', uploadRepositorio.array('archivos', 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const categoria = req.body.categoria || 'documentos-generales';
    const nota = req.body.nota || null; // La misma nota se aplica a todos los archivos
    
    if (!carpetas[categoria]) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }

    // Guardar nota en metadatos si existe (se aplica a todos los archivos)
    if (nota && nota.trim()) {
      const metadata = cargarMetadatos(categoria);
      req.files.forEach(file => {
        metadata[file.filename] = {
          nota: nota.trim(),
          fechaNota: new Date().toISOString()
        };
      });
      guardarMetadatos(categoria, metadata);
    }

    const archivos = req.files.map(file => getFileInfo(file.path, categoria, nota));

    res.json({
      mensaje: `${archivos.length} archivo(s) subido(s) exitosamente`,
      archivos: archivos
    });
  } catch (error) {
    console.error('Error subiendo archivos:', error);
    res.status(500).json({ error: error.message || 'Error subiendo archivos' });
  }
});

// ============================================
// RUTAS PÚBLICAS ADICIONALES (temporalmente sin autenticación)
// ============================================

// Descargar archivo (público temporalmente)
router.get('/descargar/:categoria/:nombreArchivo', (req, res) => {
  try {
    const { categoria, nombreArchivo } = req.params;
    const archivoPath = path.join(repositorioBaseDir, categoria, nombreArchivo);
    
    if (!fs.existsSync(archivoPath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    res.download(archivoPath);
  } catch (error) {
    console.error('Error descargando archivo:', error);
    res.status(500).json({ error: 'Error descargando archivo' });
  }
});

// Eliminar archivo (público temporalmente)
router.delete('/eliminar/:categoria/:nombreArchivo', async (req, res) => {
  try {
    const { categoria, nombreArchivo } = req.params;
    const archivoPath = path.join(repositorioBaseDir, categoria, nombreArchivo);
    
    if (!fs.existsSync(archivoPath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    fs.unlinkSync(archivoPath);
    
    res.json({ mensaje: 'Archivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({ error: 'Error eliminando archivo' });
  }
});

// Mover archivo entre categorías (público temporalmente)
router.put('/mover', async (req, res) => {
  try {
    const { categoriaOrigen, categoriaDestino, nombreArchivo } = req.body;
    
    if (!carpetas[categoriaOrigen] || !carpetas[categoriaDestino]) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }
    
    const archivoOrigen = path.join(repositorioBaseDir, categoriaOrigen, nombreArchivo);
    const archivoDestino = path.join(repositorioBaseDir, categoriaDestino, nombreArchivo);
    
    if (!fs.existsSync(archivoOrigen)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    fs.renameSync(archivoOrigen, archivoDestino);
    
    res.json({ 
      mensaje: 'Archivo movido exitosamente',
      archivo: getFileInfo(archivoDestino, categoriaDestino)
    });
  } catch (error) {
    console.error('Error moviendo archivo:', error);
    res.status(500).json({ error: 'Error moviendo archivo' });
  }
});

// ============================================
// RUTAS DE ADMINISTRADOR (para revisar y procesar)
// ============================================

// Listar todos los archivos del repositorio
router.get('/admin/listar', authenticateToken, requireAdmin, (req, res) => {
  try {
    const categoria = req.query.categoria;
    
    if (categoria && carpetas[categoria]) {
      // Listar archivos de una categoría específica
      const archivos = listarArchivosCarpeta(categoria);
      res.json({
        categoria: categoria,
        nombreCategoria: carpetas[categoria],
        archivos: archivos,
        total: archivos.length
      });
    } else {
      // Listar todos los archivos de todas las categorías
      const todasLasCategorias = {};
      let totalArchivos = 0;
      
      Object.keys(carpetas).forEach(cat => {
        const archivos = listarArchivosCarpeta(cat);
        todasLasCategorias[cat] = {
          nombre: carpetas[cat],
          archivos: archivos,
          total: archivos.length
        };
        totalArchivos += archivos.length;
      });
      
      res.json({
        categorias: todasLasCategorias,
        totalArchivos: totalArchivos
      });
    }
  } catch (error) {
    console.error('Error listando archivos:', error);
    res.status(500).json({ error: 'Error listando archivos' });
  }
});

// Descargar archivo
router.get('/admin/descargar/:categoria/:nombreArchivo', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { categoria, nombreArchivo } = req.params;
    const archivoPath = path.join(repositorioBaseDir, categoria, nombreArchivo);
    
    if (!fs.existsSync(archivoPath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    res.download(archivoPath);
  } catch (error) {
    console.error('Error descargando archivo:', error);
    res.status(500).json({ error: 'Error descargando archivo' });
  }
});

// Eliminar archivo
router.delete('/admin/eliminar/:categoria/:nombreArchivo', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { categoria, nombreArchivo } = req.params;
    const archivoPath = path.join(repositorioBaseDir, categoria, nombreArchivo);
    
    if (!fs.existsSync(archivoPath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    fs.unlinkSync(archivoPath);
    
    res.json({ mensaje: 'Archivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({ error: 'Error eliminando archivo' });
  }
});

// Mover archivo entre categorías
router.put('/admin/mover', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { categoriaOrigen, categoriaDestino, nombreArchivo } = req.body;
    
    if (!carpetas[categoriaOrigen] || !carpetas[categoriaDestino]) {
      return res.status(400).json({ error: 'Categoría no válida' });
    }
    
    const archivoOrigen = path.join(repositorioBaseDir, categoriaOrigen, nombreArchivo);
    const archivoDestino = path.join(repositorioBaseDir, categoriaDestino, nombreArchivo);
    
    if (!fs.existsSync(archivoOrigen)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    fs.renameSync(archivoOrigen, archivoDestino);
    
    res.json({ 
      mensaje: 'Archivo movido exitosamente',
      archivo: getFileInfo(archivoDestino, categoriaDestino)
    });
  } catch (error) {
    console.error('Error moviendo archivo:', error);
    res.status(500).json({ error: 'Error moviendo archivo' });
  }
});

// Obtener estadísticas del repositorio
router.get('/admin/estadisticas', authenticateToken, requireAdmin, (req, res) => {
  try {
    const estadisticas = {};
    let totalArchivos = 0;
    let totalTamaño = 0;
    
    Object.keys(carpetas).forEach(cat => {
      const archivos = listarArchivosCarpeta(cat);
      const tamañoCategoria = archivos.reduce((sum, archivo) => sum + archivo.tamaño, 0);
      
      estadisticas[cat] = {
        nombre: carpetas[cat],
        cantidad: archivos.length,
        tamañoMB: (tamañoCategoria / (1024 * 1024)).toFixed(2)
      };
      
      totalArchivos += archivos.length;
      totalTamaño += tamañoCategoria;
    });
    
    res.json({
      categorias: estadisticas,
      totalArchivos: totalArchivos,
      totalTamañoMB: (totalTamaño / (1024 * 1024)).toFixed(2)
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

module.exports = router;


