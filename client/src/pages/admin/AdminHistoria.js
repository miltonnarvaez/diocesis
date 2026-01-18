import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { getFileUrl } from '../../utils/fileUtils';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminHistoria.css';

const AdminHistoria = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    fecha_evento: '',
    categoria: 'otros',
    orden: 0,
    publicada: true
  });
  const [imagen, setImagen] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorias = [
    { value: 'fundacion', label: 'Fundación' },
    { value: 'hitos', label: 'Hitos Históricos' },
    { value: 'autoridades_historicas', label: 'Autoridades Históricas' },
    { value: 'reformas', label: 'Reformas' },
    { value: 'logros', label: 'Logros' },
    { value: 'otros', label: 'Otros' }
  ];

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['historia-admin'],
    queryFn: async () => {
      const response = await api.get('/historia/admin/all');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (formDataToSubmit) => {
      const formDataObj = new FormData();
      Object.keys(formDataToSubmit).forEach(key => {
        if (key !== 'imagen') {
          formDataObj.append(key, formDataToSubmit[key]);
        }
      });
      if (formDataToSubmit.imagen) {
        formDataObj.append('imagen', formDataToSubmit.imagen);
      }
      return api.post('/historia/admin', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['historia-admin']);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formDataToSubmit }) => {
      const formDataObj = new FormData();
      Object.keys(formDataToSubmit).forEach(key => {
        if (key !== 'imagen') {
          formDataObj.append(key, formDataToSubmit[key]);
        }
      });
      if (formDataToSubmit.imagen) {
        formDataObj.append('imagen', formDataToSubmit.imagen);
      }
      return api.put(`/historia/admin/${id}`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['historia-admin']);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/historia/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['historia-admin']);
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      contenido: '',
      fecha_evento: '',
      categoria: 'otros',
      orden: 0,
      publicada: true
    });
    setImagen(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSubmit = {
        ...formData,
        publicada: formData.publicada === true || formData.publicada === 'true',
        imagen: imagen
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, formDataToSubmit });
      } else {
        await createMutation.mutateAsync(formDataToSubmit);
      }
    } catch (error) {
      console.error('Error guardando evento:', error);
      alert('Error al guardar el evento. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (evento) => {
    setFormData({
      titulo: evento.titulo,
      contenido: evento.contenido,
      fecha_evento: evento.fecha_evento || '',
      categoria: evento.categoria || 'otros',
      orden: evento.orden || 0,
      publicada: evento.publicada
    });
    setImagen(null);
    setEditingId(evento.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este evento histórico?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error eliminando evento:', error);
        alert('Error al eliminar el evento. Por favor, intenta nuevamente.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="admin-historia">
        <AdminNavbar title="Gestión de Historia del Diócesis" />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando eventos históricos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-historia">
      <AdminNavbar title="Gestión de Historia del Diócesis" />
      <div className="admin-content-wrapper">
        <div className="admin-actions">
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? '✕ Cancelar' : '+ Nuevo Evento'}
          </button>
        </div>

        {showForm && (
          <form className="historia-form" onSubmit={handleSubmit}>
            <h3>{editingId ? 'Editar Evento' : 'Nuevo Evento Histórico'}</h3>

            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Contenido *</label>
              <textarea
                value={formData.contenido}
                onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                rows="6"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha del Evento</label>
                <input
                  type="date"
                  value={formData.fecha_evento}
                  onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Orden</label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Imagen</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImagen(e.target.files[0])}
              />
              {editingId && eventos.find(e => e.id === editingId)?.imagen_url && !imagen && (
                <div className="current-image">
                  <img src={getFileUrl(eventos.find(e => e.id === editingId).imagen_url)} alt="Actual" />
                  <small>Imagen actual (se mantendrá si no seleccionas una nueva)</small>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.publicada}
                  onChange={(e) => setFormData({ ...formData, publicada: e.target.checked })}
                />
                Publicado
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="historia-list">
          {eventos.length === 0 ? (
            <div className="empty-state">
              <p>No hay eventos históricos registrados.</p>
            </div>
          ) : (
            eventos.map((evento) => (
              <div key={evento.id} className="historia-card">
                {evento.imagen_url && (
                  <div className="historia-card-image">
                    <img src={getFileUrl(evento.imagen_url)} alt={evento.titulo} />
                  </div>
                )}
                <div className="historia-card-content">
                  <div className="historia-card-header">
                    <span className="historia-categoria">{categorias.find(c => c.value === evento.categoria)?.label || evento.categoria}</span>
                    {evento.fecha_evento && (
                      <span className="historia-fecha">
                        {new Date(evento.fecha_evento).toLocaleDateString('es-CO')}
                      </span>
                    )}
                    {!evento.publicada && <span className="badge badge-warning">Borrador</span>}
                  </div>
                  <h3>{evento.titulo}</h3>
                  <p className="historia-preview">{evento.contenido.substring(0, 150)}...</p>
                  <div className="historia-card-actions">
                    <button onClick={() => handleEdit(evento)} className="btn btn-sm btn-primary">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(evento.id)} className="btn btn-sm btn-danger">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHistoria;















