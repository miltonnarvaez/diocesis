import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminFilters from '../../components/admin/AdminFilters';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminConvocatorias.css';

const AdminConvocatorias = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [filterDestacada, setFilterDestacada] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen_url: '',
    fecha_inicio: '',
    fecha_fin: '',
    activa: true,
    destacada: false
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const queryClient = useQueryClient();

  // Obtener todas las convocatorias (admin)
  const { data: convocatorias = [], isLoading } = useQuery({
    queryKey: ['convocatorias', 'admin'],
    queryFn: async () => {
      const response = await api.get('/convocatorias/admin/all');
      return response.data;
    }
  });

  // Filtrar convocatorias
  const convocatoriasFiltradas = convocatorias.filter(convocatoria => {
    const matchSearch = searchQuery === '' || 
      convocatoria.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      convocatoria.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchEstado = filterEstado === 'todas' || 
      (filterEstado === 'activas' && convocatoria.activa) ||
      (filterEstado === 'inactivas' && !convocatoria.activa);
    
    const matchDestacada = filterDestacada === 'todas' || 
      (filterDestacada === 'destacadas' && convocatoria.destacada) ||
      (filterDestacada === 'no-destacadas' && !convocatoria.destacada);
    
    return matchSearch && matchEstado && matchDestacada;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterEstado('todas');
    setFilterDestacada('todas');
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/convocatorias', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['convocatorias']);
      resetForm();
      alert('Convocatoria creada exitosamente');
    },
    onError: (error) => {
      alert('Error al crear convocatoria: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/convocatorias/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['convocatorias']);
      resetForm();
      alert('Convocatoria actualizada exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar convocatoria: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/convocatorias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['convocatorias']);
      alert('Convocatoria eliminada exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar convocatoria: ' + (error.response?.data?.error || error.message));
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImagenChange = (e) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.descripcion || !formData.fecha_inicio || !formData.fecha_fin) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (imagenFile) {
      data.append('imagen', imagenFile);
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setImagenFile(null);
      setImagenPreview(null);
    } catch (error) {
      alert('Error al guardar convocatoria: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleActivar = async (id, activa) => {
    try {
      await api.patch(`/convocatorias/${id}/activar`, { activa: !activa });
      queryClient.invalidateQueries(['convocatorias']);
      alert(`Convocatoria ${!activa ? 'activada' : 'desactivada'} exitosamente`);
    } catch (error) {
      alert('Error al cambiar estado: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (convocatoria) => {
    setFormData({
      titulo: convocatoria.titulo || '',
      descripcion: convocatoria.descripcion || '',
      imagen_url: convocatoria.imagen_url || '',
      fecha_inicio: convocatoria.fecha_inicio || '',
      fecha_fin: convocatoria.fecha_fin || '',
      activa: convocatoria.activa !== undefined ? convocatoria.activa : true,
      destacada: convocatoria.destacada || false
    });
    setEditingId(convocatoria.id);
    setImagenFile(null);
    setImagenPreview(convocatoria.imagen_url || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta convocatoria?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      imagen_url: '',
      fecha_inicio: '',
      fecha_fin: '',
      activa: true,
      destacada: false
    });
    setEditingId(null);
    setImagenFile(null);
    setImagenPreview(null);
    setShowForm(false);
  };

  if (isLoading) {
    return <div className="loading">Cargando convocatorias...</div>;
  }

  return (
    <div className="admin-convocatorias">
      <AdminNavbar title="Gestión de Convocatorias" />
      <div className="admin-content-wrapper">
          <div className="admin-actions">
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? '✕ Cancelar' : '+ Nueva Convocatoria'}
            </button>
          </div>

          <AdminFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Buscar por título o descripción..."
            filters={[
              {
                name: 'estado',
                label: 'Estado',
                value: filterEstado,
                defaultValue: 'todas',
                onChange: setFilterEstado,
                options: [
                  { value: 'todas', label: 'Todas' },
                  { value: 'activas', label: 'Activas' },
                  { value: 'inactivas', label: 'Inactivas' }
                ]
              },
              {
                name: 'destacada',
                label: 'Destacada',
                value: filterDestacada,
                defaultValue: 'todas',
                onChange: setFilterDestacada,
                options: [
                  { value: 'todas', label: 'Todas' },
                  { value: 'destacadas', label: 'Destacadas' },
                  { value: 'no-destacadas', label: 'No destacadas' }
                ]
              }
            ]}
            onClearFilters={handleClearFilters}
            totalItems={convocatorias.length}
            filteredItems={convocatoriasFiltradas.length}
          />

          {showForm && (
            <form className="convocatorias-form" onSubmit={handleSubmit}>
              <h2>{editingId ? 'Editar Convocatoria' : 'Nueva Convocatoria'}</h2>
              
              <div className="form-group">
                <label htmlFor="titulo">Título *</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  placeholder="Título de la convocatoria"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Descripción completa de la convocatoria..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="imagen">Imagen</label>
                <input
                  type="file"
                  id="imagen"
                  name="imagen"
                  accept="image/*"
                  onChange={handleImagenChange}
                />
                <small>Sube una imagen o usa una URL (opcional)</small>
                {imagenPreview && (
                  <div className="image-preview">
                    <img src={imagenPreview} alt="Vista previa" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="imagen_url">URL de la Imagen (Alternativa)</label>
                <input
                  type="url"
                  id="imagen_url"
                  name="imagen_url"
                  value={formData.imagen_url}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                <small>Si no subes un archivo, puedes usar una URL</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fecha_inicio">Fecha de Inicio *</label>
                  <input
                    type="date"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fecha_fin">Fecha de Fin *</label>
                  <input
                    type="date"
                    id="fecha_fin"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="activa"
                      checked={formData.activa}
                      onChange={handleChange}
                    />
                    Activa (visible para usuarios)
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="destacada"
                      checked={formData.destacada}
                      onChange={handleChange}
                    />
                    Destacada (aparece en la página principal)
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
                  {editingId ? 'Actualizar' : 'Crear'} Convocatoria
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="convocatorias-list">
            <h2>Convocatorias</h2>
            
            {convocatoriasFiltradas.length === 0 ? (
              <div className="no-results">
                <p>
                  {convocatorias.length === 0 
                    ? 'No hay convocatorias registradas.' 
                    : 'No se encontraron convocatorias con los filtros aplicados.'}
                </p>
                {(searchQuery || filterEstado !== 'todas' || filterDestacada !== 'todas') && (
                  <button onClick={handleClearFilters} className="btn btn-secondary">
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="convocatorias-table">
                <table>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th>Estado</th>
                      <th>Destacada</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {convocatoriasFiltradas.map((convocatoria) => (
                      <tr key={convocatoria.id} className={!convocatoria.activa ? 'inactive' : ''}>
                        <td>
                          <strong>{convocatoria.titulo}</strong>
                          {convocatoria.descripcion && (
                            <p className="descripcion-preview">{convocatoria.descripcion.substring(0, 100)}...</p>
                          )}
                        </td>
                        <td>
                          {convocatoria.fecha_inicio 
                            ? new Date(convocatoria.fecha_inicio).toLocaleDateString('es-CO')
                            : 'Sin fecha'
                          }
                        </td>
                        <td>
                          {convocatoria.fecha_fin 
                            ? new Date(convocatoria.fecha_fin).toLocaleDateString('es-CO')
                            : 'Sin fecha'
                          }
                        </td>
                        <td>
                          <span className={`status-badge ${convocatoria.activa ? 'active' : 'inactive'}`}>
                            {convocatoria.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td>
                          {convocatoria.destacada && <span className="destacada-badge">⭐</span>}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleEdit(convocatoria)}
                              className="btn btn-sm btn-edit"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => toggleActivar(convocatoria.id, convocatoria.activa)}
                              className={`btn btn-sm ${convocatoria.activa ? 'btn-warning' : 'btn-success'}`}
                            >
                              {convocatoria.activa ? 'Desactivar' : 'Activar'}
                            </button>
                            <button 
                              onClick={() => handleDelete(convocatoria.id)}
                              className="btn btn-sm btn-delete"
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
            )}
          </div>
      </div>
    </div>
  );
};

export default AdminConvocatorias;
