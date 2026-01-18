import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import './AdminCommon.css';
import './AdminTramites.css';

const AdminTramites = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'otros',
    requisitos: '',
    costo: 0,
    tiempo_respuesta: '',
    documentos_necesarios: '',
    pasos: '',
    contacto_responsable: '',
    email_contacto: '',
    telefono_contacto: '',
    horario_atencion: '',
    activo: true,
    destacado: false,
    orden: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorias = [
    'otros',
    'documentos',
    'certificaciones',
    'permisos',
    'licencias',
    'registros',
    'consultas',
    'reclamos'
  ];

  const { data: tramites = [], isLoading } = useQuery({
    queryKey: ['tramites-admin'],
    queryFn: async () => {
      const response = await api.get('/tramites/admin/all');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return api.post('/tramites/admin', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tramites-admin']);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return api.put(`/tramites/admin/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tramites-admin']);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/tramites/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tramites-admin']);
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: 'otros',
      requisitos: '',
      costo: 0,
      tiempo_respuesta: '',
      documentos_necesarios: '',
      pasos: '',
      contacto_responsable: '',
      email_contacto: '',
      telefono_contacto: '',
      horario_atencion: '',
      activo: true,
      destacado: false,
      orden: 0
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        requisitos: formData.requisitos ? JSON.stringify(formData.requisitos.split('\n').filter(r => r.trim())) : null,
        documentos_necesarios: formData.documentos_necesarios ? JSON.stringify(formData.documentos_necesarios.split('\n').filter(d => d.trim())) : null,
        pasos: formData.pasos ? JSON.stringify(formData.pasos.split('\n').filter(p => p.trim())) : null,
        costo: parseFloat(formData.costo) || 0,
        activo: formData.activo === true || formData.activo === 'true',
        destacado: formData.destacado === true || formData.destacado === 'true'
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: dataToSubmit });
      } else {
        await createMutation.mutateAsync(dataToSubmit);
      }
    } catch (error) {
      console.error('Error guardando trámite:', error);
      alert('Error al guardar el trámite. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (tramite) => {
    const requisitos = tramite.requisitos ? (typeof tramite.requisitos === 'string' ? JSON.parse(tramite.requisitos) : tramite.requisitos).join('\n') : '';
    const documentos = tramite.documentos_necesarios ? (typeof tramite.documentos_necesarios === 'string' ? JSON.parse(tramite.documentos_necesarios) : tramite.documentos_necesarios).join('\n') : '';
    const pasos = tramite.pasos ? (typeof tramite.pasos === 'string' ? JSON.parse(tramite.pasos) : tramite.pasos).join('\n') : '';

    setFormData({
      nombre: tramite.nombre,
      descripcion: tramite.descripcion || '',
      categoria: tramite.categoria || 'otros',
      requisitos,
      costo: tramite.costo || 0,
      tiempo_respuesta: tramite.tiempo_respuesta || '',
      documentos_necesarios: documentos,
      pasos,
      contacto_responsable: tramite.contacto_responsable || '',
      email_contacto: tramite.email_contacto || '',
      telefono_contacto: tramite.telefono_contacto || '',
      horario_atencion: tramite.horario_atencion || '',
      activo: tramite.activo,
      destacado: tramite.destacado,
      orden: tramite.orden || 0
    });
    setEditingId(tramite.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este trámite?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error eliminando trámite:', error);
        alert('Error al eliminar el trámite. Por favor, intenta nuevamente.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="admin-tramites">
        <AdminNavbar title="Gestión de Trámites" />
        <div className="admin-content-wrapper">
          <div className="loading">Cargando trámites...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tramites">
      <AdminNavbar title="Gestión de Trámites" />
      <div className="admin-content-wrapper">
        <div className="admin-actions">
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? '✕ Cancelar' : '+ Nuevo Trámite'}
          </button>
        </div>

        {showForm && (
          <form className="tramites-form" onSubmit={handleSubmit}>
            <h3>{editingId ? 'Editar Trámite' : 'Nuevo Trámite'}</h3>

            <div className="form-group">
              <label>Nombre del Trámite *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Costo</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costo}
                  onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Tiempo de Respuesta</label>
                <input
                  type="text"
                  value={formData.tiempo_respuesta}
                  onChange={(e) => setFormData({ ...formData, tiempo_respuesta: e.target.value })}
                  placeholder="Ej: 5 días hábiles"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Requisitos (uno por línea)</label>
              <textarea
                value={formData.requisitos}
                onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                rows="4"
                placeholder="Requisito 1&#10;Requisito 2&#10;Requisito 3"
              />
            </div>

            <div className="form-group">
              <label>Documentos Necesarios (uno por línea)</label>
              <textarea
                value={formData.documentos_necesarios}
                onChange={(e) => setFormData({ ...formData, documentos_necesarios: e.target.value })}
                rows="4"
                placeholder="Documento 1&#10;Documento 2&#10;Documento 3"
              />
            </div>

            <div className="form-group">
              <label>Pasos del Trámite (uno por línea)</label>
              <textarea
                value={formData.pasos}
                onChange={(e) => setFormData({ ...formData, pasos: e.target.value })}
                rows="4"
                placeholder="Paso 1&#10;Paso 2&#10;Paso 3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contacto Responsable</label>
                <input
                  type="text"
                  value={formData.contacto_responsable}
                  onChange={(e) => setFormData({ ...formData, contacto_responsable: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email de Contacto</label>
                <input
                  type="email"
                  value={formData.email_contacto}
                  onChange={(e) => setFormData({ ...formData, email_contacto: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Teléfono de Contacto</label>
                <input
                  type="text"
                  value={formData.telefono_contacto}
                  onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Horario de Atención</label>
              <textarea
                value={formData.horario_atencion}
                onChange={(e) => setFormData({ ...formData, horario_atencion: e.target.value })}
                rows="2"
                placeholder="Ej: Lunes a Viernes: 8:00 AM - 12:00 PM y 2:00 PM - 6:00 PM"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Orden</label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  />
                  Activo
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.destacado}
                    onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                  />
                  Destacado
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="tramites-list">
          {tramites.length === 0 ? (
            <div className="empty-state">
              <p>No hay trámites registrados.</p>
            </div>
          ) : (
            tramites.map((tramite) => (
              <div key={tramite.id} className="tramite-card">
                <div className="tramite-card-header">
                  <h3>{tramite.nombre}</h3>
                  <div className="tramite-badges">
                    {tramite.destacado && <span className="badge badge-primary">⭐ Destacado</span>}
                    {!tramite.activo && <span className="badge badge-warning">Inactivo</span>}
                  </div>
                </div>
                <div className="tramite-card-content">
                  <p className="tramite-descripcion">{tramite.descripcion || 'Sin descripción'}</p>
                  <div className="tramite-info">
                    {tramite.costo > 0 && (
                      <span className="tramite-info-item">💰 Costo: ${tramite.costo.toLocaleString()}</span>
                    )}
                    {tramite.tiempo_respuesta && (
                      <span className="tramite-info-item">⏱️ {tramite.tiempo_respuesta}</span>
                    )}
                    {tramite.categoria && (
                      <span className="tramite-info-item">📁 {tramite.categoria}</span>
                    )}
                  </div>
                  {tramite.contacto_responsable && (
                    <p className="tramite-contacto">
                      <strong>Contacto:</strong> {tramite.contacto_responsable}
                      {tramite.telefono_contacto && ` | ${tramite.telefono_contacto}`}
                    </p>
                  )}
                </div>
                <div className="tramite-card-actions">
                  <button onClick={() => handleEdit(tramite)} className="btn btn-sm btn-primary">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(tramite.id)} className="btn btn-sm btn-danger">
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTramites;















