import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaStar } from 'react-icons/fa';
import './EventosEspeciales.css';

const EventosEspeciales = () => {
  const [filtroTipo, setFiltroTipo] = useState('');

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['eventos-especiales', filtroTipo],
    queryFn: async () => {
      const params = {};
      if (filtroTipo) params.tipo_evento = filtroTipo;
      const response = await api.get('/eventos-especiales', { params });
      return response.data;
    }
  });

  const tipos = [
    { value: '', label: 'Todos' },
    { value: 'retiro', label: 'Retiros' },
    { value: 'peregrinacion', label: 'Peregrinaciones' },
    { value: 'celebracion', label: 'Celebraciones' },
    { value: 'conferencia', label: 'Conferencias' },
    { value: 'taller', label: 'Talleres' }
  ];

  return (
    <div className="eventos-especiales-page">
      <div className="container">
        <div className="page-header">
          <h1><FaCalendarAlt /> Eventos Especiales</h1>
          <p>Retiros, peregrinaciones y celebraciones especiales</p>
        </div>

        <div className="filtros">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="filtro-select"
          >
            {tipos.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading">Cargando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="no-results">No hay eventos disponibles.</div>
        ) : (
          <div className="eventos-grid">
            {eventos.map(evento => (
              <div key={evento.id} className="evento-card">
                {evento.destacado && <FaStar className="destacada-icon" />}
                {evento.imagen_url && (
                  <img src={evento.imagen_url} alt={evento.titulo} className="evento-image" />
                )}
                <div className="evento-content">
                  <h3>{evento.titulo}</h3>
                  <div className="evento-meta">
                    <span><FaCalendarAlt /> {new Date(evento.fecha_inicio).toLocaleDateString('es-CO')}</span>
                    {evento.lugar && <span><FaMapMarkerAlt /> {evento.lugar}</span>}
                  </div>
                  {evento.descripcion && (
                    <p className="evento-descripcion">{evento.descripcion.substring(0, 150)}...</p>
                  )}
                  {evento.requiere_inscripcion && (
                    <div className="evento-inscripcion">
                      <FaUsers /> {evento.cupos_disponibles} cupos disponibles
                    </div>
                  )}
                  <Link to={`/eventos-especiales/${evento.id}`} className="btn btn-primary">
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventosEspeciales;
