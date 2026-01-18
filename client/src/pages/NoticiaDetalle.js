import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import NoticiaImage from '../components/NoticiaImage';
import { ArticleSchema } from '../components/SchemaMarkup';
import { getFileUrl } from '../utils/fileUtils';
import './NoticiaDetalle.css';

const NoticiaDetalle = () => {
  const { id } = useParams();

  const { data: noticia, isLoading } = useQuery({
    queryKey: ['noticia', id],
    queryFn: async () => {
      const response = await api.get(`/noticias/${id}`);
      return response.data;
    }
  });

  if (isLoading) {
    return <div className="loading">Cargando noticia...</div>;
  }

  if (!noticia) {
    return (
      <div className="not-found">
        <h2>Noticia no encontrada</h2>
        <Link to="/noticias" className="btn">Volver a noticias</Link>
      </div>
    );
  }

  return (
    <div className="noticia-detalle">
      <ArticleSchema
        headline={noticia.titulo}
        description={noticia.resumen || noticia.contenido.substring(0, 200)}
        image={noticia.imagen_url ? getFileUrl(noticia.imagen_url) : undefined}
        datePublished={noticia.fecha_publicacion || noticia.creado_en}
        dateModified={noticia.actualizado_en || noticia.fecha_actualizacion || noticia.fecha_publicacion || noticia.creado_en}
      />
      <article className="section">
        <div className="container">
          <Link to="/noticias" className="back-link">← Volver a noticias</Link>

          <NoticiaImage 
            src={noticia.imagen_url} 
            alt={noticia.titulo}
            className="noticia-detail-image"
          />

          <div className="noticia-header">
            <div className="noticia-fechas">
              <span className="noticia-fecha">
                Publicado: {new Date(noticia.fecha_publicacion || noticia.creado_en).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              {(noticia.actualizado_en || noticia.fecha_actualizacion) && 
               new Date(noticia.actualizado_en || noticia.fecha_actualizacion).getTime() !== 
               new Date(noticia.fecha_publicacion || noticia.creado_en).getTime() && (
                <span className="noticia-actualizacion">
                  Última actualización: {new Date(noticia.actualizado_en || noticia.fecha_actualizacion).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>
            <h1>{noticia.titulo}</h1>
            {noticia.categoria && (
              <span className="noticia-categoria">{noticia.categoria}</span>
            )}
          </div>

          <div className="noticia-body">
            <div dangerouslySetInnerHTML={{ __html: noticia.contenido }} />
          </div>
        </div>
      </article>
    </div>
  );
};

export default NoticiaDetalle;


