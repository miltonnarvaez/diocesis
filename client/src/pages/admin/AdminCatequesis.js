import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaBook, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import './AdminCatequesis.css';

const AdminCatequesis = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    nivel: 'general',
    categoria: '',
    contenido: '',
    material_descargable: '',
    video_url: '',
    imagen_url: '',
    orden: 0
  });

  const queryClient = useQueryClient();

  const { data: materiales = [], isLoading } = useQuery({
    queryKey: ['catequesis-admin'],
    queryFn: async () => {
      const response = await api.get('/catequesis');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      const response = await api.post('/catequesis', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['catequesis-admin']);
      resetForm();
      alert('Material creado exitosamente');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      const response = await api.put(`/catequesis/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['catequesis-admin']);
      resetForm();
      alert('Material actualizado exitosamente');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/catequesis/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['catequesis-admin']);
      alert('Material eliminado exitosamente');
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      nivel: 'general',
      categoria: '',
      contenido: '',
      material_descargable: '',
      video_url: '',
      imagen_url: '',
      orden: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (material) => {
    setFormData({
      titulo: material.titulo,
      descripcion: material.descripcion || '',
      nivel: material.nivel,
      categoria: material.categoria || '',
      contenido: material.contenido || '',
      material_descargable: material.material_descargable || '',
      video_url: material.video_url || '',
      imagen_url: material.imagen_url || '',
      orden: material.orden || 0
    });
    setEditingId(material.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      orden: parseInt(formData.orden) || 0
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const niveles = [
    { value: 'primera_comunion', label: 'Primera Comunión' },
    { value: 'confirmacion', label: 'Confirmación' },
    { value: 'bautismo', label: 'Bautismo' },
    { value: 'matrimonio', label: 'Matrimonio' },
    { value: 'adultos', label: 'Adultos' },
    { value: 'jovenes', label: 'Jóvenes' },
    { value: 'general', label: 'General' }
  ];

  return (
    <div className="admin-catequesis">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1><FaBook /> Gestión de Catequesis</h1>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <FaPlus /> Nuevo Material
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="catequesis-form">
            <h2>{editingId ? 'Editar' : 'Nuevo'} Material</h2>
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
                <label>Nivel *</label>
                <select
                  value={formData.nivel}
                  onChange={(e) => setFormData({...formData, nivel: e.target.value})}
                  required
                >
                  {niveles.map(nivel => (
                    <option key={nivel.value} value={nivel.value}>{nivel.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Contenido</label>
              <textarea
                value={formData.contenido}
                onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                rows="10"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>URL Material Descargable</label>
                <input
                  type="url"
                  value={formData.material_descargable}
                  onChange={(e) => setFormData({...formData, material_descargable: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>URL Video</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
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
                <label>Orden</label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({...formData, orden: e.target.value})}
                  min="0"
                />
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
          <div className="loading">Cargando materiales...</div>
        ) : materiales.length === 0 ? (
          <div className="no-results">No hay materiales registrados.</div>
        ) : (
          <div className="materiales-grid">
            {materiales.map(material => (
              <div key={material.id} className="material-card">
                <h3>{material.titulo}</h3>
                <span className="badge">{material.nivel}</span>
                {material.descripcion && (
                  <p className="material-preview">{material.descripcion.substring(0, 150)}...</p>
                )}
                <div className="material-actions">
                  <button onClick={() => handleEdit(material)} className="btn btn-sm btn-edit">
                    <FaEdit /> Editar
                  </button>
                  <button onClick={() => deleteMutation.mutate(material.id)} className="btn btn-sm btn-delete">
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

export default AdminCatequesis;
