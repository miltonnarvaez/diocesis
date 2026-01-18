import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaBook, FaPlus, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import './AdminBibliotecaDigital.css';

const AdminBibliotecaDigital = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    tipo_documento: 'otro',
    categoria: '',
    descripcion: '',
    archivo_url: '',
    imagen_portada: '',
    fecha_documento: '',
    fecha_publicacion: new Date().toISOString().split('T')[0],
    idioma: 'es',
    paginas: '',
    isbn: '',
    destacado: false
  });

  const queryClient = useQueryClient();

  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['biblioteca-digital-admin'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await api.get('/biblioteca-digital', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      const response = await api.post('/biblioteca-digital', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['biblioteca-digital-admin']);
      resetForm();
      alert('Documento creado exitosamente');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      const response = await api.put(`/biblioteca-digital/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['biblioteca-digital-admin']);
      resetForm();
      alert('Documento actualizado exitosamente');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const response = await api.delete(`/biblioteca-digital/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['biblioteca-digital-admin']);
      alert('Documento eliminado exitosamente');
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      autor: '',
      tipo_documento: 'otro',
      categoria: '',
      descripcion: '',
      archivo_url: '',
      imagen_portada: '',
      fecha_documento: '',
      fecha_publicacion: new Date().toISOString().split('T')[0],
      idioma: 'es',
      paginas: '',
      isbn: '',
      destacado: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (doc) => {
    setFormData({
      titulo: doc.titulo,
      autor: doc.autor || '',
      tipo_documento: doc.tipo_documento,
      categoria: doc.categoria || '',
      descripcion: doc.descripcion || '',
      archivo_url: doc.archivo_url || '',
      imagen_portada: doc.imagen_portada || '',
      fecha_documento: doc.fecha_documento || '',
      fecha_publicacion: doc.fecha_publicacion || new Date().toISOString().split('T')[0],
      idioma: doc.idioma || 'es',
      paginas: doc.paginas || '',
      isbn: doc.isbn || '',
      destacado: doc.destacado || false
    });
    setEditingId(doc.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      paginas: formData.paginas ? parseInt(formData.paginas) : null
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const tipos = [
    { value: 'enciclica', label: 'Encíclica' },
    { value: 'documento_vaticano', label: 'Documento Vaticano' },
    { value: 'historia_diocesana', label: 'Historia Diocesana' },
    { value: 'carta_pastoral_antigua', label: 'Carta Pastoral Antigua' },
    { value: 'libro', label: 'Libro' },
    { value: 'articulo', label: 'Artículo' },
    { value: 'otro', label: 'Otro' }
  ];

  return (
    <div className="admin-biblioteca-digital">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1><FaBook /> Gestión de Biblioteca Digital</h1>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <FaPlus /> Nuevo Documento
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="documento-form">
            <h2>{editingId ? 'Editar' : 'Nuevo'} Documento</h2>
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
                <label>Tipo de Documento *</label>
                <select
                  value={formData.tipo_documento}
                  onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})}
                  required
                >
                  {tipos.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows="5"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>URL Archivo (PDF)</label>
                <input
                  type="url"
                  value={formData.archivo_url}
                  onChange={(e) => setFormData({...formData, archivo_url: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>URL Imagen Portada</label>
                <input
                  type="url"
                  value={formData.imagen_portada}
                  onChange={(e) => setFormData({...formData, imagen_portada: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Fecha del Documento</label>
                <input
                  type="date"
                  value={formData.fecha_documento}
                  onChange={(e) => setFormData({...formData, fecha_documento: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Publicación</label>
                <input
                  type="date"
                  value={formData.fecha_publicacion}
                  onChange={(e) => setFormData({...formData, fecha_publicacion: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Páginas</label>
                <input
                  type="number"
                  value={formData.paginas}
                  onChange={(e) => setFormData({...formData, paginas: e.target.value})}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.destacado}
                  onChange={(e) => setFormData({...formData, destacado: e.target.checked})}
                />
                Destacado
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
          <div className="loading">Cargando documentos...</div>
        ) : documentos.length === 0 ? (
          <div className="no-results">No hay documentos registrados.</div>
        ) : (
          <div className="documentos-grid">
            {documentos.map(doc => (
              <div key={doc.id} className="documento-card">
                {doc.destacado && <FaStar className="destacada-icon" />}
                <h3>{doc.titulo}</h3>
                {doc.autor && <p className="documento-autor">Por: {doc.autor}</p>}
                <span className="badge">{doc.tipo_documento}</span>
                {doc.descripcion && (
                  <p className="documento-preview">{doc.descripcion.substring(0, 150)}...</p>
                )}
                <div className="documento-actions">
                  <button onClick={() => handleEdit(doc)} className="btn btn-sm btn-edit">
                    <FaEdit /> Editar
                  </button>
                  <button onClick={() => deleteMutation.mutate(doc.id)} className="btn btn-sm btn-delete">
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

export default AdminBibliotecaDigital;
