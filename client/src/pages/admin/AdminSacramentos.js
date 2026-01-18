import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminSacramentos.css';

const AdminSacramentos = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingSacramento, setEditingSacramento] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [showSolicitudes, setShowSolicitudes] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    requisitos: [],
    documentos_necesarios: [],
    costo: 0,
    tiempo_preparacion: '',
    proceso: '',
    contacto_responsable: '',
    email_contacto: '',
    telefono_contacto: '',
    horario_atencion: '',
    activo: true,
    destacado: false,
    orden: 0
  });

  const [requisitoInput, setRequisitoInput] = useState('');
  const [documentoInput, setDocumentoInput] = useState('');

  const { data: sacramentos = [], isLoading } = useQuery({
    queryKey: ['sacramentos'],
    queryFn: async () => {
      const response = await api.get('/sacramentos');
      return response.data;
    }
  });

  const { data: solicitudes = [] } = useQuery({
    queryKey: ['solicitudes-sacramentos'],
    queryFn: async () => {
      const response = await api.get('/sacramentos/admin/solicitudes');
      return response.data;
    },
    enabled: showSolicitudes
  });

  useEffect(() => {
    if (editingSacramento) {
      setFormData({
        nombre: editingSacramento.nombre || '',
        descripcion: editingSacramento.descripcion || '',
        requisitos: Array.isArray(editingSacramento.requisitos) 
          ? editingSacramento.requisitos 
          : (typeof editingSacramento.requisitos === 'string' 
              ? JSON.parse(editingSacramento.requisitos || '[]') 
              : []),
        documentos_necesarios: Array.isArray(editingSacramento.documentos_necesarios)
          ? editingSacramento.documentos_necesarios
          : (typeof editingSacramento.documentos_necesarios === 'string'
              ? JSON.parse(editingSacramento.documentos_necesarios || '[]')
              : []),
        costo: editingSacramento.costo || 0,
        tiempo_preparacion: editingSacramento.tiempo_preparacion || '',
        proceso: editingSacramento.proceso || '',
        contacto_responsable: editingSacramento.contacto_responsable || '',
        email_contacto: editingSacramento.email_contacto || '',
        telefono_contacto: editingSacramento.telefono_contacto || '',
        horario_atencion: editingSacramento.horario_atencion || '',
        activo: editingSacramento.activo !== undefined ? editingSacramento.activo : true,
        destacado: editingSacramento.destacado || false,
        orden: editingSacramento.orden || 0
      });
    }
  }, [editingSacramento]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/sacramentos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sacramentos']);
      resetForm();
      alert('Sacramento creado exitosamente');
    },
    onError: (error) => {
      alert('Error al crear sacramento: ' + (error.response?.data?.error || error.message));
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/sacramentos/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sacramentos']);
      resetForm();
      alert('Sacramento actualizado exitosamente');
    },
    onError: (error) => {
      alert('Error al actualizar sacramento: ' + (error.response?.data?.error || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/sacramentos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sacramentos']);
      alert('Sacramento eliminado exitosamente');
    },
    onError: (error) => {
      alert('Error al eliminar sacramento: ' + (error.response?.data?.error || error.message));
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      requisitos: [],
      documentos_necesarios: [],
      costo: 0,
      tiempo_preparacion: '',
      proceso: '',
      contacto_responsable: '',
      email_contacto: '',
      telefono_contacto: '',
      horario_atencion: '',
      activo: true,
      destacado: false,
      orden: 0
    });
    setRequisitoInput('');
    setDocumentoInput('');
    setEditingSacramento(null);
    setShowForm(false);
  };

  const handleNewSacramento = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditSacramento = (sacramento) => {
    setEditingSacramento(sacramento);
    setShowForm(true);
  };

  const handleDeleteSacramento = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este sacramento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert('Por favor completa el nombre del sacramento');
      return;
    }

    if (editingSacramento) {
      updateMutation.mutate({ id: editingSacramento.id, data: formData });
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

  const handleAddRequisito = () => {
    if (requisitoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requisitos: [...prev.requisitos, requisitoInput.trim()]
      }));
      setRequisitoInput('');
    }
  };

  const handleRemoveRequisito = (index) => {
    setFormData(prev => ({
      ...prev,
      requisitos: prev.requisitos.filter((_, i) => i !== index)
    }));
  };

  const handleAddDocumento = () => {
    if (documentoInput.trim()) {
      setFormData(prev => ({
        ...prev,
        documentos_necesarios: [...prev.documentos_necesarios, documentoInput.trim()]
      }));
      setDocumentoInput('');
    }
  };

  const handleRemoveDocumento = (index) => {
    setFormData(prev => ({
      ...prev,
      documentos_necesarios: prev.documentos_necesarios.filter((_, i) => i !== index)
    }));
  };

  const filteredSacramentos = sacramentos.filter(sacramento => {
    const matchesSearch = sacramento.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sacramento.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEstado = filterEstado === 'todas' || 
                         (filterEstado === 'activos' && sacramento.activo) ||
                         (filterEstado === 'inactivos' && !sacramento.activo);
    return matchesSearch && matchesEstado;
  });

  if (isLoading) {
    return (
      <div className="admin-sacramentos">
        <AdminNavbar />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando sacramentos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-sacramentos">
      <AdminNavbar />
      <div className="admin-content-wrapper">
        <div className="admin-header">
          <h1>Gestión de Sacramentos</h1>
          <div className="header-actions">
            <button onClick={() => setShowSolicitudes(!showSolicitudes)} className="btn btn-info">
              {showSolicitudes ? 'Ocultar' : 'Ver'} Solicitudes
            </button>
            <button onClick={handleNewSacramento} className="btn btn-primary">
              + Nuevo Sacramento
            </button>
          </div>
        </div>

        {showSolicitudes && (
          <div className="solicitudes-section">
            <h2>Solicitudes de Sacramentos</h2>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sacramento</th>
                    <th>Solicitante</th>
                    <th>Documento</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Fecha Solicitud</th>
                    <th>Fecha Evento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map(solicitud => (
                    <tr key={solicitud.id}>
                      <td>{solicitud.sacramento_nombre || '-'}</td>
                      <td>{solicitud.nombre_solicitante}</td>
                      <td>{solicitud.documento}</td>
                      <td>{solicitud.email}</td>
                      <td>{solicitud.telefono || '-'}</td>
                      <td>{solicitud.fecha_solicitud ? new Date(solicitud.fecha_solicitud).toLocaleDateString() : '-'}</td>
                      <td>{solicitud.fecha_evento ? new Date(solicitud.fecha_evento).toLocaleDateString() : '-'}</td>
                      <td>
                        <span className={`badge badge-${solicitud.estado === 'pendiente' ? 'warning' : solicitud.estado === 'aprobada' ? 'success' : 'danger'}`}>
                          {solicitud.estado || 'pendiente'}
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
            placeholder="Buscar sacramentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="filter-select"
          >
            <option value="todas">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>

        {showForm && (
          <div className="admin-form-modal">
            <div className="admin-form-content">
              <h2>{editingSacramento ? 'Editar Sacramento' : 'Nuevo Sacramento'}</h2>
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
                    <label>Tiempo de Preparación</label>
                    <input
                      type="text"
                      name="tiempo_preparacion"
                      value={formData.tiempo_preparacion}
                      onChange={handleChange}
                      placeholder="Ej: 3 meses, 6 semanas..."
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
                    <label>Proceso</label>
                    <textarea
                      name="proceso"
                      value={formData.proceso}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Describe el proceso paso a paso..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Contacto Responsable</label>
                    <input
                      type="text"
                      name="contacto_responsable"
                      value={formData.contacto_responsable}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email de Contacto</label>
                    <input
                      type="email"
                      name="email_contacto"
                      value={formData.email_contacto}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono de Contacto</label>
                    <input
                      type="tel"
                      name="telefono_contacto"
                      value={formData.telefono_contacto}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Horario de Atención</label>
                    <input
                      type="text"
                      name="horario_atencion"
                      value={formData.horario_atencion}
                      onChange={handleChange}
                      placeholder="Ej: Lunes a Viernes 8:00 AM - 5:00 PM"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Requisitos</label>
                    <div className="list-input-group">
                      <input
                        type="text"
                        value={requisitoInput}
                        onChange={(e) => setRequisitoInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRequisito();
                          }
                        }}
                        placeholder="Agregar requisito..."
                      />
                      <button type="button" onClick={handleAddRequisito} className="btn btn-sm btn-primary">
                        Agregar
                      </button>
                    </div>
                    <div className="list-items">
                      {formData.requisitos.map((req, index) => (
                        <div key={index} className="list-item">
                          <span>{req}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequisito(index)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Documentos Necesarios</label>
                    <div className="list-input-group">
                      <input
                        type="text"
                        value={documentoInput}
                        onChange={(e) => setDocumentoInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddDocumento();
                          }
                        }}
                        placeholder="Agregar documento..."
                      />
                      <button type="button" onClick={handleAddDocumento} className="btn btn-sm btn-primary">
                        Agregar
                      </button>
                    </div>
                    <div className="list-items">
                      {formData.documentos_necesarios.map((doc, index) => (
                        <div key={index} className="list-item">
                          <span>{doc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDocumento(index)}
                            className="btn-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleChange}
                      />
                      Activo
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="destacado"
                        checked={formData.destacado}
                        onChange={handleChange}
                      />
                      Destacado
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingSacramento ? 'Actualizar' : 'Crear'}
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
                <th>Costo</th>
                <th>Tiempo Preparación</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSacramentos.map(sacramento => (
                <tr key={sacramento.id}>
                  <td>
                    <strong>{sacramento.nombre}</strong>
                    {sacramento.destacado && <span className="badge badge-primary">Destacado</span>}
                  </td>
                  <td>${sacramento.costo || 0}</td>
                  <td>{sacramento.tiempo_preparacion || '-'}</td>
                  <td>
                    {sacramento.contacto_responsable && (
                      <div>
                        <div>{sacramento.contacto_responsable}</div>
                        {sacramento.telefono_contacto && (
                          <div className="text-muted">{sacramento.telefono_contacto}</div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${sacramento.activo ? 'badge-success' : 'badge-danger'}`}>
                      {sacramento.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditSacramento(sacramento)}
                        className="btn btn-sm btn-primary"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSacramento(sacramento.id)}
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

export default AdminSacramentos;
















