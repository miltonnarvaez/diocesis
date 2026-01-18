import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { FaMicrophone, FaCalendarAlt, FaUser } from 'react-icons/fa';
import './HomiliaDetalle.css';

const HomiliaDetalle = () => {
  const { id } = useParams();

  const { data: homilia, isLoading } = useQuery({
    queryKey: ['homilia', id],
    queryFn: async () => {
      const response = await api.get(`/homilias/${id}`);
      return response.data;
    }
  });

  if (isLoading) {
    return <div className="loading">Cargando homilía...</div>;
  }

  if (!homilia) {
    return <div className="no-results">Homilía no encontrada.</div>;
  }

  return (
    <div className="homilia-detalle-page">
      <div className="container">
        <article className="homilia-detalle">
          <div className="homilia-header">
            <h1>{homilia.titulo}</h1>
            <div className="homilia-meta">
              <span><FaUser /> {homilia.autor}</span>
              <span><FaCalendarAlt /> {new Date(homilia.fecha_homilia).toLocaleDateString('es-CO', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}</span>
            </div>
          </div>

          {homilia.evangelio && (
            <div className="homilia-lecturas">
              <h2>Lecturas del Día</h2>
              {homilia.lectura_primera && (
                <div className="lectura">
                  <h3>Primera Lectura</h3>
                  <p>{homilia.lectura_primera}</p>
                </div>
              )}
              {homilia.salmo && (
                <div className="lectura">
                  <h3>Salmo</h3>
                  <p>{homilia.salmo}</p>
                </div>
              )}
              {homilia.lectura_segunda && (
                <div className="lectura">
                  <h3>Segunda Lectura</h3>
                  <p>{homilia.lectura_segunda}</p>
                </div>
              )}
              <div className="lectura">
                <h3>Evangelio</h3>
                <p>{homilia.evangelio}</p>
              </div>
            </div>
          )}

          <div className="homilia-contenido">
            <h2>Homilía</h2>
            <div dangerouslySetInnerHTML={{ __html: homilia.contenido.replace(/\n/g, '<br />') }} />
          </div>

          {homilia.audio_url && (
            <div className="homilia-audio">
              <h3>Audio de la Homilía</h3>
              <audio controls src={homilia.audio_url} className="audio-player">
                Tu navegador no soporta el elemento de audio.
              </audio>
            </div>
          )}

          {homilia.video_url && (
            <div className="homilia-video">
              <h3>Video de la Homilía</h3>
              <iframe
                src={homilia.video_url}
                title={homilia.titulo}
                allowFullScreen
                className="video-iframe"
              />
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default HomiliaDetalle;
