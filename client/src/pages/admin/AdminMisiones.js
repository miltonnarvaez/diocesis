import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminMisiones.css';

const AdminMisiones = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMision, setEditingMision] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    ubicacion: '',
    coordenadas_lat: '',
    coordenadas_lng: '',
    fecha_inicio: '',
    fecha_fin: '',
    objetivos: '',
    estado: 'planificacion',
    publicada: true,
    destacada: false
  });

  const [misionerosInput, setMisionerosInput] = useState('');
  const [actividadesInput, setActividadesInput] = useState('');
  const [misioneros, setMisioneros] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const { data: misiones = [], isLoading } = useQuery({
    queryKey: ['misiones'],
    queryFn: async () => {
      const response = await api.get('/misiones');
      return response.data;
    }
  });

  useEffect(() => {
    if (editingMision) {
      setFormData({
        nombre: editingMision.nombre || '',
        descripcion: editingMision.descripcion || '',
        tipo: editingMision.tipo || '',
        ubicacion: editingMision.ubicacion || '',
        coordenadas_lat: editingMision.coordenadas_lat || '',
        coordenadas_lng: editingMision.coordenadas_lng || '',
        fecha_inicio: editingMision.fecha_inicio ? editingMision.fecha_inicio.split('T')[0] : '',
        fecha_fin: editingMision.fecha_fin ? editingMision.fecha_fin.split('T')[0] : '',
        objetivos: editingMision.objetivos || '',
        estado: editingMision.estado || 'planificacion',
        publicada: editingMision.publicada !== undefined ? editingMision.publicada : true,
        destacada: editingMision.destacada || false
      });
      setMisioneros(Array.isArray(editingMision.misioneros) ? editingMision.misioneros : (typeof editingMision.misioneros === 'string' ? JSON.parse(editingMision.misioneros || '[]') : []));
      setActividades(Array.isArray(editingMision.actividades) ? editingMision.actividades : (typeof editingMision.actividades === 'string' ? JSON.parse(editingMision.actividades || '[]') : []));
      setImagenPreview(editingMision.imagen_url || null);
    }
  }, [editingMision]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'misioneros' || key === 'actividades') {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      const response = await api.post('/misiones', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['misiones']);
      resetForm();
      alert('Misión creada exitosamente');
    },
    onError: (error) => {
      alert('Error al crear misión: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'misioneros' || key === 'actividades') {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      const response = await api.put(`/misiones/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['misiones']);
      resetForm();
      alert('Misión actualizada exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar misión: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/misiones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['misiones']);
      alert('Misión eliminada exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar misión: ' + (error.response?.data?.error || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: '',
      ubicacion: '',
      coordenadas_lat: '',
      coordenadas_lng: '',
      fecha_inicio: '',
      fecha_fin: '',
      objetivos: '',
      estado: 'planificacion',
      publicada: true,
      destacada: false
    });
    setMisioneros([]);
    setActividades([]);
    setMisionerosInput('');
    setActividadesInput('');
    setImagenFile(null);
    setImagenPreview(null);
    setEditingMision(null);
    setShowForm(false);
  };

  const handleNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (mision) => {
    setEditingMision(mision);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta misión?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert('Por favor completa el nombre de la misión');
      return;
    }

    const dataToSubmit = {
      ...formData,
      misioneros,
      actividades
    };

    if (editingMision) {
      updateMutation.mutate({ id: editingMision.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddMisionero = () => {
    if (misionerosInput.trim()) {
      setMisioneros([...misioneros, misionerosInput.trim()]);
      setMisionerosInput('');
    }
  };

  const handleRemoveMisionero = (index) => {
    setMisioneros(misioneros.filter((_, i) => i !== index));
  };

  const handleAddActividad = () => {
    if (actividadesInput.trim()) {
      setActividades([...actividades, actividadesInput.trim()]);
      setActividadesInput('');
    }
  };

  const handleRemoveActividad = (index) => {
    setActividades(actividades.filter((_, i) => i !== index));
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

  const estados = ['planificacion', 'en_ejecucion', 'finalizada', 'cancelada'];
  const tipos = ['local', 'nacional', 'internacional'];

  const filteredMisiones = misiones.filter(mision => {
    const matchesSearch = mision.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mision.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || mision.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  if (isLoading) {
    return (
      <div className="admin-misiones">
        <AdminNavbar />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando misiones...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-misiones">
      <AdminNavbar />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>Gestión de Misiones</h1>
          <button onClick={handleNew} className="btn btn-primary">
            + Nueva Misión
          </button>
        </div>

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Buscar misiones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado} value={estado}>{estado.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="admin-form-modal">
            <div className="admin-form-content">
              <h2>{editingMision ? 'Editar Misión' : 'Nueva Misión'}</h2>
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
                    <label>Ubicación</label>
                    <input
                      type="text"
                      name="ubicacion"
                      value={formData.ubicacion}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Latitud</label>
                    <input
                      type="text"
                      name="coordenadas_lat"
                      value={formData.coordenadas_lat}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitud</label>
                    <input
                      type="text"
                      name="coordenadas_lng"
                      value={formData.coordenadas_lng}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                    >
                      {estados.map(estado => (
                        <option key={estado} value={estado}>{estado.replace('_', ' ').toUpperCase()}</option>
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
                    <label>Objetivos</label>
                    <textarea
                      name="objetivos"
                      value={formData.objetivos}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Misioneros</label>
                    <div className="list-input-group">
                      <input
                        type="text"
                        value={misionerosInput}
                        onChange={(e) => setMisionerosInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMisionero();
                          }
                        }}
                        placeholder="Agregar misionero..."
                      />
                      <button type="button" onClick={handleAddMisionero} className="btn btn-sm btn-primary">
                        Agregar
                      </button>
                    </div>
                    <div className="list-items">
                      {misioneros.map((item, index) => (
                        <div key={index} className="list-item">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMisionero(index)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Actividades</label>
                    <div className="list-input-group">
                      <input
                        type="text"
                        value={actividadesInput}
                        onChange={(e) => setActividadesInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddActividad();
                          }
                        }}
                        placeholder="Agregar actividad..."
                      />
                      <button type="button" onClick={handleAddActividad} className="btn btn-sm btn-primary">
                        Agregar
                      </button>
                    </div>
                    <div className="list-items">
                      {actividades.map((item, index) => (
                        <div key={index} className="list-item">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveActividad(index)}
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
                    {editingMision ? 'Actualizar' : 'Crear'}
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
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Fecha Inicio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMisiones.map(mision => (
                <tr key={mision.id}>
                  <td>
                    <strong>{mision.nombre}</strong>
                    {mision.destacada && <span className="badge badge-primary">Destacada</span>}
                  </td>
                  <td>{mision.tipo || '-'}</td>
                  <td>{mision.ubicacion || '-'}</td>
                  <td>
                    <span className={`badge badge-${mision.estado}`}>
                      {mision.estado?.replace('_', ' ').toUpperCase() || '-'}
                    </span>
                  </td>
                  <td>{mision.fecha_inicio ? new Date(mision.fecha_inicio).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(mision)}
                        className="btn btn-sm btn-primary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(mision.id)}
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

export default AdminMisiones;
















