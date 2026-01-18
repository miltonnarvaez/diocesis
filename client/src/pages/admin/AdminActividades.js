import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaMapMarkerAlt, FaClock, FaUser, FaPhone } from 'react-icons/fa';
import './AdminCommon.css';
import './AdminActividades.css';

const AdminActividades = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterPublicada, setFilterPublicada] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    lugar: '',
    tipo: 'general',
    categoria: '',
    responsable: '',
    contacto: '',
    color: '#28a745',
    publicada: true,
    destacada: false
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const queryClient = useQueryClient();

  // Obtener todas las actividades
  const { data: actividades = [], isLoading } = useQuery({
    queryKey: ['actividades', 'admin'],
    queryFn: async () => {
      const response = await api.get('/actividades');
      return response.data;
    }
  });

  // Filtrar actividades
  const actividadesFiltradas = actividades.filter(actividad => {
    const matchSearch = searchQuery === '' || 
      actividad.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      actividad.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchTipo = filterTipo === 'todos' || actividad.tipo === filterTipo;
    
    const matchPublicada = filterPublicada === 'todas' || 
      (filterPublicada === 'publicadas' && actividad.publicada) ||
      (filterPublicada === 'no-publicadas' && !actividad.publicada);
    
    return matchSearch && matchTipo && matchPublicada;
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      lugar: '',
      tipo: 'general',
      categoria: '',
      responsable: '',
      contacto: '',
      color: '#4A90E2',
      publicada: true,
      destacada: false
    });
    setImagenFile(null);
    setImagenPreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (actividad) => {
    setFormData({
      titulo: actividad.titulo || '',
      descripcion: actividad.descripcion || '',
      fecha_inicio: actividad.fecha_inicio ? actividad.fecha_inicio.slice(0, 16) : '',
      fecha_fin: actividad.fecha_fin ? actividad.fecha_fin.slice(0, 16) : '',
      lugar: actividad.lugar || '',
      tipo: actividad.tipo || 'general',
      categoria: actividad.categoria || '',
      responsable: actividad.responsable || '',
      contacto: actividad.contacto || '',
      color: actividad.color || '#28a745',
      publicada: actividad.publicada !== undefined ? actividad.publicada : true,
      destacada: actividad.destacada !== undefined ? actividad.destacada : false
    });
    setImagenPreview(actividad.imagen_url || null);
    setEditingId(actividad.id);
    setShowForm(true);
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

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'imagen' && data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      if (data.imagen) {
        formData.append('imagen', data.imagen);
      }
      const response = await api.post('/actividades', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['actividades']);
      resetForm();
      alert('Actividad creada exitosamente');
    },
    onError: (error) => {
      alert('Error al crear actividad: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'imagen' && data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      if (data.imagen) {
        formData.append('imagen', data.imagen);
      }
      const response = await api.put(`/actividades/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['actividades']);
      resetForm();
      alert('Actividad actualizada exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar actividad: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/actividades/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['actividades']);
      alert('Actividad eliminada exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar actividad: ' + (error.response?.data?.error || error.message));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      imagen: imagenFile
    };
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const tipos = [
    { value: 'general', label: 'General' },
    { value: 'misa', label: 'Misa' },
    { value: 'evento', label: 'Evento' },
    { value: 'reunion', label: 'Reunión' },
    { value: 'formacion', label: 'Formación' },
    { value: 'otro', label: 'Otro' }
  ];

  const categorias = [
    { value: '', label: 'Sin categoría' },
    { value: 'liturgia', label: 'Liturgia' },
    { value: 'pastoral', label: 'Pastoral' },
    { value: 'formacion', label: 'Formación' },
    { value: 'caridad', label: 'Caridad' },
    { value: 'otro', label: 'Otro' }
  ];

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1><FaCalendarAlt /> Gestión de Actividades</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <FaPlus /> Nueva Actividad
          </button>
        </div>

        {showForm && (
          <div className="admin-form-container">
            <h2>{editingId ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
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
                  <label>Tipo *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    required
                  >
                    {tipos.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fecha y Hora de Inicio *</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha y Hora de Fin</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Lugar</label>
                  <input
                    type="text"
                    value={formData.lugar}
                    onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Responsable</label>
                  <input
                    type="text"
                    value={formData.responsable}
                    onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Contacto</label>
                  <input
                    type="text"
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Color (hex)</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagenPreview && (
                    <img src={imagenPreview} alt="Preview" className="image-preview" />
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.publicada}
                      onChange={(e) => setFormData({ ...formData, publicada: e.target.checked })}
                    />
                    Publicada
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.destacada}
                      onChange={(e) => setFormData({ ...formData, destacada: e.target.checked })}
                    />
                    Destacada
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Actualizar' : 'Crear'} Actividad
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Buscar actividades..."
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
            {tipos.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
          <select
            value={filterPublicada}
            onChange={(e) => setFilterPublicada(e.target.value)}
            className="filter-select"
          >
            <option value="todas">Todas</option>
            <option value="publicadas">Publicadas</option>
            <option value="no-publicadas">No publicadas</option>
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando actividades...</div>
        ) : actividadesFiltradas.length === 0 ? (
          <div className="no-results">No se encontraron actividades</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Fecha Inicio</th>
                  <th>Lugar</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {actividadesFiltradas.map(actividad => (
                  <tr key={actividad.id}>
                    <td>
                      <strong>{actividad.titulo}</strong>
                      {actividad.destacada && <span className="badge badge-gold">Destacada</span>}
                    </td>
                    <td>{tipos.find(t => t.value === actividad.tipo)?.label || actividad.tipo}</td>
                    <td>{new Date(actividad.fecha_inicio).toLocaleString('es-CO')}</td>
                    <td>{actividad.lugar || '-'}</td>
                    <td>
                      <span className={`badge ${actividad.publicada ? 'badge-success' : 'badge-warning'}`}>
                        {actividad.publicada ? 'Publicada' : 'No publicada'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(actividad)}
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de eliminar esta actividad?')) {
                            deleteMutation.mutate(actividad.id);
                          }
                        }}
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActividades;







