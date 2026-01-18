import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaPrayingHands, FaPlus, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import './AdminOraciones.css';

const AdminOraciones = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    categoria: 'oracion_especial',
    intencion: '',
    autor: '',
    imagen_url: '',
    audio_url: '',
    fecha_publicacion: new Date().toISOString().split('T')[0],
    destacada: false
  });

  const queryClient = useQueryClient();

  const { data: oraciones = [], isLoading } = useQuery({
    queryKey: ['oraciones-admin'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await api.get('/oraciones', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      const response = await api.post('/oraciones', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['oraciones-admin']);
      resetForm();
      alert('Oración creada exitosamente');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      const response = await api.put(`/oraciones/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['oraciones-admin']);
      resetForm();
      alert('Oración actualizada exitosamente');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/oraciones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['oraciones-admin']);
      alert('Oración eliminada exitosamente');
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      contenido: '',
      categoria: 'oracion_especial',
      intencion: '',
      autor: '',
      imagen_url: '',
      audio_url: '',
      fecha_publicacion: new Date().toISOString().split('T')[0],
      destacada: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (oracion) => {
    setFormData({
      titulo: oracion.titulo,
      contenido: oracion.contenido,
      categoria: oracion.categoria,
      intencion: oracion.intencion || '',
      autor: oracion.autor || '',
      imagen_url: oracion.imagen_url || '',
      audio_url: oracion.audio_url || '',
      fecha_publicacion: oracion.fecha_publicacion || new Date().toISOString().split('T')[0],
      destacada: oracion.destacada || false
    });
    setEditingId(oracion.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const categorias = [
    { value: 'oracion_dia', label: 'Oración del Día' },
    { value: 'novena', label: 'Novena' },
    { value: 'rosario', label: 'Rosario' },
    { value: 'letania', label: 'Letanía' },
    { value: 'oracion_especial', label: 'Oración Especial' },
    { value: 'oracion_intencion', label: 'Por Intención' }
  ];

  return (
    <div className="admin-oraciones">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1><FaPrayingHands /> Gestión de Oraciones</h1>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <FaPlus /> Nueva Oración
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="oracion-form">
            <h2>{editingId ? 'Editar' : 'Nueva'} Oración</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría *</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  required
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Contenido *</label>
              <textarea
                value={formData.contenido}
                onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                rows="10"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Intención</label>
                <input
                  type="text"
                  value={formData.intencion}
                  onChange={(e) => setFormData({...formData, intencion: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Autor</label>
                <input
                  type="text"
                  value={formData.autor}
                  onChange={(e) => setFormData({...formData, autor: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>URL Imagen</label>
                <input
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>URL Audio</label>
                <input
                  type="url"
                  value={formData.audio_url}
                  onChange={(e) => setFormData({...formData, audio_url: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Publicación</label>
                <input
                  type="date"
                  value={formData.fecha_publicacion}
                  onChange={(e) => setFormData({...formData, fecha_publicacion: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.destacada}
                    onChange={(e) => setFormData({...formData, destacada: e.target.checked})}
                  />
                  Destacada
                </label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="loading">Cargando oraciones...</div>
        ) : oraciones.length === 0 ? (
          <div className="no-results">No hay oraciones registradas.</div>
        ) : (
          <div className="oraciones-grid">
            {oraciones.map(oracion => (
              <div key={oracion.id} className="oracion-card">
                {oracion.destacada && <FaStar className="destacada-icon" />}
                <h3>{oracion.titulo}</h3>
                <span className="badge">{oracion.categoria}</span>
                <p className="oracion-preview">{oracion.contenido.substring(0, 150)}...</p>
                <div className="oracion-actions">
                  <button onClick={() => handleEdit(oracion)} className="btn btn-sm btn-edit">
                    <FaEdit /> Editar
                  </button>
                  <button onClick={() => deleteMutation.mutate(oracion.id)} className="btn btn-sm btn-delete">
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOraciones;
