import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { FaCalendarCheck, FaMapMarkerAlt, FaUsers, FaCheckCircle } from 'react-icons/fa';
import './Reservas.css';

const Reservas = () => {
  const [formData, setFormData] = useState({
    espacio_id: '',
    nombre_solicitante: '',
    documento: '',
    email: '',
    telefono: '',
    fecha_reserva: '',
    hora_inicio: '',
    hora_fin: '',
    motivo: '',
    descripcion_evento: '',
    numero_personas: '',
    requiere_equipamiento: false,
    equipamiento_solicitado: ''
  });

  const [showSuccess, setShowSuccess] = useState(false);

  const { data: espacios = [] } = useQuery({
    queryKey: ['espacios'],
    queryFn: async () => {
      const response = await api.get('/reservas/espacios');
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/reservas', data);
      return response.data;
    },
    onSuccess: () => {
      setShowSuccess(true);
      setFormData({
        espacio_id: '',
        nombre_solicitante: '',
        documento: '',
        email: '',
        telefono: '',
        fecha_reserva: '',
        hora_inicio: '',
        hora_fin: '',
        motivo: '',
        descripcion_evento: '',
        numero_personas: '',
        requiere_equipamiento: false,
        equipamiento_solicitado: ''
      });
      setTimeout(() => setShowSuccess(false), 5000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      numero_personas: parseInt(formData.numero_personas) || null
    });
  };

  return (
    <div className="reservas-page">
      <div className="container">
        <div className="page-header">
          <h1><FaCalendarCheck /> Reserva de Espacios</h1>
          <p>Solicita la reserva de espacios para tus eventos</p>
        </div>

        {showSuccess && (
          <div className="alert alert-success">
            <FaCheckCircle /> Tu solicitud de reserva ha sido enviada. Será revisada y te contactaremos pronto.
          </div>
        )}

        <div className="reservas-content">
          <div className="espacios-info">
            <h2>Espacios Disponibles</h2>
            {espacios.length === 0 ? (
              <p>No hay espacios disponibles en este momento.</p>
            ) : (
              <div className="espacios-list">
                {espacios.map(espacio => (
                  <div key={espacio.id} className="espacio-item">
                    <h3>{espacio.nombre}</h3>
                    <p>{espacio.descripcion}</p>
                    <div className="espacio-meta">
                      <span><FaUsers /> Capacidad: {espacio.capacidad} personas</span>
                      {espacio.ubicacion && <span><FaMapMarkerAlt /> {espacio.ubicacion}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="reserva-form">
            <h2>Formulario de Reserva</h2>

            <div className="form-group">
              <label>Espacio *</label>
              <select
                value={formData.espacio_id}
                onChange={(e) => setFormData({...formData, espacio_id: e.target.value})}
                required
              >
                <option value="">Seleccione un espacio</option>
                {espacios.map(espacio => (
                  <option key={espacio.id} value={espacio.id}>{espacio.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.nombre_solicitante}
                  onChange={(e) => setFormData({...formData, nombre_solicitante: e.target.value})}
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

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Reserva *</label>
                <input
                  type="date"
                  value={formData.fecha_reserva}
                  onChange={(e) => setFormData({...formData, fecha_reserva: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Número de Personas</label>
                <input
                  type="number"
                  value={formData.numero_personas}
                  onChange={(e) => setFormData({...formData, numero_personas: e.target.value})}
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hora de Inicio *</label>
                <input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hora de Fin *</label>
                <input
                  type="time"
                  value={formData.hora_fin}
                  onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Motivo del Evento</label>
              <input
                type="text"
                value={formData.motivo}
                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                placeholder="Ej: Celebración, Reunión, etc."
              />
            </div>

            <div className="form-group">
              <label>Descripción del Evento</label>
              <textarea
                value={formData.descripcion_evento}
                onChange={(e) => setFormData({...formData, descripcion_evento: e.target.value})}
                rows="4"
                placeholder="Describe tu evento..."
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.requiere_equipamiento}
                  onChange={(e) => setFormData({...formData, requiere_equipamiento: e.target.checked})}
                />
                Requiere equipamiento adicional
              </label>
            </div>

            {formData.requiere_equipamiento && (
              <div className="form-group">
                <label>Equipamiento Solicitado</label>
                <textarea
                  value={formData.equipamiento_solicitado}
                  onChange={(e) => setFormData({...formData, equipamiento_solicitado: e.target.value})}
                  rows="3"
                  placeholder="Describe el equipamiento que necesitas..."
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enviando...' : 'Solicitar Reserva'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reservas;
