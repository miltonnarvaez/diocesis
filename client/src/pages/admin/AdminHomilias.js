import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaMicrophone, FaPlus, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import './AdminHomilias.css';

const AdminHomilias = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    tipo_autor: 'sacerdote',
    fecha_homilia: new Date().toISOString().split('T')[0],
    tipo_homilia: 'dominical',
    lectura_primera: '',
    salmo: '',
    lectura_segunda: '',
    evangelio: '',
    contenido: '',
    audio_url: '',
    video_url: '',
    tema: '',
    tags: '',
    destacada: false
  });

  const queryClient = useQueryClient();

  const { data: homilias = [], isLoading } = useQuery({
    queryKey: ['homilias-admin'],
    queryFn: async () => {
      const response = await api.get('/homilias');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      const response = await api.post('/homilias', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['homilias-admin']);
      resetForm();
      alert('Homilía creada exitosamente');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      const response = await api.put(`/homilias/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['homilias-admin']);
      resetForm();
      alert('Homilía actualizada exitosamente');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/homilias/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['homilias-admin']);
      alert('Homilía eliminada exitosamente');
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      autor: '',
      tipo_autor: 'sacerdote',
      fecha_homilia: new Date().toISOString().split('T')[0],
      tipo_homilia: 'dominical',
      lectura_primera: '',
      salmo: '',
      lectura_segunda: '',
      evangelio: '',
      contenido: '',
      audio_url: '',
      video_url: '',
      tema: '',
      tags: '',
      destacada: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (homilia) => {
    setFormData({
      titulo: homilia.titulo,
      autor: homilia.autor,
      tipo_autor: homilia.tipo_autor,
      fecha_homilia: homilia.fecha_homilia,
      tipo_homilia: homilia.tipo_homilia,
      lectura_primera: homilia.lectura_primera || '',
      salmo: homilia.salmo || '',
      lectura_segunda: homilia.lectura_segunda || '',
      evangelio: homilia.evangelio || '',
      contenido: homilia.contenido,
      audio_url: homilia.audio_url || '',
      video_url: homilia.video_url || '',
      tema: homilia.tema || '',
      tags: homilia.tags || '',
      destacada: homilia.destacada || false
    });
    setEditingId(homilia.id);
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

  return (
    <div className="admin-homilias">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1><FaMicrophone /> Gestión de Homilías</h1>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <FaPlus /> Nueva Homilía
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="homilia-form">
            <h2>{editingId ? 'Editar' : 'Nueva'} Homilía</h2>
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
                <label>Autor *</label>
                <input
                  type="text"
                  value={formData.autor}
                  onChange={(e) => setFormData({...formData, autor: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Autor</label>
                <select
                  value={formData.tipo_autor}
                  onChange={(e) => setFormData({...formData, tipo_autor: e.target.value})}
                >
                  <option value="obispo">Obispo</option>
                  <option value="sacerdote">Sacerdote</option>
                  <option value="diacono">Diácono</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de la Homilía *</label>
                <input
                  type="date"
                  value={formData.fecha_homilia}
                  onChange={(e) => setFormData({...formData, fecha_homilia: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Tipo de Homilía</label>
              <select
                value={formData.tipo_homilia}
                onChange={(e) => setFormData({...formData, tipo_homilia: e.target.value})}
              >
                <option value="dominical">Dominical</option>
                <option value="festiva">Festiva</option>
                <option value="retiro">Retiro</option>
                <option value="especial">Especial</option>
                <option value="otra">Otra</option>
              </select>
            </div>
            <div className="form-group">
              <label>Evangelio</label>
              <input
                type="text"
                value={formData.evangelio}
                onChange={(e) => setFormData({...formData, evangelio: e.target.value})}
                placeholder="Ej: Juan 3:16-21"
              />
            </div>
            <div className="form-group">
              <label>Contenido de la Homilía *</label>
              <textarea
                value={formData.contenido}
                onChange={(e) => setFormData({...formData, contenido: e.target.value})}
                rows="15"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>URL Audio</label>
                <input
                  type="url"
                  value={formData.audio_url}
                  onChange={(e) => setFormData({...formData, audio_url: e.target.value})}
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
          <div className="loading">Cargando homilías...</div>
        ) : homilias.length === 0 ? (
          <div className="no-results">No hay homilías registradas.</div>
        ) : (
          <div className="homilias-grid">
            {homilias.map(homilia => (
              <div key={homilia.id} className="homilia-card">
                {homilia.destacada && <FaStar className="destacada-icon" />}
                <h3>{homilia.titulo}</h3>
                <p className="homilia-autor">{homilia.autor}</p>
                <span className="badge">{new Date(homilia.fecha_homilia).toLocaleDateString('es-CO')}</span>
                <p className="homilia-preview">{homilia.contenido.substring(0, 150)}...</p>
                <div className="homilia-actions">
                  <button onClick={() => handleEdit(homilia)} className="btn btn-sm btn-edit">
                    <FaEdit /> Editar
                  </button>
                  <button onClick={() => deleteMutation.mutate(homilia.id)} className="btn btn-sm btn-delete">
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

export default AdminHomilias;
