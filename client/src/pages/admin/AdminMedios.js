import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminMedios.css';

const AdminMedios = () => {
  const [showForm, setShowForm] = useState(false);
  const [showCanalForm, setShowCanalForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('contenido'); // 'contenido' o 'canales'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: '',
    categoria: '',
    url: '',
    url_embed: '',
    duracion: '',
    fecha_publicacion: '',
    autor: '',
    tags: [],
    publicada: true,
    destacada: false
  });

  const [canalData, setCanalData] = useState({
    nombre: '',
    tipo: '',
    url: '',
    descripcion: '',
    orden: 0,
    activo: true
  });

  const [tagInput, setTagInput] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const { data: contenido = [], isLoading: loadingContenido } = useQuery({
    queryKey: ['medios-contenido'],
    queryFn: async () => {
      const response = await api.get('/medios/contenido');
      return response.data;
    }
  });

  const { data: canales = [], isLoading: loadingCanales } = useQuery({
    queryKey: ['medios-canales'],
    queryFn: async () => {
      const response = await api.get('/medios/canales');
      return response.data;
    }
  });

  useEffect(() => {
    if (editingItem) {
      if (tipoSeleccionado === 'contenido') {
        setFormData({
          titulo: editingItem.titulo || '',
          descripcion: editingItem.descripcion || '',
          tipo: editingItem.tipo || '',
          categoria: editingItem.categoria || '',
          url: editingItem.url || '',
          url_embed: editingItem.url_embed || '',
          duracion: editingItem.duracion || '',
          fecha_publicacion: editingItem.fecha_publicacion ? editingItem.fecha_publicacion.split('T')[0] : '',
          autor: editingItem.autor || '',
          tags: Array.isArray(editingItem.tags) ? editingItem.tags : (typeof editingItem.tags === 'string' ? JSON.parse(editingItem.tags || '[]') : []),
          publicada: editingItem.publicada !== undefined ? editingItem.publicada : true,
          destacada: editingItem.destacada || false
        });
        setImagenPreview(editingItem.imagen_miniatura || null);
      } else {
        setCanalData({
          nombre: editingItem.nombre || '',
          tipo: editingItem.tipo || '',
          url: editingItem.url || '',
          descripcion: editingItem.descripcion || '',
          orden: editingItem.orden || 0,
          activo: editingItem.activo !== undefined ? editingItem.activo : true
        });
      }
    }
  }, [editingItem, tipoSeleccionado]);

  const createContenidoMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      const response = await api.post('/medios/contenido', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medios-contenido']);
      resetForm();
      alert('Contenido creado exitosamente');
    },
    onError: (error) => {
      alert('Error al crear contenido: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateContenidoMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'tags') {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      const response = await api.put(`/medios/contenido/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medios-contenido']);
      resetForm();
      alert('Contenido actualizado exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar contenido: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteContenidoMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/medios/contenido/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medios-contenido']);
      alert('Contenido eliminado exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar contenido: ' + (error.response?.data?.error || error.message));
    }
  });

  const createCanalMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/medios/canales', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medios-canales']);
      resetCanalForm();
      alert('Canal creado exitosamente');
    },
    onError: (error) => {
      alert('Error al crear canal: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateCanalMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/medios/canales/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medios-canales']);
      resetCanalForm();
      alert('Canal actualizado exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar canal: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteCanalMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/medios/canales/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medios-canales']);
      alert('Canal eliminado exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar canal: ' + (error.response?.data?.error || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: '',
      categoria: '',
      url: '',
      url_embed: '',
      duracion: '',
      fecha_publicacion: '',
      autor: '',
      tags: [],
      publicada: true,
      destacada: false
    });
    setTagInput('');
    setImagenFile(null);
    setImagenPreview(null);
    setEditingItem(null);
    setShowForm(false);
  };

  const resetCanalForm = () => {
    setCanalData({
      nombre: '',
      tipo: '',
      url: '',
      descripcion: '',
      orden: 0,
      activo: true
    });
    setEditingItem(null);
    setShowCanalForm(false);
  };

  const handleNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleNewCanal = () => {
    resetCanalForm();
    setShowCanalForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    if (tipoSeleccionado === 'contenido') {
      setShowForm(true);
    } else {
      setShowCanalForm(true);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm(`¿Estás seguro de eliminar este ${tipoSeleccionado === 'contenido' ? 'contenido' : 'canal'}?`)) {
      if (tipoSeleccionado === 'contenido') {
        deleteContenidoMutation.mutate(id);
      } else {
        deleteCanalMutation.mutate(id);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      alert('Por favor completa el título del contenido');
      return;
    }

    if (editingItem) {
      updateContenidoMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createContenidoMutation.mutate(formData);
    }
  };

  const handleCanalSubmit = (e) => {
    e.preventDefault();
    if (!canalData.nombre.trim()) {
      alert('Por favor completa el nombre del canal');
      return;
    }

    if (editingItem) {
      updateCanalMutation.mutate({ id: editingItem.id, data: canalData });
    } else {
      createCanalMutation.mutate(canalData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCanalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCanalData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tiposContenido = ['video', 'audio', 'imagen', 'documento', 'enlace', 'redes_sociales'];
  const tiposCanal = ['radio', 'tv', 'redes_sociales', 'podcast', 'noticias', 'otro'];

  const filteredContenido = contenido.filter(item => {
    const matchesSearch = item.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || item.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  const isLoading = tipoSeleccionado === 'contenido' ? loadingContenido : loadingCanales;

  if (isLoading) {
    return (
      <div className="admin-medios">
        <AdminNavbar />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando {tipoSeleccionado}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-medios">
      <AdminNavbar />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>Gestión de Medios de Comunicación</h1>
          <div className="header-actions">
            <button 
              onClick={tipoSeleccionado === 'contenido' ? handleNew : handleNewCanal} 
              className="btn btn-primary"
            >
              + Nuevo {tipoSeleccionado === 'contenido' ? 'Contenido' : 'Canal'}
            </button>
          </div>
        </div>

        <div className="tipo-selector">
          <button
            onClick={() => {
              setTipoSeleccionado('contenido');
              resetForm();
              resetCanalForm();
            }}
            className={`btn ${tipoSeleccionado === 'contenido' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Contenido Multimedia
          </button>
          <button
            onClick={() => {
              setTipoSeleccionado('canales');
              resetForm();
              resetCanalForm();
            }}
            className={`btn ${tipoSeleccionado === 'canales' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Canales de Comunicación
          </button>
        </div>

        {tipoSeleccionado === 'contenido' && (
          <>
            <div className="admin-filters">
              <input
                type="text"
                placeholder="Buscar contenido..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos los tipos</option>
                {tiposContenido.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            {showForm && (
              <div className="admin-form-modal">
                <div className="admin-form-content">
                  <h2>{editingItem ? 'Editar Contenido' : 'Nuevo Contenido'}</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Título *</label>
                        <input
                          type="text"
                          name="titulo"
                          value={formData.titulo}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo</label>
                        <select
                          name="tipo"
                          value={formData.tipo}
                          onChange={handleChange}
                        >
                          <option value="">Seleccionar tipo</option>
                          {tiposContenido.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo.replace('_', ' ').toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Categoría</label>
                        <input
                          type="text"
                          name="categoria"
                          value={formData.categoria}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>URL</label>
                        <input
                          type="url"
                          name="url"
                          value={formData.url}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>URL Embed</label>
                        <input
                          type="text"
                          name="url_embed"
                          value={formData.url_embed}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Duración</label>
                        <input
                          type="text"
                          name="duracion"
                          value={formData.duracion}
                          onChange={handleChange}
                          placeholder="Ej: 5:30, 1h 20min..."
                        />
                      </div>
                      <div className="form-group">
                        <label>Fecha Publicación</label>
                        <input
                          type="date"
                          name="fecha_publicacion"
                          value={formData.fecha_publicacion}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Autor</label>
                        <input
                          type="text"
                          name="autor"
                          value={formData.autor}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Descripción</label>
                        <textarea
                          name="descripcion"
                          value={formData.descripcion}
                          onChange={handleChange}
                          rows="4"
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Tags</label>
                        <div className="list-input-group">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                            placeholder="Agregar tag..."
                          />
                          <button type="button" onClick={handleAddTag} className="btn btn-sm btn-primary">
                            Agregar
                          </button>
                        </div>
                        <div className="list-items">
                          {formData.tags.map((tag, index) => (
                            <div key={index} className="list-item">
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(index)}
                                className="btn-remove"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Imagen Miniatura</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagenPreview && (
                          <img src={imagenPreview} alt="Preview" className="image-preview" />
                        )}
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            name="publicada"
                            checked={formData.publicada}
                            onChange={handleChange}
                          />
                          Publicada
                        </label>
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            name="destacada"
                            checked={formData.destacada}
                            onChange={handleChange}
                          />
                          Destacada
                        </label>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {editingItem ? 'Actualizar' : 'Crear'}
                      </button>
                      <button type="button" onClick={resetForm} className="btn btn-secondary">
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Fecha Publicación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContenido.map(item => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.titulo}</strong>
                        {item.destacada && <span className="badge badge-primary">Destacado</span>}
                      </td>
                      <td>{item.tipo || '-'}</td>
                      <td>{item.categoria || '-'}</td>
                      <td>{item.fecha_publicacion ? new Date(item.fecha_publicacion).toLocaleDateString() : '-'}</td>
                      <td>
                        <span className={`badge ${item.publicada ? 'badge-success' : 'badge-danger'}`}>
                          {item.publicada ? 'Publicado' : 'No Publicado'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn btn-sm btn-primary"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tipoSeleccionado === 'canales' && (
          <>
            {showCanalForm && (
              <div className="admin-form-modal">
                <div className="admin-form-content">
                  <h2>{editingItem ? 'Editar Canal' : 'Nuevo Canal'}</h2>
                  <form onSubmit={handleCanalSubmit}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Nombre *</label>
                        <input
                          type="text"
                          name="nombre"
                          value={canalData.nombre}
                          onChange={handleCanalChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Tipo</label>
                        <select
                          name="tipo"
                          value={canalData.tipo}
                          onChange={handleCanalChange}
                        >
                          <option value="">Seleccionar tipo</option>
                          {tiposCanal.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo.replace('_', ' ').toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>URL</label>
                        <input
                          type="url"
                          name="url"
                          value={canalData.url}
                          onChange={handleCanalChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Orden</label>
                        <input
                          type="number"
                          name="orden"
                          value={canalData.orden}
                          onChange={handleCanalChange}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Descripción</label>
                        <textarea
                          name="descripcion"
                          value={canalData.descripcion}
                          onChange={handleCanalChange}
                          rows="3"
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            name="activo"
                            checked={canalData.activo}
                            onChange={handleCanalChange}
                          />
                          Activo
                        </label>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {editingItem ? 'Actualizar' : 'Crear'}
                      </button>
                      <button type="button" onClick={resetCanalForm} className="btn btn-secondary">
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>URL</th>
                    <th>Orden</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {canales.map(canal => (
                    <tr key={canal.id}>
                      <td><strong>{canal.nombre}</strong></td>
                      <td>{canal.tipo || '-'}</td>
                      <td>
                        {canal.url ? (
                          <a href={canal.url} target="_blank" rel="noopener noreferrer">
                            Ver enlace
                          </a>
                        ) : '-'}
                      </td>
                      <td>{canal.orden || 0}</td>
                      <td>
                        <span className={`badge ${canal.activo ? 'badge-success' : 'badge-danger'}`}>
                          {canal.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(canal)}
                            className="btn btn-sm btn-primary"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(canal.id)}
                            className="btn btn-sm btn-danger"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMedios;
















