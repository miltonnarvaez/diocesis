import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaClipboardList, FaBolt, FaStar } from 'react-icons/fa';
import './Sesiones.css';

const Sesiones = () => {
  const [tipoFiltro, setTipoFiltro] = useState('todas');
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);

  const { data: sesiones = [], isLoading } = useQuery({
    queryKey: ['sesiones', tipoFiltro],
    queryFn: async () => {
      try {
        const params = tipoFiltro !== 'todas' ? { tipo: tipoFiltro } : {};
        const response = await api.get('/sesiones', { params });
        return response.data;
      } catch (error) {
        console.error('Error obteniendo sesiones:', error);
        return [];
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  const tiposSesion = [
    { value: 'todas', label: 'Todas las Sesiones' },
    { value: 'ordinaria', label: 'Sesiones Ordinarias' },
    { value: 'extraordinaria', label: 'Sesiones Extraordinarias' },
    { value: 'especial', label: 'Sesiones Especiales' }
  ];

  const renderVideo = (videoUrl, embedCode) => {
    if (embedCode) {
      return (
        <div 
          className="video-embed" 
          dangerouslySetInnerHTML={{ __html: embedCode }}
        />
      );
    }
    
    if (videoUrl) {
      // Detectar si es YouTube
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = videoUrl.includes('youtu.be') 
          ? videoUrl.split('/').pop().split('?')[0]
          : videoUrl.split('v=')[1]?.split('&')[0];
        
        return (
          <div className="video-embed">
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Video de sesión"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      
      // Detectar si es Facebook
      if (videoUrl.includes('facebook.com')) {
        return (
          <div className="video-embed">
            <iframe
              src={videoUrl.replace('/videos/', '/videos/embed/')}
              width="100%"
              height="500"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
        );
      }
      
      // Video directo
      return (
        <div className="video-embed">
          <video controls width="100%" style={{ maxHeight: '500px' }}>
            <source src={videoUrl} type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return <div className="loading">Cargando sesiones...</div>;
  }

  return (
    <div className="sesiones-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <div className="sesiones-header">
            <h1 className="page-title">Sesiones del Diócesis</h1>
            <p className="sesiones-intro">
              Aquí encontrará información sobre las sesiones del Diócesis de Ipiales, 
              incluyendo videos, actas y documentos relacionados.
            </p>
          </div>

          {/* Filtros */}
          <div className="sesiones-filtros">
            {tiposSesion.map(tipo => (
              <button
                key={tipo.value}
                className={`filtro-btn ${tipoFiltro === tipo.value ? 'active' : ''}`}
                onClick={() => setTipoFiltro(tipo.value)}
              >
                {tipo.label}
              </button>
            ))}
          </div>

          {/* Enlace a Facebook */}
          <div className="facebook-link-section">
            <a 
              href="https://www.facebook.com/p/Diócesis-Municipal-de-Ipiales-61555825801735/?locale=es_LA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="facebook-link-btn"
            >
              <span>📘</span> Ver más información en nuestra página de Facebook
            </a>
          </div>

          {/* Lista de sesiones */}
          {sesiones.length === 0 ? (
            <div className="no-results">
              <p>No hay sesiones disponibles en este momento.</p>
            </div>
          ) : (
            <div className="sesiones-grid">
              {sesiones.map((sesion) => (
                <div key={sesion.id} className="sesion-card">
                  <div className="sesion-header">
                    <span className={`sesion-tipo ${sesion.tipo}`}>
                      {sesion.tipo === 'ordinaria' ? <><FaClipboardList /> Ordinaria</> :
                       sesion.tipo === 'extraordinaria' ? <><FaBolt /> Extraordinaria</> :
                       <><FaStar /> Especial</>}
                    </span>
                    {sesion.destacada && (
                      <span className="sesion-destacada"><FaStar /> Destacada</span>
                    )}
                  </div>
                  
                  <div className="sesion-content">
                    <h3>Sesión {sesion.numero_sesion}</h3>
                    <div className="sesion-info">
                      <p><strong>Fecha:</strong> {new Date(sesion.fecha).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                      {sesion.hora && (
                        <p><strong>Hora:</strong> {sesion.hora}</p>
                      )}
                      <p><strong>Lugar:</strong> {sesion.lugar}</p>
                    </div>
                    
                    {sesion.resumen && (
                      <p className="sesion-resumen">{sesion.resumen}</p>
                    )}

                    <div className="sesion-actions">
                      {sesion.video_url || sesion.video_embed_code ? (
                        <button
                          onClick={() => setSesionSeleccionada(sesionSeleccionada === sesion.id ? null : sesion.id)}
                          className="btn btn-primary"
                        >
                          {sesionSeleccionada === sesion.id ? 'Ocultar' : 'Ver'} Video
                        </button>
                      ) : null}
                      
                      {sesion.acta_url && (
                        <a
                          href={sesion.acta_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                        >
                          Ver Acta
                        </a>
                      )}
                      
                      <Link to={`/sesiones/${sesion.id}`} className="btn btn-outline">
                        Ver Detalles
                      </Link>
                    </div>

                    {sesionSeleccionada === sesion.id && (
                      <div className="sesion-video-container">
                        {renderVideo(sesion.video_url, sesion.video_embed_code)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Sesiones;

















