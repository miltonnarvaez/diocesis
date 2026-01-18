import React from 'react';
import { getFileUrl } from '../utils/fileUtils';
import './Timeline.css';

const Timeline = ({ eventos }) => {
  if (!eventos || eventos.length === 0) {
    return (
      <div className="timeline-empty">
        <p>No hay eventos históricos registrados.</p>
      </div>
    );
  }

  const categorias = {
    fundacion: 'Fundación',
    hitos: 'Hitos Históricos',
    autoridades_historicas: 'Autoridades Históricas',
    reformas: 'Reformas',
    logros: 'Logros',
    otros: 'Otros'
  };

  return (
    <div className="timeline-container">
      {eventos.map((evento, index) => (
        <div key={evento.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
          <div className="timeline-marker"></div>
          <div className="timeline-content">
            {evento.imagen_url && (
              <div className="timeline-image">
                <img src={getFileUrl(evento.imagen_url)} alt={evento.titulo} />
              </div>
            )}
            <div className="timeline-header">
              <span className="timeline-categoria">{categorias[evento.categoria] || evento.categoria}</span>
              {evento.fecha_evento && (
                <span className="timeline-fecha">
                  {new Date(evento.fecha_evento).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>
            <h3 className="timeline-titulo">{evento.titulo}</h3>
            <div 
              className="timeline-contenido"
              dangerouslySetInnerHTML={{ __html: evento.contenido }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;















