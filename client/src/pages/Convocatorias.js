import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import NoticiaImage from '../components/NoticiaImage';
import { getImageByIndex } from '../utils/exampleImages';
import Breadcrumbs from '../components/Breadcrumbs';
import { FaStar } from 'react-icons/fa';
import './Convocatorias.css';

const Convocatorias = () => {
  const { data: convocatorias = [], isLoading } = useQuery({
    queryKey: ['convocatorias'],
    queryFn: async () => {
      const response = await api.get('/convocatorias');
      return response.data;
    }
  });

  if (isLoading) {
    return <div className="loading">Cargando convocatorias...</div>;
  }

  return (
    <div className="convocatorias-page">
      <Breadcrumbs />
      <section className="section">
        <div className="container">
          <h1 className="page-title">Convocatorias</h1>

          {convocatorias.length === 0 ? (
            <div className="no-results">
              <p>No hay convocatorias disponibles en este momento.</p>
            </div>
          ) : (
            <div className="convocatorias-grid">
              {convocatorias.map((convocatoria, index) => (
                <div key={convocatoria.id} className="convocatoria-card">
                  <NoticiaImage 
                    src={convocatoria.imagen_url || getImageByIndex(index, 'eventos')} 
                    alt={convocatoria.titulo}
                    className="convocatoria-card-image"
                  />
                  <div className="convocatoria-content">
                    {convocatoria.destacada && (
                      <span className="convocatoria-destacada"><FaStar /> Destacada</span>
                    )}
                    <h2>{convocatoria.titulo}</h2>
                    <p>{convocatoria.descripcion}</p>
                    <div className="convocatoria-fechas">
                      <p><strong>Inicio:</strong> {new Date(convocatoria.fecha_inicio).toLocaleDateString('es-CO')}</p>
                      <p><strong>Fin:</strong> {new Date(convocatoria.fecha_fin).toLocaleDateString('es-CO')}</p>
                      {(convocatoria.actualizado_en || convocatoria.fecha_actualizacion) && (
                        <p className="convocatoria-actualizacion">
                          <strong>Última actualización:</strong>{' '}
                          {new Date(convocatoria.actualizado_en || convocatoria.fecha_actualizacion).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                    <Link to={`/convocatorias/${convocatoria.id}`} className="btn">
                      Ver detalles →
                    </Link>
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

export default Convocatorias;


