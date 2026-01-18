import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminFilters from '../../components/admin/AdminFilters';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminSesiones.css';

const AdminSesiones = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [formData, setFormData] = useState({
    numero_sesion: '',
    tipo: 'ordinaria',
    fecha: '',
    hora: '',
    lugar: 'Sala de Sesiones del Diócesis de Ipiales',
    orden_dia: '',
    acta_url: '',
    video_url: '',
    video_embed_code: '',
    resumen: '',
    publicada: false,
    destacada: false
  });
  const [actaFile, setActaFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();

  const tiposSesion = [
    { value: 'ordinaria', label: 'Ordinaria' },
    { value: 'extraordinaria', label: 'Extraordinaria' },
    { value: 'especial', label: 'Especial' }
  ];

  // Obtener todas las sesiones (admin)
  const { data: sesiones = [], isLoading } = useQuery({
    queryKey: ['sesiones', 'admin'],
    queryFn: async () => {
      const response = await api.get('/sesiones/admin/all');
      return response.data;
    }
  });

  // Crear sesión
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/sesiones', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sesiones']);
      resetForm();
      alert('Sesión creada exitosamente');
    },
    onError: (error) => {
      alert('Error al crear sesión: ' + (error.response?.data?.error || error.message));
    }
  });

  // Actualizar sesión
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/sesiones/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sesiones']);
      resetForm();
      alert('Sesión actualizada exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar sesión: ' + (error.response?.data?.error || error.message));
    }
  });

  // Eliminar sesión
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/sesiones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sesiones']);
      alert('Sesión eliminada exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar sesión: ' + (error.response?.data?.error || error.message));
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleActaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setActaFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    if (actaFile) {
      data.append('acta', actaFile);
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setActaFile(null);
    } catch (error) {
      alert('Error al guardar sesión: ' + (error.response?.data?.error || error.message));
    }
  };

  const togglePublicar = async (id, publicada) => {
    try {
      await api.patch(`/sesiones/${id}/publicar`, { publicada: !publicada });
      queryClient.invalidateQueries(['sesiones']);
      alert(`Sesión ${!publicada ? 'publicada' : 'despublicada'} exitosamente`);
    } catch (error) {
      alert('Error al cambiar estado: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (sesion) => {
    setFormData({
      numero_sesion: sesion.numero_sesion || '',
      tipo: sesion.tipo || 'ordinaria',
      fecha: sesion.fecha || '',
      hora: sesion.hora || '',
      lugar: sesion.lugar || 'Sala de Sesiones del Diócesis de Ipiales',
      orden_dia: sesion.orden_dia || '',
      acta_url: sesion.acta_url || '',
      video_url: sesion.video_url || '',
      video_embed_code: sesion.video_embed_code || '',
      resumen: sesion.resumen || '',
      publicada: sesion.publicada || false,
      destacada: sesion.destacada || false
    });
    setEditingId(sesion.id);
    setActaFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta sesión?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      numero_sesion: '',
      tipo: 'ordinaria',
      fecha: '',
      hora: '',
      lugar: 'Sala de Sesiones del Diócesis de Ipiales',
      orden_dia: '',
      acta_url: '',
      video_url: '',
      video_embed_code: '',
      resumen: '',
      publicada: false,
      destacada: false
    });
    setEditingId(null);
    setActaFile(null);
    setShowForm(false);
  };

  // Filtrar sesiones
  const sesionesFiltradas = sesiones.filter(sesion => {
    const matchSearch = searchQuery === '' || 
      sesion.numero_sesion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sesion.resumen?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sesion.orden_dia?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchTipo = filterTipo === 'todas' || sesion.tipo === filterTipo;
    
    const matchEstado = filterEstado === 'todas' || 
      (filterEstado === 'publicadas' && sesion.publicada) ||
      (filterEstado === 'borradores' && !sesion.publicada);
    
    return matchSearch && matchTipo && matchEstado;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterTipo('todas');
    setFilterEstado('todas');
  };

  if (isLoading) {
    return <div className="loading">Cargando sesiones...</div>;
  }

  return (
    <div className="admin-sesiones">
      <AdminNavbar title="Gestión de Sesiones de la Diócesis" />
      <div className="admin-content-wrapper">
          <div className="admin-actions">
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? '✕ Cancelar' : '+ Nueva Sesión'}
            </button>
          </div>

          <AdminFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Buscar por número, resumen o orden del día..."
            filters={[
              {
                name: 'tipo',
                label: 'Tipo',
                value: filterTipo,
                defaultValue: 'todas',
                onChange: setFilterTipo,
                options: [
                  { value: 'todas', label: 'Todos los tipos' },
                  { value: 'ordinaria', label: 'Ordinaria' },
                  { value: 'extraordinaria', label: 'Extraordinaria' },
                  { value: 'especial', label: 'Especial' }
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
                  { value: 'publicadas', label: 'Publicadas' },
                  { value: 'borradores', label: 'Borradores' }
                ]
              }
            ]}
            onClearFilters={handleClearFilters}
            totalItems={sesiones.length}
            filteredItems={sesionesFiltradas.length}
          />

          {showForm && (
            <form className="sesiones-form" onSubmit={handleSubmit}>
              <h2>{editingId ? 'Editar Sesión' : 'Nueva Sesión de la Diócesis'}</h2>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="numero_sesion">Número de Sesión *</label>
                  <input
                    type="text"
                    id="numero_sesion"
                    name="numero_sesion"
                    value={formData.numero_sesion}
                    onChange={handleChange}
                    required
                    placeholder="Ej: 001-2024"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tipo">Tipo de Sesión *</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                  >
                    {tiposSesion.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fecha">Fecha *</label>
                  <input
                    type="date"
                    id="fecha"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hora">Hora</label>
                  <input
                    type="time"
                    id="hora"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lugar">Lugar</label>
                <input
                  type="text"
                  id="lugar"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleChange}
                  placeholder="Sala de Sesiones del Diócesis de Ipiales"
                />
              </div>

              <div className="form-group">
                <label htmlFor="resumen">Resumen</label>
                <textarea
                  id="resumen"
                  name="resumen"
                  value={formData.resumen}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Resumen breve de la sesión..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="orden_dia">Orden del Día</label>
                <textarea
                  id="orden_dia"
                  name="orden_dia"
                  value={formData.orden_dia}
                  onChange={handleChange}
                  rows="5"
                  placeholder="1. Punto uno&#10;2. Punto dos&#10;3. Punto tres..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="video_url">URL del Video (Facebook/YouTube)</label>
                <input
                  type="url"
                  id="video_url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="https://www.facebook.com/... o https://www.youtube.com/..."
                />
                <small className="form-help">
                  Pegue la URL del video de Facebook o YouTube. El sistema lo embebará automáticamente.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="video_embed_code">Código de Embed (Alternativo)</label>
                <textarea
                  id="video_embed_code"
                  name="video_embed_code"
                  value={formData.video_embed_code}
                  onChange={handleChange}
                  rows="3"
                  placeholder="<iframe>...</iframe>"
                />
                <small className="form-help">
                  Si tiene código HTML de embed personalizado, puede pegarlo aquí.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="acta">Acta (Archivo)</label>
                <input
                  type="file"
                  id="acta"
                  name="acta"
                  accept=".pdf,.doc,.docx"
                  onChange={handleActaChange}
                />
                <small>Sube el acta o usa una URL (opcional)</small>
              </div>

              <div className="form-group">
                <label htmlFor="acta_url">URL del Acta (Alternativa)</label>
                <input
                  type="url"
                  id="acta_url"
                  name="acta_url"
                  value={formData.acta_url}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/acta.pdf"
                />
                <small>Si no subes un archivo, puedes usar una URL</small>
              </div>

              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="publicada"
                      checked={formData.publicada}
                      onChange={handleChange}
                    />
                    Publicar sesión (visible para usuarios)
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
                    Marcar como destacada
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
                  {editingId ? 'Actualizar' : 'Crear'} Sesión
                </button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="sesiones-list">
            <h2>Sesiones de la Diócesis</h2>
            
            {sesionesFiltradas.length === 0 ? (
              <div className="no-results">
                <p>
                  {sesiones.length === 0 
                    ? 'No hay sesiones registradas.' 
                    : 'No se encontraron sesiones con los filtros aplicados.'}
                </p>
                {(searchQuery || filterTipo !== 'todas' || filterEstado !== 'todas') && (
                  <button onClick={handleClearFilters} className="btn btn-secondary">
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="sesiones-table">
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sesionesFiltradas.map((sesion) => (
                      <tr key={sesion.id} className={!sesion.publicada ? 'unpublished' : ''}>
                        <td>
                          <strong>{sesion.numero_sesion}</strong>
                        </td>
                        <td>
                          <span className={`tipo-badge ${sesion.tipo}`}>
                            {sesion.tipo === 'ordinaria' ? '📋 Ordinaria' :
                             sesion.tipo === 'extraordinaria' ? '⚡ Extraordinaria' :
                             '⭐ Especial'}
                          </span>
                        </td>
                        <td>
                          {sesion.fecha 
                            ? new Date(sesion.fecha).toLocaleDateString('es-CO')
                            : 'Sin fecha'
                          }
                        </td>
                        <td>
                          {sesion.hora || '-'}
                        </td>
                        <td>
                          <span className={`status-badge ${sesion.publicada ? 'published' : 'draft'}`}>
                            {sesion.publicada ? 'Publicada' : 'Borrador'}
                          </span>
                          {sesion.destacada && (
                            <span className="destacada-badge">⭐</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => handleEdit(sesion)}
                              className="btn btn-sm btn-edit"
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => togglePublicar(sesion.id, sesion.publicada)}
                              className={`btn btn-sm ${sesion.publicada ? 'btn-warning' : 'btn-success'}`}
                            >
                              {sesion.publicada ? 'Despublicar' : 'Publicar'}
                            </button>
                            <button 
                              onClick={() => handleDelete(sesion.id)}
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

export default AdminSesiones;

