import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminFilters from '../../components/admin/AdminFilters';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminOpiniones.css';

const AdminOpiniones = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProyecto, setFilterProyecto] = useState('todos');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [selectedOpinion, setSelectedOpinion] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    estado: 'pendiente',
    observaciones_moderacion: ''
  });

  const queryClient = useQueryClient();

  const estados = [
    { value: 'todos', label: 'Todos los Estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'revisada', label: 'Revisada' },
    { value: 'publicada', label: 'Publicada' },
    { value: 'rechazada', label: 'Rechazada' }
  ];

  const { data: opiniones = [], isLoading } = useQuery({
    queryKey: ['opiniones', filterProyecto, filterEstado, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterProyecto !== 'todos') params.append('proyecto_id', filterProyecto);
      if (filterEstado !== 'todos') params.append('estado', filterEstado);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api.get(`/opiniones?${params.toString()}`);
      return response.data;
    }
  });

  const { data: proyectos = [] } = useQuery({
    queryKey: ['proyectos-gaceta'],
    queryFn: async () => {
      const response = await api.get('/gaceta?tipo=proyecto');
      return response.data;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/opiniones/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['opiniones']);
      setShowForm(false);
      setFormData({ estado: 'pendiente', observaciones_moderacion: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`/opiniones/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['opiniones']);
    }
  });

  const handleEdit = (opinion) => {
    setSelectedOpinion(opinion);
    setFormData({
      estado: opinion.estado,
      observaciones_moderacion: opinion.observaciones_moderacion || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOpinion) {
      updateMutation.mutate({
        id: selectedOpinion.id,
        data: formData
      });
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: '#856404',
      revisada: '#155724',
      publicada: '#155724',
      rechazada: '#721c24'
    };
    return colores[estado] || '#6c757d';
  };

  const filteredOpiniones = opiniones.filter(o => {
    if (filterProyecto !== 'todos' && o.proyecto_id !== parseInt(filterProyecto)) return false;
    if (filterEstado !== 'todos' && o.estado !== filterEstado) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        o.nombre.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query) ||
        o.opinion.toLowerCase().includes(query) ||
        (o.proyecto_titulo && o.proyecto_titulo.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const proyectosOptions = [
    { value: 'todos', label: 'Todos los Proyectos' },
    ...proyectos.map(p => ({ value: p.id.toString(), label: p.titulo }))
  ];

  return (
    <div className="admin-opiniones">
      <AdminNavbar title="Gestión de Opiniones sobre Proyectos" />
      <div className="admin-content-wrapper">
        <AdminFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={[
            {
              label: 'Proyecto',
              value: filterProyecto,
              onChange: setFilterProyecto,
              options: proyectosOptions
            },
            {
              label: 'Estado',
              value: filterEstado,
              onChange: setFilterEstado,
              options: estados
            }
          ]}
        />

        <div className="admin-grid">
          <div className="opiniones-list">
            <h2>Opiniones ({filteredOpiniones.length})</h2>
            
            {isLoading ? (
              <p>Cargando...</p>
            ) : filteredOpiniones.length === 0 ? (
              <p>No hay opiniones que coincidan con los filtros.</p>
            ) : (
              <div className="opiniones-cards">
                {filteredOpiniones.map((opinion) => (
                  <div key={opinion.id} className="opinion-card-admin">
                    <div className="opinion-card-header">
                      <div>
                        <h3>{opinion.nombre}</h3>
                        <p className="opinion-proyecto">
                          Proyecto: <strong>{opinion.proyecto_titulo || 'N/A'}</strong>
                          {opinion.proyecto_numero && ` (N° ${opinion.proyecto_numero})`}
                        </p>
                      </div>
                      <span 
                        className="estado-badge"
                        style={{ background: getEstadoColor(opinion.estado) }}
                      >
                        {opinion.estado}
                      </span>
                    </div>
                    <div className="opinion-card-body">
                      <p><strong>Email:</strong> {opinion.email}</p>
                      {opinion.organizacion && (
                        <p><strong>Organización:</strong> {opinion.organizacion} ({opinion.tipo_organizacion})</p>
                      )}
                      <p><strong>Opinión:</strong> {opinion.opinion}</p>
                      {opinion.argumentos && (
                        <p><strong>Argumentos:</strong> {opinion.argumentos}</p>
                      )}
                      {opinion.sugerencias && (
                        <p><strong>Sugerencias:</strong> {opinion.sugerencias}</p>
                      )}
                      <p className="opinion-fecha">
                        Enviado: {new Date(opinion.creado_en).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    <div className="opinion-card-actions">
                      <button onClick={() => handleEdit(opinion)} className="btn btn-edit">
                        Moderar
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('¿Está seguro de eliminar esta opinión?')) {
                            deleteMutation.mutate(opinion.id);
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

          {showForm && selectedOpinion && (
            <div className="opinion-form-panel">
              <h2>Moderar Opinión</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="revisada">Revisada</option>
                    <option value="publicada">Publicada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Observaciones de Moderación</label>
                  <textarea
                    value={formData.observaciones_moderacion}
                    onChange={(e) => setFormData({ ...formData, observaciones_moderacion: e.target.value })}
                    rows="4"
                    placeholder="Notas internas sobre la moderación..."
                  />
                </div>
                <button type="submit" className="btn" disabled={updateMutation.isLoading}>
                  {updateMutation.isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false);
                    setSelectedOpinion(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOpiniones;














