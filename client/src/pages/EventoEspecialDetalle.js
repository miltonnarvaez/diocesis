import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock } from 'react-icons/fa';
import './EventoEspecialDetalle.css';

const EventoEspecialDetalle = () => {
  const { id } = useParams();
  const [showInscripcion, setShowInscripcion] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    documento: '',
    email: '',
    telefono: '',
    edad: '',
    parroquia: '',
    observaciones: ''
  });

  const { data: evento, isLoading } = useQuery({
    queryKey: ['evento-especial', id],
    queryFn: async () => {
      const response = await api.get(`/eventos-especiales/${id}`);
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/eventos-especiales/${id}/inscribirse`, data);
      return response.data;
    },
    onSuccess: () => {
      alert('Inscripción realizada exitosamente. Te contactaremos pronto.');
      setShowInscripcion(false);
      setFormData({
        nombre_completo: '',
        documento: '',
        email: '',
        telefono: '',
        edad: '',
        parroquia: '',
        observaciones: ''
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="loading">Cargando evento...</div>;
  }

  if (!evento) {
    return <div className="no-results">Evento no encontrado.</div>;
  }

  return (
    <div className="evento-detalle-page">
      <div className="container">
        <article className="evento-detalle">
          {evento.imagen_url && (
            <img src={evento.imagen_url} alt={evento.titulo} className="evento-imagen-principal" />
          )}
          
          <div className="evento-header">
            <h1>{evento.titulo}</h1>
            <div className="evento-meta">
              <span><FaCalendarAlt /> {new Date(evento.fecha_inicio).toLocaleDateString('es-CO', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}</span>
              {evento.hora_inicio && <span><FaClock /> {evento.hora_inicio}</span>}
              {evento.lugar && <span><FaMapMarkerAlt /> {evento.lugar}</span>}
            </div>
          </div>

          {evento.descripcion && (
            <div className="evento-descripcion">
              <h2>Descripción</h2>
              <p>{evento.descripcion}</p>
            </div>
          )}

          {evento.requiere_inscripcion && (
            <div className="evento-inscripcion-info">
              <h2>Inscripción</h2>
              <p><FaUsers /> Cupos disponibles: {evento.cupos_disponibles} de {evento.cupos_maximos}</p>
              {evento.inscripcion_abierta ? (
                <button onClick={() => setShowInscripcion(true)} className="btn btn-primary">
                  Inscribirse
                </button>
              ) : (
                <p className="inscripcion-cerrada">Las inscripciones están cerradas</p>
              )}
            </div>
          )}

          {showInscripcion && (
            <form onSubmit={handleSubmit} className="inscripcion-form">
              <h3>Formulario de Inscripción</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({...formData, nombre_completo: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Documento</label>
                  <input
                    type="text"
                    value={formData.documento}
                    onChange={(e) => setFormData({...formData, documento: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Parroquia</label>
                <input
                  type="text"
                  value={formData.parroquia}
                  onChange={(e) => setFormData({...formData, parroquia: e.target.value})}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Enviando...' : 'Enviar Inscripción'}
                </button>
                <button type="button" onClick={() => setShowInscripcion(false)} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </article>
      </div>
    </div>
  );
};

export default EventoEspecialDetalle;
