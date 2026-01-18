import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminParroquias.css';

const AdminParroquias = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingParroquia, setEditingParroquia] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterZona, setFilterZona] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [showHorariosForm, setShowHorariosForm] = useState(false);
  const [parroquiaSeleccionada, setParroquiaSeleccionada] = useState(null);
  const [editingHorario, setEditingHorario] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre: '',
    nombre_canonico: '',
    direccion: '',
    telefono: '',
    email: '',
    parroco: '',
    vicario: '',
    coordenadas_lat: '',
    coordenadas_lng: '',
    descripcion: '',
    fecha_fundacion: '',
    patrono: '',
    zona_pastoral: '',
    activa: true,
    destacada: false,
    orden: 0
  });

  const [horarioFormData, setHorarioFormData] = useState({
    dia_semana: '',
    hora: '',
    tipo_misa: '',
    idioma: 'español',
    notas: '',
    activo: true
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const { data: parroquias = [], isLoading } = useQuery({
    queryKey: ['parroquias'],
    queryFn: async () => {
      const response = await api.get('/parroquias');
      return response.data;
    }
  });

  useEffect(() => {
    if (editingParroquia) {
      setFormData({
        nombre: editingParroquia.nombre || '',
        nombre_canonico: editingParroquia.nombre_canonico || '',
        direccion: editingParroquia.direccion || '',
        telefono: editingParroquia.telefono || '',
        email: editingParroquia.email || '',
        parroco: editingParroquia.parroco || '',
        vicario: editingParroquia.vicario || '',
        coordenadas_lat: editingParroquia.coordenadas_lat || '',
        coordenadas_lng: editingParroquia.coordenadas_lng || '',
        descripcion: editingParroquia.descripcion || '',
        fecha_fundacion: editingParroquia.fecha_fundacion 
          ? editingParroquia.fecha_fundacion.split('T')[0] 
          : '',
        patrono: editingParroquia.patrono || '',
        zona_pastoral: editingParroquia.zona_pastoral || '',
        activa: editingParroquia.activa !== undefined ? editingParroquia.activa : true,
        destacada: editingParroquia.destacada || false,
        orden: editingParroquia.orden || 0
      });
      setImagenPreview(editingParroquia.imagen_url || null);
    }
  }, [editingParroquia]);

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
      const response = await api.post('/parroquias', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parroquias']);
      resetForm();
      alert('Parroquia creada exitosamente');
    },
    onError: (error) => {
      alert('Error al crear parroquia: ' + (error.response?.data?.error || error.message));
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
      const response = await api.put(`/parroquias/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parroquias']);
      resetForm();
      alert('Parroquia actualizada exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar parroquia: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/parroquias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parroquias']);
      alert('Parroquia eliminada exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar parroquia: ' + (error.response?.data?.error || error.message));
    }
  });

  const createHorarioMutation = useMutation({
    mutationFn: async ({ parroquiaId, data }) => {
      const response = await api.post(`/parroquias/${parroquiaId}/horarios`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parroquias']);
      resetHorarioForm();
      alert('Horario agregado exitosamente');
    },
    onError: (error) => {
      alert('Error al agregar horario: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateHorarioMutation = useMutation({
    mutationFn: async ({ horarioId, data }) => {
      const response = await api.put(`/parroquias/horarios/${horarioId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parroquias']);
      resetHorarioForm();
      alert('Horario actualizado exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar horario: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteHorarioMutation = useMutation({
    mutationFn: async (horarioId) => {
      await api.delete(`/parroquias/horarios/${horarioId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parroquias']);
      alert('Horario eliminado exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar horario: ' + (error.response?.data?.error || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      nombre_canonico: '',
      direccion: '',
      telefono: '',
      email: '',
      parroco: '',
      vicario: '',
      coordenadas_lat: '',
      coordenadas_lng: '',
      descripcion: '',
      fecha_fundacion: '',
      patrono: '',
      zona_pastoral: '',
      activa: true,
      destacada: false,
      orden: 0
    });
    setImagenFile(null);
    setImagenPreview(null);
    setEditingParroquia(null);
    setShowForm(false);
  };

  const resetHorarioForm = () => {
    setHorarioFormData({
      dia_semana: '',
      hora: '',
      tipo_misa: '',
      idioma: 'español',
      notas: '',
      activo: true
    });
    setEditingHorario(null);
    setParroquiaSeleccionada(null);
    setShowHorariosForm(false);
  };

  const handleNewParroquia = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditParroquia = (parroquia) => {
    setEditingParroquia(parroquia);
    setShowForm(true);
  };

  const handleDeleteParroquia = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta parroquia?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert('Por favor completa el nombre de la parroquia');
      return;
    }

    if (editingParroquia) {
      updateMutation.mutate({ id: editingParroquia.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleHorarioSubmit = (e) => {
    e.preventDefault();
    if (!horarioFormData.dia_semana || !horarioFormData.hora) {
      alert('Por favor completa el día y la hora');
      return;
    }

    if (editingHorario) {
      updateHorarioMutation.mutate({ horarioId: editingHorario.id, data: horarioFormData });
    } else {
      createHorarioMutation.mutate({ parroquiaId: parroquiaSeleccionada.id, data: horarioFormData });
    }
  };

  const handleEditHorario = (parroquia, horario) => {
    setParroquiaSeleccionada(parroquia);
    setEditingHorario(horario);
    setHorarioFormData({
      dia_semana: horario.dia_semana || '',
      hora: horario.hora || '',
      tipo_misa: horario.tipo_misa || '',
      idioma: horario.idioma || 'español',
      notas: horario.notas || '',
      activo: horario.activo !== undefined ? horario.activo : true
    });
    setShowHorariosForm(true);
  };

  const handleNewHorario = (parroquia) => {
    setParroquiaSeleccionada(parroquia);
    resetHorarioForm();
    setShowHorariosForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHorarioChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHorarioFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const zonas = ['zona_1', 'zona_2', 'zona_3', 'zona_4'];
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const filteredParroquias = parroquias.filter(parroquia => {
    const matchesSearch = parroquia.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         parroquia.direccion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZona = filterZona === 'todas' || parroquia.zona_pastoral === filterZona;
    const matchesEstado = filterEstado === 'todas' || 
                         (filterEstado === 'activas' && parroquia.activa) ||
                         (filterEstado === 'inactivas' && !parroquia.activa);
    return matchesSearch && matchesZona && matchesEstado;
  });

  if (isLoading) {
    return (
      <div className="admin-parroquias">
        <AdminNavbar />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando parroquias...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-parroquias">
      <AdminNavbar />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>Gestión de Parroquias</h1>
          <button onClick={handleNewParroquia} className="btn btn-primary">
            + Nueva Parroquia
          </button>
        </div>

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Buscar parroquias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterZona}
            onChange={(e) => setFilterZona(e.target.value)}
            className="filter-select"
          >
            <option value="todas">Todas las zonas</option>
            {zonas.map(zona => (
              <option key={zona} value={zona}>{zona.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="filter-select"
          >
            <option value="todas">Todas</option>
            <option value="activas">Activas</option>
            <option value="inactivas">Inactivas</option>
          </select>
        </div>

        {showForm && (
          <div className="admin-form-modal">
            <div className="admin-form-content">
              <h2>{editingParroquia ? 'Editar Parroquia' : 'Nueva Parroquia'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre Canónico</label>
                    <input
                      type="text"
                      name="nombre_canonico"
                      value={formData.nombre_canonico}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
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
                    <label>Párroco</label>
                    <input
                      type="text"
                      name="parroco"
                      value={formData.parroco}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vicario</label>
                    <input
                      type="text"
                      name="vicario"
                      value={formData.vicario}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Latitud</label>
                    <input
                      type="number"
                      step="any"
                      name="coordenadas_lat"
                      value={formData.coordenadas_lat}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitud</label>
                    <input
                      type="number"
                      step="any"
                      name="coordenadas_lng"
                      value={formData.coordenadas_lng}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Fundación</label>
                    <input
                      type="date"
                      name="fecha_fundacion"
                      value={formData.fecha_fundacion}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Patrono</label>
                    <input
                      type="text"
                      name="patrono"
                      value={formData.patrono}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Zona Pastoral</label>
                    <select
                      name="zona_pastoral"
                      value={formData.zona_pastoral}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar zona</option>
                      {zonas.map(zona => (
                        <option key={zona} value={zona}>{zona.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Orden</label>
                    <input
                      type="number"
                      name="orden"
                      value={formData.orden}
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
                        name="activa"
                        checked={formData.activa}
                        onChange={handleChange}
                      />
                      Activa
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
                    {editingParroquia ? 'Actualizar' : 'Crear'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showHorariosForm && (
          <div className="admin-form-modal">
            <div className="admin-form-content">
              <h2>
                {editingHorario ? 'Editar Horario' : 'Nuevo Horario'} - {parroquiaSeleccionada?.nombre}
              </h2>
              <form onSubmit={handleHorarioSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Día de la Semana *</label>
                    <select
                      name="dia_semana"
                      value={horarioFormData.dia_semana}
                      onChange={handleHorarioChange}
                      required
                    >
                      <option value="">Seleccionar día</option>
                      {diasSemana.map(dia => (
                        <option key={dia} value={dia}>{dia}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Hora *</label>
                    <input
                      type="time"
                      name="hora"
                      value={horarioFormData.hora}
                      onChange={handleHorarioChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tipo de Misa</label>
                    <input
                      type="text"
                      name="tipo_misa"
                      value={horarioFormData.tipo_misa}
                      onChange={handleHorarioChange}
                      placeholder="Ej: Misa dominical, Misa de sanación..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Idioma</label>
                    <select
                      name="idioma"
                      value={horarioFormData.idioma}
                      onChange={handleHorarioChange}
                    >
                      <option value="español">Español</option>
                      <option value="quichua">Quichua</option>
                      <option value="inglés">Inglés</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Notas</label>
                    <textarea
                      name="notas"
                      value={horarioFormData.notas}
                      onChange={handleHorarioChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="activo"
                        checked={horarioFormData.activo}
                        onChange={handleHorarioChange}
                      />
                      Activo
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingHorario ? 'Actualizar' : 'Crear'}
                  </button>
                  <button type="button" onClick={resetHorarioForm} className="btn btn-secondary">
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
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Párroco</th>
                <th>Zona</th>
                <th>Estado</th>
                <th>Horarios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredParroquias.map(parroquia => (
                <tr key={parroquia.id}>
                  <td>
                    <strong>{parroquia.nombre}</strong>
                    {parroquia.destacada && <span className="badge badge-primary">Destacada</span>}
                  </td>
                  <td>{parroquia.direccion || '-'}</td>
                  <td>{parroquia.parroco || '-'}</td>
                  <td>{parroquia.zona_pastoral || '-'}</td>
                  <td>
                    <span className={`badge ${parroquia.activa ? 'badge-success' : 'badge-danger'}`}>
                      {parroquia.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    {parroquia.horarios && parroquia.horarios.length > 0 ? (
                      <div className="horarios-list">
                        {parroquia.horarios.slice(0, 2).map(horario => (
                          <div key={horario.id} className="horario-item">
                            {horario.dia_semana} {horario.hora}
                          </div>
                        ))}
                        {parroquia.horarios.length > 2 && (
                          <span className="more-horarios">+{parroquia.horarios.length - 2} más</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">Sin horarios</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditParroquia(parroquia)}
                        className="btn btn-sm btn-primary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleNewHorario(parroquia)}
                        className="btn btn-sm btn-info"
                      >
                        Horarios
                      </button>
                      <button
                        onClick={() => handleDeleteParroquia(parroquia.id)}
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

export default AdminParroquias;
















