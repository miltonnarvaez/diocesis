import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminFilters from '../../components/admin/AdminFilters';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminGaceta.css';

const AdminGaceta = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tipo: 'carta_pastoral',
    numero: '',
    titulo: '',
    descripcion: '',
    archivo_url: '',
    fecha: '',
    publicada: false
  });
  const [archivoFile, setArchivoFile] = useState(null);
  const queryClient = useQueryClient();

  const tiposDocumento = [
    { value: 'carta_pastoral', label: 'Carta Pastoral' },
    { value: 'decreto', label: 'Decreto' },
    { value: 'comunicado', label: 'Comunicado' },
    { value: 'circular', label: 'Circular' },
    { value: 'boletin', label: 'Boletín' },
    { value: 'manual', label: 'Manual' },
    { value: 'directorio', label: 'Directorio' }
  ];

  // Obtener todos los documentos (admin)
  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['gaceta', 'admin'],
    queryFn: async () => {
      const response = await api.get('/gaceta/admin/all');
      return response.data;
    }
  });

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(documento => {
    const matchSearch = searchQuery === '' || 
      documento.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      documento.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      documento.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchTipo = filterTipo === 'todos' || documento.tipo === filterTipo;
    
    const matchEstado = filterEstado === 'todas' || 
      (filterEstado === 'publicados' && documento.publicada) ||
      (filterEstado === 'borradores' && !documento.publicada);
    
    return matchSearch && matchTipo && matchEstado;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterTipo('todos');
    setFilterEstado('todas');
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/gaceta', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gaceta']);
      resetForm();
      alert('Documento creado exitosamente');
    },
    onError: (error) => {
      alert('Error al crear documento: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/gaceta/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gaceta']);
      resetForm();
      alert('Documento actualizado exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar documento: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/gaceta/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gaceta']);
      alert('Documento eliminado exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar documento: ' + (error.response?.data?.error || error.message));
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo) {
      alert('Por favor completa el título');
      return;
    }

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (archivoFile) {
      data.append('archivo', archivoFile);
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setArchivoFile(null);
    } catch (error) {
      alert('Error al guardar documento: ' + (error.response?.data?.error || error.message));
    }
  };

  const togglePublicar = async (id, publicada) => {
    try {
      await api.patch(`/gaceta/${id}/publicar`, { publicada: !publicada });
      queryClient.invalidateQueries(['gaceta']);
      alert(`Documento ${!publicada ? 'publicado' : 'despublicado'} exitosamente`);
    } catch (error) {
      alert('Error al cambiar estado: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (documento) => {
    setFormData({
      tipo: documento.tipo || 'acuerdo',
      numero: documento.numero || '',
      titulo: documento.titulo || '',
      descripcion: documento.descripcion || '',
      archivo_url: documento.archivo_url || '',
      fecha: documento.fecha || '',
      publicada: documento.publicada || false
    });
    setEditingId(documento.id);
    setArchivoFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este documento?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'acuerdo',
      numero: '',
      titulo: '',
      descripcion: '',
      archivo_url: '',
      fecha: '',
      publicada: false
    });
    setEditingId(null);
    setArchivoFile(null);
    setShowForm(false);
  };

  if (isLoading) {
    return <div className="loading">Cargando documentos...</div>;
  }

  return (
    <div className="admin-gaceta">
      <AdminNavbar title="Gestión de Gaceta" />
      <div className="admin-content-wrapper">
          <div className="admin-actions">
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? '✕ Cancelar' : '+ Nuevo Documento'}
            </button>
          </div>

          <AdminFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Buscar por número, título o descripción..."
            filters={[
              {
                name: 'tipo',
                label: 'Tipo',
                value: filterTipo,
                defaultValue: 'todos',
                onChange: setFilterTipo,
                options: [
                  { value: 'todos', label: 'Todos los tipos' },
                  ...tiposDocumento.map(tipo => ({ value: tipo.value, label: tipo.label }))
                ]
              },
              {
                name: 'estado',
                label: 'Estado',
                value: filterEstado,
                defaultValue: 'todas',
                onChange: setFilterEstado,
                options: [
                  { value: 'todas', label: 'Todas' },
                  { value: 'publicados', label: 'Publicados' },
                  { value: 'borradores', label: 'Borradores' }
                ]
              }
            ]}
            onClearFilters={handleClearFilters}
            totalItems={documentos.length}
            filteredItems={documentosFiltrados.length}
          />

          {showForm && (
            <form className="gaceta-form" onSubmit={handleSubmit}>
              <h2>{editingId ? 'Editar Documento' : 'Nuevo Documento de Gaceta'}</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tipo">Tipo de Documento *</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                  >
                    {tiposDocumento.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="numero">Número</label>
                  <input
                    type="text"
                    id="numero"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                    placeholder="Ej: 001-2024"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="titulo">Título *</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  required
                  placeholder="Título del documento"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Descripción breve del documento..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="archivo">Archivo</label>
                <input
                  type="file"
                  id="archivo"
                  name="archivo"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={handleArchivoChange}
                />
                <small>Sube un archivo o usa una URL (opcional)</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="archivo_url">URL del Archivo (Alternativa)</label>
                  <input
                    type="url"
                    id="archivo_url"
                    name="archivo_url"
                    value={formData.archivo_url}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/documento.pdf"
                  />
                  <small>Si no subes un archivo, puedes usar una URL</small>
                </div>

                <div className="form-group">
                  <label htmlFor="fecha">Fecha del Documento</label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="publicada"
                    checked={formData.publicada}
                    onChange={handleChange}
                  />
                  Publicar documento (visible para usuarios)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
                  {editingId ? 'Actualizar' : 'Crear'} Documento
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="documentos-list">
            <h2>Documentos de Gaceta</h2>
            
            {documentosFiltrados.length === 0 ? (
              <div className="no-results">
                <p>
                  {documentos.length === 0 
                    ? 'No hay documentos registrados.' 
                    : 'No se encontraron documentos con los filtros aplicados.'}
                </p>
                {(searchQuery || filterTipo !== 'todos' || filterEstado !== 'todas') && (
                  <button onClick={handleClearFilters} className="btn btn-secondary">
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="documentos-table">
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Número</th>
                      <th>Título</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentosFiltrados.map((documento) => (
                      <tr key={documento.id} className={!documento.publicada ? 'unpublished' : ''}>
                        <td>
                          <span className="tipo-badge">{documento.tipo}</span>
                        </td>
                        <td>{documento.numero || '-'}</td>
                        <td>
                          <strong>{documento.titulo}</strong>
                          {documento.descripcion && (
                            <p className="descripcion-preview">{documento.descripcion.substring(0, 100)}...</p>
                          )}
                        </td>
                        <td>
                          {documento.fecha 
                            ? new Date(documento.fecha).toLocaleDateString('es-CO')
                            : 'Sin fecha'
                          }
                        </td>
                        <td>
                          <span className={`status-badge ${documento.publicada ? 'published' : 'draft'}`}>
                            {documento.publicada ? 'Publicado' : 'Borrador'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleEdit(documento)}
                              className="btn btn-sm btn-edit"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => togglePublicar(documento.id, documento.publicada)}
                              className={`btn btn-sm ${documento.publicada ? 'btn-warning' : 'btn-success'}`}
                            >
                              {documento.publicada ? 'Despublicar' : 'Publicar'}
                            </button>
                            <button 
                              onClick={() => handleDelete(documento.id)}
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

export default AdminGaceta;
