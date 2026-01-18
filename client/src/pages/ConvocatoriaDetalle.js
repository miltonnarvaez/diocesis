import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import NoticiaImage from '../components/NoticiaImage';
import { getImageByIndex } from '../utils/exampleImages';
import { FaStar } from 'react-icons/fa';
import './ConvocatoriaDetalle.css';

const ConvocatoriaDetalle = () => {
  const { id } = useParams();

  const { data: convocatoria, isLoading } = useQuery({
    queryKey: ['convocatoria', id],
    queryFn: async () => {
      const response = await api.get(`/convocatorias/${id}`);
      return response.data;
    }
  });

  if (isLoading) {
    return <div className="loading">Cargando convocatoria...</div>;
  }

  if (!convocatoria) {
    return (
      <div className="not-found">
        <h2>Convocatoria no encontrada</h2>
        <Link to="/convocatorias" className="btn">Volver a convocatorias</Link>
      </div>
    );
  }

  return (
    <div className="convocatoria-detalle">
      <article className="section">
        <div className="container">
          <Link to="/convocatorias" className="back-link">← Volver a convocatorias</Link>

          {convocatoria.imagen_url && (
            <NoticiaImage 
              src={convocatoria.imagen_url} 
              alt={convocatoria.titulo}
              className="convocatoria-detail-image"
            />
          )}

          <div className="convocatoria-header">
            {convocatoria.destacada && (
              <span className="convocatoria-destacada-badge"><FaStar /> Destacada</span>
            )}
            <h1>{convocatoria.titulo}</h1>
            <div className="convocatoria-fechas-detalle">
              <div className="fecha-item">
                <strong>Fecha de inicio:</strong>
                <span>{new Date(convocatoria.fecha_inicio).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="fecha-item">
                <strong>Fecha de cierre:</strong>
                <span>{new Date(convocatoria.fecha_fin).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              {(convocatoria.actualizado_en || convocatoria.fecha_actualizacion) && (
                <div className="fecha-item">
                  <strong>Última actualización:</strong>
                  <span>{new Date(convocatoria.actualizado_en || convocatoria.fecha_actualizacion).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="convocatoria-body">
            <div dangerouslySetInnerHTML={{ __html: convocatoria.descripcion }} />
          </div>
        </div>
      </article>
    </div>
  );
};

export default ConvocatoriaDetalle;



