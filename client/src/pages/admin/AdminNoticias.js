import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminFilters from '../../components/admin/AdminFilters';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminNoticias.css';

const AdminNoticias = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [formData, setFormData] = useState({
    titulo: '',
    contenido: '',
    resumen: '',
    imagen_url: '',
    categoria: 'Noticias',
    fecha_publicacion: new Date().toISOString().split('T')[0],
    publicada: false
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [documentosFiles, setDocumentosFiles] = useState([]);
  const [documentosExistentes, setDocumentosExistentes] = useState([]);
  const queryClient = useQueryClient();

  const { data: noticias = [] } = useQuery({
    queryKey: ['noticias'],
    queryFn: async () => {
      const response = await api.get('/noticias');
      return response.data;
    }
  });

  // Cuando se selecciona una noticia para editar
  useEffect(() => {
    if (editingNoticia) {
      setFormData({
        titulo: editingNoticia.titulo || '',
        contenido: editingNoticia.contenido || '',
        resumen: editingNoticia.resumen || '',
        imagen_url: editingNoticia.imagen_url || '',
        categoria: editingNoticia.categoria || 'Noticias',
        fecha_publicacion: editingNoticia.fecha_publicacion 
          ? editingNoticia.fecha_publicacion.split('T')[0] 
          : new Date().toISOString().split('T')[0],
        publicada: editingNoticia.publicada || false
      });
      
      // Cargar imagen existente
      if (editingNoticia.imagen_url) {
        if (editingNoticia.imagen_url.startsWith('http')) {
          setImagenPreview(editingNoticia.imagen_url);
        } else {
          // En producción usar ruta relativa, en desarrollo usar localhost:5001
          if (process.env.NODE_ENV === 'production') {
            const basename = window.location.pathname.startsWith('/diocesis') ? '/diocesis' : '';
            setImagenPreview(`${basename}${editingNoticia.imagen_url}`);
          } else {
            setImagenPreview(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${editingNoticia.imagen_url}`);
          }
        }
      } else {
        setImagenPreview(null);
      }
      
      // Cargar documentos existentes
      if (editingNoticia.documentos_adicionales) {
        try {
          setDocumentosExistentes(JSON.parse(editingNoticia.documentos_adicionales));
        } catch (e) {
          setDocumentosExistentes([]);
        }
      } else {
        setDocumentosExistentes([]);
      }
      
      setImagenFile(null);
      setDocumentosFiles([]);
      setShowForm(true);
    }
  }, [editingNoticia]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', data.titulo);
      formDataToSend.append('contenido', data.contenido);
      formDataToSend.append('resumen', data.resumen || '');
      formDataToSend.append('categoria', data.categoria);
      formDataToSend.append('fecha_publicacion', data.fecha_publicacion);
      formDataToSend.append('publicada', data.publicada);
      
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      
      documentosFiles.forEach((file, index) => {
        formDataToSend.append('documentos', file);
      });
      
      const response = await api.post('/noticias', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['noticias']);
      resetForm();
      alert('Noticia creada exitosamente');
    },
    onError: (error) => {
      alert('Error al crear noticia: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const formDataToSend = new FormData();
      formDataToSend.append('titulo', data.titulo);
      formDataToSend.append('contenido', data.contenido);
      formDataToSend.append('resumen', data.resumen || '');
      formDataToSend.append('categoria', data.categoria);
      formDataToSend.append('fecha_publicacion', data.fecha_publicacion);
      formDataToSend.append('publicada', data.publicada);
      formDataToSend.append('imagen_url', data.imagen_url || '');
      formDataToSend.append('documentos_existentes', JSON.stringify(documentosExistentes));
      
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      
      documentosFiles.forEach((file) => {
        formDataToSend.append('documentos', file);
      });
      
      const response = await api.put(`/noticias/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['noticias']);
      resetForm();
      alert('Noticia actualizada exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar noticia: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/noticias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['noticias']);
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      contenido: '',
      resumen: '',
      imagen_url: '',
      categoria: 'Noticias',
      fecha_publicacion: new Date().toISOString().split('T')[0],
      publicada: false
    });
    setImagenFile(null);
    setImagenPreview(null);
    setDocumentosFiles([]);
    setDocumentosExistentes([]);
    setEditingNoticia(null);
    setShowForm(false);
  };

  const handleNewNoticia = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      alert('Por favor completa el título y el contenido');
      return;
    }

    if (editingNoticia) {
      updateMutation.mutate({ id: editingNoticia.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

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

  const handleDocumentosChange = (e) => {
    const files = Array.from(e.target.files);
    setDocumentosFiles(prev => [...prev, ...files]);
  };

  const removeDocumento = (index) => {
    setDocumentosFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocumentoExistente = (index) => {
    setDocumentosExistentes(prev => prev.filter((_, i) => i !== index));
  };

  const togglePublicar = async (id, publicada) => {
    try {
      await api.patch(`/noticias/${id}/publicar`, { publicada: !publicada });
      queryClient.invalidateQueries(['noticias']);
      alert(`Noticia ${!publicada ? 'publicada' : 'despublicada'} exitosamente`);
    } catch (error) {
      alert('Error al cambiar estado: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta noticia?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filtrar noticias
  const noticiasFiltradas = noticias.filter(noticia => {
    // Filtro por búsqueda
    const matchSearch = searchQuery === '' || 
      noticia.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (noticia.resumen && noticia.resumen.toLowerCase().includes(searchQuery.toLowerCase())) ||
      noticia.contenido.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro por categoría
    const matchCategoria = filterCategoria === 'todas' || noticia.categoria === filterCategoria;
    
    // Filtro por estado
    const matchEstado = filterEstado === 'todas' || 
      (filterEstado === 'publicadas' && noticia.publicada) ||
      (filterEstado === 'borradores' && !noticia.publicada);
    
    return matchSearch && matchCategoria && matchEstado;
  });

  return (
    <div className="admin-noticias">
      <AdminNavbar title="Gestión de Noticias" />
      <div className="admin-content-wrapper">
        <div className="admin-actions">
          <button onClick={handleNewNoticia} className="btn btn-primary">
            + Nueva Noticia
          </button>
        </div>

          <AdminFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Buscar por título, resumen o contenido..."
            filters={[
              {
                name: 'categoria',
                label: 'Categoría',
                value: filterCategoria,
                defaultValue: 'todas',
                onChange: setFilterCategoria,
                options: [
                  { value: 'todas', label: 'Todas las categorías' },
                  { value: 'Noticias', label: 'Noticias Generales' },
                  { value: 'Sesiones', label: 'Sesiones del Diócesis' },
                  { value: 'Acuerdos', label: 'Acuerdos y Resoluciones' },
                  { value: 'Comunicados', label: 'Comunicados Oficiales' },
                  { value: 'Eventos', label: 'Eventos y Actividades' },
                  { value: 'Institucional', label: 'Institucional' }
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
            onClearFilters={() => {
              setSearchQuery('');
              setFilterCategoria('todas');
              setFilterEstado('todas');
            }}
            totalItems={noticias.length}
            filteredItems={noticiasFiltradas.length}
          />

          {showForm && (
            <div className="admin-form">
              <h2>{editingNoticia ? 'Editar Noticia' : 'Nueva Noticia'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="titulo">Título *</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    placeholder="Ingresa el título de la noticia"
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
                    placeholder="Breve resumen de la noticia (opcional)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contenido">Contenido *</label>
                  <textarea
                    id="contenido"
                    name="contenido"
                    value={formData.contenido}
                    onChange={handleChange}
                    rows="10"
                    required
                    placeholder="Contenido completo de la noticia"
                  />
                  <small>Puedes usar HTML básico para formatear el texto</small>
                </div>

                <div className="form-group">
                  <label htmlFor="imagen">Imagen de la Noticia</label>
                  <input
                    type="file"
                    id="imagen"
                    name="imagen"
                    accept="image/*"
                    onChange={handleImagenChange}
                  />
                  <small>Formatos permitidos: JPEG, JPG, PNG, GIF, WEBP (máx. 5MB)</small>
                  {imagenPreview && (
                    <div className="imagen-preview">
                      <img src={imagenPreview} alt="Vista previa" />
                      <button type="button" onClick={() => { setImagenFile(null); setImagenPreview(null); }} className="btn-small">
                        Eliminar imagen
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="documentos">Documentos Adicionales</label>
                  <input
                    type="file"
                    id="documentos"
                    name="documentos"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onChange={handleDocumentosChange}
                  />
                  <small>Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (máx. 10MB cada uno, hasta 5 archivos)</small>
                  
                  {documentosFiles.length > 0 && (
                    <div className="documentos-list">
                      <h4>Documentos nuevos a subir:</h4>
                      {documentosFiles.map((file, index) => (
                        <div key={index} className="documento-item">
                          <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                          <button type="button" onClick={() => removeDocumento(index)} className="btn-small btn-danger">
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {documentosExistentes.length > 0 && (
                    <div className="documentos-list">
                      <h4>Documentos existentes:</h4>
                      {documentosExistentes.map((doc, index) => (
                        <div key={index} className="documento-item">
                          <a 
                            href={
                              process.env.NODE_ENV === 'production'
                                ? `${window.location.pathname.startsWith('/diocesis') ? '/diocesis' : ''}${doc.ruta}`
                                : `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${doc.ruta}`
                            } 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {doc.nombre}
                          </a>
                          <button type="button" onClick={() => removeDocumentoExistente(index)} className="btn-small btn-danger">
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="categoria">Categoría</label>
                    <select
                      id="categoria"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                    >
                      <option value="Noticias">Noticias Generales</option>
                      <option value="Sesiones">Sesiones del Diócesis</option>
                      <option value="Acuerdos">Acuerdos y Resoluciones</option>
                      <option value="Comunicados">Comunicados Oficiales</option>
                      <option value="Eventos">Eventos y Actividades</option>
                      <option value="Institucional">Institucional</option>
                    </select>
                    <small>Selecciona la categoría que mejor describe el tipo de noticia</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fecha_publicacion">Fecha de Publicación</label>
                    <input
                      type="date"
                      id="fecha_publicacion"
                      name="fecha_publicacion"
                      value={formData.fecha_publicacion}
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
                    Publicar inmediatamente
                  </label>
                  <small>Si no está marcado, se guardará como borrador</small>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
                    {createMutation.isLoading || updateMutation.isLoading 
                      ? 'Guardando...' 
                      : editingNoticia 
                        ? 'Actualizar Noticia' 
                        : 'Crear Noticia'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {noticiasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                      <p>No se encontraron noticias con los filtros aplicados.</p>
                      {(searchQuery || filterCategoria !== 'todas' || filterEstado !== 'todas') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterCategoria('todas');
                            setFilterEstado('todas');
                          }}
                          className="btn btn-secondary"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  noticiasFiltradas.map((noticia) => (
                  <tr key={noticia.id}>
                    <td>{noticia.titulo}</td>
                    <td>{new Date(noticia.fecha_publicacion || noticia.creado_en).toLocaleDateString('es-CO')}</td>
                    <td>{noticia.publicada ? 'Publicada' : 'Borrador'}</td>
                    <td>
                      <button
                        onClick={() => {
                          setEditingNoticia(noticia);
                        }}
                        className="btn-small"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => togglePublicar(noticia.id, noticia.publicada)}
                        className={`btn-small ${noticia.publicada ? 'btn-warning' : 'btn-success'}`}
                      >
                        {noticia.publicada ? 'Despublicar' : 'Publicar'}
                      </button>
                      <button
                        onClick={() => handleDelete(noticia.id)}
                        className="btn-small btn-danger"
                        disabled={deleteMutation.isLoading}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default AdminNoticias;


