const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorios si no existen
const uploadsDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadsDir, 'images');
const documentsDir = path.join(uploadsDir, 'documents');
const galeriaDir = path.join(uploadsDir, 'galeria');

[uploadsDir, imagesDir, documentsDir, galeriaDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuración para imágenes
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'noticia-' + uniqueSuffix + ext);
  }
});

// Configuración para documentos
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

// Filtros de archivos
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.includes('pdf') || 
                   file.mimetype.includes('msword') || 
                   file.mimetype.includes('spreadsheet') ||
                   file.mimetype.includes('presentation') ||
                   file.mimetype.includes('text');

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten documentos (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT)'));
  }
};

// Configuraciones de multer
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const uploadDocuments = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: documentFilter
});

// Middleware combinado para subir imagen y documentos
const uploadNoticia = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'imagen') {
        cb(null, imagesDir);
      } else if (file.fieldname === 'documentos') {
        cb(null, documentsDir);
      } else {
        cb(null, uploadsDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      if (file.fieldname === 'imagen') {
        cb(null, 'noticia-' + uniqueSuffix + ext);
      } else {
        cb(null, 'doc-' + uniqueSuffix + ext);
      }
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'imagen') {
      return imageFilter(req, file, cb);
    } else if (file.fieldname === 'documentos') {
      return documentFilter(req, file, cb);
    }
    cb(new Error('Campo de archivo no reconocido'));
  }
}).fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'documentos', maxCount: 5 }
]);

// Middleware para convocatorias (imagen y documento)
const uploadConvocatoria = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'imagen') {
        cb(null, imagesDir);
      } else if (file.fieldname === 'documento') {
        cb(null, documentsDir);
      } else {
        cb(null, uploadsDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      if (file.fieldname === 'imagen') {
        cb(null, 'convocatoria-' + uniqueSuffix + ext);
      } else {
        cb(null, 'convocatoria-doc-' + uniqueSuffix + ext);
      }
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'imagen') {
      return imageFilter(req, file, cb);
    } else if (file.fieldname === 'documento') {
      return documentFilter(req, file, cb);
    }
    cb(new Error('Campo de archivo no reconocido'));
  }
}).fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'documento', maxCount: 1 }
]);

// Middleware para gaceta (imagen y documento)
const uploadGaceta = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'imagen') {
        cb(null, imagesDir);
      } else if (file.fieldname === 'archivo') {
        cb(null, documentsDir);
      } else {
        cb(null, uploadsDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      if (file.fieldname === 'imagen') {
        cb(null, 'gaceta-' + uniqueSuffix + ext);
      } else {
        cb(null, 'gaceta-doc-' + uniqueSuffix + ext);
      }
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'imagen') {
      return imageFilter(req, file, cb);
    } else if (file.fieldname === 'archivo') {
      return documentFilter(req, file, cb);
    }
    cb(new Error('Campo de archivo no reconocido'));
  }
}).fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'archivo', maxCount: 1 }
]);

// Middleware para transparencia (imagen y documento)
const uploadTransparencia = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'imagen') {
        cb(null, imagesDir);
      } else if (file.fieldname === 'archivo') {
        cb(null, documentsDir);
      } else {
        cb(null, uploadsDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      if (file.fieldname === 'imagen') {
        cb(null, 'transparencia-' + uniqueSuffix + ext);
      } else {
        cb(null, 'transparencia-doc-' + uniqueSuffix + ext);
      }
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'imagen') {
      return imageFilter(req, file, cb);
    } else if (file.fieldname === 'archivo') {
      return documentFilter(req, file, cb);
    }
    cb(new Error('Campo de archivo no reconocido'));
  }
}).fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'archivo', maxCount: 1 }
]);

// Middleware para sesiones (imagen y acta)
const uploadSesion = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'imagen') {
        cb(null, imagesDir);
      } else if (file.fieldname === 'acta') {
        cb(null, documentsDir);
      } else {
        cb(null, uploadsDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      if (file.fieldname === 'imagen') {
        cb(null, 'sesion-' + uniqueSuffix + ext);
      } else {
        cb(null, 'sesion-acta-' + uniqueSuffix + ext);
      }
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'imagen') {
      return imageFilter(req, file, cb);
    } else if (file.fieldname === 'acta') {
      return documentFilter(req, file, cb);
    }
    cb(new Error('Campo de archivo no reconocido'));
  }
}).fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'acta', maxCount: 1 }
]);

// Middleware para autoridades (foto y documento)
const uploadAutoridad = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'foto') {
        cb(null, imagesDir);
      } else if (file.fieldname === 'documento') {
        cb(null, documentsDir);
      } else {
        cb(null, uploadsDir);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      if (file.fieldname === 'foto') {
        cb(null, 'autoridad-' + uniqueSuffix + ext);
      } else {
        cb(null, 'autoridad-doc-' + uniqueSuffix + ext);
      }
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'foto') {
      return imageFilter(req, file, cb);
    } else if (file.fieldname === 'documento') {
      return documentFilter(req, file, cb);
    }
    cb(new Error('Campo de archivo no reconocido'));
  }
}).fields([
  { name: 'foto', maxCount: 1 },
  { name: 'documento', maxCount: 1 }
]);

// Configuración para galería multimedia (imágenes y videos)
const galeriaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, galeriaDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fieldName = file.fieldname === 'thumbnail' ? 'thumb-' : '';
    cb(null, `galeria-${fieldName}${uniqueSuffix}${ext}`);
  }
});

const galeriaFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|webm|ogg|mov|avi/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (file.fieldname === 'archivo') {
    // Archivo principal puede ser imagen o video
    if (allowedImageTypes.test(ext) || allowedVideoTypes.test(ext)) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP) o videos (MP4, WEBM, OGG, MOV, AVI)'));
    }
  } else if (file.fieldname === 'thumbnail') {
    // Thumbnail solo puede ser imagen
    if (allowedImageTypes.test(ext)) {
      return cb(null, true);
    } else {
      cb(new Error('El thumbnail debe ser una imagen (JPEG, JPG, PNG, GIF, WEBP)'));
    }
  } else {
    cb(new Error('Campo de archivo no válido'));
  }
};

const uploadGaleria = multer({
  storage: galeriaStorage,
  limits: { 
    fileSize: 100 * 1024 * 1024 // 100MB para videos
  },
  fileFilter: galeriaFilter
});

module.exports = {
  uploadImage: uploadImage.single('imagen'),
  uploadDocuments: uploadDocuments.array('documentos', 5),
  uploadNoticia, // Middleware combinado
  uploadConvocatoria,
  uploadGaceta,
  uploadTransparencia,
  uploadSesion,
  uploadAutoridad,
  uploadGaleria,
  imagesDir,
  documentsDir
};

