const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Se requiere rol de administrador' });
  }
  next();
};

// Middleware para verificar permisos por módulo
const requirePermission = (modulo, accion = 'editar') => {
  return async (req, res, next) => {
    try {
      // Los administradores tienen todos los permisos
      if (req.user.rol === 'admin') {
        return next();
      }

      const pool = require('../config/database');
      
      // Obtener permisos del usuario para el módulo
      const [permisos] = await pool.execute(
        `SELECT up.* FROM usuarios_permisos up
         INNER JOIN modulos m ON up.modulo_id = m.id
         WHERE up.usuario_id = ? AND m.nombre = ?`,
        [req.user.id, modulo]
      );

      if (permisos.length === 0) {
        return res.status(403).json({ 
          error: `No tienes permisos para acceder al módulo ${modulo}` 
        });
      }

      const permiso = permisos[0];
      let tienePermiso = false;

      switch (accion) {
        case 'crear':
          tienePermiso = permiso.puede_crear;
          break;
        case 'editar':
          tienePermiso = permiso.puede_editar;
          break;
        case 'eliminar':
          tienePermiso = permiso.puede_eliminar;
          break;
        case 'publicar':
          tienePermiso = permiso.puede_publicar;
          break;
        default:
          tienePermiso = permiso.puede_editar;
      }

      if (!tienePermiso) {
        return res.status(403).json({ 
          error: `No tienes permiso para ${accion} en el módulo ${modulo}` 
        });
      }

      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
};

// Middleware para verificar permisos por categoría de transparencia
const requireTransparenciaPermission = (categoria, accion = 'editar') => {
  return async (req, res, next) => {
    try {
      // Los administradores tienen todos los permisos
      if (req.user.rol === 'admin') {
        return next();
      }

      const pool = require('../config/database');
      
      // Mapear categoría a nombre de módulo
      const moduloNombre = `transparencia_${categoria}`;
      
      // Obtener permisos del usuario para la categoría específica
      const [permisos] = await pool.execute(
        `SELECT up.* FROM usuarios_permisos up
         INNER JOIN modulos m ON up.modulo_id = m.id
         WHERE up.usuario_id = ? AND m.nombre = ?`,
        [req.user.id, moduloNombre]
      );

      // Si no tiene permisos específicos para la categoría, verificar permiso general de transparencia
      if (permisos.length === 0) {
        const [permisosGenerales] = await pool.execute(
          `SELECT up.* FROM usuarios_permisos up
           INNER JOIN modulos m ON up.modulo_id = m.id
           WHERE up.usuario_id = ? AND m.nombre = 'transparencia'`,
          [req.user.id]
        );
        
        if (permisosGenerales.length === 0) {
          return res.status(403).json({ 
            error: `No tienes permisos para acceder a la categoría ${categoria} de transparencia` 
          });
        }
        
        // Usar permisos generales de transparencia
        const permiso = permisosGenerales[0];
        let tienePermiso = false;

        switch (accion) {
          case 'crear':
            tienePermiso = permiso.puede_crear;
            break;
          case 'editar':
            tienePermiso = permiso.puede_editar;
            break;
          case 'eliminar':
            tienePermiso = permiso.puede_eliminar;
            break;
          case 'publicar':
            tienePermiso = permiso.puede_publicar;
            break;
          default:
            tienePermiso = permiso.puede_editar;
        }

        if (!tienePermiso) {
          return res.status(403).json({ 
            error: `No tienes permiso para ${accion} en la categoría ${categoria} de transparencia` 
          });
        }
        
        return next();
      }

      // Usar permisos específicos de la categoría
      const permiso = permisos[0];
      let tienePermiso = false;

      switch (accion) {
        case 'crear':
          tienePermiso = permiso.puede_crear;
          break;
        case 'editar':
          tienePermiso = permiso.puede_editar;
          break;
        case 'eliminar':
          tienePermiso = permiso.puede_eliminar;
          break;
        case 'publicar':
          tienePermiso = permiso.puede_publicar;
          break;
        default:
          tienePermiso = permiso.puede_editar;
      }

      if (!tienePermiso) {
        return res.status(403).json({ 
          error: `No tienes permiso para ${accion} en la categoría ${categoria} de transparencia` 
        });
      }

      next();
    } catch (error) {
      console.error('Error verificando permisos de transparencia:', error);
      res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
};

// Middleware opcional: verifica token si existe, pero no falla si no hay
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continuar sin usuario
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    }
    next(); // Continuar en cualquier caso
  });
};

module.exports = { authenticateToken, requireAdmin, optionalAuth, requirePermission, requireTransparenciaPermission };


