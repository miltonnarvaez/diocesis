import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { getFileUrl } from '../../utils/fileUtils';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminGaleria.css';

const AdminGaleria = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'foto',
    categoria: 'otros',
    fecha_evento: '',
    publicada: true,
    destacada: false,
    orden: 0,
    tags: ''
  });
  const [archivo, setArchivo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['galeria-admin'],
    queryFn: async () => {
      try {
        const response = await api.get('/galeria/admin/all');
        return response.data;
      } catch (err) {
        console.error('Error cargando galería:', err);
        console.error('Detalles del error:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        
        if (err.response?.status === 401) {
          throw new Error('No autorizado. Por favor, inicia sesión.');
        }
        if (err.response?.status === 403) {
          throw new Error('No tienes permisos para acceder a esta sección.');
        }
        if (err.response?.status >= 500) {
          const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Error del servidor';
          throw new Error(`Error del servidor: ${errorMsg}. Por favor, contacta al administrador.`);
        }
        if (!err.response) {
          throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
        }
        const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Error desconocido';
        throw new Error(`Error al cargar la galería: ${errorMsg}`);
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, field) => {
    if (field === 'archivo') {
      setArchivo(e.target.files[0]);
    } else if (field === 'thumbnail') {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', formData.titulo);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('tipo', formData.tipo);
      formDataToSend.append('categoria', formData.categoria);
      formDataToSend.append('fecha_evento', formData.fecha_evento || '');
      formDataToSend.append('publicada', formData.publicada);
      formDataToSend.append('destacada', formData.destacada);
      formDataToSend.append('orden', formData.orden);
      if (formData.tags) {
        formDataToSend.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim())));
      }

      if (archivo) {
        formDataToSend.append('archivo', archivo);
      }
      if (thumbnail) {
        formDataToSend.append('thumbnail', thumbnail);
      }

      if (editingItem) {
        await api.put(`/galeria/admin/${editingItem.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/galeria/admin', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      queryClient.invalidateQueries(['galeria-admin']);
      resetForm();
      alert(editingItem ? 'Item actualizado exitosamente' : 'Item creado exitosamente');
    } catch (error) {
      console.error('Error guardando item:', error);
      alert('Error al guardar el item. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'foto',
      categoria: 'otros',
      fecha_evento: '',
      publicada: true,
      destacada: false,
      orden: 0,
      tags: ''
    });
    setArchivo(null);
    setThumbnail(null);
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      titulo: item.titulo,
      descripcion: item.descripcion || '',
      tipo: item.tipo,
      categoria: item.categoria,
      fecha_evento: item.fecha_evento ? item.fecha_evento.split('T')[0] : '',
      publicada: item.publicada,
      destacada: item.destacada,
      orden: item.orden || 0,
      tags: item.tags ? JSON.parse(item.tags).join(', ') : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este item?')) {
      return;
    }

    try {
      await api.delete(`/galeria/admin/${id}`);
      queryClient.invalidateQueries(['galeria-admin']);
      alert('Item eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando item:', error);
      alert('Error al eliminar el item');
    }
  };

  const categorias = [
    { value: 'sesiones', label: 'Sesiones' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'autoridades', label: 'Autoridades' },
    { value: 'actividades', label: 'Actividades' },
    { value: 'otros', label: 'Otros' }
  ];

  if (isLoading) {
    return (
      <div className="admin-galeria">
        <AdminNavbar title="Galería Multimedia" />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando galería...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-galeria">
        <AdminNavbar title="Galería Multimedia" />
        <div className="admin-content-wrapper">
          <div className="error-message">
            <h2>Error al cargar la galería</h2>
            <p>{error.message}</p>
            <div className="error-actions">
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                Recargar página
              </button>
              <Link to="/admin" className="btn btn-secondary">
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-galeria">
      <AdminNavbar title="Galería Multimedia" />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancelar' : '+ Nuevo Item'}
          </button>
        </div>

      {showForm && (
        <div className="galeria-form-container">
          <h2>{editingItem ? 'Editar Item' : 'Nuevo Item'}</h2>
          <form onSubmit={handleSubmit} className="galeria-form">
            <div className="form-row">
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
                <label>Tipo *</label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  <option value="foto">Fotografía</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fecha del Evento</label>
                <input
                  type="date"
                  name="fecha_evento"
                  value={formData.fecha_evento}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Archivo {!editingItem && '*'}</label>
                <input
                  type="file"
                  accept={formData.tipo === 'foto' ? 'image/*' : 'video/*'}
                  onChange={(e) => handleFileChange(e, 'archivo')}
                  required={!editingItem}
                />
                {editingItem && (
                  <small>Dejar vacío para mantener el archivo actual</small>
                )}
              </div>
              <div className="form-group">
                <label>Thumbnail (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                />
                <small>Solo para videos o si deseas un thumbnail diferente</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Orden</label>
                <input
                  type="number"
                  name="orden"
                  value={formData.orden}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Tags (separados por comas)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="ejemplo: sesion, Diócesis, 2024"
                />
              </div>
            </div>

            <div className="form-checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="publicada"
                  checked={formData.publicada}
                  onChange={handleChange}
                />
                Publicada
              </label>
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

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="galeria-list">
        <h2>Items de la Galería ({items.length})</h2>
        <div className="galeria-grid-admin">
          {items.map((item) => (
            <div key={item.id} className="galeria-item-admin">
              <div className="item-preview">
                {item.tipo === 'foto' ? (
                  <img
                    src={getFileUrl(item.thumbnail_url || item.archivo_url)}
                    alt={item.titulo}
                    className="preview-image"
                  />
                ) : (
                  <div className="preview-video">
                    <video
                      src={getFileUrl(item.archivo_url)}
                      className="preview-video-element"
                      muted
                    />
                    <span className="video-icon">▶</span>
                  </div>
                )}
                {item.destacada && <span className="badge-destacada">⭐</span>}
                {!item.publicada && <span className="badge-no-publicada">No publicada</span>}
              </div>
              <div className="item-info">
                <h3>{item.titulo}</h3>
                <p className="item-meta">
                  <span className="item-tipo">{item.tipo}</span>
                  <span className="item-categoria">{item.categoria}</span>
                </p>
                {item.descripcion && (
                  <p className="item-descripcion">{item.descripcion.substring(0, 100)}...</p>
                )}
              </div>
              <div className="item-actions">
                <button onClick={() => handleEdit(item)} className="btn btn-sm btn-edit">
                  Editar
                </button>
                <button onClick={() => handleDelete(item.id)} className="btn btn-sm btn-delete">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        {items.length === 0 && (
          <div className="no-items">
            <p>No hay items en la galería. Crea el primero usando el botón "Nuevo Item".</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminGaleria;

