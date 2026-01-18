const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los usuarios (solo admin)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [usuarios] = await pool.execute(
      `SELECT id, nombre, email, rol, activo, creado_en, actualizado_en 
       FROM usuarios 
       ORDER BY creado_en DESC`
    );

    // Obtener permisos de cada usuario
    const usuariosConPermisos = await Promise.all(
      usuarios.map(async (usuario) => {
        const [permisos] = await pool.execute(
          `SELECT up.*, m.nombre as modulo_nombre, m.descripcion as modulo_descripcion
           FROM usuarios_permisos up
           INNER JOIN modulos m ON up.modulo_id = m.id
           WHERE up.usuario_id = ?`,
          [usuario.id]
        );
        return { ...usuario, permisos };
      })
    );

    res.json(usuariosConPermisos);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// Obtener un usuario por ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [usuarios] = await pool.execute(
      `SELECT id, nombre, email, rol, activo, creado_en, actualizado_en 
       FROM usuarios 
       WHERE id = ?`,
      [req.params.id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];

    // Obtener permisos del usuario
    const [permisos] = await pool.execute(
      `SELECT up.*, m.nombre as modulo_nombre, m.descripcion as modulo_descripcion
       FROM usuarios_permisos up
       INNER JOIN modulos m ON up.modulo_id = m.id
       WHERE up.usuario_id = ?`,
      [usuario.id]
    );

    res.json({ ...usuario, permisos });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
});

// Crear nuevo usuario
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, email, password, rol, activo, permisos } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    // Verificar si el email ya existe
    const [existingUsers] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol || 'usuario', activo !== undefined ? activo : true]
    );

    const userId = result.insertId;

    // Asignar permisos si se proporcionaron
    if (permisos && Array.isArray(permisos)) {
      for (const permiso of permisos) {
        // Obtener ID del módulo
        const [modulos] = await pool.execute(
          'SELECT id FROM modulos WHERE nombre = ?',
          [permiso.modulo]
        );

        if (modulos.length > 0) {
          await pool.execute(
            `INSERT INTO usuarios_permisos 
             (usuario_id, modulo_id, puede_crear, puede_editar, puede_eliminar, puede_publicar)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             puede_crear = VALUES(puede_crear),
             puede_editar = VALUES(puede_editar),
             puede_eliminar = VALUES(puede_eliminar),
             puede_publicar = VALUES(puede_publicar)`,
            [
              userId,
              modulos[0].id,
              permiso.puede_crear || false,
              permiso.puede_editar || false,
              permiso.puede_eliminar || false,
              permiso.puede_publicar || false
            ]
          );
        }
      }
    }

    res.status(201).json({ id: userId, message: 'Usuario creado exitosamente' });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

// Actualizar usuario
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nombre, email, password, rol, activo, permisos } = req.body;
    const userId = req.params.id;

    // Verificar si el usuario existe
    const [usuarios] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [userId]);
    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si el email ya existe en otro usuario
    if (email) {
      const [existingUsers] = await pool.execute(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
    }

    // Construir query de actualización
    const updates = [];
    const values = [];

    if (nombre) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    if (rol !== undefined) {
      updates.push('rol = ?');
      values.push(rol);
    }
    if (activo !== undefined) {
      updates.push('activo = ?');
      values.push(activo);
    }

    if (updates.length > 0) {
      values.push(userId);
      await pool.execute(
        `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Actualizar permisos si se proporcionaron
    if (permisos && Array.isArray(permisos)) {
      // Eliminar permisos existentes
      await pool.execute('DELETE FROM usuarios_permisos WHERE usuario_id = ?', [userId]);

      // Insertar nuevos permisos
      for (const permiso of permisos) {
        const [modulos] = await pool.execute(
          'SELECT id FROM modulos WHERE nombre = ?',
          [permiso.modulo]
        );

        if (modulos.length > 0) {
          await pool.execute(
            `INSERT INTO usuarios_permisos 
             (usuario_id, modulo_id, puede_crear, puede_editar, puede_eliminar, puede_publicar)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              userId,
              modulos[0].id,
              permiso.puede_crear || false,
              permiso.puede_editar || false,
              permiso.puede_eliminar || false,
              permiso.puede_publicar || false
            ]
          );
        }
      }
    }

    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
});

// Eliminar usuario
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // No permitir eliminar el propio usuario
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    await pool.execute('DELETE FROM usuarios WHERE id = ?', [userId]);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
});

// Obtener todos los módulos disponibles
router.get('/modulos/list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [modulos] = await pool.execute(
      'SELECT * FROM modulos WHERE activo = TRUE ORDER BY nombre'
    );
    res.json(modulos);
  } catch (error) {
    console.error('Error obteniendo módulos:', error);
    res.status(500).json({ error: 'Error obteniendo módulos' });
  }
});

module.exports = router;

















