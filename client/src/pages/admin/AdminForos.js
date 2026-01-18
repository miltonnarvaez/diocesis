import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminFilters from '../../components/admin/AdminFilters';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminForos.css';

const AdminForos = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingForo, setEditingForo] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'General',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    activo: true,
    destacado: false,
    permite_comentarios: true,
    requiere_moderacion: true
  });

  const queryClient = useQueryClient();

  const { data: foros = [], isLoading } = useQuery({
    queryKey: ['foros-admin'],
    queryFn: async () => {
      const response = await api.get('/foros/admin/all');
      return response.data;
    }
  });

  const { data: comentariosPendientes = [] } = useQuery({
    queryKey: ['comentarios-pendientes'],
    queryFn: async () => {
      const response = await api.get('/foros/admin/comentarios/pendientes');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/foros/admin', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['foros-admin']);
      setShowForm(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/foros/admin/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['foros-admin']);
      setShowForm(false);
      setEditingForo(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/foros/admin/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['foros-admin']);
    }
  });

  const moderarComentarioMutation = useMutation({
    mutationFn: async ({ id, aprobado, observaciones }) => {
      const response = await api.put(`/foros/admin/comentarios/${id}`, {
        aprobado,
        observaciones_moderacion: observaciones
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comentarios-pendientes']);
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      categoria: 'General',
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: '',
      activo: true,
      destacado: false,
      permite_comentarios: true,
      requiere_moderacion: true
    });
  };

  const handleEdit = (foro) => {
    setEditingForo(foro);
    setFormData({
      titulo: foro.titulo,
      descripcion: foro.descripcion,
      categoria: foro.categoria,
      fecha_inicio: foro.fecha_inicio,
      fecha_fin: foro.fecha_fin || '',
      activo: foro.activo,
      destacado: foro.destacado,
      permite_comentarios: foro.permite_comentarios,
      requiere_moderacion: foro.requiere_moderacion
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingForo) {
      updateMutation.mutate({ id: editingForo.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredForos = foros.filter(f => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        f.titulo.toLowerCase().includes(query) ||
        f.descripcion.toLowerCase().includes(query) ||
        f.categoria.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="admin-foros">
      <AdminNavbar title="Gestión de Foros de Discusión" />
      <div className="admin-content-wrapper">
        <div className="foros-stats">
          <div className="stat-card">
            <h3>Total Foros</h3>
            <p className="stat-number">{foros.length}</p>
          </div>
          <div className="stat-card">
            <h3>Comentarios Pendientes</h3>
            <p className="stat-number">{comentariosPendientes.length}</p>
          </div>
        </div>

        <AdminFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={[]}
        />

        <div className="foros-actions">
          <button onClick={() => {
            setShowForm(true);
            setEditingForo(null);
            resetForm();
          }} className="btn btn-primary">
            + Nuevo Foro
          </button>
        </div>

        {showForm && (
          <div className="foro-form-modal">
            <div className="foro-form-content">
              <h2>{editingForo ? 'Editar Foro' : 'Nuevo Foro'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Título *</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descripción *</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows="5"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Categoría</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    >
                      <option value="General">General</option>
                      <option value="Presupuesto">Presupuesto</option>
                      <option value="Proyectos">Proyectos</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Transparencia">Transparencia</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fecha Inicio *</label>
                    <input
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha Fin</label>
                    <input
                      type="date"
                      value={formData.fecha_fin}
                      onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      />
                      Activo
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.destacado}
                        onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                      />
                      Destacado
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.permite_comentarios}
                        onChange={(e) => setFormData({ ...formData, permite_comentarios: e.target.checked })}
                      />
                      Permite Comentarios
                    </label>
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.requiere_moderacion}
                        onChange={(e) => setFormData({ ...formData, requiere_moderacion: e.target.checked })}
                      />
                      Requiere Moderación
                    </label>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn" disabled={createMutation.isLoading || updateMutation.isLoading}>
                    {createMutation.isLoading || updateMutation.isLoading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingForo(null);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="admin-grid">
          <div className="foros-list">
            <h2>Foros ({filteredForos.length})</h2>
            
            {isLoading ? (
              <p>Cargando...</p>
            ) : filteredForos.length === 0 ? (
              <p>No hay foros.</p>
            ) : (
              <div className="foros-cards">
                {filteredForos.map((foro) => (
                  <div key={foro.id} className="foro-card-admin">
                    <div className="foro-card-header">
                      <div>
                        {foro.destacado && <span className="foro-badge">⭐ Destacado</span>}
                        <h3>{foro.titulo}</h3>
                        <p className="foro-categoria">{foro.categoria}</p>
                      </div>
                      <span className={`foro-estado ${foro.activo ? 'activo' : 'inactivo'}`}>
                        {foro.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="foro-card-body">
                      <p>{foro.descripcion}</p>
                      <div className="foro-stats">
                        <span>💬 {foro.comentarios_aprobados || 0} aprobados</span>
                        <span>⏳ {foro.comentarios_pendientes || 0} pendientes</span>
                        <span>📝 {foro.total_comentarios || 0} total</span>
                      </div>
                      <p className="foro-fecha">
                        {new Date(foro.fecha_inicio).toLocaleDateString('es-CO')}
                        {foro.fecha_fin && ` - ${new Date(foro.fecha_fin).toLocaleDateString('es-CO')}`}
                      </p>
                    </div>
                    <div className="foro-card-actions">
                      <button onClick={() => handleEdit(foro)} className="btn btn-edit">
                        Editar
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('¿Está seguro de eliminar este foro?')) {
                            deleteMutation.mutate(foro.id);
                          }
                        }}
                        className="btn btn-delete"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {comentariosPendientes.length > 0 && (
            <div className="comentarios-pendientes-panel">
              <h2>Comentarios Pendientes ({comentariosPendientes.length})</h2>
              <div className="comentarios-pendientes-list">
                {comentariosPendientes.map((comentario) => (
                  <div key={comentario.id} className="comentario-pendiente-card">
                    <div className="comentario-pendiente-header">
                      <strong>{comentario.usuario_nombre}</strong>
                      <span className="comentario-foro">{comentario.foro_titulo}</span>
                    </div>
                    <p>{comentario.comentario}</p>
                    <div className="comentario-pendiente-actions">
                      <button
                        onClick={() => moderarComentarioMutation.mutate({
                          id: comentario.id,
                          aprobado: true,
                          observaciones: 'Aprobado'
                        })}
                        className="btn btn-approve"
                        disabled={moderarComentarioMutation.isLoading}
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => moderarComentarioMutation.mutate({
                          id: comentario.id,
                          aprobado: false,
                          observaciones: 'Rechazado'
                        })}
                        className="btn btn-reject"
                        disabled={moderarComentarioMutation.isLoading}
                      >
                        ✗ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminForos;














