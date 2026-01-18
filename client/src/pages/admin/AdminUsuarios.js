import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminUsuarios.css';

const AdminUsuarios = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'usuario',
    activo: true,
    permisos: []
  });
  const queryClient = useQueryClient();

  // Obtener usuarios
  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const response = await api.get('/usuarios');
      return response.data;
    }
  });

  // Obtener módulos disponibles
  const { data: modulos = [] } = useQuery({
    queryKey: ['modulos'],
    queryFn: async () => {
      const response = await api.get('/usuarios/modulos/list');
      return response.data;
    }
  });

  // Cuando se selecciona un usuario para editar
  useEffect(() => {
    if (editingUsuario) {
      setFormData({
        nombre: editingUsuario.nombre || '',
        email: editingUsuario.email || '',
        password: '',
        rol: editingUsuario.rol || 'usuario',
        activo: editingUsuario.activo !== undefined ? editingUsuario.activo : true,
        permisos: editingUsuario.permisos || []
      });
      setShowForm(true);
    }
  }, [editingUsuario]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePermisoChange = (moduloNombre, accion, checked) => {
    setFormData(prev => {
      const permisos = [...prev.permisos];
      const index = permisos.findIndex(p => p.modulo === moduloNombre);
      
      if (index >= 0) {
        permisos[index] = { ...permisos[index], [accion]: checked };
      } else {
        permisos.push({
          modulo: moduloNombre,
          puede_crear: accion === 'puede_crear' ? checked : false,
          puede_editar: accion === 'puede_editar' ? checked : false,
          puede_eliminar: accion === 'puede_eliminar' ? checked : false,
          puede_publicar: accion === 'puede_publicar' ? checked : false
        });
      }
      
      return { ...prev, permisos };
    });
  };

  const getPermisoValue = (moduloNombre, accion) => {
    const permiso = formData.permisos.find(p => p.modulo === moduloNombre);
    if (!permiso) return false;
    return permiso[accion] || false;
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/usuarios', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['usuarios']);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/usuarios/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['usuarios']);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['usuarios']);
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'usuario',
      activo: true,
      permisos: []
    });
    setEditingUsuario(null);
    setShowForm(false);
  };

  const handleNewUsuario = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email) {
      alert('Nombre y email son requeridos');
      return;
    }

    if (!editingUsuario && !formData.password) {
      alert('La contraseña es requerida para nuevos usuarios');
      return;
    }

    const dataToSend = {
      nombre: formData.nombre,
      email: formData.email,
      rol: formData.rol,
      activo: formData.activo,
      permisos: formData.permisos.filter(p => 
        p.puede_crear || p.puede_editar || p.puede_eliminar || p.puede_publicar
      )
    };

    if (formData.password) {
      dataToSend.password = formData.password;
    }

    if (editingUsuario) {
      updateMutation.mutate({ id: editingUsuario.id, data: dataToSend });
    } else {
      createMutation.mutate(dataToSend);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  return (
    <div className="admin-usuarios">
      <AdminNavbar title="Gestión de Usuarios" />
      <div className="admin-content-wrapper">
        <div className="container">
          <div className="admin-actions">
            <button 
              onClick={handleNewUsuario}
              className="btn btn-primary"
            >
              + Nuevo Usuario
            </button>
          </div>

          {showForm && (
            <div className="admin-form-container">
              <form className="admin-form" onSubmit={handleSubmit}>
                <h2>{editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Contraseña {editingUsuario ? '(dejar vacío para no cambiar)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUsuario}
                  />
                </div>

                <div className="form-group">
                  <label>Rol</label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                  >
                    <option value="admin">Administrador</option>
                    <option value="editor">Editor</option>
                    <option value="usuario">Usuario</option>
                  </select>
                  <small>
                    Los administradores tienen todos los permisos automáticamente.
                    Los permisos específicos solo aplican para usuarios no-admin.
                  </small>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="activo"
                      checked={formData.activo}
                      onChange={handleChange}
                    />
                    Usuario activo
                  </label>
                </div>

                {formData.rol !== 'admin' && (
                  <div className="form-group permisos-section">
                    <label>Permisos por Módulo</label>
                    <div className="permisos-grid">
                      {modulos
                        .filter(modulo => !modulo.nombre.startsWith('transparencia_'))
                        .map(modulo => (
                          <div key={modulo.id} className="permiso-modulo">
                            <h4>{modulo.descripcion || modulo.nombre}</h4>
                            <div className="permiso-acciones">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={getPermisoValue(modulo.nombre, 'puede_crear')}
                                  onChange={(e) => handlePermisoChange(modulo.nombre, 'puede_crear', e.target.checked)}
                                />
                                Crear
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={getPermisoValue(modulo.nombre, 'puede_editar')}
                                  onChange={(e) => handlePermisoChange(modulo.nombre, 'puede_editar', e.target.checked)}
                                />
                                Editar
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={getPermisoValue(modulo.nombre, 'puede_eliminar')}
                                  onChange={(e) => handlePermisoChange(modulo.nombre, 'puede_eliminar', e.target.checked)}
                                />
                                Eliminar
                              </label>
                              <label>
                                <input
                                  type="checkbox"
                                  checked={getPermisoValue(modulo.nombre, 'puede_publicar')}
                                  onChange={(e) => handlePermisoChange(modulo.nombre, 'puede_publicar', e.target.checked)}
                                />
                                Publicar
                              </label>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    {/* Sección especial para categorías de transparencia */}
                    <div className="transparencia-categorias-section">
                      <h3>📋 Permisos por Categoría de Transparencia</h3>
                      <p className="section-description">
                        Asigna permisos específicos para cada categoría de documentos de transparencia.
                        Si no asignas permisos específicos, el usuario no podrá gestionar documentos en esas categorías.
                      </p>
                      <div className="permisos-grid">
                        {modulos
                          .filter(modulo => modulo.nombre.startsWith('transparencia_'))
                          .map(modulo => {
                            // Extraer el nombre de la categoría del módulo
                            const categoriaNombre = modulo.descripcion 
                              ? modulo.descripcion.split(' - ')[1]?.split(':')[0] || modulo.nombre.replace('transparencia_', '')
                              : modulo.nombre.replace('transparencia_', '');
                            
                            return (
                              <div key={modulo.id} className="permiso-modulo transparencia-modulo">
                                <h4>{categoriaNombre}</h4>
                                <small className="modulo-descripcion">
                                  {modulo.descripcion?.split(':')[1]?.trim() || ''}
                                </small>
                                <div className="permiso-acciones">
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={getPermisoValue(modulo.nombre, 'puede_crear')}
                                      onChange={(e) => handlePermisoChange(modulo.nombre, 'puede_crear', e.target.checked)}
                                    />
                                    Crear
                                  </label>
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={getPermisoValue(modulo.nombre, 'puede_editar')}
                                      onChange={(e) => handlePermisoChange(modulo.nombre, 'puede_editar', e.target.checked)}
                                    />
                                    Editar
                                  </label>
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={getPermisoValue(modulo.nombre, 'puede_eliminar')}
                                      onChange={(e) => handlePermisoChange(modulo.nombre, 'puede_eliminar', e.target.checked)}
                                    />
                                    Eliminar
                                  </label>
                                  <label>
                                    <input
                                      type="checkbox"
                                      checked={getPermisoValue(modulo.nombre, 'puede_publicar')}
                                      onChange={(e) => handlePermisoChange(modulo.nombre, 'puede_publicar', e.target.checked)}
                                    />
                                    Publicar
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingUsuario ? 'Actualizar' : 'Crear'} Usuario
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="usuarios-list">
            <h2>Lista de Usuarios</h2>
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Permisos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(usuario => (
                  <tr key={usuario.id}>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td>
                      <span className={`rol-badge rol-${usuario.rol}`}>
                        {usuario.rol}
                      </span>
                    </td>
                    <td>
                      <span className={usuario.activo ? 'status-active' : 'status-inactive'}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      {usuario.rol === 'admin' ? (
                        <span className="permisos-all">Todos los permisos</span>
                      ) : (
                        <span className="permisos-count">
                          {usuario.permisos?.length || 0} módulo(s)
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => setEditingUsuario(usuario)}
                        className="btn btn-sm btn-edit"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
                        className="btn btn-sm btn-delete"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsuarios;

