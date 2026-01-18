import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminCaridad.css';

const AdminCaridad = () => {
  const [showForm, setShowForm] = useState(false);
  const [showVoluntarios, setShowVoluntarios] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('proyectos'); // 'proyectos' o 'campañas'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    objetivo: '',
    beneficiarios: '',
    zona_impacto: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'planificacion',
    presupuesto: '',
    fondos_recaudados: 0,
    responsable: '',
    contacto: '',
    email: '',
    telefono: '',
    publicada: true,
    destacada: false
  });

  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const { data: proyectos = [], isLoading: loadingProyectos } = useQuery({
    queryKey: ['caridad-proyectos'],
    queryFn: async () => {
      const response = await api.get('/caridad/proyectos');
      return response.data;
    }
  });

  const { data: campanas = [], isLoading: loadingCampanas } = useQuery({
    queryKey: ['caridad-campanas'],
    queryFn: async () => {
      const response = await api.get('/caridad/campañas');
      return response.data;
    }
  });

  const { data: voluntarios = [] } = useQuery({
    queryKey: ['caridad-voluntarios'],
    queryFn: async () => {
      const response = await api.get('/caridad/admin/voluntarios');
      return response.data;
    },
    enabled: showVoluntarios
  });

  useEffect(() => {
    if (editingItem) {
      if (tipoSeleccionado === 'proyectos') {
        setFormData({
          titulo: editingItem.titulo || '',
          descripcion: editingItem.descripcion || '',
          objetivo: editingItem.objetivo || '',
          beneficiarios: editingItem.beneficiarios || '',
          zona_impacto: editingItem.zona_impacto || '',
          fecha_inicio: editingItem.fecha_inicio ? editingItem.fecha_inicio.split('T')[0] : '',
          fecha_fin: editingItem.fecha_fin ? editingItem.fecha_fin.split('T')[0] : '',
          estado: editingItem.estado || 'planificacion',
          presupuesto: editingItem.presupuesto || '',
          fondos_recaudados: editingItem.fondos_recaudados || 0,
          responsable: editingItem.responsable || '',
          contacto: editingItem.contacto || '',
          email: editingItem.email || '',
          telefono: editingItem.telefono || '',
          publicada: editingItem.publicada !== undefined ? editingItem.publicada : true,
          destacada: editingItem.destacada || false
        });
      } else {
        setFormData({
          titulo: editingItem.titulo || '',
          descripcion: editingItem.descripcion || '',
          objetivo: editingItem.objetivo || '',
          beneficiarios: '',
          zona_impacto: '',
          fecha_inicio: editingItem.fecha_inicio ? editingItem.fecha_inicio.split('T')[0] : '',
          fecha_fin: editingItem.fecha_fin ? editingItem.fecha_fin.split('T')[0] : '',
          estado: editingItem.activa ? 'activa' : 'inactiva',
          presupuesto: '',
          fondos_recaudados: 0,
          responsable: '',
          contacto: '',
          email: '',
          telefono: '',
          publicada: editingItem.publicada !== undefined ? editingItem.publicada : true,
          destacada: editingItem.destacada || false
        });
      }
      setImagenPreview(editingItem.imagen_url || null);
    }
  }, [editingItem, tipoSeleccionado]);

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
      const endpoint = tipoSeleccionado === 'proyectos' ? '/caridad/admin/proyectos' : '/caridad/admin/campañas';
      const response = await api.post(endpoint, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['caridad-proyectos']);
      queryClient.invalidateQueries(['caridad-campanas']);
      resetForm();
      alert(`${tipoSeleccionado === 'proyectos' ? 'Proyecto' : 'Campaña'} creado exitosamente`);
    },
    onError: (error) => {
      alert(`Error al crear ${tipoSeleccionado === 'proyectos' ? 'proyecto' : 'campaña'}: ` + (error.response?.data?.error || error.message));
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
      const endpoint = tipoSeleccionado === 'proyectos' ? `/caridad/admin/proyectos/${id}` : `/caridad/admin/campañas/${id}`;
      const response = await api.put(endpoint, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['caridad-proyectos']);
      queryClient.invalidateQueries(['caridad-campanas']);
      resetForm();
      alert(`${tipoSeleccionado === 'proyectos' ? 'Proyecto' : 'Campaña'} actualizado exitosamente`);
    },
    onError: (error) => {
      alert(`Error al actualizar ${tipoSeleccionado === 'proyectos' ? 'proyecto' : 'campaña'}: ` + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const endpoint = tipoSeleccionado === 'proyectos' ? `/caridad/admin/proyectos/${id}` : `/caridad/admin/campañas/${id}`;
      await api.delete(endpoint);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['caridad-proyectos']);
      queryClient.invalidateQueries(['caridad-campanas']);
      alert(`${tipoSeleccionado === 'proyectos' ? 'Proyecto' : 'Campaña'} eliminado exitosamente`);
    },
    onError: (error) => {
      alert(`Error al eliminar ${tipoSeleccionado === 'proyectos' ? 'proyecto' : 'campaña'}: ` + (error.response?.data?.error || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      objetivo: '',
      beneficiarios: '',
      zona_impacto: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'planificacion',
      presupuesto: '',
      fondos_recaudados: 0,
      responsable: '',
      contacto: '',
      email: '',
      telefono: '',
      publicada: true,
      destacada: false
    });
    setImagenFile(null);
    setImagenPreview(null);
    setEditingItem(null);
    setShowForm(false);
  };

  const handleNew = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm(`¿Estás seguro de eliminar este ${tipoSeleccionado === 'proyectos' ? 'proyecto' : 'campaña'}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      alert(`Por favor completa el título del ${tipoSeleccionado === 'proyectos' ? 'proyecto' : 'campaña'}`);
      return;
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
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

  const estados = ['planificacion', 'en_ejecucion', 'finalizado', 'cancelado'];
  const items = tipoSeleccionado === 'proyectos' ? proyectos : campanas;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.titulo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || 
                         (tipoSeleccionado === 'proyectos' && item.estado === filterEstado) ||
                         (tipoSeleccionado === 'campañas' && filterEstado === 'activas' && item.activa) ||
                         (tipoSeleccionado === 'campañas' && filterEstado === 'inactivas' && !item.activa);
    return matchesSearch && matchesEstado;
  });

  const isLoading = tipoSeleccionado === 'proyectos' ? loadingProyectos : loadingCampanas;

  if (isLoading) {
    return (
      <div className="admin-caridad">
        <AdminNavbar />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando {tipoSeleccionado}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-caridad">
      <AdminNavbar />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>Gestión de Caridad y Solidaridad</h1>
          <div className="header-actions">
            <button onClick={() => setShowVoluntarios(!showVoluntarios)} className="btn btn-info">
              {showVoluntarios ? 'Ocultar' : 'Ver'} Voluntarios
            </button>
            <button onClick={handleNew} className="btn btn-primary">
              + Nuevo {tipoSeleccionado === 'proyectos' ? 'Proyecto' : 'Campaña'}
            </button>
          </div>
        </div>

        <div className="tipo-selector">
          <button
            onClick={() => {
              setTipoSeleccionado('proyectos');
              resetForm();
            }}
            className={`btn ${tipoSeleccionado === 'proyectos' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Proyectos
          </button>
          <button
            onClick={() => {
              setTipoSeleccionado('campañas');
              resetForm();
            }}
            className={`btn ${tipoSeleccionado === 'campañas' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Campañas
          </button>
        </div>

        {showVoluntarios && (
          <div className="voluntarios-section">
            <h2>Voluntarios Registrados</h2>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Habilidades</th>
                    <th>Área de Interés</th>
                  </tr>
                </thead>
                <tbody>
                  {voluntarios.map(voluntario => (
                    <tr key={voluntario.id}>
                      <td>{voluntario.nombre_completo}</td>
                      <td>{voluntario.documento}</td>
                      <td>{voluntario.email}</td>
                      <td>{voluntario.telefono || '-'}</td>
                      <td>{voluntario.habilidades || '-'}</td>
                      <td>{voluntario.area_interes || '-'}</td>
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
            placeholder={`Buscar ${tipoSeleccionado}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {tipoSeleccionado === 'proyectos' ? (
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
          ) : (
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todas</option>
              <option value="activas">Activas</option>
              <option value="inactivas">Inactivas</option>
            </select>
          )}
        </div>

        {showForm && (
          <div className="admin-form-modal">
            <div className="admin-form-content">
              <h2>{editingItem ? `Editar ${tipoSeleccionado === 'proyectos' ? 'Proyecto' : 'Campaña'}` : `Nuevo ${tipoSeleccionado === 'proyectos' ? 'Proyecto' : 'Campaña'}`}</h2>
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
                  {tipoSeleccionado === 'proyectos' && (
                    <>
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
                        <label>Presupuesto</label>
                        <input
                          type="number"
                          step="0.01"
                          name="presupuesto"
                          value={formData.presupuesto}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Fondos Recaudados</label>
                        <input
                          type="number"
                          step="0.01"
                          name="fondos_recaudados"
                          value={formData.fondos_recaudados}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Beneficiarios</label>
                        <input
                          type="text"
                          name="beneficiarios"
                          value={formData.beneficiarios}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Zona de Impacto</label>
                        <input
                          type="text"
                          name="zona_impacto"
                          value={formData.zona_impacto}
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
                    </>
                  )}
                  {tipoSeleccionado === 'campañas' && (
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          name="activa"
                          checked={formData.estado === 'activa'}
                          onChange={(e) => setFormData({...formData, estado: e.target.checked ? 'activa' : 'inactiva'})}
                        />
                        Activa
                      </label>
                    </div>
                  )}
                  <div className="form-group full-width">
                    <label>Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      rows="4"
                    />
                  </div>
                  {tipoSeleccionado === 'proyectos' && (
                    <div className="form-group full-width">
                      <label>Objetivo</label>
                      <textarea
                        name="objetivo"
                        value={formData.objetivo}
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>
                  )}
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
                  {tipoSeleccionado === 'proyectos' && (
                    <>
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
                    </>
                  )}
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
                    {editingItem ? 'Actualizar' : 'Crear'}
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
                {tipoSeleccionado === 'proyectos' && <th>Estado</th>}
                {tipoSeleccionado === 'proyectos' && <th>Presupuesto</th>}
                {tipoSeleccionado === 'campañas' && <th>Estado</th>}
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.titulo}</strong>
                    {item.destacada && <span className="badge badge-primary">Destacada</span>}
                  </td>
                  {tipoSeleccionado === 'proyectos' && (
                    <>
                      <td>
                        <span className={`badge badge-${item.estado}`}>
                          {item.estado?.replace('_', ' ').toUpperCase() || '-'}
                        </span>
                      </td>
                      <td>
                        {item.presupuesto ? `$${item.presupuesto}` : '-'}
                        {item.fondos_recaudados > 0 && (
                          <div className="text-muted">Recaudado: ${item.fondos_recaudados}</div>
                        )}
                      </td>
                    </>
                  )}
                  {tipoSeleccionado === 'campañas' && (
                    <td>
                      <span className={`badge ${item.activa ? 'badge-success' : 'badge-danger'}`}>
                        {item.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  )}
                  <td>{item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString() : '-'}</td>
                  <td>{item.fecha_fin ? new Date(item.fecha_fin).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn btn-sm btn-primary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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

export default AdminCaridad;
















