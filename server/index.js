const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Trust proxy (necesario cuando está detrás de Nginx)
// Configurar como 1 para confiar solo en el proxy de Nginx (más seguro)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:5001", "http://localhost:3000", "http://localhost:3001"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 intentos de login por 15 minutos
  message: 'Demasiados intentos de autenticación, por favor intenta de nuevo más tarde.',
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/noticias', require('./routes/noticias'));
app.use('/api/convocatorias', require('./routes/convocatorias'));
app.use('/api/gaceta', require('./routes/gaceta'));
app.use('/api/transparencia', require('./routes/transparencia'));
app.use('/api/sesiones', require('./routes/sesiones'));
app.use('/api/autoridades', require('./routes/autoridades'));
app.use('/api/configuracion', require('./routes/configuracion'));
app.use('/api/pqrsd', require('./routes/pqrsd'));
app.use('/api/datos-abiertos', require('./routes/datosAbiertos'));
app.use('/api/galeria', require('./routes/galeria'));
app.use('/api/encuestas', require('./routes/encuestas'));
app.use('/api/historia', require('./routes/historia'));
app.use('/api/tramites', require('./routes/tramites'));
app.use('/api/busqueda', require('./routes/busqueda'));
app.use('/api/opiniones', require('./routes/opiniones'));
app.use('/api/foros', require('./routes/foros'));
app.use('/api/contacto', require('./routes/contacto'));
app.use('/api/repositorio', require('./routes/repositorio'));
app.use('/api/actividades', require('./routes/actividades'));
app.use('/api/parroquias', require('./routes/parroquias'));
app.use('/api/sacramentos', require('./routes/sacramentos'));
app.use('/api/liturgia', require('./routes/liturgia'));
app.use('/api/pastoral', require('./routes/pastoral'));
app.use('/api/formacion', require('./routes/formacion'));
app.use('/api/caridad', require('./routes/caridad'));
app.use('/api/misiones', require('./routes/misiones'));
app.use('/api/juventud', require('./routes/juventud'));
app.use('/api/familias', require('./routes/familias'));
app.use('/api/intenciones-misa', require('./routes/intencionesMisa'));
app.use('/api/donaciones', require('./routes/donaciones'));
app.use('/api/oraciones', require('./routes/oraciones'));
app.use('/api/biblioteca-digital', require('./routes/bibliotecaDigital'));
app.use('/api/homilias', require('./routes/homilias'));
app.use('/api/testimonios', require('./routes/testimonios'));
app.use('/api/eventos-especiales', require('./routes/eventosEspeciales'));
app.use('/api/reservas', require('./routes/reservas'));
app.use('/api/catequesis', require('./routes/catequesis'));
app.use('/api/medios', require('./routes/medios'));
app.use('/api/search-profile', require('./routes/searchProfile'));
console.log('✅ Ruta /api/repositorio registrada correctamente');

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API del Concejo Municipal de Guachucal',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      noticias: '/api/noticias',
      convocatorias: '/api/convocatorias',
      gaceta: '/api/gaceta',
      transparencia: '/api/transparencia',
      sesiones: '/api/sesiones',
      configuracion: '/api/configuracion'
    }
  });
});

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API del Concejo Municipal de Guachucal',
    version: '1.0.0'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Base de datos: ${process.env.DB_NAME || 'diocesis'}`);
});


