import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import { FaCalendarAlt, FaPlus, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import './AdminEventosEspeciales.css';

const AdminEventosEspeciales = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo_evento: 'retiro',
    fecha_inicio: '',
    fecha_fin: '',
    hora_inicio: '',
    hora_fin: '',
    lugar: '',
    direccion: '',
    imagen_url: '',
    costo: '',
    cupos_maximos: '',
    requiere_inscripcion: true,
    inscripcion_abierta: true,
    destacado: false
  });

  const queryClient = useQueryClient();

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['eventos-especiales-admin'],
    queryFn: async () => {
      const response = await api.get('/eventos-especiales');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      const response = await api.post('/eventos-especiales', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['eventos-especiales-admin']);
      resetForm();
      alert('Evento creado exitosamente');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      const response = await api.put(`/eventos-especiales/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['eventos-especiales-admin']);
      resetForm();
      alert('Evento actualizado exitosamente');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const response = await api.put(`/eventos-especiales/${id}`, 
        { activo: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['eventos-especiales-admin']);
      alert('Evento eliminado exitosamente');
    }
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo_evento: 'retiro',
      fecha_inicio: '',
      fecha_fin: '',
      hora_inicio: '',
      hora_fin: '',
      lugar: '',
      direccion: '',
      imagen_url: '',
      costo: '',
      cupos_maximos: '',
      requiere_inscripcion: true,
      inscripcion_abierta: true,
      destacado: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (evento) => {
    setFormData({
      titulo: evento.titulo,
      descripcion: evento.descripcion || '',
      tipo_evento: evento.tipo_evento,
      fecha_inicio: evento.fecha_inicio,
      fecha_fin: evento.fecha_fin || '',
      hora_inicio: evento.hora_inicio || '',
      hora_fin: evento.hora_fin || '',
      lugar: evento.lugar || '',
      direccion: evento.direccion || '',
      imagen_url: evento.imagen_url || '',
      costo: evento.costo || '',
      cupos_maximos: evento.cupos_maximos || '',
      requiere_inscripcion: evento.requiere_inscripcion !== undefined ? evento.requiere_inscripcion : true,
      inscripcion_abierta: evento.inscripcion_abierta !== undefined ? evento.inscripcion_abierta : true,
      destacado: evento.destacado || false
    });
    setEditingId(evento.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      costo: parseFloat(formData.costo) || 0,
      cupos_maximos: parseInt(formData.cupos_maximos) || 0
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="admin-eventos-especiales">
      <AdminNavbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1><FaCalendarAlt /> Gestión de Eventos Especiales</h1>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <FaPlus /> Nuevo Evento
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="evento-form">
            <h2>{editingId ? 'Editar' : 'Nuevo'} Evento</h2>
            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                rows="5"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Evento</label>
                <select
                  value={formData.tipo_evento}
                  onChange={(e) => setFormData({...formData, tipo_evento: e.target.value})}
                >
                  <option value="retiro">Retiro</option>
                  <option value="peregrinacion">Peregrinación</option>
                  <option value="celebracion">Celebración</option>
                  <option value="conferencia">Conferencia</option>
                  <option value="taller">Taller</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Lugar</label>
                <input
                  type="text"
                  value={formData.lugar}
                  onChange={(e) => setFormData({...formData, lugar: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Inicio *</label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha de Fin</label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Hora de Inicio</label>
                <input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Hora de Fin</label>
                <input
                  type="time"
                  value={formData.hora_fin}
                  onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Costo</label>
                <input
                  type="number"
                  value={formData.costo}
                  onChange={(e) => setFormData({...formData, costo: e.target.value})}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Cupos Máximos</label>
                <input
                  type="number"
                  value={formData.cupos_maximos}
                  onChange={(e) => setFormData({...formData, cupos_maximos: e.target.value})}
                  min="0"
                />
              </div>
            </div>
            <div className="form-group">
              <label>URL Imagen</label>
              <input
                type="url"
                value={formData.imagen_url}
                onChange={(e) => setFormData({...formData, imagen_url: e.target.value})}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.requiere_inscripcion}
                    onChange={(e) => setFormData({...formData, requiere_inscripcion: e.target.checked})}
                  />
                  Requiere Inscripción
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.inscripcion_abierta}
                    onChange={(e) => setFormData({...formData, inscripcion_abierta: e.target.checked})}
                  />
                  Inscripción Abierta
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.destacado}
                  onChange={(e) => setFormData({...formData, destacado: e.target.checked})}
                />
                Destacado
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="loading">Cargando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="no-results">No hay eventos registrados.</div>
        ) : (
          <div className="eventos-grid">
            {eventos.map(evento => (
              <div key={evento.id} className="evento-card">
                <h3>{evento.titulo}</h3>
                <p className="evento-tipo">{evento.tipo_evento}</p>
                <p className="evento-fecha">{new Date(evento.fecha_inicio).toLocaleDateString('es-CO')}</p>
                {evento.requiere_inscripcion && (
                  <p className="evento-cupos">
                    <FaUsers /> {evento.cupos_disponibles} / {evento.cupos_maximos} cupos
                  </p>
                )}
                <div className="evento-actions">
                  <button onClick={() => handleEdit(evento)} className="btn btn-sm btn-edit">
                    <FaEdit /> Editar
                  </button>
                  <button onClick={() => deleteMutation.mutate(evento.id)} className="btn btn-sm btn-delete">
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventosEspeciales;
