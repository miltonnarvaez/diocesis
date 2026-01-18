import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminFilters from '../../components/admin/AdminFilters';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminTransparencia.css';

const AdminTransparencia = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [formData, setFormData] = useState({
    categoria: 'presupuesto',
    titulo: '',
    descripcion: '',
    archivo_url: '',
    fecha: '',
    publicada: false
  });
  const [archivoFile, setArchivoFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();

  // Categorías según normativa
  const categorias = [
    { value: 'presupuesto', label: 'Presupuesto', descripcion: 'Presupuesto general, ejecución presupuestal y modificaciones' },
    { value: 'contratacion', label: 'Contratación Pública', descripcion: 'Procesos de contratación, licitaciones y adjudicaciones' },
    { value: 'plan_compras', label: 'Plan Anual de Compras', descripcion: 'Plan anual de adquisiciones y compras' },
    { value: 'rendicion_cuentas', label: 'Rendición de Cuentas', descripcion: 'Informes de gestión y rendición de cuentas' },
    { value: 'estados_financieros', label: 'Estados Financieros', descripcion: 'Estados financieros, balances y reportes contables' },
    { value: 'control_interno', label: 'Control Interno', descripcion: 'Informes de control interno y auditorías' },
    { value: 'declaracion_renta', label: 'Declaración de Renta', descripcion: 'Declaraciones de renta y bienes' },
    { value: 'estructura_organizacional', label: 'Estructura Organizacional', descripcion: 'Organigrama, manual de funciones y estructura' },
    { value: 'plan_desarrollo', label: 'Plan de Desarrollo', descripcion: 'Plan de desarrollo municipal y seguimiento' },
    { value: 'normatividad', label: 'Normatividad', descripcion: 'Normas, reglamentos y disposiciones aplicables' },
    { value: 'servicios_ciudadanos', label: 'Servicios Ciudadanos', descripcion: 'Información sobre servicios y trámites' },
    { value: 'auditorias', label: 'Auditorías', descripcion: 'Informes de auditoría externa e interna' },
    { value: 'bienes_inmuebles', label: 'Bienes Inmuebles', descripcion: 'Inventario de bienes inmuebles y patrimonio' },
    { value: 'personal', label: 'Personal', descripcion: 'Planta de personal, nómina y convocatorias de empleo' }
  ];

  // Obtener todos los documentos (incluyendo no publicados para admin)
  const { data: documentos = [], isLoading } = useQuery({
    queryKey: ['transparencia', 'admin'],
    queryFn: async () => {
      const response = await api.get('/transparencia/admin');
      return response.data;
    }
  });

  // Crear documento
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/transparencia', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transparencia']);
      resetForm();
    }
  });

  // Actualizar documento
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/transparencia/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transparencia']);
      resetForm();
    }
  });

  // Eliminar documento
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/transparencia/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transparencia']);
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
      await api.patch(`/transparencia/${id}/publicar`, { publicada: !publicada });
      queryClient.invalidateQueries(['transparencia']);
      alert(`Documento ${!publicada ? 'publicado' : 'despublicado'} exitosamente`);
    } catch (error) {
      alert('Error al cambiar estado: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (documento) => {
    setFormData({
      categoria: documento.categoria,
      titulo: documento.titulo,
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

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(documento => {
    const matchSearch = searchQuery === '' || 
      documento.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      documento.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchCategoria = filterCategoria === 'todas' || documento.categoria === filterCategoria;
    
    const matchEstado = filterEstado === 'todas' || 
      (filterEstado === 'publicados' && documento.publicada) ||
      (filterEstado === 'borradores' && !documento.publicada);
    
    return matchSearch && matchCategoria && matchEstado;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategoria('todas');
    setFilterEstado('todas');
  };

  const resetForm = () => {
    setFormData({
      categoria: 'presupuesto',
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
    <div className="admin-transparencia">
      <AdminNavbar title="Gestión de Transparencia" />
      <div className="admin-content-wrapper">
          <div className="admin-actions">
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? '✕ Cancelar' : '+ Nuevo Documento'}
            </button>
          </div>

          <AdminFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Buscar por título o descripción..."
            filters={[
              {
                name: 'categoria',
                label: 'Categoría',
                value: filterCategoria,
                defaultValue: 'todas',
                onChange: setFilterCategoria,
                options: [
                  { value: 'todas', label: 'Todas las categorías' },
                  ...categorias.map(cat => ({ value: cat.value, label: cat.label }))
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
            <form className="transparencia-form" onSubmit={handleSubmit}>
              <h2>{editingId ? 'Editar Documento' : 'Nuevo Documento de Transparencia'}</h2>
              
              <div className="form-group">
                <label htmlFor="categoria">Categoría *</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <small className="form-help">
                  {categorias.find(c => c.value === formData.categoria)?.descripcion}
                </small>
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
                  placeholder="Ej: Presupuesto General 2024"
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
                  <small className="form-help">
                    Si no subes un archivo, puedes usar una URL
                  </small>
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
            <h2>Documentos de Transparencia</h2>
            
            {documentosFiltrados.length === 0 ? (
              <div className="no-results">
                <p>
                  {documentos.length === 0 
                    ? 'No hay documentos registrados.' 
                    : 'No se encontraron documentos con los filtros aplicados.'}
                </p>
                {(searchQuery || filterCategoria !== 'todas' || filterEstado !== 'todas') && (
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
                      <th>Categoría</th>
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
                          <span className="categoria-badge">{documento.categoria}</span>
                        </td>
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

export default AdminTransparencia;

