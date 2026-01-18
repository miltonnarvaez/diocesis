import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminPastoral.css';

const AdminPastoral = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingComision, setEditingComision] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('todas');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    mision: '',
    objetivos: [],
    coordinador: '',
    contacto: '',
    email: '',
    telefono: '',
    activa: true,
    destacada: false,
    orden: 0
  });

  const [objetivoInput, setObjetivoInput] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const { data: comisiones = [], isLoading } = useQuery({
    queryKey: ['pastoral-comisiones'],
    queryFn: async () => {
      const response = await api.get('/pastoral/comisiones');
      return response.data;
    }
  });

  useEffect(() => {
    if (editingComision) {
      setFormData({
        nombre: editingComision.nombre || '',
        descripcion: editingComision.descripcion || '',
        mision: editingComision.mision || '',
        objetivos: Array.isArray(editingComision.objetivos) 
          ? editingComision.objetivos 
          : (typeof editingComision.objetivos === 'string' 
              ? JSON.parse(editingComision.objetivos || '[]') 
              : []),
        coordinador: editingComision.coordinador || '',
        contacto: editingComision.contacto || '',
        email: editingComision.email || '',
        telefono: editingComision.telefono || '',
        activa: editingComision.activa !== undefined ? editingComision.activa : true,
        destacada: editingComision.destacada || false,
        orden: editingComision.orden || 0
      });
      setImagenPreview(editingComision.imagen_url || null);
    }
  }, [editingComision]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'objetivos') {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      const response = await api.post('/pastoral/comisiones', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pastoral-comisiones']);
      resetForm();
      alert('Comisión creada exitosamente');
    },
    onError: (error) => {
      alert('Error al crear comisión: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const formDataToSend = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'objetivos') {
          formDataToSend.append(key, JSON.stringify(data[key]));
        } else if (data[key] !== null && data[key] !== undefined) {
          formDataToSend.append(key, data[key]);
        }
      });
      if (imagenFile) {
        formDataToSend.append('imagen', imagenFile);
      }
      const response = await api.put(`/pastoral/comisiones/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pastoral-comisiones']);
      resetForm();
      alert('Comisión actualizada exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar comisión: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/pastoral/comisiones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pastoral-comisiones']);
      alert('Comisión eliminada exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar comisión: ' + (error.response?.data?.error || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      mision: '',
      objetivos: [],
      coordinador: '',
      contacto: '',
      email: '',
      telefono: '',
      activa: true,
      destacada: false,
      orden: 0
    });
    setObjetivoInput('');
    setImagenFile(null);
    setImagenPreview(null);
    setEditingComision(null);
    setShowForm(false);
  };

  const handleNewComision = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditComision = (comision) => {
    setEditingComision(comision);
    setShowForm(true);
  };

  const handleDeleteComision = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta comisión?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert('Por favor completa el nombre de la comisión');
      return;
    }

    if (editingComision) {
      updateMutation.mutate({ id: editingComision.id, data: formData });
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

  const handleAddObjetivo = () => {
    if (objetivoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        objetivos: [...prev.objetivos, objetivoInput.trim()]
      }));
      setObjetivoInput('');
    }
  };

  const handleRemoveObjetivo = (index) => {
    setFormData(prev => ({
      ...prev,
      objetivos: prev.objetivos.filter((_, i) => i !== index)
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

  const filteredComisiones = comisiones.filter(comision => {
    const matchesSearch = comision.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comision.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEstado = filterEstado === 'todas' || 
                         (filterEstado === 'activas' && comision.activa) ||
                         (filterEstado === 'inactivas' && !comision.activa);
    return matchesSearch && matchesEstado;
  });

  if (isLoading) {
    return (
      <div className="admin-pastoral">
        <AdminNavbar />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando comisiones...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-pastoral">
      <AdminNavbar />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>Gestión de Pastoral</h1>
          <button onClick={handleNewComision} className="btn btn-primary">
            + Nueva Comisión
          </button>
        </div>

        <div className="admin-filters">
          <input
            type="text"
            placeholder="Buscar comisiones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
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
              <h2>{editingComision ? 'Editar Comisión' : 'Nueva Comisión'}</h2>
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
                  <div className="form-group full-width">
                    <label>Misión</label>
                    <textarea
                      name="mision"
                      value={formData.mision}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Coordinador</label>
                    <input
                      type="text"
                      name="coordinador"
                      value={formData.coordinador}
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
                    <label>Objetivos</label>
                    <div className="list-input-group">
                      <input
                        type="text"
                        value={objetivoInput}
                        onChange={(e) => setObjetivoInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddObjetivo();
                          }
                        }}
                        placeholder="Agregar objetivo..."
                      />
                      <button type="button" onClick={handleAddObjetivo} className="btn btn-sm btn-primary">
                        Agregar
                      </button>
                    </div>
                    <div className="list-items">
                      {formData.objetivos.map((obj, index) => (
                        <div key={index} className="list-item">
                          <span>{obj}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveObjetivo(index)}
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
                    {editingComision ? 'Actualizar' : 'Crear'}
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
                <th>Coordinador</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredComisiones.map(comision => (
                <tr key={comision.id}>
                  <td>
                    <strong>{comision.nombre}</strong>
                    {comision.destacada && <span className="badge badge-primary">Destacada</span>}
                  </td>
                  <td>{comision.coordinador || '-'}</td>
                  <td>
                    {comision.telefono && <div>{comision.telefono}</div>}
                    {comision.email && <div className="text-muted">{comision.email}</div>}
                  </td>
                  <td>
                    <span className={`badge ${comision.activa ? 'badge-success' : 'badge-danger'}`}>
                      {comision.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditComision(comision)}
                        className="btn btn-sm btn-primary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteComision(comision.id)}
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

export default AdminPastoral;
















