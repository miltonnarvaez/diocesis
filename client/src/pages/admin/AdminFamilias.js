import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminFamilias.css';

const AdminFamilias = () => {
  const [showForm, setShowForm] = useState(false);
  const [showInscripciones, setShowInscripciones] = useState(false);
  const [editingPrograma, setEditingPrograma] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: '',
    objetivo: '',
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
    facilitador: '',
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

  const { data: programas = [], isLoading } = useQuery({
    queryKey: ['familias-programas'],
    queryFn: async () => {
      const response = await api.get('/familias/programas');
      return response.data;
    }
  });

  const { data: inscripciones = [] } = useQuery({
    queryKey: ['familias-inscripciones'],
    queryFn: async () => {
      const response = await api.get('/familias/admin/inscripciones');
      return response.data;
    },
    enabled: showInscripciones
  });

  useEffect(() => {
    if (editingPrograma) {
      setFormData({
        titulo: editingPrograma.titulo || '',
        descripcion: editingPrograma.descripcion || '',
        tipo: editingPrograma.tipo || '',
        objetivo: editingPrograma.objetivo || '',
        duracion: editingPrograma.duracion || '',
        modalidad: editingPrograma.modalidad || '',
        fecha_inicio: editingPrograma.fecha_inicio ? editingPrograma.fecha_inicio.split('T')[0] : '',
        fecha_fin: editingPrograma.fecha_fin ? editingPrograma.fecha_fin.split('T')[0] : '',
        horario: editingPrograma.horario || '',
        lugar: editingPrograma.lugar || '',
        cupos_maximos: editingPrograma.cupos_maximos || '',
        costo: editingPrograma.costo || 0,
        requisitos: editingPrograma.requisitos || '',
        contenido: Array.isArray(editingPrograma.contenido) 
          ? editingPrograma.contenido 
          : (typeof editingPrograma.contenido === 'string' 
              ? JSON.parse(editingPrograma.contenido || '[]') 
              : []),
        facilitador: editingPrograma.facilitador || '',
        contacto: editingPrograma.contacto || '',
        email: editingPrograma.email || '',
        telefono: editingPrograma.telefono || '',
        inscripcion_abierta: editingPrograma.inscripcion_abierta !== undefined ? editingPrograma.inscripcion_abierta : true,
        publicada: editingPrograma.publicada !== undefined ? editingPrograma.publicada : true,
        destacada: editingPrograma.destacada || false
      });
      setImagenPreview(editingPrograma.imagen_url || null);
    }
  }, [editingPrograma]);

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
      const response = await api.post('/familias/admin/programas', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['familias-programas']);
      resetForm();
      alert('Programa creado exitosamente');
    },
    onError: (error) => {
      alert('Error al crear programa: ' + (error.response?.data?.error || error.message));
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
      const response = await api.put(`/familias/admin/programas/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['familias-programas']);
      resetForm();
      alert('Programa actualizado exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar programa: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/familias/admin/programas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['familias-programas']);
      alert('Programa eliminado exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar programa: ' + (error.response?.data?.error || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: '',
      objetivo: '',
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
      facilitador: '',
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
    setEditingPrograma(null);
    setShowForm(false);
  };

  const handleNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (programa) => {
    setEditingPrograma(programa);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este programa?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      alert('Por favor completa el título del programa');
      return;
    }

    if (editingPrograma) {
      updateMutation.mutate({ id: editingPrograma.id, data: formData });
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

  const tipos = ['escuela_padres', 'terapia_familiar', 'formacion_matrimonial', 'preparacion_bautismo', 'otros'];
  const modalidades = ['presencial', 'virtual', 'mixta'];

  const filteredProgramas = programas.filter(programa => {
    const matchesSearch = programa.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         programa.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || programa.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  if (isLoading) {
    return (
      <div className="admin-familias">
        <AdminNavbar />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando programas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-familias">
      <AdminNavbar />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>Gestión de Familias</h1>
          <div className="header-actions">
            <button onClick={() => setShowInscripciones(!showInscripciones)} className="btn btn-info">
              {showInscripciones ? 'Ocultar' : 'Ver'} Inscripciones
            </button>
            <button onClick={handleNew} className="btn btn-primary">
              + Nuevo Programa
            </button>
          </div>
        </div>

        {showInscripciones && (
          <div className="inscripciones-section">
            <h2>Inscripciones a Programas</h2>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Programa</th>
                    <th>Familia</th>
                    <th>Contacto</th>
                    <th>Documento</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Miembros</th>
                    <th>Fecha Inscripción</th>
                  </tr>
                </thead>
                <tbody>
                  {inscripciones.map(inscripcion => (
                    <tr key={inscripcion.id}>
                      <td>{inscripcion.programa_titulo || '-'}</td>
                      <td>{inscripcion.nombre_familia}</td>
                      <td>{inscripcion.nombre_contacto}</td>
                      <td>{inscripcion.documento}</td>
                      <td>{inscripcion.email}</td>
                      <td>{inscripcion.telefono || '-'}</td>
                      <td>{inscripcion.numero_miembros || '-'}</td>
                      <td>{inscripcion.fecha_inscripcion ? new Date(inscripcion.fecha_inscripcion).toLocaleDateString() : '-'}</td>
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
            placeholder="Buscar programas..."
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
              <option key={tipo} value={tipo}>{tipo.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="admin-form-modal">
            <div className="admin-form-content">
              <h2>{editingPrograma ? 'Editar Programa' : 'Nuevo Programa'}</h2>
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
                        <option key={tipo} value={tipo}>{tipo.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duración</label>
                    <input
                      type="text"
                      name="duracion"
                      value={formData.duracion}
                      onChange={handleChange}
                      placeholder="Ej: 8 sesiones, 3 meses..."
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
                    <label>Facilitador</label>
                    <input
                      type="text"
                      name="facilitador"
                      value={formData.facilitador}
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
                    <label>Objetivo</label>
                    <textarea
                      name="objetivo"
                      value={formData.objetivo}
                      onChange={handleChange}
                      rows="3"
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
                    <label>Contenido del Programa</label>
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
                    {editingPrograma ? 'Actualizar' : 'Crear'}
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
              {filteredProgramas.map(programa => (
                <tr key={programa.id}>
                  <td>
                    <strong>{programa.titulo}</strong>
                    {programa.destacada && <span className="badge badge-primary">Destacado</span>}
                  </td>
                  <td>{programa.tipo ? programa.tipo.replace('_', ' ').toUpperCase() : '-'}</td>
                  <td>{programa.modalidad || '-'}</td>
                  <td>{programa.fecha_inicio ? new Date(programa.fecha_inicio).toLocaleDateString() : '-'}</td>
                  <td>
                    {programa.cupos_disponibles !== null ? (
                      <span>{programa.cupos_disponibles} / {programa.cupos_maximos}</span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`badge ${programa.publicada ? 'badge-success' : 'badge-danger'}`}>
                      {programa.publicada ? 'Publicado' : 'No Publicado'}
                    </span>
                    {programa.inscripcion_abierta && (
                      <span className="badge badge-info" style={{marginLeft: '0.5rem'}}>Inscripciones Abiertas</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(programa)}
                        className="btn btn-sm btn-primary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(programa.id)}
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

export default AdminFamilias;
















