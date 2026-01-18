import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { getFileUrl } from '../utils/fileUtils';
import { FaClipboardList, FaBolt, FaStar, FaFileAlt } from 'react-icons/fa';
import './SesionDetalle.css';

const SesionDetalle = () => {
  const { id } = useParams();

  const { data: sesion, isLoading } = useQuery({
    queryKey: ['sesion', id],
    queryFn: async () => {
      const response = await api.get(`/sesiones/${id}`);
      return response.data;
    }
  });

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
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = videoUrl.includes('youtu.be') 
          ? videoUrl.split('/').pop().split('?')[0]
          : videoUrl.split('v=')[1]?.split('&')[0];
        
        return (
          <div className="video-embed">
            <iframe
              width="100%"
              height="600"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Video de sesión"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      
      if (videoUrl.includes('facebook.com')) {
        return (
          <div className="video-embed">
            <iframe
              src={videoUrl.replace('/videos/', '/videos/embed/')}
              width="100%"
              height="600"
              style={{ border: 'none', overflow: 'hidden' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        );
      }
      
      return (
        <div className="video-embed">
          <video controls width="100%">
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      );
    }
    
    return null;
  };

  if (isLoading) {
    return <div className="loading">Cargando sesión...</div>;
  }

  if (!sesion) {
    return <div className="no-results">Sesión no encontrada</div>;
  }

  return (
    <div className="sesion-detalle-page">
      <section className="section">
        <div className="container">
          <Link to="/sesiones" className="back-link">← Volver a Sesiones</Link>

          <div className="sesion-detalle-header">
            <div className="sesion-badges">
              <span className={`sesion-tipo ${sesion.tipo}`}>
                {sesion.tipo === 'ordinaria' ? <><FaClipboardList /> Sesión Ordinaria</> :
                 sesion.tipo === 'extraordinaria' ? <><FaBolt /> Sesión Extraordinaria</> :
                 <><FaStar /> Sesión Especial</>}
              </span>
              {sesion.destacada && (
                <span className="sesion-destacada"><FaStar /> Destacada</span>
              )}
            </div>
            <h1>Sesión {sesion.numero_sesion}</h1>
          </div>

          <div className="sesion-detalle-content">
            <div className="sesion-info-detalle">
              <div className="info-item">
                <strong>Fecha:</strong>
                <span>{new Date(sesion.fecha).toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              {sesion.hora && (
                <div className="info-item">
                  <strong>Hora:</strong>
                  <span>{sesion.hora}</span>
                </div>
              )}
              <div className="info-item">
                <strong>Lugar:</strong>
                <span>{sesion.lugar}</span>
              </div>
            </div>

            {sesion.resumen && (
              <div className="sesion-resumen-detalle">
                <h3>Resumen</h3>
                <p>{sesion.resumen}</p>
              </div>
            )}

            {sesion.orden_dia && (
              <div className="sesion-orden-dia">
                <h3>Orden del Día</h3>
                <div className="orden-dia-content" dangerouslySetInnerHTML={{ __html: sesion.orden_dia }} />
              </div>
            )}

            {(sesion.video_url || sesion.video_embed_code) && (
              <div className="sesion-video-section">
                <h3>Video de la Sesión</h3>
                {renderVideo(sesion.video_url, sesion.video_embed_code)}
                <div className="video-links">
                  <a 
                    href={sesion.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    Ver en Facebook/YouTube →
                  </a>
                </div>
              </div>
            )}

            {sesion.acta_url && (
              <div className="sesion-documentos">
                <h3>Documentos</h3>
                <a
                  href={getFileUrl(sesion.acta_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <FaFileAlt /> Ver Acta Completa
                </a>
              </div>
            )}

            {sesion.documentos && sesion.documentos.length > 0 && (
              <div className="sesion-documentos-relacionados">
                <h3>Documentos Relacionados</h3>
                <div className="documentos-grid">
                  {sesion.documentos.map((doc) => (
                    <div key={doc.id} className="documento-item">
                      <h4>{doc.titulo}</h4>
                      <p className="documento-tipo">{doc.tipo.toUpperCase()}</p>
                      {doc.numero && <p className="documento-numero">N° {doc.numero}</p>}
                      {doc.descripcion && <p>{doc.descripcion}</p>}
                      {doc.archivo_url && (
                        <a
                          href={getFileUrl(doc.archivo_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm"
                        >
                          Ver Documento
                        </a>
                      )}
                      {doc.aprobado !== null && (
                        <p className={`votacion ${doc.aprobado ? 'aprobado' : 'rechazado'}`}>
                          {doc.aprobado ? '✓ Aprobado' : '✗ Rechazado'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sesion.asistentes && sesion.asistentes.length > 0 && (
              <div className="sesion-asistentes">
                <h3>Asistentes</h3>
                <div className="asistentes-list">
                  {sesion.asistentes.map((asistente) => (
                    <div key={asistente.id} className="asistente-item">
                      <strong>{asistente.nombre}</strong>
                      {asistente.cargo && <span className="asistente-cargo">{asistente.cargo}</span>}
                      {!asistente.asistio && (
                        <span className="asistente-ausente">Ausente</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sesion-facebook-link">
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="facebook-link-btn"
              >
                <span>📘</span> Ver más información en nuestra página de Facebook
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SesionDetalle;

