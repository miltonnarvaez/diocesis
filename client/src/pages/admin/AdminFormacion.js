import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminFormacion.css';

const AdminFormacion = () => {
  const [showForm, setShowForm] = useState(false);
  const [showInscripciones, setShowInscripciones] = useState(false);
  const [editingCurso, setEditingCurso] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: '',
    categoria: '',
    duracion: '',
    modalidad: '',
    fecha_inicio: '',
    fecha_fin: '',
    horario: '',
    lugar: '',
    cupos_maximos: '',
    costo: 0,
    requisitos: '',
    contenido: [],
    instructor: '',
    contacto: '',
    email: '',
    telefono: '',
    inscripcion_abierta: true,
    publicada: true,
    destacada: false
  });

  const [contenidoInput, setContenidoInput] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ['formacion-cursos'],
    queryFn: async () => {
      const response = await api.get('/formacion/cursos');
      return response.data;
    }
  });

  const { data: inscripciones = [] } = useQuery({
    queryKey: ['formacion-inscripciones'],
    queryFn: async () => {
      const response = await api.get('/formacion/admin/inscripciones');
      return response.data;
    },
    enabled: showInscripciones
  });

  useEffect(() => {
    if (editingCurso) {
      setFormData({
        titulo: editingCurso.titulo || '',
        descripcion: editingCurso.descripcion || '',
        tipo: editingCurso.tipo || '',
        categoria: editingCurso.categoria || '',
        duracion: editingCurso.duracion || '',
        modalidad: editingCurso.modalidad || '',
        fecha_inicio: editingCurso.fecha_inicio ? editingCurso.fecha_inicio.split('T')[0] : '',
        fecha_fin: editingCurso.fecha_fin ? editingCurso.fecha_fin.split('T')[0] : '',
        horario: editingCurso.horario || '',
        lugar: editingCurso.lugar || '',
        cupos_maximos: editingCurso.cupos_maximos || '',
        costo: editingCurso.costo || 0,
        requisitos: editingCurso.requisitos || '',
        contenido: Array.isArray(editingCurso.contenido) 
          ? editingCurso.contenido 
          : (typeof editingCurso.contenido === 'string' 
              ? JSON.parse(editingCurso.contenido || '[]') 
              : []),
        instructor: editingCurso.instructor || '',
        contacto: editingCurso.contacto || '',
        email: editingCurso.email || '',
        telefono: editingCurso.telefono || '',
        inscripcion_abierta: editingCurso.inscripcion_abierta !== undefined ? editingCurso.inscripcion_abierta : true,
        publicada: editingCurso.publicada !== undefined ? editingCurso.publicada : true,
        destacada: editingCurso.destacada || false
      });
      setImagenPreview(editingCurso.imagen_url || null);
    }
  }, [editingCurso]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'contenido') {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      const response = await api.post('/formacion/cursos', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['formacion-cursos']);
      resetForm();
      alert('Curso creado exitosamente');
    },
    onError: (error) => {
      alert('Error al crear curso: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'contenido') {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      const response = await api.put(`/formacion/cursos/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['formacion-cursos']);
      resetForm();
      alert('Curso actualizado exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar curso: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/formacion/cursos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['formacion-cursos']);
      alert('Curso eliminado exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar curso: ' + (error.response?.data?.error || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: '',
      categoria: '',
      duracion: '',
      modalidad: '',
      fecha_inicio: '',
      fecha_fin: '',
      horario: '',
      lugar: '',
      cupos_maximos: '',
      costo: 0,
      requisitos: '',
      contenido: [],
      instructor: '',
      contacto: '',
      email: '',
      telefono: '',
      inscripcion_abierta: true,
      publicada: true,
      destacada: false
    });
    setContenidoInput('');
    setImagenFile(null);
    setImagenPreview(null);
    setEditingCurso(null);
    setShowForm(false);
  };

  const handleNewCurso = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditCurso = (curso) => {
    setEditingCurso(curso);
    setShowForm(true);
  };

  const handleDeleteCurso = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este curso?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      alert('Por favor completa el título del curso');
      return;
    }

    if (editingCurso) {
      updateMutation.mutate({ id: editingCurso.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleAddContenido = () => {
    if (contenidoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        contenido: [...prev.contenido, contenidoInput.trim()]
      }));
      setContenidoInput('');
    }
  };

  const handleRemoveContenido = (index) => {
    setFormData(prev => ({
      ...prev,
      contenido: prev.contenido.filter((_, i) => i !== index)
    }));
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

  const tipos = ['curso', 'taller', 'seminario', 'diplomado'];
  const modalidades = ['presencial', 'virtual', 'mixta'];

  const filteredCursos = cursos.filter(curso => {
    const matchesSearch = curso.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         curso.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || curso.tipo === filterTipo;
    const matchesEstado = filterEstado === 'todos' || 
                         (filterEstado === 'publicados' && curso.publicada) ||
                         (filterEstado === 'no-publicados' && !curso.publicada);
    return matchesSearch && matchesTipo && matchesEstado;
  });

  if (isLoading) {
    return (
      <div className="admin-formacion">
        <AdminNavbar />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando cursos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-formacion">
      <AdminNavbar />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>Gestión de Formación</h1>
          <div className="header-actions">
            <button onClick={() => setShowInscripciones(!showInscripciones)} className="btn btn-info">
              {showInscripciones ? 'Ocultar' : 'Ver'} Inscripciones
            </button>
            <button onClick={handleNewCurso} className="btn btn-primary">
              + Nuevo Curso
            </button>
          </div>
        </div>

        {showInscripciones && (
          <div className="inscripciones-section">
            <h2>Inscripciones a Cursos</h2>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Parroquia</th>
                    <th>Fecha Inscripción</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {inscripciones.map(inscripcion => (
                    <tr key={inscripcion.id}>
                      <td>{inscripcion.curso_titulo || '-'}</td>
                      <td>{inscripcion.nombre_completo}</td>
                      <td>{inscripcion.documento}</td>
                      <td>{inscripcion.email}</td>
                      <td>{inscripcion.telefono || '-'}</td>
                      <td>{inscripcion.parroquia || '-'}</td>
                      <td>{inscripcion.fecha_inscripcion ? new Date(inscripcion.fecha_inscripcion).toLocaleDateString() : '-'}</td>
                      <td>
                        <span className={`badge badge-${inscripcion.estado === 'aprobada' ? 'success' : inscripcion.estado === 'rechazada' ? 'danger' : 'warning'}`}>
                          {inscripcion.estado || 'pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Buscar cursos..."
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
              <option key={tipo} value={tipo}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>
            ))}
          </select>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos</option>
            <option value="publicados">Publicados</option>
            <option value="no-publicados">No Publicados</option>
          </select>
        </div>

        {showForm && (
          <div className="admin-form-modal">
            <div className="admin-form-content">
              <h2>{editingCurso ? 'Editar Curso' : 'Nuevo Curso'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Título *</label>
                    <input
                      type="text"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar tipo</option>
                      {tipos.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <input
                      type="text"
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Duración</label>
                    <input
                      type="text"
                      name="duracion"
                      value={formData.duracion}
                      onChange={handleChange}
                      placeholder="Ej: 40 horas, 3 meses..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Modalidad</label>
                    <select
                      name="modalidad"
                      value={formData.modalidad}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar modalidad</option>
                      {modalidades.map(modalidad => (
                        <option key={modalidad} value={modalidad}>{modalidad.charAt(0).toUpperCase() + modalidad.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha Inicio</label>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={formData.fecha_inicio}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha Fin</label>
                    <input
                      type="date"
                      name="fecha_fin"
                      value={formData.fecha_fin}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Horario</label>
                    <input
                      type="text"
                      name="horario"
                      value={formData.horario}
                      onChange={handleChange}
                      placeholder="Ej: Lunes y Miércoles 6:00 PM - 8:00 PM"
                    />
                  </div>
                  <div className="form-group">
                    <label>Lugar</label>
                    <input
                      type="text"
                      name="lugar"
                      value={formData.lugar}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cupos Máximos</label>
                    <input
                      type="number"
                      name="cupos_maximos"
                      value={formData.cupos_maximos}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Costo</label>
                    <input
                      type="number"
                      step="0.01"
                      name="costo"
                      value={formData.costo}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Instructor</label>
                    <input
                      type="text"
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contacto</label>
                    <input
                      type="text"
                      name="contacto"
                      value={formData.contacto}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows="4"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Requisitos</label>
                    <textarea
                      name="requisitos"
                      value={formData.requisitos}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Contenido del Curso</label>
                    <div className="list-input-group">
                      <input
                        type="text"
                        value={contenidoInput}
                        onChange={(e) => setContenidoInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddContenido();
                          }
                        }}
                        placeholder="Agregar módulo o tema..."
                      />
                      <button type="button" onClick={handleAddContenido} className="btn btn-sm btn-primary">
                        Agregar
                      </button>
                    </div>
                    <div className="list-items">
                      {formData.contenido.map((item, index) => (
                        <div key={index} className="list-item">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveContenido(index)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
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
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="inscripcion_abierta"
                        checked={formData.inscripcion_abierta}
                        onChange={handleChange}
                      />
                      Inscripción Abierta
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="publicada"
                        checked={formData.publicada}
                        onChange={handleChange}
                      />
                      Publicada
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="destacada"
                        checked={formData.destacada}
                        onChange={handleChange}
                      />
                      Destacada
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingCurso ? 'Actualizar' : 'Crear'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Modalidad</th>
                <th>Fecha Inicio</th>
                <th>Cupos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCursos.map(curso => (
                <tr key={curso.id}>
                  <td>
                    <strong>{curso.titulo}</strong>
                    {curso.destacada && <span className="badge badge-primary">Destacado</span>}
                  </td>
                  <td>{curso.tipo || '-'}</td>
                  <td>{curso.modalidad || '-'}</td>
                  <td>{curso.fecha_inicio ? new Date(curso.fecha_inicio).toLocaleDateString() : '-'}</td>
                  <td>
                    {curso.cupos_disponibles !== null ? (
                      <span>{curso.cupos_disponibles} / {curso.cupos_maximos}</span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`badge ${curso.publicada ? 'badge-success' : 'badge-danger'}`}>
                      {curso.publicada ? 'Publicado' : 'No Publicado'}
                    </span>
                    {curso.inscripcion_abierta && (
                      <span className="badge badge-info" style={{marginLeft: '0.5rem'}}>Inscripciones Abiertas</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditCurso(curso)}
                        className="btn btn-sm btn-primary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteCurso(curso.id)}
                        className="btn btn-sm btn-danger"
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
      </div>
    </div>
  );
};

export default AdminFormacion;
















