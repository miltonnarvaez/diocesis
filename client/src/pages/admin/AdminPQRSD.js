import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminFilters from '../../components/admin/AdminFilters';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminPQRSD.css';

const AdminPQRSD = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTipo, setFilterTipo] = useState('todas');
  const [filterEstado, setFilterEstado] = useState('todas');
  const [filterGrupoInteres, setFilterGrupoInteres] = useState('todas');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    estado: 'pendiente',
    respuesta: ''
  });

  const queryClient = useQueryClient();

  const tipos = [
    { value: 'todas', label: 'Todos los Tipos' },
    { value: 'peticion', label: 'Petición' },
    { value: 'queja', label: 'Queja' },
    { value: 'reclamo', label: 'Reclamo' },
    { value: 'sugerencia', label: 'Sugerencia' },
    { value: 'denuncia', label: 'Denuncia' }
  ];

  const estados = [
    { value: 'todas', label: 'Todos los Estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'resuelto', label: 'Resuelto' },
    { value: 'cerrado', label: 'Cerrado' }
  ];

  const gruposInteres = [
    { value: 'todas', label: 'Todos los Grupos' },
    { value: 'general', label: 'General' },
    { value: 'dupla_naranja', label: 'Dupla Naranja' },
    { value: 'adultos_mayores', label: 'Adultos Mayores' },
    { value: 'jovenes', label: 'Jóvenes' },
    { value: 'personas_discapacidad', label: 'Personas con Discapacidad' },
    { value: 'comunidades_etnicas', label: 'Comunidades Étnicas' },
    { value: 'empresarios', label: 'Empresarios' }
  ];

  // Obtener todas las solicitudes
  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['pqrsd', filterTipo, filterEstado, filterGrupoInteres, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterTipo !== 'todas') params.append('tipo', filterTipo);
      if (filterEstado !== 'todas') params.append('estado', filterEstado);
      if (filterGrupoInteres !== 'todas') params.append('grupo_interes', filterGrupoInteres);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api.get(`/pqrsd?${params.toString()}`);
      return response.data;
    }
  });

  // Obtener estadísticas
  const { data: estadisticas } = useQuery({
    queryKey: ['pqrsd-estadisticas'],
    queryFn: async () => {
      const response = await api.get('/pqrsd/admin/estadisticas');
      return response.data;
    }
  });

  // Obtener detalles de una solicitud
  const { data: solicitudDetalle } = useQuery({
    queryKey: ['pqrsd-detalle', selectedSolicitud],
    queryFn: async () => {
      if (!selectedSolicitud) return null;
      const response = await api.get(`/pqrsd/${selectedSolicitud}`);
      return response.data;
    },
    enabled: !!selectedSolicitud
  });

  // Actualizar solicitud
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/pqrsd/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pqrsd']);
      queryClient.invalidateQueries(['pqrsd-detalle']);
      queryClient.invalidateQueries(['pqrsd-estadisticas']);
      setShowForm(false);
      setFormData({ estado: 'pendiente', respuesta: '' });
    }
  });

  const handleViewDetails = (id) => {
    setSelectedSolicitud(id);
    setShowForm(false);
  };

  const handleEdit = (solicitud) => {
    setSelectedSolicitud(solicitud.id);
    setFormData({
      estado: solicitud.estado,
      respuesta: solicitud.respuesta || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSolicitud) {
      updateMutation.mutate({
        id: selectedSolicitud,
        data: formData
      });
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: '#856404',
      en_proceso: '#155724',
      resuelto: '#155724',
      cerrado: '#6c757d'
    };
    return colores[estado] || '#6c757d';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      resuelto: 'Resuelto',
      cerrado: 'Cerrado'
    };
    return labels[estado] || estado;
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      peticion: 'Petición',
      queja: 'Queja',
      reclamo: 'Reclamo',
      sugerencia: 'Sugerencia',
      denuncia: 'Denuncia'
    };
    return labels[tipo] || tipo;
  };

  const filteredSolicitudes = solicitudes.filter(s => {
    if (filterTipo !== 'todas' && s.tipo !== filterTipo) return false;
    if (filterEstado !== 'todas' && s.estado !== filterEstado) return false;
    if (filterGrupoInteres !== 'todas' && s.grupo_interes !== filterGrupoInteres) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        s.nombre.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.numero_radicado.toLowerCase().includes(query) ||
        s.asunto.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="admin-pqrsd">
      <AdminNavbar title="Gestión de PQRSD" />
      <div className="admin-content-wrapper">
        {/* Estadísticas */}
        {estadisticas && (
          <div className="pqrsd-stats">
            <div className="stat-card">
              <h3>Total</h3>
              <p className="stat-number">{estadisticas.total}</p>
            </div>
            <div className="stat-card pending">
              <h3>Pendientes</h3>
              <p className="stat-number">{estadisticas.pendientes}</p>
            </div>
            {estadisticas.por_estado?.map(stat => (
              <div key={stat.estado} className="stat-card">
                <h3>{getEstadoLabel(stat.estado)}</h3>
                <p className="stat-number">{stat.cantidad}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        <AdminFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={[
            {
              label: 'Tipo',
              value: filterTipo,
              onChange: setFilterTipo,
              options: tipos
            },
            {
              label: 'Estado',
              value: filterEstado,
              onChange: setFilterEstado,
              options: estados
            },
            {
              label: 'Grupo de Interés',
              value: filterGrupoInteres,
              onChange: setFilterGrupoInteres,
              options: gruposInteres
            }
          ]}
        />

        <div className="admin-grid">
          {/* Lista de solicitudes */}
          <div className="solicitudes-list">
            <h2>Solicitudes ({filteredSolicitudes.length})</h2>
            
            {isLoading ? (
              <p>Cargando...</p>
            ) : filteredSolicitudes.length === 0 ? (
              <p>No hay solicitudes que coincidan con los filtros.</p>
            ) : (
              <div className="solicitudes-grid">
                {filteredSolicitudes.map(solicitud => (
                  <div 
                    key={solicitud.id} 
                    className={`solicitud-card ${selectedSolicitud === solicitud.id ? 'selected' : ''}`}
                    onClick={() => handleViewDetails(solicitud.id)}
                  >
                    <div className="solicitud-header">
                      <span className="solicitud-numero">{solicitud.numero_radicado}</span>
                      <span 
                        className="solicitud-estado"
                        style={{ background: getEstadoColor(solicitud.estado) }}
                      >
                        {getEstadoLabel(solicitud.estado)}
                      </span>
                    </div>
                    <div className="solicitud-body">
                      <p className="solicitud-tipo">{getTipoLabel(solicitud.tipo)}</p>
                      <h3>{solicitud.asunto}</h3>
                      <p className="solicitud-nombre"><strong>{solicitud.nombre}</strong></p>
                      <p className="solicitud-email">{solicitud.email}</p>
                      <p className="solicitud-fecha">
                        {new Date(solicitud.creado_en).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="solicitud-actions">
                      <button 
                        className="btn btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(solicitud);
                        }}
                      >
                        Responder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panel de detalles/edición */}
          <div className="solicitud-detail-panel">
            {selectedSolicitud && solicitudDetalle ? (
              <>
                {showForm ? (
                  <div className="pqrsd-form-panel">
                    <h2>Responder Solicitud</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label>Estado *</label>
                        <select
                          value={formData.estado}
                          onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                          required
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en_proceso">En Proceso</option>
                          <option value="resuelto">Resuelto</option>
                          <option value="cerrado">Cerrado</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Respuesta</label>
                        <textarea
                          value={formData.respuesta}
                          onChange={(e) => setFormData({ ...formData, respuesta: e.target.value })}
                          rows="8"
                          placeholder="Escriba la respuesta a la solicitud..."
                        />
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={updateMutation.isLoading}>
                          {updateMutation.isLoading ? 'Guardando...' : 'Guardar Respuesta'}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowForm(false);
                            setFormData({ estado: 'pendiente', respuesta: '' });
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="pqrsd-detail-panel">
                    <div className="detail-header">
                      <h2>{solicitudDetalle.numero_radicado}</h2>
                      <span 
                        className="detail-estado"
                        style={{ background: getEstadoColor(solicitudDetalle.estado) }}
                      >
                        {getEstadoLabel(solicitudDetalle.estado)}
                      </span>
                    </div>

                    <div className="detail-section">
                      <h3>Información de la Solicitud</h3>
                      <p><strong>Tipo:</strong> {getTipoLabel(solicitudDetalle.tipo)}</p>
                      <p><strong>Nombre:</strong> {solicitudDetalle.nombre}</p>
                      <p><strong>Documento:</strong> {solicitudDetalle.documento}</p>
                      <p><strong>Email:</strong> {solicitudDetalle.email}</p>
                      {solicitudDetalle.telefono && (
                        <p><strong>Teléfono:</strong> {solicitudDetalle.telefono}</p>
                      )}
                      <p><strong>Fecha de creación:</strong> {new Date(solicitudDetalle.creado_en).toLocaleString('es-CO')}</p>
                    </div>

                    <div className="detail-section">
                      <h3>Asunto</h3>
                      <p>{solicitudDetalle.asunto}</p>
                    </div>

                    <div className="detail-section">
                      <h3>Descripción</h3>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{solicitudDetalle.descripcion}</p>
                    </div>

                    {solicitudDetalle.respuesta && (
                      <div className="detail-section respuesta">
                        <h3>Respuesta</h3>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{solicitudDetalle.respuesta}</p>
                        {solicitudDetalle.fecha_respuesta && (
                          <p className="fecha-respuesta">
                            <strong>Fecha de respuesta:</strong> {new Date(solicitudDetalle.fecha_respuesta).toLocaleString('es-CO')}
                          </p>
                        )}
                      </div>
                    )}

                    {solicitudDetalle.historial && solicitudDetalle.historial.length > 0 && (
                      <div className="detail-section">
                        <h3>Historial</h3>
                        <div className="historial-list">
                          {solicitudDetalle.historial.map((item, index) => (
                            <div key={index} className="historial-item">
                              <div className="historial-header">
                                <strong>{getEstadoLabel(item.estado_nuevo)}</strong>
                                <span>{new Date(item.creado_en).toLocaleString('es-CO')}</span>
                              </div>
                              {item.observaciones && (
                                <p>{item.observaciones}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="detail-actions">
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleEdit(solicitudDetalle)}
                      >
                        {solicitudDetalle.respuesta ? 'Editar Respuesta' : 'Responder'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-selection">
                <p>Seleccione una solicitud para ver los detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPQRSD;

