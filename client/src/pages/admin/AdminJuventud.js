import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminJuventud.css';

const AdminJuventud = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingActividad, setEditingActividad] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('todos');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: '',
    fecha_inicio: '',
    fecha_fin: '',
    lugar: '',
    edad_minima: 14,
    edad_maxima: 30,
    cupos_maximos: '',
    costo: 0,
    responsable: '',
    contacto: '',
    email: '',
    telefono: '',
    inscripcion_abierta: true,
    publicada: true,
    destacada: false
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const { data: actividades = [], isLoading } = useQuery({
    queryKey: ['juventud-actividades'],
    queryFn: async () => {
      const response = await api.get('/juventud/actividades');
      return response.data;
    }
  });

  useEffect(() => {
    if (editingActividad) {
      setFormData({
        titulo: editingActividad.titulo || '',
        descripcion: editingActividad.descripcion || '',
        tipo: editingActividad.tipo || '',
        fecha_inicio: editingActividad.fecha_inicio ? editingActividad.fecha_inicio.split('T')[0] : '',
        fecha_fin: editingActividad.fecha_fin ? editingActividad.fecha_fin.split('T')[0] : '',
        lugar: editingActividad.lugar || '',
        edad_minima: editingActividad.edad_minima || 14,
        edad_maxima: editingActividad.edad_maxima || 30,
        cupos_maximos: editingActividad.cupos_maximos || '',
        costo: editingActividad.costo || 0,
        responsable: editingActividad.responsable || '',
        contacto: editingActividad.contacto || '',
        email: editingActividad.email || '',
        telefono: editingActividad.telefono || '',
        inscripcion_abierta: editingActividad.inscripcion_abierta !== undefined ? editingActividad.inscripcion_abierta : true,
        publicada: editingActividad.publicada !== undefined ? editingActividad.publicada : true,
        destacada: editingActividad.destacada || false
      });
      setImagenPreview(editingActividad.imagen_url || null);
    }
  }, [editingActividad]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      const response = await api.post('/juventud/actividades', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['juventud-actividades']);
      resetForm();
      alert('Actividad creada exitosamente');
    },
    onError: (error) => {
      alert('Error al crear actividad: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      const response = await api.put(`/juventud/actividades/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['juventud-actividades']);
      resetForm();
      alert('Actividad actualizada exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar actividad: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/juventud/actividades/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['juventud-actividades']);
      alert('Actividad eliminada exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar actividad: ' + (error.response?.data?.error || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: '',
      fecha_inicio: '',
      fecha_fin: '',
      lugar: '',
      edad_minima: 14,
      edad_maxima: 30,
      cupos_maximos: '',
      costo: 0,
      responsable: '',
      contacto: '',
      email: '',
      telefono: '',
      inscripcion_abierta: true,
      publicada: true,
      destacada: false
    });
    setImagenFile(null);
    setImagenPreview(null);
    setEditingActividad(null);
    setShowForm(false);
  };

  const handleNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (actividad) => {
    setEditingActividad(actividad);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta actividad?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      alert('Por favor completa el título de la actividad');
      return;
    }

    if (editingActividad) {
      updateMutation.mutate({ id: editingActividad.id, data: formData });
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

  const tipos = ['retiro', 'convivencia', 'formacion', 'servicio', 'deportivo', 'cultural', 'otros'];

  const filteredActividades = actividades.filter(actividad => {
    const matchesSearch = actividad.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         actividad.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || actividad.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  if (isLoading) {
    return (
      <div className="admin-juventud">
        <AdminNavbar />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando actividades...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-juventud">
      <AdminNavbar />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>Gestión de Juventud</h1>
          <button onClick={handleNew} className="btn btn-primary">
            + Nueva Actividad
          </button>
        </div>

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Buscar actividades..."
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
        </div>

        {showForm && (
          <div className="admin-form-modal">
            <div className="admin-form-content">
              <h2>{editingActividad ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
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
                    <label>Lugar</label>
                    <input
                      type="text"
                      name="lugar"
                      value={formData.lugar}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Edad Mínima</label>
                    <input
                      type="number"
                      name="edad_minima"
                      value={formData.edad_minima}
                      onChange={handleChange}
                      min="14"
                      max="30"
                    />
                  </div>
                  <div className="form-group">
                    <label>Edad Máxima</label>
                    <input
                      type="number"
                      name="edad_maxima"
                      value={formData.edad_maxima}
                      onChange={handleChange}
                      min="14"
                      max="30"
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
                    <label>Responsable</label>
                    <input
                      type="text"
                      name="responsable"
                      value={formData.responsable}
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
                    {editingActividad ? 'Actualizar' : 'Crear'}
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
                <th>Fecha Inicio</th>
                <th>Lugar</th>
                <th>Edad</th>
                <th>Cupos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredActividades.map(actividad => (
                <tr key={actividad.id}>
                  <td>
                    <strong>{actividad.titulo}</strong>
                    {actividad.destacada && <span className="badge badge-primary">Destacada</span>}
                  </td>
                  <td>{actividad.tipo || '-'}</td>
                  <td>{actividad.fecha_inicio ? new Date(actividad.fecha_inicio).toLocaleDateString() : '-'}</td>
                  <td>{actividad.lugar || '-'}</td>
                  <td>{actividad.edad_minima}-{actividad.edad_maxima} años</td>
                  <td>
                    {actividad.cupos_disponibles !== null ? (
                      <span>{actividad.cupos_disponibles} / {actividad.cupos_maximos}</span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`badge ${actividad.publicada ? 'badge-success' : 'badge-danger'}`}>
                      {actividad.publicada ? 'Publicada' : 'No Publicada'}
                    </span>
                    {actividad.inscripcion_abierta && (
                      <span className="badge badge-info" style={{marginLeft: '0.5rem'}}>Inscripciones Abiertas</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(actividad)}
                        className="btn btn-sm btn-primary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(actividad.id)}
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

export default AdminJuventud;
















