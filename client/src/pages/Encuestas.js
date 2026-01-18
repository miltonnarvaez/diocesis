import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import './Encuestas.css';

const Encuestas = () => {
  const { data: encuestas = [], isLoading } = useQuery({
    queryKey: ['encuestas'],
    queryFn: async () => {
      const response = await api.get('/encuestas');
      return response.data;
    }
  });

  if (isLoading) {
    return <div className="loading">Cargando encuestas...</div>;
  }

  const fechaActual = new Date();

  return (
    <div className="encuestas-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <div className="encuestas-header">
            <h1 className="page-title">Encuestas Ciudadanas</h1>
            <p className="encuestas-intro">
              Participa en las encuestas del Diócesis de Ipiales. Tu opinión es importante para nosotros.
            </p>
          </div>

          {encuestas.length === 0 ? (
            <div className="no-results">
              <p>No hay encuestas disponibles en este momento.</p>
              <p className="no-results-note">
                Las encuestas se publican periódicamente. Vuelve pronto para participar.
              </p>
            </div>
          ) : (
            <div className="encuestas-grid">
              {encuestas.map((encuesta) => {
                const fechaInicio = new Date(encuesta.fecha_inicio);
                const fechaFin = new Date(encuesta.fecha_fin);
                // La encuesta está activa si: está marcada como activa EN LA BD Y está dentro del rango de fechas
                const estaActiva = encuesta.activa && fechaActual >= fechaInicio && fechaActual <= fechaFin;

                return (
                  <div key={encuesta.id} className="encuesta-card">
                    <div className="encuesta-header">
                      <h2>{encuesta.titulo}</h2>
                      <span className={`encuesta-estado ${estaActiva ? 'activa' : 'finalizada'}`}>
                        {estaActiva ? '🟢 Activa' : '🔴 Finalizada'}
                      </span>
                    </div>
                    
                    {encuesta.descripcion && (
                      <p className="encuesta-descripcion">{encuesta.descripcion}</p>
                    )}

                    <div className="encuesta-info">
                      <div className="info-item">
                        <strong>Fecha de inicio:</strong>
                        <span>{fechaInicio.toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="info-item">
                        <strong>Fecha de cierre:</strong>
                        <span>{fechaFin.toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="info-item">
                        <strong>Preguntas:</strong>
                        <span>{encuesta.preguntas?.length || 0}</span>
                      </div>
                    </div>

                    <div className="encuesta-actions">
                      {estaActiva ? (
                        <Link to={`/encuestas/${encuesta.id}`} className="btn btn-primary">
                          Participar →
                        </Link>
                      ) : (
                        <Link to={`/encuestas/${encuesta.id}/resultados`} className="btn btn-secondary">
                          Ver Resultados →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Encuestas;

